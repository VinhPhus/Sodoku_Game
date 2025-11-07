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
        new_users = [
            User(username="tiennguyen", password_hash="123456"),
            User(username="thanhnguyen", password_hash="234567"),
            User(username="tamdao", password_hash="345678"),
            User(username="phutrong", password_hash="456789"),
            User(username="tritrung", password_hash="987654"),
            User(username="haonguyen", password_hash="876543"),
            User(username="quoctuan", password_hash="765432"),
        ]
        # Insert users
        db.add_all(new_users)
        db.commit()
        for u in new_users:
            db.refresh(u)
        print(f"Added {len(new_users)} users")

        # --------------------- Create sample sudoku boards ---------------------
        boards = [
            SudokuBoard(name="Easy Board 1", initial_matrix='0'*81),
            SudokuBoard(name="Medium Board 1", initial_matrix='.'*81),
            SudokuBoard(name="Hard Board 1", initial_matrix='1'*81),
        ]
        db.add_all(boards)
        db.commit()
        for b in boards:
            db.refresh(b)
        print(f"Added {len(boards)} sudoku boards")

        # --------------------- Create sample matches ---------------------
        # Pair first few users into matches
        matches = [
            Match(board_id=boards[0].id, winner_id=new_users[0].id,
                  loser_id=new_users[1].id, win_reason="finished"),
            Match(board_id=boards[1].id, winner_id=new_users[2].id,
                  loser_id=new_users[3].id, win_reason="timeout"),
            Match(board_id=boards[2].id, winner_id=new_users[4].id,
                  loser_id=new_users[5].id, win_reason="forfeit"),
        ]
        db.add_all(matches)
        db.commit()
        for m in matches:
            db.refresh(m)
        print(f"Added {len(matches)} matches")

        # --------------------- Create sample match players ---------------------
        players = []
        for m in matches:
            if m.winner_id:
                players.append(MatchPlayer(
                    match_id=m.id, user_id=m.winner_id, time_spent_sec=300))
            if m.loser_id:
                players.append(MatchPlayer(
                    match_id=m.id, user_id=m.loser_id, time_spent_sec=450))
        db.add_all(players)
        db.commit()
        print(f"Added {len(players)} match players")

        # --------------------- Create sample match histories ---------------------
        histories = []
        for m in matches:
            if m.winner_id:
                histories.append(MatchHistory(
                    match_id=m.id, user_id=m.winner_id, status="win"))
            if m.loser_id:
                histories.append(MatchHistory(
                    match_id=m.id, user_id=m.loser_id, status="lose"))
        db.add_all(histories)
        db.commit()
        print(f"Added {len(histories)} match histories")
    except Exception as e:
        db.rollback()
        print("Error inserting user:", e)
    finally:
        db.close()


if __name__ == "__main__":
    test_insert_user()
