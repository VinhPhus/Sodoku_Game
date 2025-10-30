# src/main.py

from fastapi import FastAPI

# Import tương đối: '.' nghĩa là import từ cùng thư mục 'src'
# Import các router API (HTTP)
from .routes import auth_api, user_api, history_api, leaderboard_api

# Import router WebSocket
from .sockets.socket_server import router as websocket_router

app = FastAPI(
    title="Sudoku Game API",
    description="API cho game Sudoku bao gồm cả WebSocket.",
    version="1.0.0"
)

# --- Gắn các router API bình thường ---
# (Giả sử các tệp API của bạn đều có biến tên là 'router')
app.include_router(auth_api.router, prefix="/api/auth", tags=["Auth"])
app.include_router(user_api.router, prefix="/api/users", tags=["Users"])
app.include_router(history_api.router, prefix="/api/history", tags=["History"])
app.include_router(leaderboard_api.router, prefix="/api/leaderboard", tags=["Leaderboard"])

# --- Gắn router WebSocket ---
# Đường dẫn sẽ là ws://localhost:8000/ws/game
app.include_router(websocket_router, prefix="/ws", tags=["WebSocket"])


@app.get("/")
async def read_root():
    return {"message": "Chào mừng đến với Sudoku API. Kết nối WebSocket tại /ws/game"}

print("Đã tải: src/main.py - Ứng dụng FastAPI 'app' đã sẵn sàng.")