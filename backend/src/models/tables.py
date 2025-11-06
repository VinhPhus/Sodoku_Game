# file: test_db.py
from sqlalchemy import (
    create_engine, Column, Integer, String, ForeignKey,
    DateTime, Text, LargeBinary, CheckConstraint
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

# --------------------- Load .env ---------------------
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# --------------------- Engine & Session ---------------------
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --------------------- MODELS ---------------------


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    profile_image = Column(LargeBinary, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_status = Column(String(20), default="online", nullable=False)

    __table_args__ = (
        CheckConstraint("user_status IN ('online', 'offline')",
                        name="user_status_check"),
    )

    matches = relationship(
        "MatchPlayer", back_populates="user", cascade="all, delete-orphan")
    histories = relationship(
        "MatchHistory", back_populates="user", cascade="all, delete-orphan")
    matches_won = relationship(
        "Match", foreign_keys="Match.winner_id", back_populates="winner")
    matches_lost = relationship(
        "Match", foreign_keys="Match.loser_id", back_populates="loser")


class SudokuBoard(Base):
    __tablename__ = "sudoku_boards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50))
    initial_matrix = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    matches = relationship("Match", back_populates="board",
                           cascade="all, delete-orphan")


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey(
        "sudoku_boards.id", ondelete="CASCADE"))
    winner_id = Column(Integer, ForeignKey(
        "users.id", ondelete="SET NULL"), nullable=True)
    loser_id = Column(Integer, ForeignKey(
        "users.id", ondelete="SET NULL"), nullable=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    win_reason = Column(String(30), nullable=True)

    board = relationship("SudokuBoard", back_populates="matches")
    players = relationship(
        "MatchPlayer", back_populates="match", cascade="all, delete-orphan")
    histories = relationship(
        "MatchHistory", back_populates="match", cascade="all, delete-orphan")
    winner = relationship("User", foreign_keys=[
                          winner_id], back_populates="matches_won")
    loser = relationship("User", foreign_keys=[
                         loser_id], back_populates="matches_lost")


class MatchPlayer(Base):
    __tablename__ = "match_players"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    joined_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)
    time_spent_sec = Column(Integer, nullable=True)

    match = relationship("Match", back_populates="players")
    user = relationship("User", back_populates="matches")


class MatchHistory(Base):
    __tablename__ = "match_histories"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    status = Column(String(20), nullable=False)
    played_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint("status IN ('win', 'lose')",
                        name="match_status_check"),
    )

    match = relationship("Match", back_populates="histories")
    user = relationship("User", back_populates="histories")


# --------------------- CREATE TABLES ---------------------
Base.metadata.create_all(bind=engine)
print("✅ All tables created successfully!")

# --------------------- TEST INSERT ---------------------


def test_insert_user():
    db = SessionLocal()
    try:
        new_user = User(username="tiennguyen", password_hash="123456")
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"✅ Added user: id={new_user.id}, username={new_user.username}")
    except Exception as e:
        db.rollback()
        print("❌ Error inserting user:", e)
    finally:
        db.close()


if __name__ == "__main__":
    test_insert_user()
