import hashlib
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    # SHA-256 digest luôn 32 bytes, an toàn cho bcrypt
    pw_digest = hashlib.sha256(password.encode('utf-8')).digest()
    return pwd_context.hash(pw_digest)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pw_digest = hashlib.sha256(plain_password.encode('utf-8')).digest()
    return pwd_context.verify(pw_digest, hashed_password)
