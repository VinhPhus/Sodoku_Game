# src/services/database_service.py
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session
from datetime import datetime

# -------------------------------
# Database setup
# -------------------------------
DATABASE_URL = "sqlite:///./sudoku.db"  # thay bằng DB của bạn
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# -------------------------------
# Models
# -------------------------------
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    games = relationship("GameHistory", back_populates="user")


class GameHistory(Base):
    __tablename__ = "game_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    score = Column(Integer)
    played_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="games")


# -------------------------------
# Database utility functions
# -------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# User functions
def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def create_user(db: Session, username: str, hashed_password: str):
    user = User(username=username, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# GameHistory functions
def get_game_history(db: Session, user_id: int):
    return db.query(GameHistory).filter(GameHistory.user_id == user_id).all()


def create_game_history(db: Session, user_id: int, score: int):
    game = GameHistory(user_id=user_id, score=score)
    db.add(game)
    db.commit()
    db.refresh(game)
    return game


# Leaderboard function
def get_leaderboard(db: Session, limit: int = 10):
    return db.query(GameHistory).order_by(GameHistory.score.desc()).limit(limit).all()


# -------------------------------
# Create tables if not exist
# -------------------------------
def init_db():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Database initialized.")
