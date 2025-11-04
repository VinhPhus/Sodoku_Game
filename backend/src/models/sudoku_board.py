# src/models/sudoku_board.py

from pydantic import BaseModel
from typing import List

class SudokuBoard(BaseModel):
    """
    Đại diện cho một ván game, bao gồm ván đố và lời giải.
    """
    puzzle: List[List[int]]
    solution: List[List[int]]

class SudokuMove(BaseModel):
    """
    Đại diện cho một nước đi của người dùng.
    """
    row: int
    col: int
    value: int

print("Đã tải: src/models/sudoku_board.py")