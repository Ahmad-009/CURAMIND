from pydantic import BaseModel, EmailStr, StringConstraints
from typing import Annotated
from core.models import UserRole

StrongPassword = Annotated[str, StringConstraints(min_length=12, max_length=64)]
UsernameCheck = Annotated[
    str, StringConstraints(min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$")
]

class SignupSchema(BaseModel):
    username: UsernameCheck
    email: EmailStr
    password: StrongPassword
    role: UserRole

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class ResetPasswordSchema(BaseModel):
    email: EmailStr
    new_password: StrongPassword