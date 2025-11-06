from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv
# jhvjh
# Load file .env
load_dotenv()

# Lấy DATABASE_URL từ .env
DATABASE_URL = os.getenv("DATABASE_URL")

# Tạo engine
# echo=True để debug SQL nếu cần
engine = create_engine(DATABASE_URL, echo=True)

# Tạo session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base để các model kế thừa
Base = declarative_base()

# ====== Xác nhận kết nối ======
try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("✅ Connected to database successfully! Result:", result.scalar())
except Exception as e:
    print("❌ Connection failed:", e)
