from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# 1. Sửa import: Chuyển sang dùng file schema chung
from src.models.schemas import UserCreate, UserResponse

# 2. Sửa import: Dùng các hàm database service (giống user_api.py)
from src.services.database_service import get_db, get_user_by_username, create_user
from src.utils.security import hash_password

router = APIRouter()

# 3. Sửa response_model thành UserResponse
@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):

    # 4. Thêm logic kiểm tra user tồn tại (giống user_api.py)
    existing_user = get_user_by_username(db, user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = hash_password(user.password)

    # 5. Dùng hàm create_user nhất quán
    new_user = create_user(db, username=user.username, hashed_password=hashed_password)

    # Tự động convert sang UserResponse
    return new_user