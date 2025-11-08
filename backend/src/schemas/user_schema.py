from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# ---------------- User ----------------


class UserCreate(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    created_at: datetime

    class Config:
        from_attributes = True  # Đã sửa 'orm_mode'


# ---------------- Sudoku Board ----------------

class SudokuBoardBase(BaseModel):
    name: Optional[str]
    initial_matrix: str


class SudokuBoardResponse(SudokuBoardBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # Đã sửa 'orm_mode'


# ---------------- Match ----------------

class MatchBase(BaseModel):
    board_id: int
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    winner_id: Optional[int] = None
    loser_id: Optional[int] = None
    win_reason: Optional[str] = None


class MatchResponse(MatchBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # Đã sửa 'orm_mode'


# ---------------- Match Player ----------------

class MatchPlayerBase(BaseModel):
    match_id: int
    user_id: int
    joined_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    time_spent_sec: Optional[int] = None


class MatchPlayerResponse(MatchPlayerBase):
    id: int

    class Config:
        from_attributes = True  # Đã sửa 'orm_mode'


# ---------------- Match History ----------------

class MatchHistoryBase(BaseModel):
    match_id: int
    user_id: int
    status: str  # 'win' hoặc 'lose'


class MatchHistoryResponse(MatchHistoryBase):
    id: int
    played_at: datetime

    class Config:
        from_attributes = True  # Đã sửa 'orm_mode'


# ---------------- Game History (SỬA LỖI IMPORT ERROR) ----------------
# Class này bị thiếu, gây ra lỗi trong history_api.py

class GameHistory(BaseModel):
    id: int
    user_id: int
    score: int
    played_at: datetime

    class Config:
        from_attributes = True  # Đã sửa 'orm_mode'