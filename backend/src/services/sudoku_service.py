"""A small self-contained SudokuService used by WebSocket demo.

This implementation is synchronous and intentionally simple: it can
generate a full solved board with backtracking, remove cells to
create a puzzle, validate a move against Sudoku rules, and apply a move.
It avoids DB dependencies so it can be used easily from WebSocket handlers.
"""

import random
from typing import List, Optional, Tuple


class SudokuService:
    def __init__(self):
        pass

    def generate_board(self, difficulty: str = "easy") -> dict:
        """Generate a new puzzle and return { 'board': puzzle, 'solution': solution }.

        difficulty controls how many cells are removed: 'easy' ~ 35 clues,
        'medium' ~ 30 clues, 'hard' ~ 25 clues.
        """
        solution = self._create_empty_board()
        self._fill_board(solution)

        # Make a copy and remove cells based on difficulty
        puzzle = [row[:] for row in solution]
        self._remove_cells(puzzle, difficulty)

        return {"board": puzzle, "solution": solution}

    def validate_move(self, board: List[List[int]], row: int, col: int, value: int) -> bool:
        """Check whether placing `value` at (row, col) is valid on `board`.

        This checks row/column/3x3 box constraints but does not compare
        against a hidden solution.
        """
        if not (0 <= row < 9 and 0 <= col < 9 and 1 <= value <= 9):
            return False

        # If cell already filled with a different number, invalid
        if board[row][col] != 0 and board[row][col] != value:
            return False

        # Check row
        for c in range(9):
            if c != col and board[row][c] == value:
                return False

        # Check column
        for r in range(9):
            if r != row and board[r][col] == value:
                return False

        # Check 3x3 box
        start_row = (row // 3) * 3
        start_col = (col // 3) * 3
        for r in range(start_row, start_row + 3):
            for c in range(start_col, start_col + 3):
                if (r != row or c != col) and board[r][c] == value:
                    return False

        return True

    def apply_move(self, board: List[List[int]], row: int, col: int, value: int) -> bool:
        """Apply the move to the board if valid and return True, else False."""
        if self.validate_move(board, row, col, value):
            board[row][col] = value
            return True
        return False

    # --- internal helpers ---
    def _create_empty_board(self) -> List[List[int]]:
        return [[0 for _ in range(9)] for _ in range(9)]

    def _fill_board(self, board: List[List[int]]) -> bool:
        empty = self._find_empty_location(board)
        if not empty:
            return True
        row, col = empty

        numbers = list(range(1, 10))
        random.shuffle(numbers)
        for num in numbers:
            if self._is_valid_move(board, row, col, num):
                board[row][col] = num
                if self._fill_board(board):
                    return True
                board[row][col] = 0
        return False

    def _find_empty_location(self, board: List[List[int]]) -> Optional[Tuple[int, int]]:
        for i in range(9):
            for j in range(9):
                if board[i][j] == 0:
                    return (i, j)
        return None

    def _is_valid_move(self, board: List[List[int]], row: int, col: int, num: int) -> bool:
        for x in range(9):
            if board[row][x] == num or board[x][col] == num:
                return False

        start_row, start_col = 3 * (row // 3), 3 * (col // 3)
        for i in range(3):
            for j in range(3):
                if board[i + start_row][j + start_col] == num:
                    return False
        return True

    def _remove_cells(self, board: List[List[int]], difficulty: str):
        # Determine number of clues to keep
        if difficulty == "easy":
            clues = 35
        elif difficulty == "medium":
            clues = 30
        else:
            clues = 25

        # total cells 81 -> remove 81 - clues cells
        cells_to_remove = 81 - clues
        positions = [(r, c) for r in range(9) for c in range(9)]
        random.shuffle(positions)
        for i in range(cells_to_remove):
            r, c = positions[i]
            board[r][c] = 0


if __name__ == "__main__":
    # Quick sanity run
    svc = SudokuService()
    res = svc.generate_board('easy')
    print('Puzzle:')
    for row in res['board']:
        print(row)