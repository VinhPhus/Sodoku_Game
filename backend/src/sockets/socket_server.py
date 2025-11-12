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

        # Thêm hoặc cập nhật user vào storage
        self.storage.add_user(user_id, username)

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
            user = self.storage.get_user(user_id)
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
        manager.storage.add_user(user_id, username)

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
                challenger = manager.storage.get_user(user_id)

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

                challenger = manager.storage.get_user(challenger_id)
                accepter = manager.storage.get_user(user_id)

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

                # Thông báo cho cả 2 người chơi
                for player_id in [match['player1_id'], match['player2_id']]:
                    await manager.send_personal_message({
                        'event': 'matchStarted',
                        'matchId': match_id,
                        'match': match
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

                await manager.send_personal_message({
                    'event': 'opponentProgress',
                    'progress': progress,
                    'errors': errors
                }, opponent_id)

            elif event == 'finishMatch':
                match_id = data.get('matchId')
                winner_id = data.get('winnerId')
                # Thời gian hoàn thành (giây)
                completion_time = data.get('completionTime', 0)

                # Lấy thông tin match để xác định player nào hoàn thành
                match = manager.match_service.get_match(match_id)

                # Xác định thời gian cho từng người chơi
                if match['player1_id'] == winner_id:
                    player1_time = completion_time  # Người thắng - thời gian thực
                    player2_time = "-"  # Người thua - chưa hoàn thành
                else:
                    player1_time = "-"  # Người thua - chưa hoàn thành
                    player2_time = completion_time  # Người thắng - thời gian thực

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

                # Thông báo cho cả 2 người chơi
                for player_id in [result['player1_id'], result['player2_id']]:
                    await manager.send_personal_message({
                        'event': 'matchFinished',
                        'result': result
                    }, player_id)

    except WebSocketDisconnect:
        manager.disconnect(user_id)

        # Thông báo người chơi đã thoát
        await manager.broadcast({
            'event': 'onlinePlayers',
            'players': manager.get_online_players()
        })

        # Nếu đang trong trận đấu, thông báo đối thủ
        active_matches = manager.storage.get_all_active_matches()
        for match in active_matches:
            if user_id in [match['player1_id'], match['player2_id']]:
                opponent_id = (match['player2_id'] if match['player1_id'] == user_id
                               else match['player1_id'])
                await manager.send_personal_message({
                    'event': 'playerLeft',
                    'matchId': match['match_id']
                }, opponent_id)
