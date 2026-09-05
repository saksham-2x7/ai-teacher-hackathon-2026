from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uuid

from contracts.pedagogy.models import LearnerProfile
from app.schemas.session import TeachingSession
from app.schemas.interaction import InteractionTurn
from app.repositories.session_repo import session_repo
from app.services.teaching_engine import generate_teaching_turn
from contracts.pedagogy.state_machine import TeachingState, TeachingStateMachine

router = APIRouter()

class CreateSessionRequest(BaseModel):
    learner_profile: LearnerProfile
    current_topic: str
    material_id: Optional[str] = None

class UpdateStateRequest(BaseModel):
    state: TeachingState

class StudentInputRequest(BaseModel):
    student_input: str

@router.post("", response_model=TeachingSession, status_code=status.HTTP_201_CREATED)
async def create_session(request: CreateSessionRequest):
    new_session = TeachingSession(
        learner_profile=request.learner_profile,
        current_topic=request.current_topic,
        material_id=request.material_id,
        current_state=TeachingState.IDLE
    )
    return await session_repo.create_session(new_session)

@router.get("/{session_id}", response_model=TeachingSession)
async def get_session(session_id: str):
    session = await session_repo.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session

@router.patch("/{session_id}/state", response_model=TeachingSession)
async def update_session_state(session_id: str, request: UpdateStateRequest):
    session = await session_repo.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    
    current = session.current_state
    target = request.state
    
    valid_transitions = TeachingStateMachine.VALID_TRANSITIONS.get(current, [])
    if target not in valid_transitions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Invalid state transition from {current.value} to {target.value}"
        )
        
    session.current_state = target
    session.updated_at = datetime.now(timezone.utc)
    
    return await session_repo.update_session(session)

@router.post("/{session_id}/interact")
async def post_interaction(session_id: str, request: StudentInputRequest):
    session = await session_repo.get_session(session_id)
    if not session:
        # Fallback for Vercel Ephemeral DB
        pass
    else:
        turn = InteractionTurn(
            turn_id=str(uuid.uuid4()),
            state=session.current_state,
            student_input=request.student_input
        )
        session.history.append(turn)
        session.updated_at = datetime.now(timezone.utc)
        await session_repo.update_session(session)

    
    async def sse_generator():
        async for chunk in generate_teaching_turn(session_id, request.student_input):
            yield f"data: {chunk}\n\n"
            
    return StreamingResponse(sse_generator(), media_type="text/event-stream")

@router.get("/{session_id}/stream")
async def stream_interaction(session_id: str):
    session = await session_repo.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    async def sse_generator():
        async for chunk in generate_teaching_turn(session_id):
            yield f"data: {chunk}\n\n"
            
    return StreamingResponse(sse_generator(), media_type="text/event-stream")
