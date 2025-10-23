from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from src.config.db import Base

class SudokuBoard(Base):
    __tablename__ = 'sudoku_boards'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    board = Column(String, nullable=False)
    created_at = Column(Integer, nullable=False)
    updated_at = Column(Integer, nullable=False)

    user = relationship("User", back_populates="sudoku_boards")