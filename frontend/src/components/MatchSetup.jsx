import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import "../style/Match_Setup.css";

import avatarYou from "../assets/img/user-icon.png";
import avatarPlayerA from "../assets/img/user-icon.png";

// --- CẬP NHẬT: Thay thế icon Sudoku cũ bằng icon mới ---
const SudokuIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="28" height="28" rx="8" fill="#1C1E21" />
    <text
      x="50%"
      y="52%"
      dominantBaseline="middle"
      textAnchor="middle"
      fill="white"
      fontSize="16"
      fontFamily="Georgia, serif"
      fontWeight="600"
    >
      S
    </text>
  </svg>
);

const ExitIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 17L21 12M21 12L16 7M21 12H9M12 16V17C12 18.6569 10.6569 20 9 20H5C3.34315 20 2 18.6569 2 17V7C2 5.34315 3.34315 4 5 4H9C10.6569 4 12 5.34315 12 7V8"
      stroke="#333"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
// --- Hết phần icon SVG ---

// Single, merged component with onStartGame prop
const MatchSetup = ({ user, opponent, onBack, onStartGame }) => {
  const { socket } = useSocket();
  const [countdown, setCountdown] = useState(3);
  const [statusText, setStatusText] = useState("Đang tạo phòng đấu...");

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Khi đếm ngược kết thúc
    setStatusText("Bắt đầu!");

    // Gửi event startMatch lên server với matchId
    if (socket && opponent?.matchId) {
      console.log("Sending startMatch event with matchId:", opponent.matchId);
      socket.emit("startMatch", { matchId: opponent.matchId });
    }

    // Chờ một chút để hiển thị "Bắt đầu!" rồi chuyển màn hình
    const timer = setTimeout(() => {
      if (typeof onStartGame === "function") {
        onStartGame();
      }
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, onStartGame, socket, opponent]);

  return (
    <div className="match-setup-screen">
      <div className="battle-card">
        <header className="battle-header">
          <div className="logo">
            <SudokuIcon />
            <h1>Sudoku Battle</h1>
          </div>
          <button className="exit-button" onClick={onBack}>
            <ExitIcon />
            <span>Thoát</span>
          </button>
        </header>

        <main className="battle-main">
          <h2 className="status-title">{statusText}</h2>

          <div className={`countdown-timer ${countdown === 0 ? "go" : ""}`}>
            {countdown > 0 ? countdown : "GO!"}
          </div>

          <div className="players-container">
            <div className="player-info-card">
              <img
                src={user?.avatar || avatarYou}
                alt={user?.username || user?.name || "You"}
                className="avatar"
              />
              <div className="player-details">
                <span className="player-name">{user?.username || user?.name || "You"}</span>
                <span className="player-status">Online</span>
              </div>
            </div>

            <svg
              className="arrow-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="#4A90E2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="player-info-card">
              <img
                src={opponent?.avatar || avatarPlayerA}
                alt={opponent?.username || opponent?.name || "Opponent"}
                className="avatar"
              />
              <div className="player-details">
                <span className="player-name">
                  {opponent?.username || opponent?.name || "Opponent"}
                </span>
                <span className="player-status">Online</span>
              </div>
            </div>
          </div>

          <div className="connection-status">
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: "30%" }}></div>
            </div>
            <p className="connection-text">Đang thiết lập kết nối...</p>
          </div>
        </main>
      </div>
    </div>
  );
};



export default MatchSetup;
