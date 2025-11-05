from sqlalchemy import (
    Column, Integer, String, ForeignKey, DateTime,
    Text, Enum, LargeBinary
)
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base, engine


# --------------------- USER ---------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    profile_image = Column(LargeBinary, nullable=True)  # lưu ảnh nhị phân
    created_at = Column(DateTime, default=datetime.utcnow)
    user_status = Column(
        Enum("online", "offline", name="user_status_enum"),
        default="online"
    )

    # Quan hệ 1-n với MatchPlayer
    matches = relationship(
        "MatchPlayer", back_populates="user", cascade="all, delete-orphan")

    # Quan hệ 1-n với MatchHistory
    histories = relationship(
        "MatchHistory", back_populates="user", cascade="all, delete-orphan")

    # Quan hệ 1-n với Match (winner/loser)
    matches_won = relationship(
        "Match", foreign_keys="Match.winner_id", back_populates="winner")
    matches_lost = relationship(
        "Match", foreign_keys="Match.loser_id", back_populates="loser")


# --------------------- SUDOKU BOARD ---------------------
class SudokuBoard(Base):
    __tablename__ = "sudoku_boards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50))
    initial_matrix = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Quan hệ 1-n với Match
    matches = relationship("Match", back_populates="board",
                           cascade="all, delete-orphan")


# --------------------- MATCH ---------------------
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
    win_reason = Column(
        Enum(
            "solved_first",
            "opponent_quit",
            "opponent_timeout",
            "opponent_errors",
            name="win_reason_enum"
        ),
        nullable=True
    )

    # Quan hệ
    board = relationship("SudokuBoard", back_populates="matches")
    players = relationship(
        "MatchPlayer", back_populates="match", cascade="all, delete-orphan")
    histories = relationship(
        "MatchHistory", back_populates="match", cascade="all, delete-orphan")

    # Quan hệ ngược với User
    winner = relationship("User", foreign_keys=[
                          winner_id], back_populates="matches_won")
    loser = relationship("User", foreign_keys=[
                         loser_id], back_populates="matches_lost")


# --------------------- MATCH PLAYER ---------------------
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


# --------------------- MATCH HISTORY ---------------------
class MatchHistory(Base):
    __tablename__ = "match_histories"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    status = Column(
        Enum("win", "lose", name="match_status_enum"), nullable=False)
    played_at = Column(DateTime, default=datetime.utcnow)

    match = relationship("Match", back_populates="histories")
    user = relationship("User", back_populates="histories")
