from passlib.context import CryptContext

# Tạo context để mã hóa và kiểm tra mật khẩu
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    Mã hóa mật khẩu bằng bcrypt.
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Kiểm tra mật khẩu gốc với mật khẩu đã mã hóa.
    """
    return pwd_context.verify(plain_password, hashed_password)
