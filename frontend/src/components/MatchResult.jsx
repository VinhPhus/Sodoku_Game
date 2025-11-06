import React from "react";
import "../style/MatchResult.css";
// Giả định icon confetti được thêm dưới dạng emoji hoặc một component SVG

// Dữ liệu giả lập cho màn hình kết quả (có thể nhận từ props)
// --- THAY ĐỔI 1: Cập nhật mockResultData để bao gồm 'status' ---
const mockResultData = {
    isUserWinner: true, 
    user: {
        name: 'YOU',
        status: 'Thắng cuộc', // Thêm status
        thoughtTime: '01:58',
        errors: 0,
        timeCompleted: '02:10',
        isWinner: true,
    },
    opponent: {
        name: 'PLAYER A',
        status: 'Thua cuộc', // Thêm status
        thoughtTime: '01:30',
        errors: 2,
        timeCompleted: '-', // Thua
        isWinner: false,
    }
};

const ConfettiEmoji = () => (
    <div style={{fontSize: '2rem', marginBottom: '10px'}}>
        🎉🎊🍾
    </div>
);
const LoserEmoji = () => (
    <div style={{fontSize: '2rem', marginBottom: '10px'}}>
        😔
    </div>
);

const MatchResult = ({ 
    user = { name: 'YOU' }, 
    opponent = { name: 'PLAYER A' }, 
    resultData = mockResultData, // Sử dụng mock data nếu không có props
    onReplay = () => console.log('Replay clicked'), 
    onGoToLobby = () => console.log('Go to Lobby clicked'), 
    onViewHistory = () => console.log('View History clicked')
}) => {

    // --- THAY ĐỔI 2: Đơn giản hóa logic lấy dữ liệu ---
    // Dữ liệu đã được chuẩn bị hoàn hảo từ App.jsx
    const userResult = resultData.user;
    const opponentResult = resultData.opponent;
    const winnerName = resultData.isUserWinner ? userResult.name : opponentResult.name;
    
    // Hộp 1: WINNER (Hoặc người dùng)
    const renderBlock = (player, data, isWinner) => (
        <div className={`player-block ${isWinner ? 'winner' : 'loser'}`}>
            <h4>{player.name}</h4>
            
            {/* --- THAY ĐỔI 3: Thêm dòng hiển thị KẾT QUẢ (Status) --- */}
            <div className="stat-item">
                <span className="stat-label">Kết quả:</span>
                <span className="stat-value" style={{fontWeight: 700, color: isWinner ? 'var(--color-green)' : 'var(--color-red)'}}>
                    {data.status || (isWinner ? 'Thắng' : 'Thua')}
                </span>
            </div>
            
            <div className="stat-item">
                <span className="stat-label">Tổng thời gian Suy nghĩ:</span>
                <span className="stat-value">{data.thoughtTime || 'N/A'}</span>
            </div>
            
            <div className="stat-item">
                <span className="stat-label">Số Lỗi:</span>
                <span className={`stat-value ${data.errors > 0 ? 'error-count' : ''}`}>{data.errors}</span>
            </div>
            
            <div className="stat-item">
                <span className="stat-label">Thời gian Hoàn thành:</span>
                <span className="stat-value">{data.timeCompleted}</span>
            </div>
        </div>
    );


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
                    {renderBlock(user, userResult, resultData.isUserWinner)}
                    
                    {/* Hộp 2: Đối thủ */}
                    {renderBlock(opponent, opponentResult, !resultData.isUserWinner)}
                </main>
                
                <footer className="action-buttons">
                    <button className="button-replay" onClick={onReplay}>
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