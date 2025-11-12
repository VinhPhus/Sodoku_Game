# src/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth_api, user_api, history_api, leaderboard_api, match_api
from .sockets.socket_server import router as websocket_router

app = FastAPI(
    title="Sudoku Game API",
    description="API cho game Sudoku với JSON storage",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong production nên chỉ định cụ thể
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
app.include_router(match_api.router, tags=["Match"])

# ✅ Gắn router WebSocket
app.include_router(websocket_router, tags=["WebSocket"])


@app.get("/")
async def root():
    return {
        "message": "Sudoku API is running",
        "version": "2.0.0",
        "storage": "JSON-based",
        "websocket": "/ws/game/{user_id}"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    from .services.json_storage import get_json_storage
    storage = get_json_storage()

    return {
        "status": "healthy",
        "total_users": len(storage.get_all_users()),
        "active_matches": len(storage.get_all_active_matches())
    }

print("✅ Sudoku API đã khởi động với JSON storage!")
