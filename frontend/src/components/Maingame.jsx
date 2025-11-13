import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import "../style/Maingame.css";

// ===== SUDOKU LOGIC FUNCTIONS =====

// Hàm kiểm tra số có hợp lệ tại vị trí (row, col)
const isValidMove = (board, row, col, num) => {
    // Kiểm tra hàng
    for (let x = 0; x < 9; x++) {
        if (x !== col && board[row][x] === num) {
            return false;
        }
    }

    // Kiểm tra cột
    for (let x = 0; x < 9; x++) {
        if (x !== row && board[x][col] === num) {
            return false;
        }
    }

    // Kiểm tra ô 3x3
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const currentRow = startRow + i;
            const currentCol = startCol + j;
            if (currentRow !== row && currentCol !== col &&
                board[currentRow][currentCol] === num) {
                return false;
            }
        }
    }

    return true;
};

// Hàm giải Sudoku (backtracking)
const solveSudoku = (board) => {
    const findEmpty = () => {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === 0) return [i, j];
            }
        }
        return null;
    };

    const empty = findEmpty();
    if (!empty) return true; // Đã giải xong

    const [row, col] = empty;
    for (let num = 1; num <= 9; num++) {
        if (isValidMove(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = 0;
        }
    }

    return false;
};

// Hàm tạo bàn Sudoku hoàn chỉnh
const generateCompleteBoard = () => {
    const board = Array(9).fill(null).map(() => Array(9).fill(0));

    // Điền đường chéo chính (3 ô 3x3)
    const fillDiagonal = () => {
        for (let box = 0; box < 9; box += 3) {
            const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            // Shuffle array
            for (let i = nums.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [nums[i], nums[j]] = [nums[j], nums[i]];
            }

            let idx = 0;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    board[box + i][box + j] = nums[idx++];
                }
            }
        }
    };

    fillDiagonal();
    solveSudoku(board);
    return board;
};

// Hàm tạo puzzle từ solution (xóa bớt số)
const generatePuzzle = (solution, difficulty = 'medium') => {
    const board = solution.map(row => [...row]);

    // Số ô cần xóa theo độ khó
    const cellsToRemove = {
        easy: 30,
        medium: 40,
        hard: 50
    }[difficulty] || 40;

    let removed = 0;
    while (removed < cellsToRemove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);

        if (board[row][col] !== 0) {
            board[row][col] = 0;
            removed++;
        }
    }

    return board;
};

// Hàm tạo bàn Sudoku (puzzle + solution)
const generateSudokuGame = (difficulty = 'medium') => {
    const solution = generateCompleteBoard();
    const puzzle = generatePuzzle(solution, difficulty);
    return { puzzle, solution };
};

const Maingame = ({ user, opponent, matchId, serverBoard, serverSolution, onFinish, onSurrender }) => {
    const { socket } = useSocket();
    const [timer, setTimer] = useState(0);
    const [errors, setErrors] = useState(0);
    const [opponentErrors, setOpponentErrors] = useState(0);
    const [opponentProgress, setOpponentProgress] = useState(0);

    // Sử dụng board từ server nếu có, nếu không thì tạo mới (fallback)
    const [gameData] = useState(() => {
        if (serverBoard && serverSolution) {
            return { puzzle: serverBoard, solution: serverSolution };
        }
        return generateSudokuGame('medium');
    });
    const [solution] = useState(gameData.solution);
    const [board, setBoard] = useState(() => gameData.puzzle.map(row => [...row]));
    const [selectedCell, setSelectedCell] = useState(null);
    const [defaultCells] = useState(() => {
        const cells = new Set();
        gameData.puzzle.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell !== 0) cells.add(`${i}-${j}`);
            });
        });
        return cells;
    });
    const [errorCells, setErrorCells] = useState(new Set());
    const [hintsUsed, setHintsUsed] = useState(0);
    const [gameWon, setGameWon] = useState(false);

    // Giới hạn số lần gợi ý
    const MAX_HINTS = 3;

    // Chế độ viết chì (pencil mode)
    const [pencilMode, setPencilMode] = useState(false);
    const [pencilMarks, setPencilMarks] = useState({}); // { "row-col": Set([1,2,3]) }

    // --- States cho Chat ---
    const chatBoxRef = useRef(null);
    const [chatHistory, setChatHistory] = useState([]); // Format: { sender: {id, username}, message, isSender }
    const [currentMessage, setCurrentMessage] = useState("");

    // Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Socket listeners
    useEffect(() => {
        if (!socket || !matchId) return;

        // Lắng nghe tiến độ đối thủ
        const handleOpponentProgress = (data) => {
            console.log("Opponent progress:", data);
            setOpponentErrors(data.errors || 0);
            setOpponentProgress(data.progress || 0);
        };

        // Lắng nghe khi trận đấu kết thúc (hoàn thành hoặc đầu hàng)
        const handleMatchFinished = (data) => {
            console.log("Match finished:", data);
            const result = data.result;
            const isWinner = result.winner_id === user.id;

            // Format thời gian
            const formatCompletionTime = (timeValue) => {
                // Nếu là số giây
                if (typeof timeValue === 'number') {
                    const mins = Math.floor(timeValue / 60);
                    const secs = timeValue % 60;
                    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                }
                // Nếu đã là định dạng MM:SS
                if (typeof timeValue === 'string' && timeValue.includes(':')) {
                    return timeValue;
                }
                return timeValue;
            };

            const userTime = result.player1_id === user.id ? result.player1_time : result.player2_time;
            const opponentTime = result.player1_id === user.id ? result.player2_time : result.player1_time;

            // Tạo thông tin kết quả để hiển thị
            const matchResult = {
                isUserWinner: isWinner,
                user: {
                    name: user.username,
                    timeCompleted: formatCompletionTime(userTime),
                    errors: errors,
                    isWinner: isWinner
                },
                opponent: {
                    name: opponent?.username || 'Đối thủ',
                    timeCompleted: formatCompletionTime(opponentTime),
                    errors: opponentErrors,
                    isWinner: !isWinner
                }
            };

            // Hiển thị thông báo
            if (isWinner) {
                setTimeout(() => {
                    alert("🎉 Bạn thắng! Đối thủ đã đầu hàng hoặc bạn hoàn thành trước!");
                }, 300);
            } else {
                setTimeout(() => {
                    alert("😔 Bạn thua! Đối thủ đã hoàn thành trước hoặc bạn đã đầu hàng!");
                }, 300);
            }

            // Chuyển sang màn hình kết quả với data đầy đủ
            setTimeout(() => {
                onFinish(matchResult);
            }, 1000);
        };

        // Lắng nghe tin nhắn chat
        const handleChatMessageReceived = (data) => {
            console.log("Chat message received:", data);
            setChatHistory(prev => [...prev, data]);
        };

        socket.on("chatMessageReceived", handleChatMessageReceived);
        socket.on("opponentProgress", handleOpponentProgress);
        socket.on("matchFinished", handleMatchFinished);

        return () => {
            socket.off("opponentProgress", handleOpponentProgress);
            socket.off("matchFinished", handleMatchFinished);
            socket.off("chatMessageReceived", handleChatMessageReceived);
        };
    }, [socket, matchId, user, opponent, board, errors, opponentErrors, onFinish]);

    // Auto-scroll chatbox
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCellClick = (row, col) => {
        if (defaultCells.has(`${row}-${col}`)) return; // Không cho chọn ô mặc định
        if (gameWon) return; // Không cho chơi nữa nếu đã thắng

        // Kiểm tra xem có ô sai nào đang tồn tại không
        if (errorCells.size > 0) {
            // Chỉ cho phép chọn ô sai để sửa
            const cellKey = `${row}-${col}`;
            if (errorCells.has(cellKey)) {
                setSelectedCell({ row, col });
            } else {
                // Thông báo phải sửa ô sai trước
                alert("Xóa ô sai để tiếp tục!");
            }
            return;
        }

        setSelectedCell({ row, col });
    };

    const handleNumberInput = (number) => {
        if (!selectedCell || gameWon) return;

        const { row, col } = selectedCell;
        const cellKey = `${row}-${col}`;

        // Không cho sửa ô mặc định
        if (defaultCells.has(cellKey)) return;

        // **CHẾ ĐỘ VIẾT CHÌ (PENCIL MODE)**
        if (pencilMode) {
            const newMarks = { ...pencilMarks };
            if (!newMarks[cellKey]) {
                newMarks[cellKey] = new Set();
            }

            // Toggle: thêm hoặc xóa số
            if (newMarks[cellKey].has(number)) {
                newMarks[cellKey].delete(number);
            } else {
                newMarks[cellKey].add(number);
            }

            // Xóa nếu rỗng
            if (newMarks[cellKey].size === 0) {
                delete newMarks[cellKey];
            }

            setPencilMarks(newMarks);
            return; // Không cập nhật board
        }

        // **CHẾ ĐỘ THƯỜNG (ĐIỀN SỐ CHÍNH THỨC)**
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = number;

        // Kiểm tra nước đi có hợp lệ không
        const newErrorCells = new Set(errorCells);

        // Xóa pencil marks khi điền số chính thức
        const newMarks = { ...pencilMarks };
        delete newMarks[cellKey];

        if (number !== 0) {
            // Kiểm tra với solution
            if (solution[row][col] !== number) {
                // Sai rồi! Giữ nguyên khung đỏ và không cho chơi tiếp
                newErrorCells.add(cellKey);
                setErrors(prev => prev + 1);

                // Không cập nhật board nếu đang sai
                setErrorCells(newErrorCells);
                setBoard(newBoard); // Vẫn cập nhật board để hiện số sai
                setPencilMarks(newMarks);

                // Không cho chọn ô khác hoặc điền số khác cho đến khi sửa
                return; // Dừng tại đây, không cho thực hiện nước đi tiếp
            } else {
                // Đúng! Xóa khỏi danh sách lỗi nếu có
                newErrorCells.delete(cellKey);
            }
        } else {
            // Xóa số - xóa khỏi danh sách lỗi
            newErrorCells.delete(cellKey);
        }

        setBoard(newBoard);
        setErrorCells(newErrorCells);
        setPencilMarks(newMarks);
        // Kiểm tra xem đã thắng chưa
        if (checkWin(newBoard)) {
            setGameWon(true);
            const completionTime = timer; // Lưu thời gian hoàn thành (giây)
            setTimeout(() => {
                if (socket && matchId) {
                    socket.emit("finishMatch", {
                        matchId,
                        winnerId: user.id,
                        completionTime: completionTime, // Gửi thời gian hoàn thành (số giây)
                        player1Time: formatTime(completionTime),
                        player2Time: "-" // Đối thủ chưa hoàn thành
                    });
                }
                // Server sẽ gửi matchFinished event cho cả 2 người
                // Event listener sẽ xử lý việc chuyển màn hình
            }, 500);
        } else {
            // Gửi tiến độ lên server
            if (socket && matchId) {
                socket.emit("updateProgress", {
                    matchId,
                    progress: calculateProgress(newBoard),
                    errors: errors
                });
            }
        }

        // Xóa ô được chọn sau khi điền
        setSelectedCell(null);
    };

    const handleDelete = () => {
        if (!selectedCell || gameWon) return;
        const { row, col } = selectedCell;
        const cellKey = `${row}-${col}`;

        if (defaultCells.has(cellKey)) return;

        // Xóa số (cho phép xóa cả ô sai để sửa lại)
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = 0;
        setBoard(newBoard);

        // Xóa khỏi danh sách lỗi
        const newErrorCells = new Set(errorCells);
        newErrorCells.delete(cellKey);
        setErrorCells(newErrorCells);

        // Xóa pencil marks
        const newMarks = { ...pencilMarks };
        delete newMarks[cellKey];
        setPencilMarks(newMarks);

        // Vẫn giữ ô được chọn để có thể điền số mới
        // setSelectedCell(null);
    };

    const handleHint = () => {
        if (gameWon) return;

        // Kiểm tra giới hạn số lần gợi ý
        if (hintsUsed >= MAX_HINTS) {
            alert(`⚠️ Bạn đã hết lượt gợi ý! (Tối đa ${MAX_HINTS} lần)`);
            return;
        }

        // Kiểm tra xem có ô sai không - phải sửa ô sai trước
        if (errorCells.size > 0) {
            alert("⚠️ Bạn phải sửa lại ô sai (khung đỏ) trước khi dùng gợi ý!");
            return;
        }

        // Tìm ô trống đầu tiên
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cellKey = `${i}-${j}`;
                if (!defaultCells.has(cellKey) && board[i][j] === 0) {
                    // Điền số đúng từ solution
                    const newBoard = board.map(r => [...r]);
                    newBoard[i][j] = solution[i][j];
                    setBoard(newBoard);
                    setHintsUsed(prev => prev + 1);

                    // Highlight ô vừa gợi ý
                    setSelectedCell({ row: i, col: j });
                    setTimeout(() => setSelectedCell(null), 1500);

                    // Gửi tiến độ
                    if (socket && matchId) {
                        socket.emit("updateProgress", {
                            matchId,
                            progress: calculateProgress(newBoard),
                            errors: errors
                        });
                    }

                    return;
                }
            }
        }

        alert("Không còn gợi ý nào!");
    };

    const checkWin = (currentBoard) => {
        // Kiểm tra tất cả ô đã điền đúng
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (currentBoard[i][j] !== solution[i][j]) {
                    return false;
                }
            }
        }
        return true;
    };

    const calculateProgress = (currentBoard) => {
        let filled = 0;
        currentBoard.forEach(row => {
            row.forEach(cell => {
                if (cell !== 0) filled++;
            });
        });
        return Math.round((filled / 81) * 100);
    };

    const handleSurrender = () => {
        if (window.confirm("Bạn có chắc muốn đầu hàng?")) {
            setGameWon(true); // Khóa game để không chơi tiếp

            if (socket && matchId) {
                socket.emit("surrender", { matchId });

                // Tạo kết quả đầu hàng (dù server sẽ gửi lại,
                // chúng ta không cần tự gọi onFinish ở đây nữa)

                // Server sẽ gửi matchFinished event cho cả 2 người
                // Event listener (handleMatchFinished) sẽ xử lý và gọi onFinish
            }
        }
    };

    const handleFinish = () => {
        // Kiểm tra xem đã hoàn thành đúng chưa
        if (!checkWin(board)) {
            alert("Bạn chưa hoàn thành đúng! Còn ô sai hoặc ô trống.");
            return;
        }

        setGameWon(true);
        const completionTime = timer; // Lưu thời gian hoàn thành

        if (socket && matchId) {
            socket.emit("finishMatch", {
                matchId,
                winnerId: user.id,
                completionTime: completionTime, // Gửi thời gian hoàn thành (số giây)
                player1Time: formatTime(completionTime),
                player2Time: "-" // Đối thủ chưa hoàn thành
            });
        }
        // Server sẽ gửi matchFinished event cho cả 2 người
        // Event listener (handleMatchFinished) sẽ xử lý việc chuyển màn hình
    };

    // Hàm gửi tin nhắn (đặt bên ngoài useEffect)
    const handleSendChat = () => {
        if (!socket || !matchId || currentMessage.trim() === "") return;

        const messageData = {
            sender: { id: user.id, username: user.username },
            message: currentMessage.trim()
        };

        // 1. Gửi lên server
        socket.emit("chatMessage", {
            matchId: matchId,
            message: currentMessage.trim()
        });

        // 2. Thêm vào lịch sử chat của chính mình (để hiển thị ngay)
        setChatHistory(prev => [...prev, { ...messageData, isSender: true }]);

        // 3. Xóa input
        setCurrentMessage("");
    };

    return (
        <div className="game-screen">
            {/* Header */}
            <header className="game-header">
                <div className="header-left">
                    <div className="header-logo">Sudoku Battle</div>
                    <div className="score-board">
                        <span>Lỗi:</span>
                        <span>{errors}</span>
                    </div>
                </div>

                <div className="timer">{formatTime(timer)}</div>

                <div className="header-actions">
                    <button className="surrender-button" onClick={handleSurrender}>
                        🏳️ Đầu hàng
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="game-main-content">
                {/* Sudoku Grid Section */}
                <div className="sudoku-section">
                    <div className="sudoku-grid-container">
                        <div className="sudoku-grid">
                            {board.map((row, rowIndex) => (
                                <React.Fragment key={rowIndex}>
                                    {row.map((cell, colIndex) => {
                                        const cellKey = `${rowIndex}-${colIndex}`;
                                        const isDefault = defaultCells.has(cellKey);
                                        const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                                        const isError = errorCells.has(cellKey);

                                        return (
                                            <div
                                                key={cellKey}
                                                className={`cell ${isDefault ? 'default' : 'player-input'} ${isSelected ? 'selected' : ''} ${isError ? 'error' : ''}`}
                                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                            >
                                                {cell !== 0 ? (
                                                    <span className="cell-number">{cell}</span>
                                                ) : pencilMarks[cellKey] && pencilMarks[cellKey].size > 0 ? (
                                                    <div className="pencil-marks">
                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                                            <span
                                                                key={num}
                                                                className={pencilMarks[cellKey].has(num) ? 'marked' : ''}
                                                            >
                                                                {pencilMarks[cellKey].has(num) ? num : ''}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : ''}
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Controls Area */}
                    <div className="controls-area">
                        {/* Tool Buttons */}
                        <div className="tool-buttons">
                            <button
                                className={`tool-button ${pencilMode ? 'active-pencil' : ''}`}
                                onClick={() => setPencilMode(!pencilMode)}
                                disabled={gameWon}
                            >
                                ✏️ Viết chì {pencilMode ? '(BẬT)' : ''}
                            </button>
                            <button
                                className="tool-button"
                                onClick={handleDelete}
                                disabled={!selectedCell || gameWon}
                            >
                                🗑️ Xóa
                            </button>
                            <button
                                className="tool-button"
                                onClick={handleHint}
                                disabled={gameWon || hintsUsed >= MAX_HINTS}
                            >
                                💡 Gợi ý ({MAX_HINTS - hintsUsed}/{MAX_HINTS})
                            </button>
                            <button
                                className="finish-button"
                                onClick={handleFinish}
                                disabled={gameWon}
                            >
                                ✓ Hoàn thành
                            </button>
                        </div>

                        {/* Number Buttons */}
                        <div className="number-buttons-container">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button
                                    key={num}
                                    className="number-button"
                                    onClick={() => handleNumberInput(num)}
                                    disabled={gameWon}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="game-sidebar">
                    {/* Leaderboard Card */}
                    <div className="leaderboard-card">
                        <h3>Người chơi</h3>
                        <div className="player-score-item">
                            <div className="player-info-min">
                                <span className="player-name-min">
                                    {user?.username || 'Bạn'} (Lỗi: {errors})
                                </span>
                                <span className="player-time-min">{formatTime(timer)}</span>
                            </div>
                            <div className="progress-bar-min">
                                <div className="progress-fill" style={{ width: `${calculateProgress(board)}%` }}></div>
                            </div>
                        </div>

                        <div className="player-score-item">
                            <div className="player-info-min">
                                <span className="player-name-min">
                                    {opponent?.username || 'Đối thủ'} (Lỗi: {opponentErrors})
                                </span>
                                <span className="player-time-min">Đang chơi...</span>
                            </div>
                            <div className="progress-bar-min">
                                <div className="progress-fill" style={{ width: `${opponentProgress}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Card */}
                    <div className="chat-card">
                        <h3>Chat</h3>
                        <div className="chat-box" ref={chatBoxRef}> {/* Thêm ref vào đây */}
                            {/* --- NỘI DUNG CHAT-BOX ĐÃ CẬP NHẬT --- */}
                            {chatHistory.length === 0 ? (
                                <p style={{ color: '#999', fontSize: '13px', margin: 'auto', textAlign: 'center' }}>
                                    Bắt đầu cuộc trò chuyện...
                                </p>
                            ) : (
                                chatHistory.map((chat, index) => (
                                    <div
                                        key={index}
                                        className={`chat-message ${chat.isSender ? 'sent' : 'received'}`}
                                    >
                                        <span className="chat-sender-name">
                                            {chat.isSender ? "Bạn" : (chat.sender?.username || 'Đối thủ')}:
                                        </span>
                                        {' '}
                                        <span className="chat-message-text">{chat.message}</span>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="chat-input-area">
                            <input
                                type="text"
                                className="chat-input"
                                placeholder="Nhập tin nhắn..."
                                value={currentMessage} // <-- Cập nhật
                                onChange={e => setCurrentMessage(e.target.value)} // <-- Cập nhật
                                onKeyPress={e => e.key === 'Enter' && handleSendChat()} // <-- Thêm: Gửi bằng Enter
                                disabled={gameWon} // <-- Bỏ 'disabled' cứng
                            />
                            <button
                                className="chat-send-btn"
                                onClick={handleSendChat} // <-- Cập nhật
                                disabled={gameWon || currentMessage.trim() === ""}
                            >
                                ⮞
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Maingame;