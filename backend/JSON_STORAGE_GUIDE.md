# Hướng dẫn sử dụng JSON Storage cho Sudoku Game

## Tổng quan
Dự án đã được chuyển đổi từ database (SQLAlchemy) sang lưu trữ JSON. Tất cả dữ liệu sẽ được lưu trong thư mục `data/` với 3 file chính:

- `users.json` - Thông tin người dùng
- `matches.json` - Trận đấu đang diễn ra
- `match_history.json` - Lịch sử các trận đấu

## Cài đặt

1. Không cần cài đặt database nữa
2. Chỉ cần cài đặt các dependencies Python:

```bash
cd backend
pip install fastapi uvicorn websockets
```

## Chạy server

```bash
# Từ thư mục backend
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

hoặc

```bash
cd backend
uvicorn src.main:app --reload
```

## API Endpoints

### WebSocket
- `ws://localhost:8000/ws/game/{user_id}` - Kết nối WebSocket chính

### REST API
- `GET /` - Thông tin API
- `GET /health` - Kiểm tra trạng thái server
- `GET /api/match/history/{user_id}` - Lịch sử trận đấu
- `GET /api/match/stats/{user_id}` - Thống kê người chơi
- `GET /api/match/leaderboard` - Bảng xếp hạng
- `GET /api/match/{match_id}` - Chi tiết trận đấu
- `DELETE /api/match/{match_id}` - Hủy trận đấu

## WebSocket Events

### Client gửi lên server:

1. **Kết nối ban đầu**
```json
{
  "username": "Player1"
}
```

2. **Gửi lời thách đấu**
```json
{
  "event": "sendChallenge",
  "opponentId": "user_123"
}
```

3. **Chấp nhận thách đấu**
```json
{
  "event": "acceptChallenge",
  "challengerId": "user_456",
  "difficulty": "medium"
}
```

4. **Từ chối thách đấu**
```json
{
  "event": "declineChallenge",
  "challengerId": "user_456"
}
```

5. **Bắt đầu trận đấu**
```json
{
  "event": "startMatch",
  "matchId": "uuid-here"
}
```

6. **Cập nhật tiến độ**
```json
{
  "event": "updateProgress",
  "matchId": "uuid-here",
  "progress": 50,
  "errors": 2
}
```

7. **Kết thúc trận đấu**
```json
{
  "event": "finishMatch",
  "matchId": "uuid-here",
  "winnerId": "user_123",
  "player1Time": "02:30",
  "player2Time": "03:00"
}
```

8. **Đầu hàng**
```json
{
  "event": "surrender",
  "matchId": "uuid-here"
}
```

### Server gửi xuống client:

1. **Danh sách người chơi online**
```json
{
  "event": "onlinePlayers",
  "players": [
    {"id": "user_1", "username": "Player1", "status": "online"}
  ]
}
```

2. **Nhận lời thách đấu**
```json
{
  "event": "challengeReceived",
  "challenger": {
    "id": "user_123",
    "name": "Player1",
    "avatar": "url"
  }
}
```

3. **Phản hồi thách đấu**
```json
{
  "event": "challengeResponse",
  "accepted": true,
  "matchId": "uuid-here",
  "challenger": {...}
}
```

4. **Trận đấu bắt đầu**
```json
{
  "event": "matchStarted",
  "matchId": "uuid-here",
  "match": {...}
}
```

5. **Cập nhật tiến độ đối thủ**
```json
{
  "event": "opponentProgress",
  "progress": 50,
  "errors": 2
}
```

6. **Trận đấu kết thúc**
```json
{
  "event": "matchFinished",
  "result": {...}
}
```

7. **Người chơi thoát**
```json
{
  "event": "playerLeft",
  "matchId": "uuid-here"
}
```

## Cấu trúc dữ liệu JSON

### users.json
```json
[
  {
    "id": "user_123",
    "username": "Player1",
    "created_at": "2025-11-12T10:00:00"
  }
]
```

### matches.json
```json
{
  "uuid-match-1": {
    "match_id": "uuid-match-1",
    "player1_id": "user_123",
    "player2_id": "user_456",
    "player1_name": "Player1",
    "player2_name": "Player2",
    "status": "started",
    "difficulty": "medium",
    "player1_progress": 50,
    "player2_progress": 30,
    "player1_errors": 2,
    "player2_errors": 1,
    "created_at": "2025-11-12T10:00:00",
    "started_at": "2025-11-12T10:01:00"
  }
}
```

### match_history.json
```json
[
  {
    "match_id": "uuid-match-1",
    "player1_id": "user_123",
    "player2_id": "user_456",
    "winner_id": "user_123",
    "player1_time": "02:30",
    "player2_time": "03:00",
    "status": "finished",
    "finished_at": "2025-11-12T10:05:00",
    "saved_at": "2025-11-12T10:05:01"
  }
]
```

## Backup dữ liệu

Sử dụng JSONStorage để backup:

```python
from src.services.json_storage import get_json_storage

storage = get_json_storage()
result = storage.backup_data()
print(result)  # Backup created at backups/ with timestamp ...
```

## Testing

Test kết nối WebSocket:
```bash
# Mở file demo_ws_client.html trong browser
# hoặc sử dụng tool như wscat
wscat -c ws://localhost:8000/ws/game/test_user_1
```

## Lưu ý

1. **Dữ liệu được lưu ngay lập tức** vào file JSON sau mỗi thay đổi
2. **Không cần migration** - file JSON tự động được tạo khi chạy lần đầu
3. **Backup thường xuyên** - Sử dụng method `backup_data()`
4. **Hiệu năng** - Phù hợp cho số lượng user vừa phải (< 1000 concurrent users)
5. **Thread-safe** - Mỗi operation đọc/ghi file riêng biệt

## Chuyển đổi từ Frontend

Cập nhật SocketContext để kết nối đúng endpoint:

```javascript
// frontend/src/context/SocketContext.jsx
const socket = io('http://localhost:8000', {
  path: '/ws/game/{user_id}',
  transports: ['websocket']
});
```

## Troubleshooting

**Lỗi: File not found**
- Đảm bảo thư mục `data/` tồn tại hoặc sẽ được tạo tự động

**Lỗi: JSON decode error**
- Xóa file JSON bị lỗi, sẽ được tạo lại tự động

**Lỗi: WebSocket connection failed**
- Kiểm tra server đang chạy
- Kiểm tra port 8000 không bị chiếm dụng
- Kiểm tra firewall

## Files đã thay đổi

1. ✅ `backend/src/services/json_storage.py` - Service mới xử lý JSON
2. ✅ `backend/src/services/match_service.py` - Cập nhật sử dụng JSON
3. ✅ `backend/src/sockets/socket_server.py` - Cập nhật xử lý match
4. ✅ `backend/src/routes/match_api.py` - API endpoints mới
5. ✅ `backend/src/main.py` - Kết nối routes và middleware

## Files có thể xóa (không dùng nữa)

- `backend/src/models/db.py`
- `backend/src/models/match.py`
- `backend/src/services/database_service.py`
- Các file liên quan đến SQLAlchemy/Database
