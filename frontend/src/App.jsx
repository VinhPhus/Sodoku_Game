import React, { useState } from "react";
import "./style/index.css"; // File CSS toàn cục
// Import tất cả các components cần thiết
import AuthWrapper from "./components/AuthWrapper"; // Mới: Quản lý Login/Register
import Lobby from "./components/Lobby";
import MatchSetup from "./components/MatchSetup";
import Maingame from "./components/Maingame";
import MatchResult from "./components/MatchResult"; // Mới
import History from "./components/History"; // Mới

// Dữ liệu giả lập về trận đấu
const mockInitialUser = { name: "GUEST", id: "u1" };
const mockInitialOpponent = { name: "AI Opponent", id: "a1" };

// (Giữ nguyên hằng số thời gian và hàm formatTime)
const GAME_DURATION_SECONDS = 140; 

const formatTime = (s) => {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
};

const App = () => {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(mockInitialUser);
  const [opponent, setOpponent] = useState(mockInitialOpponent);
  const [lastMatchResult, setLastMatchResult] = useState(null);

  // ===============================================
  // --- (Các hàm handleAuthSuccess, handleAcceptChallenge, handleStartGame không đổi) ---
  // ===============================================
  const handleAuthSuccess = (username) => {
    setUser({ ...user, name: username });
    setScreen("lobby");
  };

  const handleAcceptChallenge = (challenger) => {
    setOpponent(challenger);
    setScreen("matchSetup");
  };

  const handleStartGame = () => {
    setScreen("game");
  };
  
  // ===============================================
  // --- 4. Xử lý Luồng Kết thúc Game (MAINGAME) ---
  // ===============================================

  /**
   * HÀM 1: Khi người dùng nhấn HOÀN THÀNH (THẮNG)
   */
  const handleFinishGame = (finalBoard, errors, timeLeft) => {
    
    // Tính toán thời gian hoàn thành
    const timeUsedInSeconds = GAME_DURATION_SECONDS - timeLeft;
    const formattedTimeCompleted = formatTime(timeUsedInSeconds); // Thời gian thực của người thắng

    const result = {
      isUserWinner: true,
      user: {
        name: user.name,
        // --- THAY ĐỔI THEO YÊU CẦU 1 & 3 ---
        timeCompleted: formattedTimeCompleted, // Gán thời gian trôi qua
        status: "Thắng cuộc",                // Gán trạng thái
        errors: 1, // (Lỗi giả lập của đối thủ)
        isWinner: true,
      },
      opponent: {
        name: opponent.name,
        // --- THAY ĐỔI THEO YÊU CẦU 2 & 3 ---
        timeCompleted: "-",                   // Gán dấu "-"
        status: "Thua cuộc",                 // Gán trạng thái
        errors: 1, // (Lỗi giả lập của đối thủ)
        isWinner: false,
      },
    };
    setLastMatchResult(result);
    setScreen("matchResult");
  };

  /**
   * HÀM 2: Khi người dùng ĐẦU HÀNG (THUA)
   */
  const handleSurrender = (errors, timeLeft) => {

    // Tính toán thời gian tại lúc đầu hàng
    const timeUsedInSeconds = GAME_DURATION_SECONDS - timeLeft;
    const formattedTimeUsed = formatTime(timeUsedInSeconds); // Thời gian thực của người thắng

    const result = {
      isUserWinner: false,
      user: {
        name: user.name,
        // --- THAY ĐỔI THEO YÊU CẦU 2 & 3 ---
        timeCompleted: "-",                   // Gán dấu "-"
        status: "Đầu hàng",                 // Gán trạng thái
        errors: errors,
        isWinner: false,
      },
      opponent: {
        name: opponent.name,
        // --- THAY ĐỔI THEO YÊU CẦU 1 & 3 ---
        timeCompleted: formattedTimeUsed,     // Gán thời gian trôi qua
        status: "Thắng cuộc",                // Gán trạng thái
        errors: 0, // (Giả lập đối thủ không có lỗi)
        isWinner: true,
      },
    };
    setLastMatchResult(result);
    setScreen("matchResult");
  };

  // ===============================================
  // --- 5. Logic Hiển thị (RENDER) ---
  // ===============================================

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
            onFinish={handleFinishGame} // (Đã cập nhật)
            onSurrender={handleSurrender} // (Đã cập nhật)
          />
        );

      case "matchResult":
        return (
          <MatchResult
            user={user}
            opponent={opponent}
            resultData={lastMatchResult} // Dữ liệu kết quả từ game
            onReplay={() => setScreen("matchSetup")}
            onGoToLobby={() => setScreen("lobby")}
            onViewHistory={() => setScreen("history")}
          />
        );

      case "history":
        return (
          <History
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

export default App;