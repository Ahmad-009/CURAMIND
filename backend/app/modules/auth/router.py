from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from modules.auth.schemas import SignupSchema, LoginSchema
from modules.auth.service import check_user_exists, add_user, get_user_by_email
from core.database import get_db
from modules.auth.utils import get_password_hash, verify_password, create_access_token

router = APIRouter()

@router.post("/signup")
async def signup(signup_data: SignupSchema, db: Session = Depends(get_db)):
    status = check_user_exists(db=db, user_email=signup_data.email, user_username=signup_data.username)
    
    if status == "email_taken":
        raise HTTPException(status_code=400, detail="This email is already registered.")
    if status == "username_taken":
        raise HTTPException(status_code=400, detail="This username is already taken.")
    
    hashed_pass = get_password_hash(signup_data.password)

    new_user = add_user(
        db=db, 
        user_email=signup_data.email, 
        user_username=signup_data.username, 
        hashed_password=hashed_pass,
        user_role=signup_data.role.value
    )

    return {
        "message": "User added successfully!",
        "user_id": new_user.id,
        "username": new_user.username,
        "role": new_user.role
    }

@router.post("/login")
async def login(login_data: LoginSchema, db: Session = Depends(get_db)):
    user = get_user_by_email(db=db, user_email=login_data.email)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if not verify_password(plain_password=login_data.password, hashed_password=user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token_payload = {"user_id":user.id, "user_role":user.role}
    access_token = create_access_token(token_payload)
        
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role
    }