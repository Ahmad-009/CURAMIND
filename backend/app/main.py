from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from modules.auth.router import router as auth_router
from modules.orchestrator.router import router as chat_router 
from modules.sessions.router import router as session_router
from core.database import engine
from core.models import Base

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat & AI"])
app.include_router(session_router, prefix="/api/sessions", tags=["Sessions"])

Base.metadata.create_all(bind=engine)