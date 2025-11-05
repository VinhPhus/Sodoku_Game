import React, { useState } from 'react';
import './style/index.css';

// Import các component
import AuthWrapper from './components/AuthWrapper';
import Lobby from './components/Lobby';
import MatchSetup from './components/MatchSetup';
import Maingame from './components/Maingame';
import MatchResult from './components/MatchResult';
import History from './components/History';

// Dữ liệu mặc định
const mockInitialUser = { name: 'GUEST', id: 'u1' };
const mockInitialOpponent = { name: 'AI Opponent', id: 'a1' };

const App = () => {
    // Quản lý màn hình
    const [screen, setScreen] = useState('login');

    // Quản lý người chơi và đối thủ
    const [user, setUser] = useState(mockInitialUser);
    const [opponent, setOpponent] = useState(mockInitialOpponent);

    // Quản lý kết quả trận đấu
    const [lastMatchResult, setLastMatchResult] = useState(null);

    // ===========================================================
    // 1️⃣ XỬ LÝ ĐĂNG NHẬP / ĐĂNG KÝ
    // ===========================================================
    const handleAuthSuccess = (username) => {
        setUser({ ...user, name: username });
        setScreen('lobby');
    };

    // ===========================================================
    // 2️⃣ XỬ LÝ Ở LOBBY
    // ===========================================================
    const handleAcceptChallenge = (challenger) => {
        setOpponent(challenger);
        setScreen('matchSetup');
    };

    // ===========================================================
    // 3️⃣ BẮT ĐẦU GAME (Match Setup)
    // ===========================================================
    const handleStartGame = () => {
        setScreen('game');
    };

    // ===========================================================
    // 4️⃣ KHI KẾT THÚC TRẬN (Maingame)
    // ===========================================================
    const handleFinishGame = (finalBoard, errors) => {
        const result = {
            isUserWinner: true,
            user: {
                name: user.name,
                timeCompleted: '02:10',
                errors,
                isWinner: true,
            },
            opponent: {
                name: opponent.name,
                timeCompleted: '03:00',
                errors: 1,
                isWinner: false,
            },
        };
        setLastMatchResult(result);
        setScreen('matchResult');
    };

    const handleSurrender = (errors) => {
        const result = {
            isUserWinner: false,
            user: {
                name: user.name,
                timeCompleted: 'Đầu hàng',
                errors,
                isWinner: false,
            },
            opponent: {
                name: opponent.name,
                timeCompleted: '01:50',
                errors: 0,
                isWinner: true,
            },
        };
        setLastMatchResult(result);
        setScreen('matchResult');
    };

    // ===========================================================
    // 5️⃣ HIỂN THỊ MÀN HÌNH
    // ===========================================================
    const renderScreen = () => {
        switch (screen) {
            case 'login':
                return <AuthWrapper onAuthSuccess={handleAuthSuccess} />;

            case 'lobby':
                return (
                    <Lobby
                        user={user}
                        onAcceptChallenge={handleAcceptChallenge}
                        onViewHistory={() => setScreen('history')}
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
                        onFinish={handleFinishGame}
                        onSurrender={handleSurrender}
                    />
                );

            case 'matchResult':
                return (
                    <MatchResult
                        user={user}
                        opponent={opponent}
                        resultData={lastMatchResult}
                        onReplay={() => setScreen('matchSetup')}
                        onGoToLobby={() => setScreen('lobby')}
                        onViewHistory={() => setScreen('history')}
                    />
                );

            case 'history':
                return (
                    <History
                        onMenuClick={() => setScreen('lobby')}
                    // onViewDetails={handleViewMatchDetails} // có thể thêm sau
                    />
                );

            default:
                return <div>404 | Screen Not Found</div>;
        }
    };

    // ===========================================================
    // 6️⃣ GIAO DIỆN CHÍNH
    // ===========================================================
    return <div className="App">{renderScreen()}</div>;
};

export default App;
