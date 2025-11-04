from pydantic import BaseModel

# Dữ liệu nhận từ client
class UserCreate(BaseModel):
    email: str
    password: str

# Dữ liệu trả về client
class UserOut(BaseModel):
    id: int
    email: str
