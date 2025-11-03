# src/main.py
from fastapi import FastAPI
from .routes import auth_api, user_api, history_api, leaderboard_api
from .sockets.socket_server import router as websocket_router

app = FastAPI(
    title="Sudoku Game API",
    description="API cho game Sudoku bao gồm cả WebSocket.",
    version="1.0.0"
)

# --- Gắn các router API bình thường ---
app.include_router(auth_api.router, prefix="/api/auth", tags=["Auth"])
app.include_router(user_api.router, prefix="/api/users", tags=["Users"])
app.include_router(history_api.router, prefix="/api/history", tags=["History"])
app.include_router(leaderboard_api.router, prefix="/api/leaderboard", tags=["Leaderboard"])

#Gắn router WebSocket KHÔNG có prefix nữa
app.include_router(websocket_router, tags=["WebSocket"])

@app.get("/")
async def read_root():
    return {"message": "Sudoku API is running. WebSocket at /ws/game"}

print("Đã tải: src/main.py - Ứng dụng FastAPI 'app' đã sẵn sàng.")
