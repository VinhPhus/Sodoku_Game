from sqlalchemy.orm import Session
from src.models.sudoku_board import SudokuBoard
from src.models.user_model import User
from fastapi import HTTPException
import random
from ..services.sudoku_service import SudokuService

class SudokuService:
    def __init__(self, db: Session):
        self.db = db

    def generate_sudoku_board(self):
        # Logic to generate a new Sudoku board
        board = self._create_empty_board()
        self._fill_board(board)
        return board

    def _create_empty_board(self):
        return [[0 for _ in range(9)] for _ in range(9)]

    def _fill_board(self, board):
        # Simple backtracking algorithm to fill the board
        self._solve_sudoku(board)

    def _solve_sudoku(self, board):
        empty = self._find_empty_location(board)
        if not empty:
            return True  # Solved
        row, col = empty

        for num in range(1, 10):
            if self._is_valid_move(board, row, col, num):
                board[row][col] = num
                if self._solve_sudoku(board):
                    return True
                board[row][col] = 0  # Backtrack

        return False

    def _find_empty_location(self, board):
        for i in range(9):
            for j in range(9):
                if board[i][j] == 0:
                    return (i, j)
        return None

    def _is_valid_move(self, board, row, col, num):
        # Check if the number is not in the current row, column, and 3x3 box
        for x in range(9):
            if board[row][x] == num or board[x][col] == num:
                return False

        start_row, start_col = 3 * (row // 3), 3 * (col // 3)
        for i in range(3):
            for j in range(3):
                if board[i + start_row][j + start_col] == num:
                    return False

        return True

    def validate_move(self, board, row, col, num):
        if self._is_valid_move(board, row, col, num):
            board[row][col] = num
            return True
        raise HTTPException(status_code=400, detail="Invalid move")
    SudokuService()