{/* ... (header, grid, controls...) ... */ }
// src/components/Maingame.jsx
import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext"; // <-- 1. Import useSocket
import "../style/Maingame.css";
// ... (các import khác: SurrenderDialog, icons...)

// (Giả sử initialBoard và solutionBoard được truyền từ props hoặc hardcode)

const Maingame = ({
    user,
    opponent,
    matchId, // <-- 2. Nhận matchId từ props
    onSurrender,
    onFinish
}) => {

    const { socket } = useSocket(); // <-- 3. Lấy socket

    // ... (Tất cả state cũ của Maingame: board, selectedCell, errorCells, timeLeft...)

    // THÊM STATE MỚI để theo dõi đối thủ
    const [opponentErrorCount, setOpponentErrorCount] = useState(0);

    // 4. LẮNG NGHE SỰ KIỆN TỪ ĐỐI THỦ
    useEffect(() => {
        if (!socket) return;

        // Lắng nghe khi đối thủ đi
        // Tên 'opponentMove' phải khớp với backend
        const onOpponentMove = (data) => {
            // data = { row, col, value, newErrorCount }
            console.log("Đối thủ đi:", data);

            // Cập nhật số lỗi của đối thủ lên UI
            setOpponentErrorCount(data.newErrorCount);

            // TÙY CHỌN: Nếu bạn muốn cả 2 cùng giải 1 bảng,
            // hãy cập nhật bảng của BẠN với nước đi của ĐỐI THỦ
            // setBoard(prevBoard => {
            //   const newBoard = prevBoard.map(r => [...r]);
            //   newBoard[data.row][data.col] = data.value;
            //   return newBoard;
            // });
        };

        // (Bạn cũng có thể lắng nghe 'opponentChat' tại đây)

        socket.on("opponentMove", onOpponentMove);

        return () => {
            socket.off("opponentMove", onOpponentMove);
        };
    }, [socket]);


    // 5. GỬI NƯỚC ĐI KHI BẠN CHƠI
    const handleNumberInput = async (number) => {
        if (!selectedCell || !socket) return;

        const { row, col } = selectedCell;
        // ... (logic cũ: kiểm tra defaultCells...)

        // (Logic validate của bạn...)
        // Giả sử bạn đã gọi API /validate và có kết quả...
        // const validationResult = await callValidateAPI(...);
        // const newErrors = new Set(errorCells);
        // if (!validationResult.isValid) {
        //   newErrors.add(`${row}-${col}`);
        // }

        // --- BẮT ĐẦU GỬI WEBSOCKET ---

        // Tên 'sendMove' phải khớp với backend
        socket.emit("sendMove", {
            matchId: matchId, // <-- Dùng matchId đã được truyền
            row: row,
            col: col,
            value: number,
            // Gửi kèm số lỗi MỚI của bạn để đối thủ cập nhật
            newErrorCount: errorCells.size // (Hoặc newErrors.size nếu bạn dùng logic mới)
        });

        // --- KẾT THÚC GỬI WEBSOCKET ---

        // ... (Cập nhật setBoard và xử lý 5 lỗi như cũ)
    };

    // (Các hàm khác: handleDelete, handleHint, handleSendChat, handleSurrenderClick...)

    // TRONG PHẦN RENDER JSX:
    return (
        <div className="game-screen">
            <aside className="game-sidebar">
                <div className="leaderboard-card">
                    <h3>Người chơi</h3>
                    {/* Cập nhật UI của BẠN với errorCells.size */}
                    <div className="player-score-item">
                        <div className="player-info-min">
                            <span className="player-name-min">Bạn (Lỗi: {errorCells?.size ?? 0})</span>
                            {/* ... */}
                        </div>
                    </div>

                    {/* Cập nhật UI của ĐỐI THỦ với opponentErrorCount */}
                    <div className="player-score-item">
                        <div className="player-info-min">
                            <span className="player-name-min">{opponent?.name ?? 'Đối thủ'} (Lỗi: {typeof opponentErrorCount === 'number' ? opponentErrorCount : (opponent?.errorCount ?? 0)})</span>
                            {/* ... */}
                        </div>
                    </div>
                </div>
                {/* ... (Chat card) ... */}
            </aside>
        </div >
    );
};

export default Maingame;