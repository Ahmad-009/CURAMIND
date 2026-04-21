from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Boolean,
    Enum,
    Float
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSON, JSONB
from pgvector.sqlalchemy import Vector
from core.database import Base
import enum

class UserRole(str, enum.Enum):
    DOCTOR = "doctor"
    RESEARCHER = "researcher"
    STUDENT = "student"

class ArticleCategory(str, enum.Enum):
    RESEARCH_PAPER = "research_paper"
    CLINICAL_TRIAL = "clinical_trial"
    DRUG_GUIDE = "drug_guide"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.DOCTOR.value, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient_profile = relationship(
        "PatientProfile", back_populates="owner", uselist=False
    )
    chat_sessions = relationship("ChatSession", back_populates="user")

class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=True) 
    age = Column(Integer)
    sex = Column(String)
    chronic_conditions = Column(Text)
    current_medications = Column(Text)

    owner = relationship("User", back_populates="patient_profile")

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    session_name = Column(String, default="New Chat")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    patient_state = Column(
        JSONB, 
        nullable=False, 
        server_default='{"conditions": [], "medications": [], "allergies": [], "key_facts": []}'
    )

    messages = relationship("ChatMessage", back_populates="session")
    user = relationship("User", back_populates="chat_sessions")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), index=True)
    sender = Column(String)
    content = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    citations = Column(JSON, nullable=True)
    feedback_score = Column(Integer, nullable=True)

    session = relationship("ChatSession", back_populates="messages")
    evaluation = relationship("MessageEvaluation", back_populates="message", uselist=False)

class MedicalArticle(Base):
    __tablename__ = "medical_articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    url = Column(String, nullable=True)
    pmid = Column(String, nullable=True) 
    content = Column(Text, nullable=False)
    metadata_tags = Column(JSONB, default=dict)
    embedding = Column(Vector(768))

class MessageEvaluation(Base):
    __tablename__ = "message_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("chat_messages.id", ondelete="CASCADE"), unique=True, index=True, nullable=False) 
    faithfulness_score = Column(Float, nullable=False)
    relevance_score = Column(Float, nullable=False)
    correctness_score = Column(Float, nullable=False)
    reasoning = Column(Text, nullable=True) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    message = relationship("ChatMessage", back_populates="evaluation")