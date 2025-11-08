import asyncio
import random
import string
# 1. Thêm Tuple vào import
from typing import Dict, Any, Optional, Tuple

from fastapi import WebSocket
from .sudoku_service import SudokuService

# ... (các hàm khác giữ nguyên) ...

class MatchManager:
    # ... (hàm __init__, create_match, join_match, leave_match giữ nguyên) ...

    # 2. Sửa hàm leave_by_ws
    async def leave_by_ws(self, websocket: WebSocket) -> Optional[Tuple[str, str]]:
        """Tự động xoá người chơi khi websocket đóng.
        
        Trả về (match_id, player_id) nếu tìm thấy, ngược lại trả None.
        """
        for match_id, match in list(self.matches.items()):
            for pid, ws in list(match["players"].items()):
                if ws is websocket:
                    await self.leave_match(match_id, pid)
                    # Trả về thông tin người vừa rời đi
                    return match_id, pid
        return None

    # ... (các hàm make_move, broadcast, get_match giữ nguyên) ...