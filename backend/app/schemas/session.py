from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field
import uuid

from contracts.pedagogy.models import LearnerProfile
from app.schemas.interaction import InteractionTurn
from contracts.pedagogy.state_machine import TeachingState

class TeachingSession(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    learner_profile: LearnerProfile
    current_state: TeachingState = TeachingState.IDLE
    current_topic: str
    material_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    history: List[InteractionTurn] = Field(default_factory=list)
