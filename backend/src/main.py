# src/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .routes import auth_api, user_api, history_api, leaderboard_api
from .sockets.socket_server import router as websocket_router

app = FastAPI(
    title="Sudoku Game API",
    description="API cho game Sudoku bao gồm cả WebSocket.",
    version="1.0.0"
)

# --- ✅ Cấu hình CORS để frontend hoặc client WebSocket không bị 403 ---
origins = [
    "http://localhost:5173",   # Vite/React default
    "http://127.0.0.1:5173",
    "http://localhost:3000",   # fallback nếu dùng create-react-app
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    # SỬA LỖI: Thay thế ["*"] bằng danh sách origins cụ thể
    # vì allow_credentials=True.
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Gắn các router API ---
app.include_router(auth_api.router, prefix="/api/auth", tags=["Auth"])
app.include_router(user_api.router, prefix="/api/users", tags=["Users"])
app.include_router(history_api.router, prefix="/api/history", tags=["History"])
app.include_router(leaderboard_api.router,
                   prefix="/api/leaderboard", tags=["Leaderboard"])

# --- Gắn router WebSocket ---
app.include_router(websocket_router, tags=["WebSocket"])

# Nếu Docker build đã copy frontend build vào /app/frontend_dist, mount SPA ở root
if os.path.isdir("frontend_dist"):
    # mount SPA as the root; API routes are under /api so they remain available
    app.mount("/", StaticFiles(directory="frontend_dist",
              html=True), name="frontend")
else:
    @app.get("/")
    async def root():
        return {"message": "Sudoku API is running. WebSocket at /ws/game"}

print("✅ Đã tải: src/main.py - Ứng dụng FastAPI 'app' đã sẵn sàng.")
