import React, { useState } from 'react';
import './style/index.css'; // File CSS toàn cục
// Import tất cả các components cần thiết
import AuthWrapper from './components/AuthWrapper'; // Mới: Quản lý Login/Register
import Lobby from './components/Lobby';
import MatchSetup from './components/MatchSetup';
import Maingame from './components/Maingame';
import MatchResult from './components/MatchResult'; // Mới
import History from './components/History'; // Mới

// Dữ liệu giả lập về trận đấu
const mockInitialUser = { name: 'GUEST', id: 'u1' };
const mockInitialOpponent = { name: 'AI Opponent', id: 'a1' };

const App = () => {
    // State quản lý màn hình hiện tại: 
    // 'login' | 'lobby' | 'matchSetup' | 'game' | 'matchResult' | 'history'
    const [screen, setScreen] = useState('login');

    // State lưu trữ thông tin người chơi
    const [user, setUser] = useState(mockInitialUser);
    const [opponent, setOpponent] = useState(mockInitialOpponent);

    // State lưu trữ kết quả trận đấu để truyền vào MatchResult
    const [lastMatchResult, setLastMatchResult] = useState(null);

    // ===============================================
    // --- 1. Xử lý Luồng Xác thực (LOGIN/REGISTER) ---
    // ===============================================

    // Hàm được gọi khi Đăng nhập/Đăng ký thành công
    const handleAuthSuccess = (username) => {
        // Cập nhật tên người dùng và chuyển sang Lobby
        setUser({ ...user, name: username });
        setScreen('lobby');
    };

    // ===============================================
    // --- 2. Xử lý Luồng Thách đấu (LOBBY) ---
    // ===============================================

    // Hàm được gọi khi chấp nhận lời mời (từ Lobby)
    const handleAcceptChallenge = (challenger) => {
        setOpponent(challenger);
        setScreen('matchSetup');
    };

    // ===============================================
    // --- 3. Xử lý Luồng Bắt đầu Game (MATCH SETUP) ---
    // ===============================================

    // Hàm được gọi khi MatchSetup đếm ngược xong
    const handleStartGame = () => {
        setScreen('game');
    };

    // ===============================================
    // --- 4. Xử lý Luồng Kết thúc Game (MAINGAME) ---
    // ===============================================

    /**
     * Hàm xử lý khi người dùng nhấn HOÀN THÀNH (Dự kiến THẮNG)
     * @param {Array} finalBoard - Trạng thái cuối cùng của bàn cờ (nếu cần chấm điểm)
     */
    const handleFinishGame = (finalBoard, errors) => {
        // Giả lập dữ liệu thắng cuộc
        const result = {
            isUserWinner: true,
            user: { name: user.name, timeCompleted: '02:10', errors: errors, isWinner: true },
            // BẠN ĐÃ LÀM MẤT DỮ LIỆU NÀY:
            opponent: { name: opponent.name, timeCompleted: '03:00', errors: 1, isWinner: false },
        };
        setLastMatchResult(result);
        setScreen('matchResult');
    };

    /**
     * Hàm xử lý khi người dùng nhấn ĐẦU HÀNG (Dự kiến THUA)
     */
    const handleSurrender = (errors) => {
        // Giả lập dữ liệu thua cuộc
        const result = {
            isUserWinner: false,
            user: { name: user.name, timeCompleted: 'Đầu hàng', errors: errors, isWinner: false },
            // BẠN ĐÃ LÀM MẤT DỮ LIỆU NÀY:
            opponent: { name: opponent.name, timeCompleted: '01:50', errors: 0, isWinner: true },
        };
        setLastMatchResult(result);
        setScreen('matchResult');
    };

    // ===============================================
    // --- 5. Logic Hiển thị (RENDER) ---
    // ===============================================

    const renderScreen = () => {
        switch (screen) {
            case 'login':
                return <AuthWrapper onAuthSuccess={handleAuthSuccess} />; // Dùng AuthWrapper mới

            case 'lobby':
                return (
                    <Lobby
                        user={user}
                        onAcceptChallenge={handleAcceptChallenge}
                        onViewHistory={() => setScreen('history')} // Thêm luồng đến History
                        onLogout={() => setScreen('login')}
                    />
                );

            case 'matchSetup':
                return (
                    <MatchSetup
                        user={user}
                        opponent={opponent}
                        onStartGame={handleStartGame}
                    />
                );

            case 'game':
                return (
                    <Maingame
                        user={user}
                        opponent={opponent}
                        onFinish={handleFinishGame} // Kết thúc (THẮNG)
                        onSurrender={handleSurrender} // Đầu hàng (THUA)
                    />
                );

            case 'matchResult':
                return (
                    <MatchResult
                        user={user}
                        opponent={opponent}
                        resultData={lastMatchResult} // Dữ liệu kết quả từ game
                        onReplay={() => setScreen('matchSetup')}
                        onGoToLobby={() => setScreen('lobby')}
                        onViewHistory={() => setScreen('history')}
                    />
                );

            case 'history':
                return (
                    <History
                        onMenuClick={() => setScreen('lobby')} // Quay lại Lobby
                    // onViewDetails={handleViewMatchDetails} // Thêm luồng này sau
                    />
                );

            default:
                return <div>404 | Screen Not Found</div>;
        }
    };

    return (
        <div className="App">
            {renderScreen()}
        </div>
    );
};

export default App;