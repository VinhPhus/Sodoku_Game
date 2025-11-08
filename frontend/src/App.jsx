import React, { useState, useEffect } from "react";
import { SocketProvider, useSocket } from "./context/SocketContext";
import "./style/index.css";

import AuthWrapper from "./components/AuthWrapper";
import Lobby from "./components/Lobby";
import MatchSetup from "./components/MatchSetup";
import Maingame from "./components/Maingame";
import MatchResult from "./components/MatchResult";
import History from "./components/History";

const AppContent = () => {
  const { socket } = useSocket();

  const [user, setUser] = useState(null); // null trước login
  const [opponent, setOpponent] = useState(null);

  const [screen, setScreen] = useState("login"); // login | lobby | matchSetup | game | matchResult | history
  const [lastMatchResult, setLastMatchResult] = useState(null);

  const [challenger, setChallenger] = useState(null);
  const [onlinePlayers, setOnlinePlayers] = useState([{ id: 0, username: "Loading...", status: "online" }]);

  // --- Khi login thành công ---
  const handleAuthSuccess = (username) => {
    // Tạo id cố định (trùng với server nếu muốn)
    const newUser = { id: Math.floor(Math.random() * 10000), username };
    setUser(newUser);
    setScreen("lobby");

    if (socket) socket.emit("login", newUser);
  };

  // --- Socket listeners ---
  useEffect(() => {
  if (!socket || !user) return;

  socket.on("onlinePlayers", (players) => {
    setOnlinePlayers(players.filter((p) => p.id !== user.id));
  });

  socket.on("challengeReceived", ({ challenger }) => {
    setChallenger(challenger);
  });

  socket.on("challengeResponse", (data) => {
    if (data.accepted) {
      setOpponent(data.opponent || data.challenger);
      setScreen("matchSetup");
    } else {
      alert("Lời mời bị từ chối");
    }
    setChallenger(null);
  });

  return () => {
    socket.off("onlinePlayers");
    socket.off("challengeReceived");
    socket.off("challengeResponse");
  };
}, [socket, user]);

  // --- Lobby Actions ---
  const handleAcceptChallenge = (challengerData) => {
    setOpponent(challengerData);
    setScreen("matchSetup");
  };

  // --- Match Setup / Start Game ---
  const handleStartGame = () => setScreen("game");

  // --- Game Finish ---
  const handleFinishGame = (finalBoard, errors) => {
    const result = {
      isUserWinner: true,
      user: { name: user.username, timeCompleted: "02:10", errors, isWinner: true },
      opponent: { name: opponent?.username || "AI Opponent", timeCompleted: "03:00", errors: 1, isWinner: false },
    };
    setLastMatchResult(result);
    setScreen("matchResult");
  };

  const handleSurrender = (errors) => {
    const result = {
      isUserWinner: false,
      user: { name: user.username, timeCompleted: "Đầu hàng", errors, isWinner: false },
      opponent: { name: opponent?.username || "AI Opponent", timeCompleted: "01:50", errors: 0, isWinner: true },
    };
    setLastMatchResult(result);
    setScreen("matchResult");
  };

  // --- Render screen ---
  const renderScreen = () => {
    switch (screen) {
      case "login":
        return <AuthWrapper onAuthSuccess={handleAuthSuccess} />;

      case "lobby":
        if (!user) return <div>Loading user...</div>;
        return (
          <Lobby
            user={user}
            challenger={challenger}
            setChallenger={setChallenger}
            onlinePlayers={onlinePlayers}
            onAcceptChallenge={handleAcceptChallenge}
            onViewHistory={() => setScreen("history")}
            onLogout={() => setScreen("login")}
            socket={socket}
          />
        );

      case "matchSetup":
        return user && opponent ? (
        <MatchSetup user={user} opponent={opponent} onStartGame={handleStartGame} />
      ) : (
        <div>Loading...</div>   
      );

      case "game":
        return <Maingame user={user} opponent={opponent} onFinish={handleFinishGame} onSurrender={handleSurrender} />;

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

  return <div className="App">{renderScreen()}</div>;
};

export default function App() {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
}
