from fastapi import FastAPI, HTTPException # <-- Thêm HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel # <-- Thêm BaseModel

from .routes import user_api, history_api, leaderboard_api, match_api
from .sockets.socket_server import router as websocket_router

# Import service và bảo mật
from .services.json_storage import get_json_storage
from .utils.security import hash_password, verify_password

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
# Vô hiệu hóa router auth cũ (dùng SQL) để dùng logic JSON bên dưới
app.include_router(user_api.router, prefix="/api/users", tags=["Users"])
app.include_router(history_api.router, prefix="/api/history", tags=["History"])
app.include_router(leaderboard_api.router,
                   prefix="/api/leaderboard", tags=["Leaderboard"])
app.include_router(match_api.router, tags=["Match"])
# ✅ Gắn router WebSocket
app.include_router(websocket_router, tags=["WebSocket"])

# ===== THÊM LOGIC XÁC THỰC JSON MỚI =====

# 1. Định nghĩa models cho request body
class AuthRequest(BaseModel):
    username: str
    password: str

# 2. Lấy instance của JSON storage
storage = get_json_storage()

@app.post("/auth/register")
async def auth_register(request: AuthRequest):
    """
    API đăng ký user mới, lưu vào users.json
    """
    if not request.username or not request.password:
        raise HTTPException(status_code=400, detail="Thiếu username hoặc password")

    # Băm mật khẩu
    hashed_pw = hash_password(request.password)
    
    # Thêm user
    new_user = storage.add_user(username=request.username, hashed_password=hashed_pw)
    
    if new_user is None:
        raise HTTPException(status_code=400, detail="Username đã tồn tại")
        
    return {"message": "Đăng ký thành công", "user": new_user}

@app.post("/auth/login")
async def auth_login(request: AuthRequest):
    """
    API đăng nhập, kiểm tra thông tin từ users.json
    """
    if not request.username or not request.password:
        raise HTTPException(status_code=400, detail="Thiếu username hoặc password")

    # Tìm user bằng username (sẽ trả về data có cả
    # hashed_password)
    user = storage.get_user_by_username(request.username)
    
    if user is None:
        raise HTTPException(status_code=401, detail="Tên đăng nhập không đúng")
        
    # SỬA LỖI: Thêm kiểm tra này để tránh lỗi KeyError
    if 'hashed_password' not in user:
        raise HTTPException(status_code=401, detail="Tài khoản của bạn bị lỗi (thiếu mật khẩu). Vui lòng đăng ký lại.")

    # Xác thực mật khẩu
    if not verify_password(request.password, user['hashed_password']):
        raise HTTPException(status_code=401, detail="Mật khẩu không đúng")
    
    # Trả về thông tin user (loại bỏ mật khẩu)
    user_response = user.copy()
    del user_response['hashed_password']
    
    return {"message": "Đăng nhập thành công", "user": user_response}

# ===============================================

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

print("Sudoku API đã khởi động với JSON storage!")