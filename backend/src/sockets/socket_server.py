# src/sockets/socket_server.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from typing import List

# Import the SudokuService we just fixed
from ..services.sudoku_service import SudokuService
from ..services.match_manager import MatchManager

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

# create a single service instance for demo usage
service = SudokuService()
# Create a match manager instance
match_manager = MatchManager(service)


@router.websocket("/ws/game")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint that uses SudokuService for demo game actions.

    Supported actions (JSON):
      - {"action":"new_game","payload":{"difficulty":"easy"}}
      - {"action":"make_move","payload":{"board":[[...]],"row":0,"col":1,"value":5}}
      - {"action":"echo","payload":...}
      - {"action":"broadcast","payload":...}
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

            elif action == "create_match":
                difficulty = (payload or {}).get("difficulty", "easy")
                match_id = match_manager.create_match(difficulty)
                await manager.send_personal_message({"type": "match_created", "data": {"match_id": match_id}}, websocket)

            elif action == "join_match":
                match_id = (payload or {}).get("match_id")
                if not match_id:
                    await manager.send_personal_message({"type": "error", "data": "missing match_id"}, websocket)
                    continue
                player_id = await match_manager.join_match(match_id, websocket)
                if not player_id:
                    await manager.send_personal_message({"type": "error", "data": "match_not_found"}, websocket)
                    continue
                match = match_manager.get_match(match_id)
                await manager.send_personal_message({"type": "joined", "data": {"match_id": match_id, "player_id": player_id, "board": match["board"]}}, websocket)

            elif action == "make_move":
                match_id = (payload or {}).get("match_id")
                player_id = (payload or {}).get("player_id")
                row = (payload or {}).get("row")
                col = (payload or {}).get("col")
                value = (payload or {}).get("value")

                if not match_id or not player_id or row is None or col is None or value is None:
                    await manager.send_personal_message({"type": "error", "data": "missing move payload"}, websocket)
                    continue

                result = await match_manager.make_move(match_id, player_id, row, col, value)
                if not result.get("ok"):
                    await manager.send_personal_message({"type": "error", "data": result.get("error")}, websocket)
                    continue

                if result.get("valid"):
                    # broadcast updated board to all players in match
                    await match_manager.broadcast(match_id, {"type": "move", "data": {"player_id": player_id, "row": row, "col": col, "value": value, "board": result.get("board")}})
                else:
                    await manager.send_personal_message({"type": "move_result", "data": {"valid": False}}, websocket)

            else:
                await manager.send_personal_message({"type": "error", "data": f"unknown action '{action}'"}, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print("WebSocket error:", e)
        manager.disconnect(websocket)


print("Loaded: src/sockets/socket_server.py (wired to SudokuService)")