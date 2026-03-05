from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Boolean,
    Enum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSON
from pgvector.sqlalchemy import Vector
from core.database import Base
import enum


# ==========================================
# Enums (For Security & Data Integrity)
# ==========================================
class UserRole(str, enum.Enum):
    DOCTOR = "doctor"
    RESEARCHER = "researcher"
    STUDENT = "student"


class ArticleCategory(str, enum.Enum):
    RESEARCH_PAPER = "research_paper"
    CLINICAL_TRIAL = "clinical_trial"
    DRUG_GUIDE = "drug_guide"


# ==========================================
# 1. USER TABLE (Authentication)
# ==========================================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Using Enum restricts values to only valid roles
    role = Column(String, default=UserRole.DOCTOR.value, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    patient_profile = relationship(
        "PatientProfile", back_populates="owner", uselist=False
    )
    chat_sessions = relationship("ChatSession", back_populates="user")


# ==========================================
# 2. PATIENT CONTEXT (The AI Memory)
# ==========================================
class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    age = Column(Integer)
    sex = Column(String)
    chronic_conditions = Column(Text)
    current_medications = Column(Text)

    owner = relationship("User", back_populates="patient_profile")


# ==========================================
# 3. CHAT SESSIONS (The "Folders")
# ==========================================
class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id"), index=True
    )  # Indexed for fast lookup
    session_name = Column(String, default="New Chat")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    messages = relationship("ChatMessage", back_populates="session")
    user = relationship("User", back_populates="chat_sessions")


# ==========================================
# 4. CHAT MESSAGES (The Audit Trail)
# ==========================================
class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), index=True)

    sender = Column(String)  # "user" or "ai"
    content = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Auditability: Stores [{"title": "Study X", "url": "pubmed..."}]
    citations = Column(JSON, nullable=True)

    # RLHF: Stores +1 or -1
    feedback_score = Column(Integer, nullable=True)

    session = relationship("ChatSession", back_populates="messages")


# ==========================================
# 5. MEDICAL ARTICLES (The Vector Brain)
# ==========================================
class MedicalArticle(Base):
    __tablename__ = "medical_articles"

    id = Column(Integer, primary_key=True, index=True)

    # Metadata for the UI Link
    title = Column(String, nullable=True)
    url = Column(String, nullable=True)
    pmid = Column(String, nullable=True)  # Store the ID separately

    # The actual text the AI reads
    content = Column(Text, nullable=False)

    # Category (Research vs Drug Guide)
    category = Column(String, default=ArticleCategory.RESEARCH_PAPER.value)

    # The Vector (768 dimensions for BioBERT)
    embedding = Column(Vector(768))
