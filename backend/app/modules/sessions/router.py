from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime

from core.database import get_db
from core.models import ChatSession, ChatMessage, User
from modules.auth.utils import get_current_user

class SessionSchema(BaseModel):
    id: int
    session_name: str
    created_at: datetime
    patient_state: Optional[Any] = None

    model_config = ConfigDict(from_attributes=True)

class EvaluationSchema(BaseModel):
    faithfulness_score: float
    relevance_score: float
    reasoning: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class MessageSchema(BaseModel):
    id: int
    sender: str
    content: str
    timestamp: datetime
    citations: Optional[Any] = None
    evaluation: Optional[EvaluationSchema] = None

    model_config = ConfigDict(from_attributes=True)

class SessionDetailSchema(BaseModel):
    session_info: SessionSchema
    history: List[MessageSchema]

router = APIRouter()

@router.get("/all", response_model=List[SessionSchema])
async def get_doctor_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.created_at.desc()).all()
    
    return sessions

@router.get("/{session_id}", response_model=SessionDetailSchema)
async def get_session_details(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found or access denied")

    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.timestamp.asc()).all()

    return {
        "session_info": session,
        "history": messages
    }