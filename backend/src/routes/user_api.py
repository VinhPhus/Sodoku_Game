# src/routes/user_api.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.services.database_service import get_db, get_user_by_id, get_user_by_username, create_user
from src.models.schemas import UserCreate, UserResponse
from src.utils.security import hash_password  # Bạn tự định nghĩa hàm hash_password

router = APIRouter(prefix="/users", tags=["users"])

# Tạo user mới
@router.post("/", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_username(db, user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_pw = hash_password(user.password)
    new_user = create_user(db, user.username, hashed_pw)
    return new_user


# Lấy user theo id
@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
