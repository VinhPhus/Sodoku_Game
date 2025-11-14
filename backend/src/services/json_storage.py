from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path
import uuid
import json


class JSONStorage:
    """Service để lưu trữ dữ liệu vào file JSON"""

    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)

        self.users_file = self.data_dir / "users.json"
        self.matches_file = self.data_dir / "matches.json"
        self.match_history_file = self.data_dir / "match_history.json"

        self._init_file(self.users_file, [])
        self._init_file(self.matches_file, {})
        self._init_file(self.match_history_file, [])

    # ========================= BASIC JSON OPS =========================

    def _init_file(self, filepath: Path, default_data):
        if not filepath.exists():
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(default_data, f, ensure_ascii=False, indent=2)

    def _read_json(self, filepath: Path):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return [] if filepath == self.users_file or filepath == self.match_history_file else {}

    def _write_json(self, filepath: Path, data):
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    # ========================= USER OPS =========================

    def add_user(self, username: str, hashed_password: str) -> Dict:
        """Tạo user mới và lưu vào users.json"""
        users = self._read_json(self.users_file)

        new_user = {
            "id": str(uuid.uuid4()),
            "username": username,
            "hashed_password": hashed_password,
            "created_at": datetime.now().isoformat()
        }

        users.append(new_user)
        self._write_json(self.users_file, users)
        return new_user

    def get_user_by_username(self, username: str) -> Optional[Dict]:
        users = self._read_json(self.users_file)
        for u in users:
            if u["username"].lower() == username.lower():
                return u
        return None
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Lấy user bằng ID"""
        users = self._read_json(self.users_file)
        for u in users:
            if u.get("id") == user_id: # Dùng .get("id") để an toàn
                return u
        return None

    def get_all_users(self) -> List[Dict]:
        users = self._read_json(self.users_file)
        sanitized = []
        for u in users:
            clone = u.copy()
            clone.pop("hashed_password", None)
            sanitized.append(clone)
        return sanitized

    # ========================= MATCH OPS =========================

    def create_match(self, match_id: str, player1_id: str, player2_id: str, **kwargs) -> Dict:
        matches = self._read_json(self.matches_file)

        match_data = {
            "match_id": match_id,
            "player1_id": player1_id,
            "player2_id": player2_id,
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "started_at": None,
            "finished_at": None,
            **kwargs
        }

        matches[match_id] = match_data
        self._write_json(self.matches_file, matches)

        return match_data

    def get_match(self, match_id: str) -> Optional[Dict]:
        matches = self._read_json(self.matches_file)
        return matches.get(match_id)

    def update_match(self, match_id: str, **updates) -> Optional[Dict]:
        matches = self._read_json(self.matches_file)
        if match_id not in matches:
            return None

        matches[match_id].update(updates)
        matches[match_id]["updated_at"] = datetime.now().isoformat()
        self._write_json(self.matches_file, matches)

        return matches[match_id]

    def delete_match(self, match_id: str) -> bool:
        matches = self._read_json(self.matches_file)
        if match_id in matches:
            del matches[match_id]
            self._write_json(self.matches_file, matches)
            return True
        return False

    def get_all_active_matches(self) -> List[Dict]:
        matches = self._read_json(self.matches_file)
        active_list = []
        for match in matches.values():
            if match.get("status") != "finished":
                active_list.append(match)
        return active_list

    # ========================= MATCH HISTORY =========================

    def save_match_to_history(self, match_data: Dict) -> Dict:
        history = self._read_json(self.match_history_file)

        entry = {
            **match_data,
            "saved_at": datetime.now().isoformat()
        }

        history.append(entry)
        self._write_json(self.match_history_file, history)
        return entry

    def get_match_history(self, user_id: Optional[str] = None, limit: int = 50):
        history = self._read_json(self.match_history_file)

        if user_id:
            history = [
                h for h in history
                if h.get("player1_id") == user_id or h.get("player2_id") == user_id
            ]

        history.sort(key=lambda x: x.get("finished_at", x.get("created_at", "")), reverse=True)
        return history[:limit]

    # ========================= STATS / LEADERBOARD =========================

    def get_user_stats(self, user_id: str) -> Dict:
        history = self.get_match_history(user_id)

        total = len(history)
        wins = sum(1 for h in history if h.get("winner_id") == user_id)
        losses = total - wins

        return {
            "user_id": user_id,
            "total_matches": total,
            "wins": wins,
            "losses": losses,
            "win_rate": round(wins / total * 100, 2) if total else 0
        }

    def get_leaderboard(self, limit: int = 10):
        users = self.get_all_users()
        board = []

        for u in users:
            stats = self.get_user_stats(u["id"])
            board.append({
                "user_id": u["id"],
                "username": u["username"],
                **stats,
            })

        board.sort(key=lambda x: (x["wins"], x["win_rate"]), reverse=True)
        return board[:limit]

    # ========================= UTIL =========================

    def clear_all_data(self):
        self._write_json(self.users_file, [])
        self._write_json(self.matches_file, {})
        self._write_json(self.match_history_file, [])

    def backup_data(self, backup_dir="backups"):
        backup = Path(backup_dir)
        backup.mkdir(exist_ok=True)

        ts = datetime.now().strftime("%Y%m%d_%H%M%S")

        for file in [self.users_file, self.matches_file, self.match_history_file]:
            data = self._read_json(file)
            target = backup / f"{file.stem}_{ts}.json"
            self._write_json(target, data)

        return f"Backup created: {ts}"


# Singleton instance
_storage_instance = None


def get_json_storage(data_dir="data") -> JSONStorage:
    global _storage_instance
    if _storage_instance is None:
        _storage_instance = JSONStorage(data_dir)
    return _storage_instance
