import React from "react";
import "../style/MatchResult.css";
// Giả định icon confetti được thêm dưới dạng emoji hoặc một component SVG

// Dữ liệu giả lập cho màn hình kết quả
// Format chuẩn: name, status, errors, timeCompleted
const mockResultData = {
    isUserWinner: true,
    user: {
        name: 'YOU',
        status: 'Thắng cuộc',
        errors: 0,
        timeCompleted: '02:10',
        isWinner: true,
    },
    opponent: {
        name: 'PLAYER A',
        status: 'Thua cuộc',
        errors: 2,
        timeCompleted: '-',
        isWinner: false,
    }
};

const ConfettiEmoji = () => (
    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
        🎉🎊🍾
    </div>
);
const LoserEmoji = () => (
    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
        😔
    </div>
);

const MatchResult = ({
    user = { name: 'YOU' },
    opponent = { name: 'PLAYER A' },
    resultData = mockResultData, // Sử dụng mock data nếu không có props
    matchId = null,
    difficulty = 'medium',
    socket = null,
    onReplay = () => console.log('Replay clicked'),
    onGoToLobby = () => console.log('Go to Lobby clicked'),
    onViewHistory = () => console.log('View History clicked')
}) => {

    // Chuẩn hóa dữ liệu theo format mockResultData
    const normalizeData = (data) => {
        // Nếu data đã có format đúng (có status)
        if (data.status) return data;

        // Nếu không, tạo format mới từ dữ liệu cũ
        const status = data.timeCompleted === "Đầu hàng" ? "Đầu hàng" :
            (data.isWinner ? "Thắng cuộc" : "Thua cuộc");

        return {
            name: data.name,
            status: status,
            errors: data.errors || 0,
            timeCompleted: data.timeCompleted,
            isWinner: data.isWinner
        };
    };

    const userResult = normalizeData(resultData.user);
    const opponentResult = normalizeData(resultData.opponent);
    const winnerName = resultData.isUserWinner ? userResult.name : opponentResult.name;

    // Render block theo format mockResultData
    const renderBlock = (data, playerLabel) => {
        const isWinner = data.isWinner;

        return (
            <div className={`player-block ${isWinner ? 'winner' : 'loser'}`}>
                <h4>{data.name || playerLabel}</h4>

                {/* Hiển thị Status (Thắng cuộc/Thua cuộc/Đầu hàng) */}
                <div className="stat-item">
                    <span className="stat-label">Kết quả:</span>
                    <span className="stat-value" style={{
                        fontWeight: 700,
                        color: data.status === "Đầu hàng" ? 'var(--color-red)' :
                            (isWinner ? 'var(--color-green)' : 'var(--color-red)')
                    }}>
                        {data.status}
                    </span>
                </div>

                {/* Hiển thị Số Lỗi */}
                <div className="stat-item">
                    <span className="stat-label">Số Lỗi:</span>
                    <span className={`stat-value ${data.errors > 0 ? 'error-count' : ''}`}>
                        {data.errors}
                    </span>
                </div>

                {/* Hiển thị Thời gian hoàn thành */}
                <div className="stat-item">
                    <span className="stat-label">Thời gian hoàn thành:</span>
                    <span className="stat-value" style={{
                        fontWeight: 600,
                        color: data.timeCompleted === "Đầu hàng" ? 'var(--color-red)' :
                            (data.timeCompleted === "-" ? '#999' : 'var(--color-primary)')
                    }}>
                        {data.timeCompleted === "-" ? "Chưa hoàn thành" : data.timeCompleted}
                    </span>
                </div>
            </div>
        );
    };


    return (
        <div className="result-screen">
            <div className="result-card">
                <header className="result-header">
                    {/* --- THAY ĐỔI 4: Hiển thị emoji dựa trên kết quả thực tế --- */}
                    {resultData.isUserWinner ? <ConfettiEmoji /> : <LoserEmoji />}
                    <h2 className="winner-title">
                        NGƯỜI CHIẾN THẮNG: <span>{winnerName.toUpperCase()}</span>
                    </h2>
                </header>

                <main className="comparison-container">
                    {/* Hộp 1: Người dùng */}
                    {renderBlock(userResult, 'YOU')}

                    {/* Hộp 2: Đối thủ */}
                    {renderBlock(opponentResult, 'Đối thủ')}
                </main>

                <footer className="action-buttons">
                    <button className="button-replay" onClick={() => {
                        if (socket && matchId) {
                            // Gửi yêu cầu rematch qua socket
                            socket.emit('rematchRequest', {
                                matchId: matchId,
                                difficulty: difficulty
                            });
                        } else {
                            // Fallback nếu không có socket
                            onReplay();
                        }
                    }}>
                        CHƠI LẠI
                    </button>
                    <button className="button-lobby" onClick={onGoToLobby}>
                        VỀ SẢNH CHÍNH
                    </button>
                    <button className="button-history" onClick={onViewHistory}>
                        XEM LỊCH SỬ
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default MatchResult;