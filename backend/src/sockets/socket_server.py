# src/sockets/socket_server.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
import json
from ..services.match_service import MatchService
from ..services.json_storage import get_json_storage

router = APIRouter()


class ConnectionManager:
    """Quản lý kết nối WebSocket và trận đấu"""

    def __init__(self):
        # user_id -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}
        self.match_service = MatchService()
        self.storage = get_json_storage()

    async def connect(self, websocket: WebSocket, user_id: str, username: str):
        """Chấp nhận kết nối và đăng ký user"""
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        """Ngắt kết nối"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        """Gửi tin nhắn riêng đến 1 client"""
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)

    async def broadcast(self, message: dict, exclude_user_id: str = None):
        """Gửi tin nhắn đến tất cả client"""
        for user_id, connection in self.active_connections.items():
            if user_id != exclude_user_id:
                try:
                    await connection.send_json(message)
                except:
                    pass

    def get_online_players(self):
        """Lấy danh sách người chơi online"""
        players = []
        for user_id in self.active_connections.keys():
            user = self.storage.get_user_by_id(user_id)
            if user:
                players.append({
                    'id': user['id'],
                    'username': user['username'],
                    'status': 'online'
                })
        return players


# Tạo instance toàn cục
manager = ConnectionManager()


@router.websocket("/ws/game/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint chính"""
    username = None

    try:
        # Nhận message đầu tiên chứa username
        await websocket.accept()
        first_msg = await websocket.receive_json()
        username = first_msg.get('username', f'User_{user_id}')

        # Kết nối user
        manager.active_connections[user_id] = websocket

        # Gửi danh sách người chơi online cho tất cả
        online_players = manager.get_online_players()
        await manager.broadcast({
            'event': 'onlinePlayers',
            'players': online_players
        })

        while True:
            data = await websocket.receive_json()
            event = data.get('event')

            # Xử lý các sự kiện
            if event == 'getOnlinePlayers':
                # Gửi danh sách người chơi cho client yêu cầu
                online_players = manager.get_online_players()
                await manager.send_personal_message({
                    'event': 'onlinePlayers',
                    'players': online_players
                }, user_id)

            elif event == 'sendChallenge':
                opponent_id = data.get('opponentId')
                challenger = manager.storage.get_user_by_id(user_id)
                
                if not challenger:
                    continue

                await manager.send_personal_message({
                    'event': 'challengeReceived',
                    'challenger': {
                        'id': user_id,
                        'name': challenger['username'],
                        'avatar': challenger.get('avatar')
                    }
                }, opponent_id)

            elif event == 'acceptChallenge':
                challenger_id = data.get('challengerId')

                # Tạo trận đấu mới
                match = manager.match_service.create_match(
                    user_id=challenger_id,
                    opponent_id=user_id,
                    difficulty=data.get('difficulty', 'medium')
                )

                challenger = manager.storage.get_user_by_id(challenger_id)
                accepter = manager.storage.get_user_by_id(user_id)

                if not challenger or not accepter:
                    continue

                # Thông báo cho người thách đấu
                await manager.send_personal_message({
                    'event': 'challengeResponse',
                    'accepted': True,
                    'matchId': match['match_id'],
                    'challenger': {
                        'id': user_id,
                        'username': accepter['username'],
                        'avatar': accepter.get('avatar')
                    }
                }, challenger_id)

                # Thông báo cho người chấp nhận
                await manager.send_personal_message({
                    'event': 'challengeResponse',
                    'accepted': True,
                    'matchId': match['match_id'],
                    'challenger': {
                        'id': challenger_id,
                        'username': challenger['username'],
                        'avatar': challenger.get('avatar')
                    }
                }, user_id)

            elif event == 'declineChallenge':
                challenger_id = data.get('challengerId')
                await manager.send_personal_message({
                    'event': 'challengeResponse',
                    'accepted': False
                }, challenger_id)

            elif event == 'startMatch':
                match_id = data.get('matchId')
                match = manager.match_service.start_match(match_id)

                # Thông báo cho cả 2 người chơi kèm board và solution
                for player_id in [match['player1_id'], match['player2_id']]:
                    await manager.send_personal_message({
                        'event': 'matchStarted',
                        'matchId': match_id,
                        'match': match,
                        'board': match.get('board'),
                        'solution': match.get('solution')
                    }, player_id)

            elif event == 'updateProgress':
                match_id = data.get('matchId')
                progress = data.get('progress', 0)
                errors = data.get('errors', 0)

                match = manager.match_service.update_match_progress(
                    match_id, user_id, progress, errors
                )

                # Thông báo cho đối thủ
                opponent_id = (match['player2_id'] if match['player1_id'] == user_id
                               else match['player1_id'])
                
                # Gửi cập nhật tiến độ cho đối thủ
                await manager.send_personal_message({
                    'event': 'opponentProgress',
                    'progress': progress,
                    'errors': errors
                }, opponent_id)

            elif event == 'finishMatch':
                match_id = data.get('matchId')
                winner_id = data.get('winnerId')
                completion_time = data.get('completionTime', 0)

                # Lấy thông tin match
                match = manager.match_service.get_match(match_id)

                # Xác định thời gian
                if match['player1_id'] == winner_id:
                    player1_time = completion_time
                    player2_time = "-"
                else:
                    player1_time = "-"
                    player2_time = completion_time

                result = manager.match_service.finish_match(
                    match_id, winner_id, player1_time, player2_time
                )

                # Thông báo kết quả cho cả 2 người chơi
                for player_id in [result['player1_id'], result['player2_id']]:
                    await manager.send_personal_message({
                        'event': 'matchFinished',
                        'result': result
                    }, player_id)

            elif event == 'surrender':
                match_id = data.get('matchId')
                result = manager.match_service.player_surrender(
                    match_id, user_id)

                for player_id in [result['player1_id'], result['player2_id']]:
                    await manager.send_personal_message({
                        'event': 'matchFinished',
                        'result': result
                    }, player_id)

            elif event == 'chatMessage':
                match_id = data.get('matchId')
                message_text = data.get('message')

                if not match_id or not message_text:
                    continue

                match = manager.storage.get_match(match_id)
                if not match:
                    continue

                opponent_id = None
                if match['player1_id'] == user_id:
                    opponent_id = match['player2_id']
                elif match['player2_id'] == user_id:
                    opponent_id = match['player1_id']

                sender = manager.storage.get_user_by_id(user_id)

                if opponent_id and sender:
                    await manager.send_personal_message({
                        'event': 'chatMessageReceived',
                        'sender': {
                            'id': user_id,
                            'username': sender.get('username', 'Player')
                        },
                        'message': message_text
                    }, opponent_id)

            elif event == 'rematchRequest':
                # --- ĐÂY LÀ ĐOẠN CODE ĐÚNG ---
                match_id = data.get('matchId')
                difficulty = data.get('difficulty', 'medium')

                match = manager.storage.get_match(match_id)
                if not match:
                    continue

                opponent_id = None
                if match['player1_id'] == user_id:
                    opponent_id = match['player2_id']
                elif match['player2_id'] == user_id:
                    opponent_id = match['player1_id']

                requester = manager.storage.get_user_by_id(user_id)

                if opponent_id and requester:
                    await manager.send_personal_message({
                        'event': 'rematchRequested',
                        'requester': {
                            'id': user_id,
                            'username': requester.get('username', 'Player')
                        },
                        'matchId': match_id,
                        'difficulty': difficulty
                    }, opponent_id)

            elif event == 'rematchResponse':
                requester_id = data.get('requesterId')
                accepted = data.get('accepted', False)
                match_id = data.get('matchId')
                difficulty = data.get('difficulty', 'medium')

                if accepted:
                    new_match = manager.match_service.create_match(
                        user_id=requester_id,
                        opponent_id=user_id,
                        difficulty=difficulty
                    )

                    requester = manager.storage.get_user_by_id(requester_id)
                    accepter = manager.storage.get_user_by_id(user_id)

                    if not requester or not accepter:
                        continue

                    # Thông báo cho người yêu cầu (User 1)
                    await manager.send_personal_message({
                        'event': 'rematchAccepted',
                        'matchId': new_match['match_id'],
                        'opponent': {
                            'id': user_id,
                            'username': accepter['username'],
                            'avatar': accepter.get('avatar')
                        }
                    }, requester_id)

                    # Thông báo cho người chấp nhận (User 2)
                    await manager.send_personal_message({
                        'event': 'rematchAccepted',
                        'matchId': new_match['match_id'],
                        'opponent': {
                            'id': requester_id,
                            'username': requester['username'],
                            'avatar': requester.get('avatar')
                        }
                    }, user_id)
                else:
                    await manager.send_personal_message({
                        'event': 'rematchDeclined'
                    }, requester_id)

    except WebSocketDisconnect:
        manager.disconnect(user_id)

        await manager.broadcast({
            'event': 'onlinePlayers',
            'players': manager.get_online_players()
        })

        active_matches = manager.storage.get_all_active_matches()
        for match in active_matches:
            if user_id in [match['player1_id'], match['player2_id']]:
                opponent_id = (match['player2_id'] if match['player1_id'] == user_id
                               else match['player1_id'])
                await manager.send_personal_message({
                    'event': 'playerLeft',
                    'matchId': match['match_id']
                }, opponent_id)