import React, { useState, useEffect, useRef } from 'react';
import './style/index.css';
import AuthWrapper from './components/AuthWrapper';
import Lobby from './components/Lobby';
import MatchSetup from './components/MatchSetup';
import Maingame from './components/Maingame';
import MatchResult from './components/MatchResult';
import History from './components/History';

const defaultUser = { name: 'GUEST', id: 'u1' };
const defaultOpponent = { name: 'AI Opponent', id: 'a1' };

const App = () => {
    const [screen, setScreen] = useState('login');
    const [user, setUser] = useState(defaultUser);
    const [opponent, setOpponent] = useState(defaultOpponent);
    const [lastMatchResult, setLastMatchResult] = useState(null);
    const [messages, setMessages] = useState([]);

    // Dùng useRef để lưu socket (vì socket là persistent object)
    const socketRef = useRef(null);

    // ==================================================
    // 🔗 1. Kết nối WebSocket khi đăng nhập
    // ==================================================
    const handleAuthSuccess = (username) => {
        const newUser = { ...user, name: username };
        setUser(newUser);
        setScreen('lobby');

        // Kết nối socket sau khi đăng nhập
        const socket = new WebSocket(`ws://localhost:8000/ws/${username}`);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('✅ WebSocket connected');
            socket.send(JSON.stringify({ type: 'JOIN', user: username }));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('📩 Server:', data);

            // Xử lý các loại message khác nhau
            switch (data.type) {
                case 'CHALLENGE':
                    setOpponent({ name: data.from });
                    setScreen('matchSetup');
                    break;

                case 'START_GAME':
                    setScreen('game');
                    break;

                case 'MATCH_RESULT':
                    setLastMatchResult(data.payload);
                    setScreen('matchResult');
                    break;

                default:
                    setMessages((prev) => [...prev, data]);
            }
        };

        socket.onclose = () => console.log('🔌 WebSocket disconnected');
        socket.onerror = (err) => console.error('❌ Socket error:', err);
    };

    // ==================================================
    // ⚙️ 2. Gửi sự kiện qua WebSocket
    // ==================================================
    const sendMessage = (msg) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(msg));
        } else {
            console.warn('⚠️ Socket chưa sẵn sàng');
        }
    };

    const handleAcceptChallenge = (challenger) => {
        setOpponent(challenger || defaultOpponent);
        setScreen('matchSetup');
        sendMessage({ type: 'ACCEPT_CHALLENGE', user: user.name, opponent: challenger.name });
    };

    const handleStartGame = () => {
        setScreen('game');
        sendMessage({ type: 'START_GAME', user: user.name, opponent: opponent.name });
    };

    const handleFinishGame = (finalBoard, errors = 0) => {
        const result = {
            isUserWinner: true,
            user: { name: user.name, timeCompleted: '02:10', errors, isWinner: true },
            opponent: { name: opponent.name, timeCompleted: '03:00', errors: 1, isWinner: false },
        };
        setLastMatchResult(result);
        setScreen('matchResult');
        sendMessage({ type: 'MATCH_RESULT', payload: result });
    };

    const handleSurrender = (errors = 0) => {
        const result = {
            isUserWinner: false,
            user: { name: user.name, timeCompleted: 'Đầu hàng', errors, isWinner: false },
            opponent: { name: opponent.name, timeCompleted: '01:50', errors: 0, isWinner: true },
        };
        setLastMatchResult(result);
        setScreen('matchResult');
        sendMessage({ type: 'MATCH_RESULT', payload: result });
    };

    // ==================================================
    // 🧹 3. Đóng socket khi rời khỏi ứng dụng
    // ==================================================
    useEffect(() => {
        return () => {
            if (socketRef.current) socketRef.current.close();
        };
    }, []);

    // ==================================================
    // 🧩 4. Render giao diện
    // ==================================================
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
                        onLogout={() => {
                            if (socketRef.current) socketRef.current.close();
                            setScreen('login');
                        }}
                    />
                );

            case 'matchSetup':
                return <MatchSetup user={user} opponent={opponent} onStartGame={handleStartGame} />;

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
                return <History onMenuClick={() => setScreen('lobby')} />;

            default:
                return <div>404 | Screen Not Found</div>;
        }
    };

    return (
        <div className="App">
            {renderScreen()}
            {/* 👇 Hiển thị log WebSocket để debug */}
            {messages.length > 0 && (
                <div className="debug-box">
                    <h4>📡 WebSocket Logs</h4>
                    <pre>{JSON.stringify(messages, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default App;
