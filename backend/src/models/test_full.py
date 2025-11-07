# file: test_full.py
from sqlalchemy import (
    create_engine, Column, Integer, String, ForeignKey, Enum,
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

    # Đây là fix chính: dùng Enum
    status = Column(Enum('win', 'lose', name='match_status_enum',
                    create_type=False), nullable=False)

    played_at = Column(DateTime, default=datetime.utcnow)

    match = relationship("Match", back_populates="histories")
    user = relationship("User", back_populates="histories")


# --------------------- CREATE TABLES ---------------------
Base.metadata.create_all(bind=engine)
print("All tables created successfully!")

# --------------------- TEST INSERT DATA ---------------------


def test_full_flow():
    db = SessionLocal()  # Tạo session trước
    try:
        # --- Xóa dữ liệu hiện tại, từ bảng con lên bảng cha để tránh FK constraint ---
        db.query(MatchHistory).delete(synchronize_session=False)
        db.query(MatchPlayer).delete(synchronize_session=False)
        db.query(Match).delete(synchronize_session=False)
        db.query(SudokuBoard).delete(synchronize_session=False)
        db.query(User).delete(synchronize_session=False)
        db.commit()
        print("Existing data cleared!")

        # --- Thêm user ---
        user1 = User(username="tiennguyen1231232", password_hash="123456")
        user2 = User(username="player2", password_hash="abcdef")
        db.add_all([user1, user2])
        db.commit()
        db.refresh(user1)
        db.refresh(user2)
        print(
            f"Users added: {user1.username} ({user1.id}), {user2.username} ({user2.id})"
        )

        # --- Thêm sudoku board ---
        board = SudokuBoard(
            name="Board1", initial_matrix="[[0,0,0],[0,0,0],[0,0,0]]"
        )
        db.add(board)
        db.commit()
        db.refresh(board)
        print(f"SudokuBoard added: {board.name} ({board.id})")

        # --- Tạo match ---
        match = Match(board_id=board.id)
        db.add(match)
        db.commit()
        db.refresh(match)
        print(f"Match created: id={match.id}, board_id={match.board_id}")

        # --- Thêm match players ---
        mp1 = MatchPlayer(match_id=match.id,
                          user_id=user1.id, time_spent_sec=300)
        mp2 = MatchPlayer(match_id=match.id,
                          user_id=user2.id, time_spent_sec=250)
        db.add_all([mp1, mp2])
        db.commit()
        print(f"MatchPlayers added: {mp1.user_id}, {mp2.user_id}")

        # --- Thêm match history ---
        mh1 = MatchHistory(match_id=match.id, user_id=user1.id, status="win")
        mh2 = MatchHistory(match_id=match.id, user_id=user2.id, status="lose")
        db.add_all([mh1, mh2])
        db.commit()
        print(f"MatchHistories added for users {user1.id}, {user2.id}")

    except Exception as e:
        db.rollback()
        print("Error:", e)
    finally:
        db.close()


if __name__ == "__main__":
    test_full_flow()
