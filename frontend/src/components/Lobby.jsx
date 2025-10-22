import React, { useState, useEffect } from "react";
import { LogOut, Swords, BarChart3 } from "lucide-react";
import "../style/Lobby.css";
import userIcon from "../assets/img/user-icon.png";
import MinhTam from "../assets/img/MinhTam.jpg";
import ChallengeDialog from "./ChallengeDialog";

// --- Component SVG Avatar (Không thay đổi) ---
const DefaultAvatar = () => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="player-avatar"
  >
    <circle cx="20" cy="20" r="20" fill="#E4E6EB" />
    <path
      d="M20 25C24.4183 25 28 28.5817 28 33H12C12 28.5817 15.5817 25 20 25Z"
      fill="#B0B3B8"
    />
    <circle cx="20" cy="18" r="5" fill="#B0B3B8" />
  </svg>
);

// --- Dữ liệu giả lập (Không thay đổi) ---
const mockPlayers = [
  { id: 1, name: "sói hoang", status: "online", avatar: null },
  { id: 2, name: "sickmyduck", status: "online", avatar: null },
  { id: 3, name: "Vinh Phú", status: "busy", avatar: userIcon },
  { id: 4, name: "Minh Tâm", status: "online", avatar: MinhTam },
  { id: 5, name: "No Name", status: "online", avatar: null },
];

// --- Component chính của Màn hình Sảnh ---
const Lobby = ({ username = "VinhPlus", onLogout, onAcceptChallenge, onViewHistory }) => {
  const [players] = useState(mockPlayers);

  // CẢI TIẾN 1: Dùng một state duy nhất để quản lý lời mời thách đấu
  // Nếu `challenger` là một object, dialog sẽ hiện. Nếu là `null`, dialog sẽ ẩn.
  const [challenger, setChallenger] = useState(null);

  // CẢI TIẾN 2: Hàm chấp nhận thách đấu sẽ gọi prop từ App.jsx
  const handleAccept = () => {
    console.log(`Chấp nhận thách đấu từ ${challenger.name}`);
    onAcceptChallenge(challenger); // Báo cho App.jsx biết để chuyển màn hình
    setChallenger(null); // Đóng dialog
  };

  // CẢI TIẾN 3: Hàm từ chối/đóng dialog chỉ cần reset state
  const handleDecline = () => {
    console.log(`Từ chối thách đấu từ ${challenger.name}`);
    setChallenger(null); // Đóng dialog
  };

  // Giả lập một người thách đấu bạn sau 3 giây
  useEffect(() => {
    const timer = setTimeout(() => {
      // Tìm đối tượng người chơi từ mock data để có đầy đủ thông tin
      const simulatedChallenger = players.find((p) => p.name === "sói hoang");
      if (simulatedChallenger) {
        setChallenger(simulatedChallenger); // Mở dialog bằng cách set state
      }
    }, 3000); // Giảm thời gian chờ để dễ test

    return () => clearTimeout(timer);
  }, [players]); // Thêm players vào dependency array

  return (
    <div className="lobby-screen">
      {/* CẢI TIẾN 4: Truyền props dưới dạng object cho ChallengeDialog */}
      <ChallengeDialog
        challenger={challenger} // Truyền cả object người thách đấu
        currentUser={{ name: username, avatar: userIcon }} // Tạo object người dùng hiện tại
        onAccept={handleAccept}
        onDecline={handleDecline}
        duration={20} // Có thể tùy chỉnh thời gian
      />

      <div className="lobby-container">
        {/* Header */}
        <header className="lobby-header">
          <h1 className="welcome-text">Xin chào, {username}</h1>
          <button className="logout-button" onClick={onLogout}>
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </header>

        <main className="main-content">
          {/* Cột chính: Danh sách người chơi */}
          <section className="player-list-card">
            <h2>Người chơi Online</h2>
            <div className="player-list">
              {players.map((player) => (
                <div key={player.id} className="player-item">
                  <div className="player-info">
                    {player.avatar ? (
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="player-avatar"
                      />
                    ) : (
                      <DefaultAvatar />
                    )}
                    <div className="player-details">
                      <span className="player-name">{player.name}</span>
                      <span className={`player-status status-${player.status}`}>
                        {player.status === "online" ? "Online" : "Đang bận"}
                      </span>
                    </div>
                  </div>
                  <button
                    className="challenge-button"
                    disabled={
                      player.status === "busy" || player.name === username
                    }
                    onClick={() => alert(`Bạn đã thách đấu ${player.name}!`)}
                  >
                    <Swords size={16} />
                    <span>Thách đấu</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Cột phụ: Các nút chức năng */}
          <aside className="sidebar">
            <div className="sidebar-card">
              <BarChart3 size={32} color="#007AFF" />
              <div className="sidebar-text">
                <h3>Lịch sử trận đấu</h3>
                <p>Xem lại các trận đấu đã qua của bạn.</p>
              </div>
              <button className="view-history-button" onClick={onViewHistory}>Xem</button>
            </div>

            <div className="avatar-section">
              <div className="avatar-container">
                <img src={userIcon} alt="User Avatar" className="user-avatar" />
              </div>
              <div className="avatar-info">
                <h4 className="avatar-name">{username}</h4>
                <p className="avatar-status">Đang online</p>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default Lobby;
