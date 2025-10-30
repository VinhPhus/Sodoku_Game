# src/models/schemas.py
from pydantic import BaseModel
from datetime import datetime

# -------- User Schemas --------
class UserCreate(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        orm_mode = True


# -------- Game History Schemas --------
class GameHistory(BaseModel):
    user_id: int
    score: int


class GameHistoryResponse(BaseModel):
    id: int
    user_id: int
    score: int
    played_at: datetime

    class Config:
        orm_mode = True
