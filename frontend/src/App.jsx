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
  const [onlinePlayers, setOnlinePlayers] = useState([]);

  // --- Khi login thành công ---
  const handleAuthSuccess = (username) => {
    // Tạo id duy nhất cho user
    const userId = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newUser = { id: userId, username };
    setUser(newUser);
    setScreen("lobby");

    // Kết nối WebSocket với userId
    if (socket) {
      socket.connect(userId, username);
    }
  };

  // --- Socket listeners ---
  useEffect(() => {
    if (!socket || !user) return;

    // Cập nhật danh sách online
    socket.on("onlinePlayers", (data) => {
      console.log("Received onlinePlayers:", data);
      const playersList = data.players || data;
      const filtered = playersList.filter((p) => p.id !== user.id);
      console.log("Filtered players:", filtered);
      setOnlinePlayers(filtered);
    });

    // Khi có challenge tới
    socket.on("challengeReceived", ({ challenger }) => {
      setChallenger(challenger);
    });

    // Khi có phản hồi challenge
    socket.on("challengeResponse", (data) => {
      console.log("challengeResponse", data); // debug
      if (data.accepted && data.matchId && data.challenger) {
        const challengerData = {
          id: data.challenger.id,
          username: data.challenger.username || data.challenger.name,
          avatar: data.challenger.avatar || null,
          matchId: data.matchId  // Lưu matchId để sử dụng sau
        };
        setOpponent(challengerData);
        setScreen("matchSetup");
      }
      setChallenger(null);
    });

    // Khi trận đấu bắt đầu (cả 2 người chơi đều nhận được)
    socket.on("matchStarted", (data) => {
      console.log("matchStarted", data);
      if (data.matchId) {
        // Đảm bảo matchId được lưu vào opponent
        setOpponent(prev => ({
          ...prev,
          matchId: data.matchId
        }));
        setScreen("game");
      }
    });

    // Khi người chơi thoát khỏi trận
    socket.on("playerLeft", (data) => {
      console.log("playerLeft", data);
      if (screen === "matchSetup" || screen === "game") {
        alert("Đối thủ đã thoát khỏi trận đấu!");
        setScreen("lobby");
        setOpponent(null);
      }
    });

    return () => {
      socket.off("onlinePlayers");
      socket.off("challengeReceived");
      socket.off("challengeResponse");
      socket.off("matchStarted");
      socket.off("playerLeft");
    };
  }, [socket, user]);

  // --- Lobby Actions ---
  const handleAcceptChallenge = (challengerData) => {
    setOpponent(challengerData);
    setScreen("matchSetup");
  };

  // --- Match Setup / Start Game ---
  const handleStartGame = () => {
    console.log("Starting game with user:", user);
    console.log("Starting game with opponent:", opponent);
    setScreen("game");
  };

  // --- Game Finish ---
  const handleFinishGame = (matchResult) => {
    // matchResult có thể là object kết quả hoặc là (board, errors) từ cách gọi cũ
    let result;

    if (matchResult && typeof matchResult === 'object' && matchResult.isUserWinner !== undefined) {
      // Đã là object kết quả từ socket event
      result = matchResult;
    } else {
      // Fallback cho trường hợp cũ (nếu có)
      result = {
        isUserWinner: true,
        user: {
          name: user.username,
          timeCompleted: "N/A",
          errors: typeof matchResult === 'number' ? matchResult : 0,
          isWinner: true
        },
        opponent: {
          name: opponent?.username || "Đối thủ",
          timeCompleted: "N/A",
          errors: 0,
          isWinner: false
        },
      };
    }

    setLastMatchResult(result);
    setScreen("matchResult");
  };

  const handleSurrender = (errors) => {
    // Hàm này có thể không cần nữa vì surrender được xử lý qua socket
    // Nhưng giữ lại để tương thích
    const result = {
      isUserWinner: false,
      user: { name: user.username, timeCompleted: "Đầu hàng", errors, isWinner: false },
      opponent: { name: opponent?.username || "Đối thủ", timeCompleted: "N/A", errors: 0, isWinner: true },
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
        return (
          <MatchSetup
            user={user}
            opponent={opponent}
            matchId={opponent?.matchId || null} // nếu cần matchId
            onStartGame={handleStartGame}
          />
        );

      case "game":
        return (
          <Maingame
            user={user}
            opponent={opponent}
            matchId={opponent?.matchId}
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
        return (
          <History
            user={user}
            onMenuClick={() => setScreen("lobby")}
            onBack={() => setScreen("lobby")}
          />
        );

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
