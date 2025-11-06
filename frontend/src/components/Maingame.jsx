import React, { useState, useEffect } from "react";
import "../style/Maingame.css";
import SurrenderDialog from "./SurrenderDialog";

// Icon từ lucide-react (giả định đã được cài đặt)
import { LogOut, PenLine, Eraser, Lightbulb, Check, Menu, MessageSquare, Send, X, Swords } from "lucide-react";


// Dữ liệu Sudoku giả lập (0: ô trống, 1-9: số đã điền)
const initialBoard = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

// Giả định các ô gợi ý ban đầu (không thể chỉnh sửa)
const defaultCells = initialBoard.map(row => row.map(cell => cell !== 0));

// Giả định đáp án đúng (để phục vụ chức năng gợi ý)
const solutionBoard = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

// --- THAY ĐỔI 1: Định nghĩa hằng số thời gian (tính bằng giây) ---
// (Ví dụ của bạn là 3 phút = 180s, mã gốc là 140s. Tôi dùng 140s để khớp mã gốc)
const GAME_DURATION_SECONDS = 140; 


// Component con: Sudoku Cell
const SudokuCell = ({ value, isDefault, isSelected, isError, onCellClick }) => {
    // ... (Không thay đổi)
    const displayValue = Array.isArray(value) 
        ? <div className="pencil-marks">{value.map((n, i) => <span key={i}>{n}</span>)}</div> 
        : (value === 0 ? '' : value);
    
    const isPlayerInput = value !== 0 && !isDefault && !Array.isArray(value);

    const className = `cell 
        ${isSelected ? 'selected' : ''} 
        ${isDefault ? 'default' : ''} 
        ${isPlayerInput ? 'player-input' : ''} 
        ${isError ? 'error' : ''}
    `;

    return (
        <div className={className} onClick={onCellClick}>
            {displayValue}
        </div>
    );
};


// Component chính
const Maingame = ({ user = { name: 'YOU' }, opponent = { name: 'PLAYER A' }, onSurrender = () => {}, onFinish = () => {} }) => {
    const [board, setBoard] = useState(initialBoard);
    const [selectedCell, setSelectedCell] = useState(null); // {row, col}
    const [errorCells, setErrorCells] = useState(new Set()); 
    
    // --- THAY ĐỔI 2: Sử dụng hằng số thời gian ---
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS); // seconds
    
    const [tool, setTool] = useState('normal'); // 'normal', 'pencil', 'eraser'
    const [showSurrenderDialog, setShowSurrenderDialog] = useState(false);
    const [chats, setChats] = useState([
        { sender: 'Bạn', text: 'Chúc may mắn nhé!', isMe: true },
        { sender: opponent.name || 'A', text: 'Cảm ơn!', isMe: false },
    ]);
    const [chatInput, setChatInput] = useState('');

    // Timer
    useEffect(() => {
        const t = setInterval(() => {
            setTimeLeft(s => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => clearInterval(t);
    }, []);

    const formatTime = (s) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    const handleCellClick = (row, col) => {
        // ... (Không thay đổi)
        if (defaultCells[row][col]) {
            setSelectedCell(null);
            return; 
        }
        setSelectedCell({ row, col });
    };

    const handleNumberInput = async (number) => {
        // ... (Không thay đổi)
        if (!selectedCell) return;
        const { row, col } = selectedCell;
        if (defaultCells[row][col]) return; 

        const newBoard = board.map(r => [...r]);

        if (tool === 'pencil') {
            let notes = Array.isArray(newBoard[row][col]) ? newBoard[row][col] : [];
            if (typeof newBoard[row][col] === 'number' && newBoard[row][col] !== 0) return;
            const noteIndex = notes.indexOf(number);
            if (noteIndex > -1) {
                notes.splice(noteIndex, 1);
            } else {
                notes.push(number);
                notes.sort((a, b) => a - b);
            }
            newBoard[row][col] = notes.length > 0 ? notes : 0;
            
        } else if (tool === 'eraser') {
            newBoard[row][col] = 0;
            const newErrors = new Set(errorCells);
            newErrors.delete(`${row}-${col}`);
            setErrorCells(newErrors);
        } else { 
            newBoard[row][col] = number;
            try {
                const requestBody = {
                    board: newBoard, 
                    row: row,
                    col: col,
                    value: number
                };

                const response = await fetch('http://localhost:8000/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                });

                if (!response.ok) throw new Error('API call failed');
                const result = await response.json(); 
                const newErrors = new Set(errorCells);
                const cellKey = `${row}-${col}`;

                if (result.isValid) {
                    newErrors.delete(cellKey);
                } else {
                    newErrors.add(cellKey);
                    if (newErrors.size >= 5) {
                        setBoard(newBoard); 
                        setErrorCells(newErrors);
                        
                        setTimeout(() => {
                            alert("Bạn đã mắc 5 lỗi! Trò chơi kết thúc.");
                            // --- THAY ĐỔI 3: Truyền timeLeft khi tự động thua ---
                            onSurrender(newErrors.size, timeLeft); 
                        }, 500);
                        return; 
                    }
                }
                setErrorCells(newErrors);

            } catch (error) {
                console.error("Lỗi khi kiểm tra nước đi:", error);
            }
        }
        setBoard(newBoard);
    };
    
    const handleDelete = () => {
        // ... (Không thay đổi)
        if (!selectedCell) return;
        const { row, col } = selectedCell;
        if (defaultCells[row][col]) return;
        
        const newErrors = new Set(errorCells);
        newErrors.delete(`${row}-${col}`);
        setErrorCells(newErrors);

        setBoard(prev => {
            const copy = prev.map(r => r.slice());
            copy[row][col] = 0;
            return copy;
        });
    };
    
    const handleHint = () => {
        // ... (Không thay đổi)
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (!defaultCells[r][c] && (board[r][c] === 0 || Array.isArray(board[r][c]))) {
                    const newBoard = board.map(row => [...row]);
                    const hintValue = solutionBoard[r][c];
                    newBoard[r][c] = hintValue;
                    
                    const newErrors = new Set(errorCells);
                    newErrors.delete(`${r}-${c}`);
                    setErrorCells(newErrors);

                    setBoard(newBoard);
                    setSelectedCell(null);
                    return;
                }
            }
        }
    };

    const handleSendChat = () => {
        // ... (Không thay đổi)
        if (chatInput.trim() === '') return;
        const newChat = {
            sender: user.name || "Bạn",
            text: chatInput.trim(),
            isMe: true,
        };
        setChats(prev => [...prev, newChat]);
        setChatInput('');
    };


    const handleSurrenderClick = () => { // Đổi tên hàm để tránh nhầm lẫn
        setShowSurrenderDialog(true);
    };

    const handleConfirmSurrender = () => {
        setShowSurrenderDialog(false);
        // --- THAY ĐỔI 4: Truyền timeLeft khi xác nhận đầu hàng ---
        onSurrender(errorCells.size, timeLeft);
    };

    const handleCancelSurrender = () => {
        setShowSurrenderDialog(false);
    };

    const handleFinish = () => {
        if (window.confirm("Bạn có chắc chắn muốn Hoàn Thành? Bài sẽ được gửi để chấm điểm.")) {
            // --- THAY ĐỔI 5: Truyền timeLeft khi hoàn thành ---
            onFinish(board, errorCells.size, timeLeft); 
        }
    };

    // Hàm render bảng Sudoku
    const renderGrid = () => {
        // ... (Không thay đổi)
        const rows = [];
        for (let r = 0; r < 9; r++) {
            const rowCells = [];
            for (let c = 0; c < 9; c++) {
                const cellKey = `${r}-${c}`;
                const isError = errorCells.has(cellKey);
                rowCells.push(
                    <SudokuCell
                        key={`${r}-${c}`}
                        value={board[r][c]}
                        isDefault={defaultCells[r][c]}
                        isSelected={selectedCell?.row === r && selectedCell?.col === c}
                        isError={isError} 
                        onCellClick={() => handleCellClick(r, c)}
                    />
                );
            }
            rows.push(<div key={r} className="sudoku-row">{rowCells}</div>);
        }
        return <div className="sudoku-grid">{rows}</div>;
    };


    return (
        <div className="game-screen">
            {showSurrenderDialog && (
                <SurrenderDialog
                    onAccept={handleConfirmSurrender}
                    onCancel={handleCancelSurrender}
                />
            )}
            <header className="game-header">
                {/* ... (Header JSX không thay đổi) ... */}
                <div className="header-left">
                    <span className="header-logo"><Swords size={20} style={{marginRight: 5}}/>Sudoku Battle</span>
                    <div className="score-board">
                        <span>YOU</span>
                        <span>1 - 1</span>
                        <span>{opponent.name || "PLAYER A"}</span>
                    </div>
                </div>
                <div className="timer">{formatTime(timeLeft)}</div>
                <div className="header-actions">
                    {/* Cập nhật onClick để gọi đúng hàm */}
                    <button className="surrender-button" onClick={handleSurrenderClick}>
                        <LogOut size={18} /> Đầu Hàng
                    </button>
                    <Menu className="menu-icon" size={24} />
                </div>
            </header>

            <main className="game-main-content">
                
                {/* --- Cột Trái: Sudoku Grid & Controls --- */}
                <section className="sudoku-section">
                    {/* ... (Không thay đổi) ... */}
                    <div className="sudoku-grid-container">
                        {renderGrid()}
                    </div>
                    
                    <div className="controls-area">
                        <div className="number-buttons-container">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button key={num} className="number-button" onClick={() => handleNumberInput(num)}>
                                    {num}
                                </button>
                            ))}
                            <button className="number-button delete-button" onClick={handleDelete}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="tool-buttons">
                            <button className={`tool-button ${tool === 'pencil' ? 'active' : ''}`} onClick={() => setTool(tool === 'pencil' ? 'normal' : 'pencil')}>
                                <PenLine size={18} /> Bút chì
                            </button>
                            <button className={`tool-button ${tool === 'eraser' ? 'active' : ''}`} onClick={() => setTool(tool === 'eraser' ? 'normal' : 'eraser')}>
                                <Eraser size={18} /> Cục Tẩy
                            </button>
                            <button className="tool-button" onClick={handleHint}>
                                <Lightbulb size={18} /> Bóng đèn
                            </button>
                            <button className="finish-button" onClick={handleFinish}>
                                HOÀN THÀNH
                            </button>
                        </div>
                    </div>
                </section>

                {/* --- Cột Phải: Sidebar --- */}
                <aside className="game-sidebar">
                    {/* ... (Sidebar JSX không thay đổi) ... */}
                    <div className="leaderboard-card">
                        <h3>Người chơi</h3>
                        <div className="player-score-item">
                            <div className="player-info-min">
                                <span className="player-name-min">Bạn (Lỗi: {errorCells.size})</span>
                                <span className="player-time-min">Tổng thời gian: 01:20</span>
                            </div>
                            <div className="progress-bar-min">
                                <div className="progress-fill" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                        <div className="player-score-item">
                            <div className="player-info-min">
                                <span className="player-name-min">{opponent.name || "PLAYER A"}</span>
                                <span className="player-time-min">Tổng thời gian: 01:23</span>
                            </div>
                            <div className="progress-bar-min">
                                <div className="progress-fill" style={{ width: '70%' }}></div>
                            </div>
                        </div>
                         <div className="player-score-item">
                            <div className="player-info-min">
                                <span className="player-name-min">ĐỐI THỦ</span>
                                <span className="player-time-min">Tổng thời gian: 01:24</span>
                            </div>
                            <div className="progress-bar-min">
                                <div className="progress-fill" style={{ width: '68%' }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="chat-card">
                        <h3>Chat Mini</h3>
                        <div className="chat-box">
                            {chats.map((chat, index) => (
                                <p key={index} style={{margin: '5px 0', color: 'var(--text-primary)'}}>
                                    <strong style={{color: chat.isMe ? 'var(--color-blue)' : 'var(--color-red)'}}>{chat.sender}: </strong>
                                    {chat.text}
                                </p>
                            ))}
                        </div>
                        <div className="chat-input-area">
                            <input 
                                type="text" 
                                className="chat-input" 
                                placeholder="Nhập tin nhắn..." 
                                value={chatInput} 
                                onChange={(e) => setChatInput(e.target.value)} 
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') handleSendChat();
                                }}
                            />
                            <button className="chat-send-btn" onClick={handleSendChat}><Send size={18} /></button>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default Maingame;