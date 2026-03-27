from fastapi import FastAPI
from modules.auth.router import router as auth_router
from core.database import engine
from core.models import Base

app = FastAPI()
app.include_router(auth_router)
Base.metadata.create_all(bind=engine) # metadata is the folder where all the blueprints of the tabels we made r stored

