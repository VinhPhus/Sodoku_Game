import asyncio
import random
import string
from typing import Dict, Any, Optional

from fastapi import WebSocket
from .sudoku_service import SudokuService


def short_id(prefix: str, length: int = 3) -> str:
    """Sinh ID ngắn gọn kiểu M123 hoặc P45."""
    num = ''.join(random.choices(string.digits, k=length))
    return f"{prefix}{num}"


class MatchManager:
    def __init__(self, sudoku_service: SudokuService):
        self.sudoku = sudoku_service
        # match_id -> match state
        self.matches: Dict[str, Dict[str, Any]] = {}

    def create_match(self, difficulty: str = "easy") -> str:
        """Tạo match mới với độ khó được chọn."""
        match_id = short_id("M")  # Ví dụ: M312
        res = self.sudoku.generate_board(difficulty)
        match = {
            "match_id": match_id,
            "board": res["board"],
            "solution": res["solution"],
            "players": {},  # player_id -> websocket
            "player_order": [],  # list player_ids theo lượt
            "turn_index": 0,
            "lock": asyncio.Lock(),
            "started": False,
        }
        self.matches[match_id] = match
        return match_id

    async def join_match(self, match_id: str, websocket: WebSocket) -> Optional[str]:
        """Người chơi tham gia match qua websocket."""
        match = self.matches.get(match_id)
        if not match:
            return None

        # gán player_id ngắn
        player_id = short_id("P")
        match["players"][player_id] = websocket
        match["player_order"].append(player_id)

        # bắt đầu game khi có ít nhất 1 người chơi
        if len(match["player_order"]) >= 1:
            match["started"] = True

        return player_id

    async def leave_match(self, match_id: str, player_id: str):
        """Người chơi rời khỏi match."""
        match = self.matches.get(match_id)
        if not match:
            return

        match["players"].pop(player_id, None)
        try:
            match["player_order"].remove(player_id)
        except ValueError:
            pass

        # xoá match nếu không còn người chơi
        if not match["player_order"]:
            self.matches.pop(match_id, None)

    async def leave_by_ws(self, websocket: WebSocket):
        """Tự động xoá người chơi khi websocket đóng."""
        for match_id, match in list(self.matches.items()):
            for pid, ws in list(match["players"].items()):
                if ws is websocket:
                    await self.leave_match(match_id, pid)
                    return

    async def make_move(self, match_id: str, player_id: str, row: int, col: int, value: int) -> Dict[str, Any]:
        """Thực hiện 1 nước đi Sudoku."""
        match = self.matches.get(match_id)
        if not match:
            return {"ok": False, "error": "match_not_found"}

        async with match["lock"]:
            # kiểm tra lượt chơi
            if match["player_order"]:
                current_player = match["player_order"][match["turn_index"] % len(match["player_order"])]
                if current_player != player_id:
                    return {"ok": False, "error": "not_your_turn"}

            board = match["board"]
            valid = self.sudoku.validate_move(board, row, col, value)
            if valid:
                self.sudoku.apply_move(board, row, col, value)
                # chuyển lượt
                if match["player_order"]:
                    match["turn_index"] = (match["turn_index"] + 1) % max(1, len(match["player_order"]))
                return {"ok": True, "valid": True, "board": board}
            else:
                return {"ok": True, "valid": False}

    async def broadcast(self, match_id: str, message: Dict[str, Any]):
        """Gửi thông điệp đến toàn bộ người chơi trong match."""
        match = self.matches.get(match_id)
        if not match:
            return

        for ws in list(match["players"].values()):
            try:
                await ws.send_json(message)
            except Exception:
                pass  # bỏ qua lỗi gửi, disconnect cleanup sẽ xử lý sau

    def get_match(self, match_id: str) -> Optional[Dict[str, Any]]:
        """Trả về thông tin match."""
        return self.matches.get(match_id)