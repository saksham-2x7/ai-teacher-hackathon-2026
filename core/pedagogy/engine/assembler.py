import sys
import os
import json
from typing import Optional

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

from contracts.pedagogy.models import (
    LearnerProfile,
    AdaptiveTransition,
    TeachingTurn,
    VisualIntent,
    VisualIntentType
)
from core.pedagogy.engine.visual_policy import determine_visual_intent_type, VISUAL_DISPATCH_PROMPT
from core.pedagogy.engine.language_policy import LANGUAGE_CODE_SWITCHING_PROMPT

class TeachingTurnAssembler:
    @staticmethod
    def construct_llm_prompt(
        profile: LearnerProfile,
        target_subject: str,
        current_concept: str,
        adaptive_transition: Optional[AdaptiveTransition] = None
    ) -> str:
        """
        Builds the system prompt instructing the LLM on how to generate the TeachingTurn.
        """
        language_prompt = LANGUAGE_CODE_SWITCHING_PROMPT.format(
            preferred_language=profile.preferred_language
        )
        
        prompt = f"You are an AI Teacher teaching {target_subject}.\n"
        prompt += f"Current Concept: {current_concept}\n"
        
        if adaptive_transition:
            prompt += f"\nADAPTATION TRIGGERED:\nAction: {adaptive_transition.next_action}\nContext: {adaptive_transition.adaptation_context}\n"
            
        prompt += f"\n{language_prompt}\n"
        prompt += f"\n{VISUAL_DISPATCH_PROMPT}\n"
        
        return prompt

    @staticmethod
    def validate_and_parse_llm_output(llm_json_str: str) -> TeachingTurn:
        """
        Takes the raw JSON output from the LLM, validates it against the TeachingTurn schema.
        """
        data = json.loads(llm_json_str)
        return TeachingTurn(**data)
        
    @staticmethod
    def force_visual_intent_fallback(turn: TeachingTurn, target_subject: str) -> TeachingTurn:
        """
        If we don't trust the LLM, we can forcibly override its visual intent based on the deterministic subject mapping.
        """
        expected_type = determine_visual_intent_type(target_subject)
        
        if turn.visual_intent.type != expected_type:
            # Note: in a real system we might augment the payload or just warn.
            # Here we just override the type for safety, assuming the frontend can handle the payload.
            turn.visual_intent.type = expected_type
            
        return turn
