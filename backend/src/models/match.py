from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Match(Base):
    __tablename__ = 'matches'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    sudoku_board_id = Column(Integer, ForeignKey('sudoku_boards.id'))
    score = Column(Integer)
    timestamp = Column(Integer)

    user = relationship("User", back_populates="matches")
    sudoku_board = relationship("SudokuBoard", back_populates="matches")