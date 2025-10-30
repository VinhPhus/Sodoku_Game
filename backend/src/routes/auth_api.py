from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.schemas.user_schema import UserCreate, UserOut
from src.services.database_service import get_db
from src.utils.security import hash_password
from src.models.user_model import User  # SQLAlchemy model

router = APIRouter()

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    hashed_password = hash_password(user.password)
    
    new_user = User(email=user.email, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Trả Pydantic model hoặc dict hợp lệ
    return {"id": new_user.id, "email": new_user.email}
