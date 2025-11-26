import React from "react";
import "../style/MatchResult.css";

// ===== COMPONENTS UI PHỤ TRỢ =====
// Icon Confetti cho người thắng
const ConfettiEmoji = () => (
    <span style={{ fontSize: '56px', display: 'block', marginBottom: '10px' }} role="img" aria-label="confetti">
        🎉
    </span>
);

// Icon buồn cho người thua
const LoserEmoji = () => (
    <span style={{ fontSize: '56px', display: 'block', marginBottom: '10px' }} role="img" aria-label="sad">
        😥
    </span>
);

// ===== DỮ LIỆU MOCK (Dùng để test khi không có props) =====
const mockResultData = {
    isUserWinner: true,
    user: { name: 'YOU', errors: 0, timeCompleted: '02:10' },
    opponent: { name: 'PLAYER A', errors: 2, timeCompleted: '-' }
};

const MatchResult = ({
    resultData = mockResultData,
    matchId = null,
    difficulty = 'medium',
    socket = null,
    onReplay = () => console.log('Replay clicked'),
    onGoToLobby = () => console.log('Go to Lobby clicked'),
    onViewHistory = () => console.log('View History clicked')
}) => {

    // === LOGIC XỬ LÝ DỮ LIỆU ===
    // Hàm này ép buộc trạng thái thắng/thua dựa trên biến isWinner truyền vào
    // để tránh lỗi hiển thị sai từ server.
    const processPlayerData = (rawData, isWinner, defaultName) => {
        const safeData = rawData || {};
        
        // Xác định tên hiển thị
        const displayName = safeData.name || defaultName;

        // Xác định trạng thái hiển thị
        let statusText = "";
        let statusColor = "";

        if (safeData.timeCompleted === "Đầu hàng") {
            statusText = "ĐẦU HÀNG";
            statusColor = "var(--color-red, #ff4d4f)";
        } else {
            statusText = isWinner ? "THẮNG CUỘC" : "THUA CUỘC";
            statusColor = isWinner ? "var(--color-green, #52c41a)" : "var(--color-red, #ff4d4f)";
        }

        return {
            ...safeData,
            name: displayName,
            isWinner: isWinner, // Ghi đè isWinner để đảm bảo tính nhất quán
            displayStatus: statusText,
            statusColor: statusColor,
            errors: safeData.errors || 0,
            timeCompleted: safeData.timeCompleted || "-"
        };
    };

    // Xử lý dữ liệu dựa trên "Source of Truth" là resultData.isUserWinner
    // User thắng thì Opponent bắt buộc phải thua và ngược lại
    const userResult = processPlayerData(resultData.user, resultData.isUserWinner, 'YOU');
    const opponentResult = processPlayerData(resultData.opponent, !resultData.isUserWinner, 'OPPONENT');
    
    // Tên người thắng để hiển thị tiêu đề
    const winnerName = resultData.isUserWinner ? userResult.name : opponentResult.name;

    // === HÀM RENDER KHỐI NGƯỜI CHƠI ===
    const renderPlayerBlock = (data, label) => {
        return (
            <div className={`player-block ${data.isWinner ? 'winner' : 'loser'}`} 
                 style={{ 
                     border: data.isWinner ? '2px solid var(--color-green, #52c41a)' : '1px solid #ddd',
                     backgroundColor: data.isWinner ? '#f6ffed' : '#fff1f0',
                     padding: '15px',
                     borderRadius: '8px',
                     flex: 1,
                     textAlign: 'center'
                 }}>
                
                {/* Tên người chơi + Icon Vương miện nếu thắng */}
                <h4 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>
                    {data.isWinner ? '👑 ' : ''}{data.name}
                </h4>

                {/* Hiển thị Status */}
                <div className="stat-item" style={{ marginBottom: '10px' }}>
                    <span className="stat-value" style={{ fontWeight: 800, color: data.statusColor, fontSize: '1.1rem' }}>
                        {data.displayStatus}
                    </span>
                </div>

                {/* Hiển thị Số Lỗi */}
                <div className="stat-item" style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                    <span className="stat-label">Số Lỗi:</span>
                    <span className={`stat-value ${data.errors > 0 ? 'error-count' : ''}`} style={{ fontWeight: 'bold' }}>
                        {data.errors}
                    </span>
                </div>

                {/* Hiển thị Thời gian */}
                <div className="stat-item" style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                    <span className="stat-label">Thời gian:</span>
                    <span className="stat-value" style={{
                        fontWeight: 600,
                        color: data.timeCompleted === "Đầu hàng" ? 'red' :
                            (data.timeCompleted === "-" ? '#999' : '#000')
                    }}>
                        {data.timeCompleted === "-" ? "--:--" : data.timeCompleted}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="result-screen">
            <div className="result-card">
                {/* --- HEADER --- */}
                <header className="result-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
                    {resultData.isUserWinner ? <ConfettiEmoji /> : <LoserEmoji />}
                    
                    <h2 className="winner-title" style={{ 
                        color: resultData.isUserWinner ? 'var(--color-green, #52c41a)' : 'var(--color-red, #ff4d4f)',
                        margin: '10px 0'
                    }}>
                        {resultData.isUserWinner ? "BẠN ĐÃ CHIẾN THẮNG!" : "BẠN ĐÃ THUA CUỘC!"}
                    </h2>
                    <p className="winner-subtitle" style={{ color: '#666' }}>
                        Người chiến thắng chung cuộc: <strong>{winnerName.toUpperCase()}</strong>
                    </p>
                </header>

                {/* --- MAIN COMPARISON --- */}
                <main className="comparison-container" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {/* Hộp 1: Người dùng */}
                    {renderPlayerBlock(userResult, 'YOU')}

                    {/* VS Divider */}
                    <div className="vs-divider" style={{ fontWeight: '900', color: '#999', fontSize: '1.5rem' }}>
                        VS
                    </div>

                    {/* Hộp 2: Đối thủ */}
                    {renderPlayerBlock(opponentResult, 'ĐỐI THỦ')}
                </main>

                {/* --- FOOTER ACTIONS --- */}
                <footer className="action-buttons" style={{ marginTop: '25px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button className="button-replay" onClick={() => {
                        if (socket && matchId) {
                            socket.emit('rematchRequest', { matchId, difficulty });
                        } else {
                            onReplay();
                        }
                    }}>
                        CHƠI LẠI
                    </button>
                    
                    <button className="button-lobby" onClick={onGoToLobby}>
                        VỀ SẢNH
                    </button>
                    
                    <button className="button-history" onClick={onViewHistory}>
                        LỊCH SỬ
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default MatchResult;