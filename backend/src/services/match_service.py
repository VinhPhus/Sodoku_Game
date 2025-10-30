from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.match import Match
from backend.src.models.user_model import User

class MatchService:
    def __init__(self, db: Session):
        self.db = db

    def create_match(self, user_id: int, opponent_id: int):
        user = self.db.query(User).filter(User.id == user_id).first()
        opponent = self.db.query(User).filter(User.id == opponent_id).first()

        if not user or not opponent:
            raise HTTPException(status_code=404, detail="User not found")

        match = Match(user_id=user_id, opponent_id=opponent_id)
        self.db.add(match)
        self.db.commit()
        self.db.refresh(match)
        return match

    def get_match(self, match_id: int):
        match = self.db.query(Match).filter(Match.id == match_id).first()
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        return match

    def get_user_matches(self, user_id: int):
        matches = self.db.query(Match).filter((Match.user_id == user_id) | (Match.opponent_id == user_id)).all()
        return matches

    def delete_match(self, match_id: int):
        match = self.db.query(Match).filter(Match.id == match_id).first()
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        self.db.delete(match)
        self.db.commit()
        return {"detail": "Match deleted successfully"}