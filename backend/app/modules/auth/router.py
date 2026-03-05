from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr, StringConstraints
from typing import Annotated

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

StrongPassword = Annotated[str, StringConstraints(min_length=12, max_length=64)]

UsernameCheck = Annotated[
    str, StringConstraints(min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$")
]


class signup(BaseModel):
    username: UsernameCheck
    email: EmailStr
    password: StrongPassword


router = APIRouter()


@router.post("/signup")
async def Signup(signup_data: signup):

    return {
        "message": "mission successful",
        "resgistered_email": signup_data.email,
        "resgistered_username": signup_data.username,
    }
