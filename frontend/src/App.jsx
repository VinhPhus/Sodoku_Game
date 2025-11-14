import React, { useState, useEffect } from "react";
import { SocketProvider, useSocket } from "./context/SocketContext";
import "./style/index.css";

import AuthWrapper from "./components/AuthWrapper";
import Lobby from "./components/Lobby";
import MatchSetup from "./components/MatchSetup";
import Maingame from "./components/Maingame";
import MatchResult from "./components/MatchResult";
import History from "./components/History";
import RematchDialog from "./components/RematchDialog";

const AppContent = () => {
  const { socket } = useSocket();

  const [user, setUser] = useState(null); // null trước login
  const [opponent, setOpponent] = useState(null);

  const [screen, setScreen] = useState("login"); // login | lobby | matchSetup | game | matchResult | history
  const [lastMatchResult, setLastMatchResult] = useState(null);

  const [challenger, setChallenger] = useState(null);
  const [onlinePlayers, setOnlinePlayers] = useState([]);

  // Board chung từ server
  const [gameBoard, setGameBoard] = useState(null);
  const [gameSolution, setGameSolution] = useState(null);

  // Rematch state
  const [rematchRequester, setRematchRequester] = useState(null);
  const [pendingRematchData, setPendingRematchData] = useState(null);

  // Lưu difficulty cho rematch
  const [currentDifficulty, setCurrentDifficulty] = useState('medium');

  // --- Khi login thành công ---
  const handleAuthSuccess = (authenticatedUser) => { //đối tượng {id, username} từ api login
    setUser(authenticatedUser);
    setScreen("lobby");

    // Kết nối WebSocket với userId
    if (socket) {
      socket.connect(authenticatedUser.id, authenticatedUser.username);
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
        // Lưu board và solution từ server
        setGameBoard(data.board);
        setGameSolution(data.solution);

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

    // Khi nhận yêu cầu rematch
    socket.on("rematchRequested", (data) => {
      console.log("rematchRequested", data);
      setRematchRequester(data.requester);
      setPendingRematchData({
        matchId: data.matchId,
        difficulty: data.difficulty,
        requesterId: data.requester.id
      });
    });

    // Khi rematch được chấp nhận
    socket.on("rematchAccepted", (data) => {
      console.log("rematchAccepted", data);
      const opponentData = {
        id: data.opponent.id,
        username: data.opponent.username,
        avatar: data.opponent.avatar || null,
        matchId: data.matchId
      };
      setOpponent(opponentData);
      setScreen("matchSetup");
      setRematchRequester(null);
      setPendingRematchData(null);
    });

    // Khi rematch bị từ chối
    socket.on("rematchDeclined", () => {
      console.log("rematchDeclined");
      alert("Đối thủ đã từ chối yêu cầu chơi lại!");
      setRematchRequester(null);
      setPendingRematchData(null);
    });

    return () => {
      socket.off("onlinePlayers");
      socket.off("challengeReceived");
      socket.off("challengeResponse");
      socket.off("matchStarted");
      socket.off("playerLeft");
      socket.off("rematchRequested");
      socket.off("rematchAccepted");
      socket.off("rematchDeclined");
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

  // --- Rematch handlers ---
  const handleAcceptRematch = () => {
    if (socket && pendingRematchData) {
      socket.emit('rematchResponse', {
        requesterId: pendingRematchData.requesterId,
        accepted: true,
        matchId: pendingRematchData.matchId,
        difficulty: pendingRematchData.difficulty
      });
    }
  };

  const handleDeclineRematch = () => {
    if (socket && pendingRematchData) {
      socket.emit('rematchResponse', {
        requesterId: pendingRematchData.requesterId,
        accepted: false,
        matchId: pendingRematchData.matchId
      });
    }
    setRematchRequester(null);
    setPendingRematchData(null);
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
            serverBoard={gameBoard}
            serverSolution={gameSolution}
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
            matchId={opponent?.matchId}
            difficulty={currentDifficulty}
            socket={socket}
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

  return (
    <div className="App">
      {renderScreen()}
      {rematchRequester && (
        <RematchDialog
          requesterName={rematchRequester.username}
          onAccept={handleAcceptRematch}
          onDecline={handleDeclineRematch}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
}
