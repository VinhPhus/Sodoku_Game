from fastapi import APIRouter, HTTPException, Depends  # 1. Thêm Depends
from typing import List
from pydantic import BaseModel  # 2. Thêm BaseModel
from datetime import datetime   # 3. Thêm datetime
from sqlalchemy.orm import Session  # 4. Thêm Session

# 5. Import hàm get_db và hàm get_game_history
from src.services.database_service import get_game_history, get_db

# 6. (Đã XÓA dòng 'from src.models.schemas import GameHistory' bị lỗi)


# 7. ĐỊNH NGHĨA GameHistory ngay tại đây (để tránh lỗi import)
class GameHistory(BaseModel):
    id: int
    user_id: int
    score: int
    played_at: datetime

    class Config:
        from_attributes = True  # Cú pháp mới cho Pydantic v2


router = APIRouter()

# 8. Sửa lại hàm: Xóa 'async' và thêm 'db: Session'
@router.get("/history/{user_id}", response_model=List[GameHistory])
def get_user_history(user_id: int, db: Session = Depends(get_db)):
    
    # 9. Xóa 'await' khi gọi hàm
    history = get_game_history(db, user_id)
    
    if history is None:
        raise HTTPException(status_code=404, detail="User history not found")
    return history