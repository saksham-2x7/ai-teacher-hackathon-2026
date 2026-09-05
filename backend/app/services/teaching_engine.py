import os
import sys
from pathlib import Path

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

import json
import uuid
from typing import AsyncGenerator, Optional
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

from google import genai
from google.genai import types
try:
    from google.genai._api_client import BaseApiClient
    if not hasattr(BaseApiClient, "_orig_aclose"):
        BaseApiClient._orig_aclose = BaseApiClient.aclose
        async def _safe_aclose(self):
            if hasattr(self, "_async_httpx_client") and self._async_httpx_client:
                await self._async_httpx_client.aclose()
        BaseApiClient.aclose = _safe_aclose
except Exception:
    pass

from app.schemas.interaction import PedagogicalState, InteractionTurn
from app.repositories.session_repo import session_repo

from contracts.pedagogy.models import (
    PedagogicalEvaluation, 
    TeachingTurn, 
    UnderstandingStatus
)
from core.pedagogy.engine.router import AdaptiveRouter
from core.pedagogy.engine.assembler import TeachingTurnAssembler

from app.core.llm_client import generate_structured_output_async

async def mock_generate_teaching_turn(session_id: str, student_input: Optional[str] = None) -> AsyncGenerator[str, None]:
    """
    The production integration of the AI Brain with the FastAPI SQLite datastore.
    """

    # 1. Fetch Session from DB
    session = await session_repo.get_session(session_id)
    if not session:
        # FALLBACK FOR VERCEL EPHEMERAL DB
        from app.schemas.session import TeachingSession
        from contracts.pedagogy.models import LearnerProfile as EngineProfile, EducationalLevel, LearningStyle
        session = TeachingSession(
            session_id=session_id,
            learner_profile=EngineProfile(educational_level=EducationalLevel.BEGINNER, target_subject="Neural Networks", preferred_language="en", learning_style=LearningStyle.CONCEPTUAL),
            current_topic="Neural Networks",
            current_state=PedagogicalState.TEACHING
        )


    topic = session.current_topic
    app_profile = session.learner_profile
    from contracts.pedagogy.models import LearnerProfile as EngineProfile, EducationalLevel, LearningStyle
    if isinstance(app_profile, EngineProfile):
        profile = app_profile
    else:
        level_map = {"beginner": EducationalLevel.BEGINNER, "intermediate": EducationalLevel.INTERMEDIATE, "advanced": EducationalLevel.ADVANCED}
        raw_level = getattr(app_profile, "educational_level", None) or getattr(app_profile, "grade_or_level", None)
        if hasattr(raw_level, "value"):
            raw_level = raw_level.value
        ed_level = level_map.get(str(raw_level).lower(), EducationalLevel.BEGINNER)
        profile = EngineProfile(
            student_id=getattr(app_profile, "student_id", None),
            educational_level=ed_level,
            target_subject=getattr(app_profile, "target_subject", topic),
            available_time_minutes=getattr(app_profile, "available_time_minutes", None) or getattr(app_profile, "time_budget_minutes", 15),
            preferred_language=getattr(app_profile, "preferred_language", "en"),
            learning_style=LearningStyle.CONCEPTUAL
        )
    adaptive_transition = None

    # 2. Evaluate & Route if Student Input exists
    if student_input:
        session.current_state = PedagogicalState.EVALUATING
        
        eval_prompt = f"Topic: {topic}\nStudent Response: {student_input}"
        try:
            evaluation = await generate_structured_output_async(
                system_instruction="You are a pedagogical evaluator assessing a student's answer.",
                user_prompt=eval_prompt,
                schema=PedagogicalEvaluation,
                model='gemini-3.7-flash'
            )
        except Exception:
            evaluation = None

        if not evaluation:
            # Fallback in case of parsing failure or mock
            evaluation = PedagogicalEvaluation(
                understanding_status=UnderstandingStatus.PARTIAL,
                confidence_score=0.5,
                pedagogical_rationale="Failsafe fallback due to parsing error."
            )
            
        adaptive_transition = AdaptiveRouter.evaluate_and_route(evaluation)

    # 3. Assemble & Teach
    session.current_state = PedagogicalState.TEACHING
    
    system_instruction = TeachingTurnAssembler.construct_llm_prompt(
        profile=profile,
        target_subject=topic,
        current_concept=topic, # Fallback to topic as concept
        adaptive_transition=adaptive_transition
    )
    
    teaching_turn = None
    try:
        teaching_turn = await generate_structured_output_async(
            system_instruction=system_instruction,
            user_prompt="Generate the next teaching turn.",
            schema=TeachingTurn,
            model='gemini-3.7-flash'
        )
    except Exception:
        teaching_turn = None

    if not teaching_turn:
        # Fallback teaching turn
        from contracts.pedagogy.models import VisualIntent, VisualIntentType
        teaching_turn = TeachingTurn(
            turn_id=str(uuid.uuid4()),
            module_id="mod_demo_01",
            concept_id=topic,
            spoken_text=f"Let's explore {topic}. Remember that Ohm's Law states Voltage equals Current multiplied by Resistance (V = I * R).",
            visual_intent=VisualIntent(
                type=VisualIntentType.EQUATION,
                payload="V = I * R"
            )
        )
        
    # Ensure UUIDs are set
    if not teaching_turn.turn_id:
        teaching_turn.turn_id = str(uuid.uuid4())
        
    # Safely enforce visual fallback based on policy
    teaching_turn = TeachingTurnAssembler.force_visual_intent_fallback(teaching_turn, topic)

    # 4. Persistence
    interaction = InteractionTurn(
        turn_id=teaching_turn.turn_id,
        state=session.current_state,
        spoken_text=teaching_turn.spoken_text,
        visual_intent=teaching_turn.visual_intent.model_dump() if teaching_turn.visual_intent else None,
        student_input=student_input
    )
    
    session.history.append(interaction)
    await session_repo.update_session(session)

    # 5. Yield final JSON for SSE chunk
    payload = teaching_turn.model_dump(mode="json")
    payload["status"] = "thinking"
    payload["state"] = session.current_state.value if hasattr(session.current_state, "value") else session.current_state
    yield json.dumps(payload)

generate_teaching_turn = mock_generate_teaching_turn