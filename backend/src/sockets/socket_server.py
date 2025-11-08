# src/sockets/socket_server.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List

router = APIRouter()

# ===============================
# ✅ Class quản lý kết nối WebSocket
# ===============================
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Chấp nhận kết nối mới và thêm vào danh sách"""
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        """Ngắt kết nối và xóa khỏi danh sách"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_message(self, message: str, websocket: WebSocket):
        """Gửi tin nhắn riêng đến 1 client"""
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        """Gửi tin nhắn đến tất cả client đang kết nối"""
        for connection in self.active_connections:
            await connection.send_text(message)

# Tạo instance của manager để dùng toàn cục
manager = ConnectionManager()

# ===============================
# ✅ Router WebSocket endpoint
# ===============================
@router.websocket("/ws/game")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"Người chơi gửi: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast("Một người chơi đã ngắt kết nối.")
