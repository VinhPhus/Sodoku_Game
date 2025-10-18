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


// Component con: Sudoku Cell
const SudokuCell = ({ value, isDefault, isSelected, isError, onCellClick }) => {
    // Giá trị thực tế hoặc nốt bút chì
    const displayValue = Array.isArray(value) 
        ? <div className="pencil-marks">{value.map((n, i) => <span key={i}>{n}</span>)}</div> 
        : (value === 0 ? '' : value);
    
    // isPlayerInput: Là số do người chơi điền (không phải số mặc định và không phải là ghi chú/array)
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
// Khai báo giá trị mặc định cho user/opponent để tránh lỗi nếu App.jsx chưa truyền đủ props
const Maingame = ({ user = { name: 'YOU' }, opponent = { name: 'PLAYER A' }, onSurrender = () => {}, onFinish = () => {} }) => {
    const [board, setBoard] = useState(initialBoard);
    const [selectedCell, setSelectedCell] = useState(null); // {row, col}
    const [timeLeft, setTimeLeft] = useState(140); // seconds (02:20)
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
        if (defaultCells[row][col]) {
            setSelectedCell(null);
            return; 
        }
        setSelectedCell({ row, col });
    };

    const handleNumberInput = (number) => {
        if (!selectedCell) return;
        const { row, col } = selectedCell;
        if (defaultCells[row][col]) return; 

        const newBoard = board.map(r => [...r]);

        if (tool === 'pencil') {
            // Chế độ ghi chú (Bút chì)
            let notes = Array.isArray(newBoard[row][col]) ? newBoard[row][col] : [];
            
            // Nếu ô đã có số chính thức, không thể thêm ghi chú
            if (typeof newBoard[row][col] === 'number' && newBoard[row][col] !== 0) return;

            const noteIndex = notes.indexOf(number);
            if (noteIndex > -1) {
                notes.splice(noteIndex, 1); // Xóa ghi chú
            } else {
                notes.push(number); // Thêm ghi chú
                notes.sort((a, b) => a - b);
            }
            newBoard[row][col] = notes.length > 0 ? notes : 0;
            
        } else if (tool === 'eraser') {
            newBoard[row][col] = 0;
        } else { // tool === 'normal' (Điền số chính thức)
            newBoard[row][col] = number;
        }

        setBoard(newBoard);
    };

    const handleDelete = () => {
        if (!selectedCell) return;
        const { row, col } = selectedCell;
        if (defaultCells[row][col]) return;
        setBoard(prev => {
            const copy = prev.map(r => r.slice());
            copy[row][col] = 0;
            return copy;
        });
    };
    
    // --- CHỨC NĂNG BÓNG ĐÈN (GỢI Ý) ---
    const handleHint = () => {
        // Tìm ô trống đầu tiên (không phải ô mặc định và chưa có số chính thức)
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (!defaultCells[r][c] && (board[r][c] === 0 || Array.isArray(board[r][c]))) {
                    const newBoard = board.map(row => [...row]);
                    const hintValue = solutionBoard[r][c];
                    newBoard[r][c] = hintValue;
                    setBoard(newBoard);
                    // alert(`Gợi ý: Ô (${r+1}, ${c+1}) được điền số ${hintValue}`); // Có thể tắt alert khi chạy thực tế
                    setSelectedCell(null);
                    return;
                }
            }
        }
    };

    const handleSendChat = () => {
        if (chatInput.trim() === '') return;
        
        const newChat = {
            sender: user.name || "Bạn",
            text: chatInput.trim(),
            isMe: true,
        };

        setChats(prev => [...prev, newChat]);
        setChatInput('');
        // Logic gửi tin nhắn đến đối thủ (giả lập)
    };


    const handleSurrender = () => {
        setShowSurrenderDialog(true);
    };

    const handleConfirmSurrender = () => {
        setShowSurrenderDialog(false);
        onSurrender();
    };

    const handleCancelSurrender = () => {
        setShowSurrenderDialog(false);
    };

    const handleFinish = () => {
        if (window.confirm("Bạn có chắc chắn muốn Hoàn Thành? Bài sẽ được gửi để chấm điểm.")) {
            onFinish(board); 
        }
    };

    // Hàm render bảng Sudoku
    const renderGrid = () => {
        const rows = [];
        for (let r = 0; r < 9; r++) {
            const rowCells = [];
            for (let c = 0; c < 9; c++) {
                rowCells.push(
                    <SudokuCell
                        key={`${r}-${c}`}
                        value={board[r][c]}
                        isDefault={defaultCells[r][c]}
                        isSelected={selectedCell?.row === r && selectedCell?.col === c}
                        isError={false} // Cần logic kiểm tra lỗi thực tế
                        onCellClick={() => handleCellClick(r, c)}
                    />
                );
            }
            // Sửa lại class name để khớp với CSS (sudoku-row thay cho cell-row)
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
                    <button className="surrender-button" onClick={handleSurrender}>
                        <LogOut size={18} /> Đầu Hàng
                    </button>
                    <Menu className="menu-icon" size={24} />
                </div>
            </header>

            <main className="game-main-content">
                
                {/* --- Cột Trái: Sudoku Grid & Controls --- */}
                <section className="sudoku-section">
                    <div className="sudoku-grid-container">
                        {renderGrid()}
                    </div>
                    
                    <div className="controls-area">
                        
                        {/* 2. Nút Nhập số */}
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

                        {/* 1. Nút Công cụ & Hoàn thành (được sắp xếp lại theo Figma) */}
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
                    {/* 1. Bảng Xếp Hạng Mini (KHÔI PHỤC THEO FIGMA) */}
                    <div className="leaderboard-card">
                        <h3>Người chơi</h3>
                        {/* YOU */}
                        <div className="player-score-item">
                            <div className="player-info-min">
                                <span className="player-name-min">Bạn</span>
                                <span className="player-time-min">Tổng thời gian: 01:20</span>
                            </div>
                            <div className="progress-bar-min">
                                <div className="progress-fill" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                        {/* PLAYER A */}
                        <div className="player-score-item">
                            <div className="player-info-min">
                                <span className="player-name-min">{opponent.name || "PLAYER A"}</span>
                                <span className="player-time-min">Tổng thời gian: 01:23</span>
                            </div>
                            <div className="progress-bar-min">
                                <div className="progress-fill" style={{ width: '70%' }}></div>
                            </div>
                        </div>
                         {/* ĐỐI THỦ (Thành phần phụ, dựa trên Figma) */}
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

                    {/* 2. Chat Mini */}
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