import hashlib
import bcrypt


def hash_password(password: str) -> str:
    # SHA-256 digest luôn 32 bytes, an toàn cho bcrypt
    pw_digest = hashlib.sha256(password.encode('utf-8')).digest()
    # bcrypt.hashpw returns bytes, we decode to str for storage
    hashed = bcrypt.hashpw(pw_digest, bcrypt.gensalt())
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    pw_digest = hashlib.sha256(plain_password.encode('utf-8')).digest()
    # bcrypt.checkpw expects bytes for both args
    return bcrypt.checkpw(pw_digest, hashed_password.encode('utf-8'))
