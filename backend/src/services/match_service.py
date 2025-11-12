from fastapi import HTTPException
from typing import Optional, Dict, List
import uuid
from datetime import datetime
from .json_storage import get_json_storage


class MatchService:
    """Service xử lý logic trận đấu với lưu trữ JSON"""

    def __init__(self):
        self.storage = get_json_storage()

    def create_match(self, user_id: str, opponent_id: str, difficulty: str = "medium") -> Dict:
        """
        Tạo trận đấu mới
        Args:
            user_id: ID người chơi 1
            opponent_id: ID người chơi 2
            difficulty: Độ khó (easy, medium, hard)
        Returns:
            Dict chứa thông tin trận đấu
        """
        # Kiểm tra users có tồn tại
        user = self.storage.get_user(user_id)
        opponent = self.storage.get_user(opponent_id)

        if not user or not opponent:
            raise HTTPException(status_code=404, detail="User not found")

        # Tạo match_id duy nhất
        match_id = str(uuid.uuid4())

        match = self.storage.create_match(
            match_id=match_id,
            player1_id=user_id,
            player2_id=opponent_id,
            difficulty=difficulty,
            player1_name=user['username'],
            player2_name=opponent['username'],
            player1_progress=0,
            player2_progress=0,
            player1_errors=0,
            player2_errors=0
        )

        return match

    def get_match(self, match_id: str) -> Dict:
        """Lấy thông tin trận đấu"""
        match = self.storage.get_match(match_id)
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        return match

    def start_match(self, match_id: str) -> Dict:
        """Bắt đầu trận đấu"""
        match = self.get_match(match_id)

        updated_match = self.storage.update_match(
            match_id,
            status='started',
            started_at=datetime.now().isoformat()
        )

        return updated_match

    def update_match_progress(self, match_id: str, player_id: str,
                              progress: int, errors: int) -> Dict:
        """
        Cập nhật tiến độ người chơi
        Args:
            match_id: ID trận đấu
            player_id: ID người chơi
            progress: Tiến độ (0-100)
            errors: Số lỗi
        """
        match = self.get_match(match_id)

        updates = {}
        if match['player1_id'] == player_id:
            updates['player1_progress'] = progress
            updates['player1_errors'] = errors
        elif match['player2_id'] == player_id:
            updates['player2_progress'] = progress
            updates['player2_errors'] = errors
        else:
            raise HTTPException(
                status_code=400, detail="Player not in this match")

        return self.storage.update_match(match_id, **updates)

    def finish_match(self, match_id: str, winner_id: str,
                     player1_time: str, player2_time: str) -> Dict:
        """
        Kết thúc trận đấu
        Args:
            match_id: ID trận đấu
            winner_id: ID người thắng
            player1_time: Thời gian hoàn thành của player 1
            player2_time: Thời gian hoàn thành của player 2
        """
        match = self.get_match(match_id)

        # Cập nhật trạng thái
        updated_match = self.storage.update_match(
            match_id,
            status='finished',
            finished_at=datetime.now().isoformat(),
            winner_id=winner_id,
            player1_time=player1_time,
            player2_time=player2_time
        )

        # Lưu vào history
        self.storage.save_match_to_history(updated_match)

        # Xóa khỏi active matches
        self.storage.delete_match(match_id)

        return updated_match

    def get_user_matches(self, user_id: str, include_active: bool = True) -> List[Dict]:
        """
        Lấy danh sách trận đấu của user
        Args:
            user_id: ID user
            include_active: Có bao gồm trận đang chơi không
        """
        matches = []

        # Lấy lịch sử
        history = self.storage.get_match_history(user_id)
        matches.extend(history)

        # Thêm trận đang chơi
        if include_active:
            active_matches = self.storage.get_all_active_matches()
            user_active = [
                m for m in active_matches
                if m['player1_id'] == user_id or m['player2_id'] == user_id
            ]
            matches.extend(user_active)

        return matches

    def get_user_stats(self, user_id: str) -> Dict:
        """Lấy thống kê của user"""
        return self.storage.get_user_stats(user_id)

    def get_leaderboard(self, limit: int = 10) -> List[Dict]:
        """Lấy bảng xếp hạng"""
        return self.storage.get_leaderboard(limit)

    def player_surrender(self, match_id: str, player_id: str) -> Dict:

        match = self.get_match(match_id)

        # Xác định người thắng
        if match['player1_id'] == player_id:
            winner_id = match['player2_id']
        elif match['player2_id'] == player_id:
            winner_id = match['player1_id']
        else:
            raise HTTPException(status_code=400, detail="Player not in this match")

        # --- Tính thời gian trận đấu ---
        try:
            if match.get("started_at"):
                started_at = datetime.fromisoformat(match["started_at"])
                now = datetime.now()
                elapsed_seconds = int((now - started_at).total_seconds())

                mins = elapsed_seconds // 60
                secs = elapsed_seconds % 60
                elapsed_str = f"{mins:02d}:{secs:02d}"
            else:
                elapsed_str = "00:00"
        except Exception:
            elapsed_str = "Lỗi TG"

        # --- Gán kết quả cho từng người ---
        player1_time = f"{elapsed_str}"
        player2_time = f"{elapsed_str}"
        # --- Kết thúc trận đấu ---
        return self.finish_match(
            match_id,
            winner_id=winner_id,
            player1_time=player1_time,
            player2_time=player2_time
        )