from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

# BƯỚC 1: Import Middleware CORS
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# BƯỚC 2: Thêm thiết lập CORS
# (Hãy chắc chắn địa chỉ localhost của React là đúng,
#  5173 là địa chỉ mặc định của Vite, 3000 là của Create-React-App)
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Cho phép các địa chỉ này
    allow_credentials=True,
    allow_methods=["*"],         # Cho phép tất cả methods (GET, POST, v.v.)
    allow_headers=["*"],         # Cho phép tất cả headers
)


# --- PHẦN CODE CÒN LẠI GIỮ NGUYÊN ---

# --- 1. Định nghĩa Model Dữ liệu ---
class SudokuMoveRequest(BaseModel):
    board: List[List[int]]
    row: int
    col: int
    value: int


class ValidationResponse(BaseModel):
    isValid: bool

# --- 2. Hàm Logic Kiểm tra Sudoku ---


def is_move_valid(board: List[List[int]], row: int, col: int, value: int) -> bool:
    """
    Kiểm tra xem một nước đi có hợp lệ hay không.
    """

    # 1. Kiểm tra hàng (row)
    for c in range(9):
        if c != col and board[row][c] == value:
            return False

    # 2. Kiểm tra cột (column)
    for r in range(9):
        if r != row and board[r][col] == value:
            return False

    # 3. Kiểm tra ô 3x3 (box)
    start_row = (row // 3) * 3
    start_col = (col // 3) * 3

    for r in range(start_row, start_row + 3):
        for c in range(start_col, start_col + 3):
            if (r != row or c != col) and board[r][c] == value:
                return False

    return True

# --- 3. Định nghĩa API Endpoint ---


@app.post("/validate", response_model=ValidationResponse)
async def validate_sudoku_move(request: SudokuMoveRequest):
    """
    Endpoint nhận nước đi từ frontend, kiểm tra tính hợp lệ
    và trả về kết quả.
    """

    # Frontend đã gửi board *bao gồm* nước đi mới,
    # nên chúng ta có thể kiểm tra trực tiếp
    board_copy = [row[:] for row in request.board]

    is_valid = is_move_valid(board_copy, request.row,
                             request.col, request.value)

    return ValidationResponse(isValid=is_valid)
