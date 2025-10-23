from fastapi import APIRouter, HTTPException
from typing import List, Dict

router = APIRouter()

# Sample leaderboard data
leaderboard_data = [
    {"username": "player1", "score": 1500},
    {"username": "player2", "score": 1200},
    {"username": "player3", "score": 900},
]

@router.get("/leaderboard", response_model=List[Dict[str, int]])
async def get_leaderboard():
    return leaderboard_data

@router.post("/leaderboard", response_model=Dict[str, str])
async def add_score(username: str, score: int):
    if score < 0:
        raise HTTPException(status_code=400, detail="Score must be a positive integer.")
    
    leaderboard_data.append({"username": username, "score": score})
    return {"message": "Score added successfully."}