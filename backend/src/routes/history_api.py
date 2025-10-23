from fastapi import APIRouter, HTTPException
from typing import List
from src.models.schemas import GameHistory
from src.services.database_service import get_game_history

router = APIRouter()

@router.get("/history/{user_id}", response_model=List[GameHistory])
async def get_user_history(user_id: int):
    history = await get_game_history(user_id)
    if history is None:
        raise HTTPException(status_code=404, detail="User history not found")
    return history