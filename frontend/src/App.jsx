// ...existing code...
import React, { useState } from "react";
// import "./style/index.css"; // File CSS toàn cục - Đã được import trong main.jsx
// Import tất cả các components cần thiết
import AuthWrapper from "./components/AuthWrapper.jsx"; // Mới: Quản lý Login/Register
import Lobby from "./components/Lobby.jsx";
import MatchSetup from "./components/MatchSetup.jsx";
import Maingame from "./components/Maingame.jsx";
import MatchResult from "./components/MatchResult.jsx"; // Mới
import History from "./components/History.jsx"; // Mới
import AvatarEditModal from "./components/AvatarEditModal.jsx"; // Mới: modal chỉnh avatar
// ...existing code...

// Dữ liệu giả lập về trận đấu
const mockInitialUser = { name: "GUEST", id: "u1", avatar: "" };
const mockInitialOpponent = { name: "AI Opponent", id: "a1" };

// (Giữ nguyên hằng số thời gian và hàm formatTime)
const GAME_DURATION_SECONDS = 140;

const formatTime = (s) => {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

const App = () => {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(mockInitialUser);
  const [opponent, setOpponent] = useState(mockInitialOpponent);
  const [lastMatchResult, setLastMatchResult] = useState(null);

  // NEW: avatar modal state
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [localAvatarPreview, setLocalAvatarPreview] = useState(""); // store preview URL before saving

  // ===============================================
  // --- (Các hàm handleAuthSuccess, handleAcceptChallenge, handleStartGame không đổi) ---
  // ===============================================
  const handleAuthSuccess = (username) => {
    setUser((u) => ({ ...u, name: username }));
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
  // --- Avatar edit handlers (Mới) ---
  // ===============================================
  const openAvatarEditor = () => {
    setLocalAvatarPreview(user.avatar || "");
    setIsAvatarModalOpen(true);
  };

  const handleSaveAvatar = (previewUrl) => {
    // Lưu URL xem trước vào state user
    setUser((u) => ({ ...u, avatar: previewUrl }));
    setLocalAvatarPreview(previewUrl);
    setIsAvatarModalOpen(false);
  };

  const handleCloseAvatarModal = () => {
    setIsAvatarModalOpen(false);
    setLocalAvatarPreview("");
  };

  // ===============================================
  // --- 4. Xử lý Luồng Kết thúc Game (MAINGAME) ---
  // ===============================================
  const handleFinishGame = (finalBoard, errors, timeLeft) => {
    const timeUsedInSeconds = GAME_DURATION_SECONDS - timeLeft;
    const formattedTimeCompleted = formatTime(timeUsedInSeconds);

    const result = {
      isUserWinner: true,
      user: {
        name: user.name,
        timeCompleted: formattedTimeCompleted,
        status: "Thắng cuộc",
        errors: 1,
        isWinner: true,
      },
      opponent: {
        name: opponent.name,
        timeCompleted: "-",
        status: "Thua cuộc",
        errors: 1,
        isWinner: false,
      },
    };
    setLastMatchResult(result);
    setScreen("matchResult");
  };

  const handleSurrender = (errors, timeLeft) => {
    const timeUsedInSeconds = GAME_DURATION_SECONDS - timeLeft;
    const formattedTimeUsed = formatTime(timeUsedInSeconds);

    const result = {
      isUserWinner: false,
      user: {
        name: user.name,
        timeCompleted: "-",
        status: "Đầu hàng",
        errors: errors,
        isWinner: false,
      },
      opponent: {
        name: opponent.name,
        timeCompleted: formattedTimeUsed,
        status: "Thắng cuộc",
        errors: 0,
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
            onEditAvatar={openAvatarEditor} // Mới: cho phép mở modal từ Lobby
          />
        );

      case "matchSetup":
        return (
          <MatchSetup
            user={user}
            opponent={opponent}
            onStartGame={handleStartGame}
            onBack={() => setScreen("lobby")}
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

  return (
    <div className="App">
      {renderScreen()}

      {/* Avatar edit modal nằm ở root để overlay luôn hiển thị */}
      <AvatarEditModal
        isOpen={isAvatarModalOpen}
        onClose={handleCloseAvatarModal}
        onSave={handleSaveAvatar}
        currentAvatar={user.avatar || localAvatarPreview || ""}
      />
    </div>
  );
};

export default App;
// ...existing code...
