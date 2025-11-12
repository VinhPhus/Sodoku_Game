from fastapi import APIRouter, HTTPException
from typing import Optional
from ..services.match_service import MatchService

router = APIRouter(prefix="/api/match", tags=["Match"])

match_service = MatchService()


@router.get("/history/{user_id}")
async def get_user_match_history(user_id: str, limit: int = 50):
    """
    Lấy lịch sử trận đấu của user

    Args:
        user_id: ID của user
        limit: Số lượng trận tối đa (mặc định 50)
    """
    try:
        matches = match_service.get_user_matches(user_id, include_active=False)
        return {
            "success": True,
            "user_id": user_id,
            "total": len(matches),
            "matches": matches[:limit]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/{user_id}")
async def get_user_stats(user_id: str):
    """
    Lấy thống kê của user

    Args:
        user_id: ID của user
    """
    try:
        stats = match_service.get_user_stats(user_id)
        return {
            "success": True,
            **stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/leaderboard")
async def get_leaderboard(limit: int = 10):
    """
    Lấy bảng xếp hạng

    Args:
        limit: Số lượng người chơi (mặc định 10)
    """
    try:
        leaderboard = match_service.get_leaderboard(limit)
        return {
            "success": True,
            "leaderboard": leaderboard
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{match_id}")
async def get_match_details(match_id: str):
    """
    Lấy chi tiết trận đấu

    Args:
        match_id: ID của trận đấu
    """
    try:
        match = match_service.get_match(match_id)
        return {
            "success": True,
            "match": match
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{match_id}")
async def cancel_match(match_id: str):
    """
    Hủy trận đấu (chỉ khi trận chưa bắt đầu)

    Args:
        match_id: ID của trận đấu
    """
    try:
        match = match_service.get_match(match_id)

        if match['status'] != 'pending':
            raise HTTPException(
                status_code=400,
                detail="Chỉ có thể hủy trận đấu chưa bắt đầu"
            )

        match_service.storage.delete_match(match_id)

        return {
            "success": True,
            "message": "Đã hủy trận đấu"
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
