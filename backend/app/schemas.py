from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


# --- AUTH SCHEMAS ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "student"


class Token(BaseModel):
    access_token: str
    token_type: str


# --- CHAT SCHEMAS ---
class ChatMessageCreate(BaseModel):
    content: str


class ChatResponse(BaseModel):
    id: int
    sender: str
    content: str
    citations: Optional[List[dict]] = None
    timestamp: datetime


# --- DOCUMENT SCHEMAS ---
class DocumentMetadata(BaseModel):
    id: int
    title: str
    url: str
    category: str
    vector_ready: bool
