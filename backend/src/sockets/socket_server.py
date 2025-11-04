# src/sockets/socket_server.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from typing import List

router = APIRouter()


class ConnectionManager:
    """Simple Connection manager for demo WebSocket usage.

    Supports tracking active connections, sending personal messages and broadcasting.
    """

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        try:
            self.active_connections.remove(websocket)
        except ValueError:
            pass
        print(f"Client disconnected. Total: {len(self.active_connections)}")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: dict):
        # Iterate over a copy to avoid mutation during send
        for conn in list(self.active_connections):
            try:
                await conn.send_json(message)
            except Exception as e:
                print("Failed to send to a client, removing it:", e)
                try:
                    self.active_connections.remove(conn)
                except ValueError:
                    pass


manager = ConnectionManager()


def _make_demo_board():
    """Return a very small demo board shape used for demo purposes."""
    return {"board": [[0 for _ in range(9)] for _ in range(9)]}


@router.websocket("/ws/game")
async def websocket_endpoint(websocket: WebSocket):
    """Demo WebSocket endpoint.

    Accepts simple JSON messages:
      {"action":"echo","payload":...} -> sends back to sender
      {"action":"broadcast","payload":...} -> sends to all connected clients
      {"action":"new_game"} -> returns a demo board
    """
    await manager.connect(websocket)
    try:
        while True:
            data_str = await websocket.receive_text()
            try:
                data = json.loads(data_str)
            except Exception:
                await manager.send_personal_message({"type": "error", "data": "invalid json"}, websocket)
                continue

            action = data.get("action")
            payload = data.get("payload", None)

            if action == "echo":
                await manager.send_personal_message({"type": "echo", "data": payload}, websocket)

            elif action == "broadcast":
                await manager.broadcast({"type": "broadcast", "data": payload})

            elif action == "new_game":
                board = _make_demo_board()
                await manager.send_personal_message({"type": "game_created", "data": board}, websocket)

            else:
                await manager.send_personal_message({"type": "error", "data": f"unknown action '{action}'"}, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print("WebSocket error:", e)
        manager.disconnect(websocket)


print("Loaded: src/sockets/socket_server.py (demo)")