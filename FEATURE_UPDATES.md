# Cập nhật các tính năng mới

## ✅ 1. Đồng bộ ma trận cho 2 players (Hoàn thành)

### Backend:
- ✅ `match_service.py`: Tạo board chung khi create_match
- ✅ `socket_server.py`: Gửi board và solution trong event matchStarted

### Frontend:
- ✅ `App.jsx`: Lưu gameBoard và gameSolution từ server
- ✅ `Maingame.jsx`: Nhận serverBoard và serverSolution từ props

---

## 🔄 2. Viết chì (Pencil Marks)

### Maingame.jsx - Thêm states:
```jsx
const [pencilMode, setPencilMode] = useState(false);
const [pencilMarks, setPencilMarks] = useState({}); // { "row-col": Set([1,2,3]) }
```

### Maingame.jsx - Cập nhật handleNumberInput:
```jsx
// Thêm logic pencil mode:
if (pencilMode) {
    const newMarks = { ...pencilMarks };
    if (!newMarks[cellKey]) newMarks[cellKey] = new Set();
    
    // Toggle số
    if (newMarks[cellKey].has(number)) {
        newMarks[cellKey].delete(number);
    } else {
        newMarks[cellKey].add(number);
    }
    
    setPencilMarks(newMarks);
    return;
}

// Xóa pencil marks khi điền số chính thức:
const newMarks = { ...pencilMarks };
delete newMarks[cellKey];
setPencilMarks(newMarks);
```

### Maingame.jsx - UI Button:
```jsx
<button 
    className={`control-button ${pencilMode ? 'active' : ''}`}
    onClick={() => setPencilMode(!pencilMode)}
>
    ✏️ Viết chì {pencilMode ? '(BẬT)' : ''}
</button>
```

### Maingame.jsx - Render pencil marks:
```jsx
// Trong renderCell():
{board[i][j] === 0 && pencilMarks[cellKey] && (
    <div className="pencil-marks">
        {[1,2,3,4,5,6,7,8,9].map(num => (
            <span key={num} className={pencilMarks[cellKey].has(num) ? 'marked' : ''}>
                {pencilMarks[cellKey].has(num) ? num : ''}
            </span>
        ))}
    </div>
)}
```

### Maingame.css - Styles:
```css
.pencil-marks {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    width: 100%;
    height: 100%;
    font-size: 0.5em;
    color: #666;
}

.pencil-marks span {
    text-align: center;
    line-height: 1;
}

.control-button.active {
    background-color: var(--color-primary);
    color: white;
}
```

---

## 🔄 3. Xác nhận đấu lại

### MatchResult.jsx - Sửa onReplay:
```jsx
const handleReplay = () => {
    if (socket && opponent) {
        // Gửi yêu cầu đấu lại
        socket.emit('requestRematch', {
            opponentId: opponent.id,
            challengerId: user.id
        });
        alert('Đã gửi yêu cầu đấu lại đến đối thủ!');
    }
};
```

### Backend socket_server.py - Thêm event:
```python
elif event == 'requestRematch':
    opponent_id = data.get('opponentId')
    challenger_id = data.get('challengerId')
    
    challenger = manager.storage.get_user(challenger_id)
    
    await manager.send_personal_message({
        'event': 'rematchRequest',
        'challenger': {
            'id': challenger_id,
            'username': challenger['username']
        }
    }, opponent_id)

elif event == 'acceptRematch':
    challenger_id = data.get('challengerId')
    
    # Tạo match mới
    match = manager.match_service.create_match(
        user_id=challenger_id,
        opponent_id=user_id,
        difficulty='medium'
    )
    
    # Gửi matchId cho cả 2
    for player_id in [challenger_id, user_id]:
        await manager.send_personal_message({
            'event': 'rematchAccepted',
            'matchId': match['match_id']
        }, player_id)
```

### Frontend App.jsx - Listener:
```jsx
socket.on("rematchRequest", (data) => {
    const confirmed = window.confirm(
        `${data.challenger.username} muốn đấu lại. Bạn có chấp nhận không?`
    );
    
    if (confirmed) {
        socket.emit('acceptRematch', {
            challengerId: data.challenger.id
        });
    }
});

socket.on("rematchAccepted", (data) => {
    setOpponent(prev => ({ ...prev, matchId: data.matchId }));
    setScreen("matchSetup");
});
```

---

## 🔄 4. Giới hạn số lượt gợi ý

### Maingame.jsx - State:
```jsx
const MAX_HINTS = 3;
const [hintsRemaining, setHintsRemaining] = useState(MAX_HINTS);
```

### Maingame.jsx - Cập nhật handleHint:
```jsx
const handleHint = () => {
    if (gameWon) return;
    
    if (hintsRemaining <= 0) {
        alert('⚠️ Bạn đã hết lượt gợi ý!');
        return;
    }
    
    if (errorCells.size > 0) {
        alert("⚠️ Bạn phải sửa lại ô sai (khung đỏ) trước khi dùng gợi ý!");
        return;
    }
    
    // Tìm ô trống và điền
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cellKey = `${i}-${j}`;
            if (!defaultCells.has(cellKey) && board[i][j] === 0) {
                const newBoard = board.map(r => [...r]);
                newBoard[i][j] = solution[i][j];
                setBoard(newBoard);
                setHintsRemaining(prev => prev - 1); // Giảm lượt
                
                setSelectedCell({ row: i, col: j });
                setTimeout(() => setSelectedCell(null), 1500);
                
                return;
            }
        }
    }
};
```

### Maingame.jsx - UI Display:
```jsx
<button 
    className="control-button hint-button"
    onClick={handleHint}
    disabled={hintsRemaining <= 0}
>
    💡 Gợi ý ({hintsRemaining}/{MAX_HINTS})
</button>
```

### Maingame.css:
```css
.hint-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #ccc;
}
```

---

## 📋 Checklist triển khai:

- [x] 1. Đồng bộ ma trận (Hoàn thành)
- [ ] 2. Viết chì - Thêm vào Maingame.jsx
- [ ] 3. Xác nhận đấu lại - Backend + Frontend
- [ ] 4. Giới hạn hint - Cập nhật Maingame.jsx

## 🚀 Lệnh test:
```bash
# Backend
cd backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm run dev
```
