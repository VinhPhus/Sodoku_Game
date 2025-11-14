from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
# Import các service JSON
from ..services.json_storage import get_json_storage
from ..utils.security import hash_password, verify_password

router = APIRouter()

class AuthRequest(BaseModel):
    username: str
    password: str

storage = get_json_storage()


@router.post("/register") # Sửa: Xóa /auth/ vì prefix sẽ tự thêm
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


@router.post("/login") # Sửa: Xóa /auth/ vì prefix sẽ tự thêm
async def auth_login(request: AuthRequest):
    """
    API đăng nhập, kiểm tra thông tin từ users.json
    """
    if not request.username or not request.password:
        raise HTTPException(status_code=400, detail="Thiếu username hoặc password")
        
    user = storage.get_user_by_username(request.username)
    
    if user is None:
        raise HTTPException(status_code=401, detail="Tên đăng nhập không đúng")

    if "hashed_password" not in user:
        raise HTTPException(status_code=401, detail="Tài khoản lỗi — thiếu mật khẩu")

    if not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Mật khẩu không đúng")

    user_data = user.copy()
    del user_data["hashed_password"]

    return {"message": "Đăng nhập thành công", "user": user_data}