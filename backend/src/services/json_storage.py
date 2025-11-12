import json
import os
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path


class JSONStorage:
    """Service để lưu trữ dữ liệu vào file JSON"""

    def __init__(self, data_dir: str = "data"):
        """
        Khởi tạo JSON storage
        Args:
            data_dir: Thư mục chứa các file JSON
        """
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)

        # Đường dẫn các file
        self.users_file = self.data_dir / "users.json"
        self.matches_file = self.data_dir / "matches.json"
        self.match_history_file = self.data_dir / "match_history.json"

        # Khởi tạo files nếu chưa tồn tại
        self._init_file(self.users_file, [])
        self._init_file(self.matches_file, {})
        self._init_file(self.match_history_file, [])

    def _init_file(self, filepath: Path, default_data):
        """Tạo file JSON với dữ liệu mặc định nếu chưa tồn tại"""
        if not filepath.exists():
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(default_data, f, ensure_ascii=False, indent=2)

    def _read_json(self, filepath: Path):
        """Đọc dữ liệu từ file JSON"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return [] if 'history' in str(filepath) or 'users' in str(filepath) else {}

    def _write_json(self, filepath: Path, data):
        """Ghi dữ liệu vào file JSON"""
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    # ===== USER OPERATIONS =====

    def add_user(self, user_id: str, username: str, **kwargs) -> Dict:
        """Thêm user mới"""
        users = self._read_json(self.users_file)

        # Kiểm tra user đã tồn tại
        for user in users:
            if user['id'] == user_id:
                return user

        new_user = {
            'id': user_id,
            'username': username,
            'created_at': datetime.now().isoformat(),
            **kwargs
        }
        users.append(new_user)
        self._write_json(self.users_file, users)
        return new_user

    def get_user(self, user_id: str) -> Optional[Dict]:
        """Lấy thông tin user"""
        users = self._read_json(self.users_file)
        for user in users:
            if user['id'] == user_id:
                return user
        return None

    def get_all_users(self) -> List[Dict]:
        """Lấy tất cả users"""
        return self._read_json(self.users_file)

    # ===== MATCH OPERATIONS (Active matches) =====

    def create_match(self, match_id: str, player1_id: str, player2_id: str, **kwargs) -> Dict:
        """Tạo trận đấu mới"""
        matches = self._read_json(self.matches_file)

        match_data = {
            'match_id': match_id,
            'player1_id': player1_id,
            'player2_id': player2_id,
            'status': 'pending',  # pending, started, finished
            'created_at': datetime.now().isoformat(),
            'started_at': None,
            'finished_at': None,
            **kwargs
        }

        matches[match_id] = match_data
        self._write_json(self.matches_file, matches)
        return match_data

    def get_match(self, match_id: str) -> Optional[Dict]:
        """Lấy thông tin trận đấu"""
        matches = self._read_json(self.matches_file)
        return matches.get(match_id)

    def update_match(self, match_id: str, **updates) -> Optional[Dict]:
        """Cập nhật thông tin trận đấu"""
        matches = self._read_json(self.matches_file)

        if match_id not in matches:
            return None

        matches[match_id].update(updates)
        matches[match_id]['updated_at'] = datetime.now().isoformat()
        self._write_json(self.matches_file, matches)
        return matches[match_id]

    def delete_match(self, match_id: str) -> bool:
        """Xóa trận đấu (sau khi đã lưu vào history)"""
        matches = self._read_json(self.matches_file)

        if match_id in matches:
            del matches[match_id]
            self._write_json(self.matches_file, matches)
            return True
        return False

    def get_all_active_matches(self) -> List[Dict]:
        """Lấy tất cả trận đấu đang hoạt động"""
        matches = self._read_json(self.matches_file)
        return list(matches.values())

    # ===== MATCH HISTORY OPERATIONS =====

    def save_match_to_history(self, match_data: Dict) -> Dict:
        """Lưu trận đấu vào lịch sử"""
        history = self._read_json(self.match_history_file)

        history_entry = {
            **match_data,
            'saved_at': datetime.now().isoformat()
        }

        history.append(history_entry)
        self._write_json(self.match_history_file, history)
        return history_entry

    def get_match_history(self, user_id: Optional[str] = None, limit: int = 50) -> List[Dict]:
        """
        Lấy lịch sử trận đấu
        Args:
            user_id: Nếu có, chỉ lấy lịch sử của user này
            limit: Số lượng trận tối đa
        """
        history = self._read_json(self.match_history_file)

        if user_id:
            history = [
                match for match in history
                if match.get('player1_id') == user_id or match.get('player2_id') == user_id
            ]

        # Sắp xếp theo thời gian mới nhất
        history.sort(key=lambda x: x.get(
            'finished_at', x.get('created_at', '')), reverse=True)

        return history[:limit]

    def get_user_stats(self, user_id: str) -> Dict:
        """Lấy thống kê của user"""
        history = self.get_match_history(user_id)

        total_matches = len(history)
        wins = sum(1 for match in history if match.get('winner_id') == user_id)
        losses = total_matches - wins

        return {
            'user_id': user_id,
            'total_matches': total_matches,
            'wins': wins,
            'losses': losses,
            'win_rate': round(wins / total_matches * 100, 2) if total_matches > 0 else 0
        }

    def get_leaderboard(self, limit: int = 10) -> List[Dict]:
        """Lấy bảng xếp hạng"""
        users = self.get_all_users()
        leaderboard = []

        for user in users:
            stats = self.get_user_stats(user['id'])
            leaderboard.append({
                'user_id': user['id'],
                'username': user['username'],
                **stats
            })

        # Sắp xếp theo số thắng
        leaderboard.sort(key=lambda x: (
            x['wins'], x['win_rate']), reverse=True)

        return leaderboard[:limit]

    # ===== UTILITY METHODS =====

    def clear_all_data(self):
        """Xóa tất cả dữ liệu (dùng cho testing)"""
        self._write_json(self.users_file, [])
        self._write_json(self.matches_file, {})
        self._write_json(self.match_history_file, [])

    def backup_data(self, backup_dir: str = "backups"):
        """Sao lưu dữ liệu"""
        backup_path = Path(backup_dir)
        backup_path.mkdir(exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        for file in [self.users_file, self.matches_file, self.match_history_file]:
            if file.exists():
                backup_file = backup_path / f"{file.stem}_{timestamp}.json"
                data = self._read_json(file)
                self._write_json(backup_file, data)

        return f"Backup created at {backup_path} with timestamp {timestamp}"


# Singleton instance
_storage_instance = None


def get_json_storage(data_dir: str = "data") -> JSONStorage:
    """Lấy instance của JSONStorage (singleton pattern)"""
    global _storage_instance
    if _storage_instance is None:
        _storage_instance = JSONStorage(data_dir)
    return _storage_instance
