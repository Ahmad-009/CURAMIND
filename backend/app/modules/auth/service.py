from sqlalchemy.orm import Session
from core.models import User
from modules.auth.utils import get_password_hash

def check_user_exists(db: Session, user_email: str, user_username: str):
    if db.query(User).filter(User.email == user_email).first():
        return "email_taken"
    if db.query(User).filter(User.username == user_username).first():
        return "username taken"
    return None

def add_user(db : Session, user_email: str, user_username: str, hashed_password: str, user_role: str):
    add_user_to_db = User(email= user_email, username= user_username, hashed_password= hashed_password, role=user_role)
    db.add(add_user_to_db)
    db.commit()
    db.refresh(add_user_to_db)
    return add_user_to_db

def get_user_by_email(db: Session, user_email: str):
    return db.query(User).filter(User.email == user_email).first() 
