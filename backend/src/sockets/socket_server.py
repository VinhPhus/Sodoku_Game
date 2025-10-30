# src/sockets/socket_server.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json

# Import tương đối: '..' đi lên 'src', sau đó vào 'services'

router = APIRouter()

class ConnectionManager:
    """Quản lý các kết nối WebSocket."""
def some_function():
    from ..services.sudoku_service import SudokuService  # import ở đây
    service = SudokuService()

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Client mới đã kết nối. Tổng số: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"Client đã ngắt kết nối. Còn lại: {len(self.active_connections)}")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Gửi tin nhắn JSON cho một client cụ thể."""
        await websocket.send_json(message)

# Tạo một instance manager
manager = ConnectionManager()


@router.websocket("/game")
async def websocket_endpoint(websocket: WebSocket):
    """
    Endpoint WebSocket chính cho game Sudoku.
    """
    await manager.connect(websocket)
    try:
        while True:
            # Chờ nhận tin nhắn từ client
            data_str = await websocket.receive_text()
            data = json.loads(data_str)
            
            action = data.get("action")
            payload = data.get("payload", {})

            if action == "new_game":
                # Client yêu cầu ván mới
                board = sudoku_service.generate_puzzle()
                # Gửi ván đố về cho client (dùng .dict() để chuyển Pydantic model thành JSON)
                await manager.send_personal_message(
                    {"type": "game_created", "data": board.dict()},
                    websocket
                )
            
            elif action == "make_move":
                # Client thực hiện một nước đi
                row = payload.get("row")
                col = payload.get("col")
                value = payload.get("value")
                
                is_valid = sudoku_service.check_move(row, col, value)
                
                await manager.send_personal_message(
                    {"type": "move_result", "data": {"valid": is_valid, "row": row, "col": col, "value": value}},
                    websocket
                )
                
            else:
                # Hành động không xác định
                await manager.send_personal_message(
                    {"type": "error", "data": {"message": f"Hành động '{action}' không được hỗ trợ."}},
                    websocket
                )

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"Lỗi WebSocket: {e}")
        manager.disconnect(websocket)

print("Đã tải: src/sockets/socket_server.py")