from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Lịch sử người dùng tham gia trong các trận đấu
    matches = relationship("MatchPlayer", back_populates="user")


class SudokuBoard(Base):
    __tablename__ = "sudoku_boards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50))
    initial_matrix = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    matches = relationship("Match", back_populates="board")


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("sudoku_boards.id"))
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    loser_id = Column(Integer, ForeignKey("users.id"), nullable=True)
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

    board = relationship("SudokuBoard", back_populates="matches")
    players = relationship("MatchPlayer", back_populates="match")


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
    status = Column(
        Enum("win", "lose", name="match_status_enum"),
        nullable=False
    )
    played_at = Column(DateTime, default=datetime.utcnow)

    match = relationship("Match")
    user = relationship("User")
