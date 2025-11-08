// src/App.jsx
import React, { useState } from "react";
import "./style/index.css";
import AuthWrapper from "./components/AuthWrapper";
import Lobby from "./components/Lobby";
import MatchSetup from "./components/MatchSetup";
import Maingame from "./components/Maingame";
import MatchResult from "./components/MatchResult";
import History from "./components/History";
import { SocketProvider } from "./context/SocketContext";

// Dữ liệu giả lập khi chưa có người
const mockInitialUser = { name: "GUEST", id: `u-${Date.now()}` };
const mockInitialOpponent = { name: "AI Opponent", id: "a1" };

const App = () => {
  const [screen, setScreen] = useState("login");

  const [user, setUser] = useState(mockInitialUser);
  const [opponent, setOpponent] = useState(mockInitialOpponent);
  const [lastMatchResult, setLastMatchResult] = useState(null);

  // Khi đăng nhập thành công
  const handleAuthSuccess = (username) => {
    setUser({ ...user, name: username });
    setScreen("lobby");
  };

  // Khi chấp nhận thách đấu từ Lobby
  const handleAcceptChallenge = (challenger) => {
    setOpponent(challenger);
    setScreen("matchSetup");
  };

  // Khi MatchSetup đếm ngược xong
  const handleStartGame = () => setScreen("game");

  // Khi game kết thúc
  const handleFinishGame = (finalBoard, errors) => {
    const result = {
      isUserWinner: true,
      user: {
        name: user.name,
        timeCompleted: "02:10",
        errors: errors,
        isWinner: true,
      },
      opponent: {
        name: opponent.name,
        timeCompleted: "03:00",
        errors: 1,
        isWinner: false,
      },
    };
    setLastMatchResult(result);
    setScreen("matchResult");
  };

  const handleSurrender = (errors) => {
    const result = {
      isUserWinner: false,
      user: {
        name: user.name,
        timeCompleted: "Đầu hàng",
        errors: errors,
        isWinner: false,
      },
      opponent: {
        name: opponent.name,
        timeCompleted: "01:50",
        errors: 0,
        isWinner: true,
      },
    };
    setLastMatchResult(result);
    setScreen("matchResult");
  };

  const renderScreen = () => {
    switch (screen) {
      case "login":
        return <AuthWrapper onAuthSuccess={handleAuthSuccess} />;

      case "lobby":
        return (
          <Lobby
            user={user}
            onAcceptChallenge={handleAcceptChallenge}
            onViewHistory={() => setScreen("history")}
            onLogout={() => setScreen("login")}
          />
        );

      case "matchSetup":
        return (
          <MatchSetup
            user={user}
            opponent={opponent}
            onStartGame={handleStartGame}
          />
        );

      case "game":
        return (
          <Maingame
            user={user}
            opponent={opponent}
            onFinish={handleFinishGame}
            onSurrender={handleSurrender}
          />
        );

      case "matchResult":
        return (
          <MatchResult
            user={user}
            opponent={opponent}
            resultData={lastMatchResult}
            onReplay={() => setScreen("matchSetup")}
            onGoToLobby={() => setScreen("lobby")}
            onViewHistory={() => setScreen("history")}
          />
        );

      case "history":
        return <History onMenuClick={() => setScreen("lobby")} onBack={() => setScreen("lobby")} />;

      default:
        return <div>404 | Screen Not Found</div>;
    }
  };

  return (
    <SocketProvider>
      <div className="App">{renderScreen()}</div>
    </SocketProvider>
  );
};

export default App;
