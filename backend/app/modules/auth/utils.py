from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from core.config import settings
from jose import jwt

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password,hashed_password)

def create_access_token(payload_data: dict):
    payload_data_to_encode = payload_data.copy()
    expiration = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload_data_to_encode.update({"exp": int(expiration.timestamp())})
    encoded_jwt = jwt.encode(payload_data_to_encode,settings.SECRET_KEY,algorithm=settings.ALGORITHM)

    return encoded_jwt
