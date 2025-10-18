import React from "react";
import "../style/MatchResult.css";
// Giả định icon confetti được thêm dưới dạng emoji hoặc một component SVG

// Dữ liệu giả lập cho màn hình kết quả (có thể nhận từ props)
const mockResultData = {
    // Ghi chú: Cài đặt người chiến thắng ở đây để dễ dàng thay đổi (true/false)
    isUserWinner: true, 

    user: {
        name: 'YOU',
        thoughtTime: '01:58',
        errors: 0,
        timeCompleted: '02:10',
    },
    opponent: {
        name: 'PLAYER A',
        thoughtTime: '01:30',
        errors: 2,
        timeCompleted: '-', // Chưa hoàn thành hoặc bị thua
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

    const userResult = resultData.user;
    const opponentResult = resultData.opponent;
    const winnerName = resultData.isUserWinner ? user.name : opponent.name;
    
    // Đảm bảo dữ liệu người chơi và đối thủ khớp với vị trí winner/loser
    const player1 = userResult.isWinner ? user : opponent;
    const player2 = userResult.isWinner ? opponent : user;

    const data1 = userResult.isWinner ? userResult : opponentResult;
    const data2 = userResult.isWinner ? opponentResult : userResult;
    
    // Hộp 1: WINNER (Hoặc người dùng)
    const renderBlock = (player, data, isWinner) => (
        <div className={`player-block ${isWinner ? 'winner' : 'loser'}`}>
            <h4>{player.name}</h4>
            
            <div className="stat-item">
                <span className="stat-label">Tổng thời gian Suy nghĩ:</span>
                <span className="stat-value">{data.thoughtTime}</span>
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
                    <ConfettiEmoji />
                    <h2 className="winner-title">
                        NGƯỜI CHIẾN THẮNG: <span>{winnerName.toUpperCase()}</span>
                    </h2>
                </header>
                
                <main className="comparison-container">
                    {/* Hộp 1: Người dùng/Người chiến thắng */}
                    {renderBlock(player1, data1, data1.isWinner)}
                    
                    {/* Hộp 2: Đối thủ/Người thua cuộc */}
                    {renderBlock(player2, data2, data2.isWinner)}
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