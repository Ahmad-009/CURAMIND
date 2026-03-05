from sqlalchemy.orm import Session
from core.models import User


def check_user_exists(db: Session, user_email: str, user_username: str):
    if db.query(User).filter(User.email == user_email).first():
        return "email_taken"
    if db.query(User).filter(User.username == user_username).first():
        return "username taken"
    return None
