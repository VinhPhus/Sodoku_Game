import React, { useState, useEffect } from "react";
import { LogOut, Swords, BarChart3 } from "lucide-react";
import "../style/Lobby.css";
import userIcon from "../assets/img/user-icon.png";
import ChallengeDialog from "./ChallengeDialog";

// --- Component SVG Avatar ---
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

// --- Component chính ---
const Lobby = ({
  user = { id: 1, username: "VinhPlus", avatar: userIcon },
  socket = null,
  onlinePlayers = [],
  challenger,
  setChallenger,
  onAcceptChallenge,
  onViewHistory,
  onLogout,
}) => {
  // --- State cho offline simulation ---
  const [players, setPlayers] = useState(onlinePlayers);
  const [localChallenger, setLocalChallenger] = useState(null);

  // Nếu không có socket (offline test), dùng mock
  useEffect(() => {
    if (!socket) {
      const mockPlayers = [
        { id: 2, username: "sói hoang", status: "online", avatar: null },
        { id: 3, username: "sickmyduck", status: "online", avatar: null },
        { id: 4, username: "Minh Tâm", status: "busy", avatar: null },
      ];
      setPlayers(mockPlayers);

      const timer = setTimeout(() => {
        const challengerMock = mockPlayers[0];
        setLocalChallenger(challengerMock);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setPlayers(onlinePlayers);
    }
  }, [socket, onlinePlayers]);

  // --- Gửi lời thách đấu ---
  const sendChallenge = (opponent) => {
    if (!socket) {
      alert(`(Offline) Bạn đã thách đấu ${opponent.username}!`);
      return;
    }
    socket.emit("sendChallenge", {
      opponentId: opponent.id,
      challengerId: user.id,
    });
  };

  // --- Chấp nhận thách đấu ---
  const acceptChallenge = () => {
    const current = challenger || localChallenger;
    if (!current) return;

    if (socket) {
      socket.emit("acceptChallenge", { challengerId: current.id });
    } else {
      console.log(`(Offline) Chấp nhận thách đấu từ ${current.username}`);
    }
    if (setChallenger) setChallenger(null);
    setLocalChallenger(null);
    onAcceptChallenge(current);
  };

  // --- Từ chối thách đấu ---
  const declineChallenge = () => {
    const current = challenger || localChallenger;
    if (!current) return;

    if (socket) {
      socket.emit("declineChallenge", { challengerId: current.id });
    } else {
      console.log(`(Offline) Từ chối thách đấu từ ${current.username}`);
    }
    if (setChallenger) setChallenger(null);
    setLocalChallenger(null);
  };

  // --- Chọn challenger đang hiển thị ---
  const activeChallenger = challenger || localChallenger;

  return (
    <div className="lobby-screen">
      {/* Challenge Dialog */}
      {activeChallenger && (
        <ChallengeDialog
          challenger={activeChallenger}
          currentUser={user}
          onAccept={acceptChallenge}
          onDecline={declineChallenge}
          duration={20}
        />
      )}

      <div className="lobby-container">
        {/* Header */}
        <header className="lobby-header">
          <h1 className="welcome-text">Xin chào, {user.username}</h1>
          <button className="logout-button" onClick={onLogout}>
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </header>

        <main className="main-content">
          {/* Danh sách người chơi */}
          <section className="player-list-card">
            <h2>
              Người chơi Online{" "}
              {socket ? `(${players.length})` : "(Giả lập)"}
            </h2>
            <div className="player-list">
              {players.map((p) => (
                <div key={p.id} className="player-item">
                  <div className="player-info">
                    {p.avatar ? (
                      <img
                        src={p.avatar}
                        alt={p.username}
                        className="player-avatar"
                      />
                    ) : (
                      <DefaultAvatar />
                    )}
                    <div className="player-details">
                      <span className="player-name">{p.username}</span>
                      <span
                        className={`player-status status-${
                          p.status || "online"
                        }`}
                      >
                        {p.status === "busy" ? "Đang bận" : "Online"}
                      </span>
                    </div>
                  </div>
                  <button
                    className="challenge-button"
                    disabled={p.status === "busy" || p.id === user.id}
                    onClick={() => sendChallenge(p)}
                  >
                    <Swords size={16} />
                    <span>Thách đấu</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-card">
              <BarChart3 size={32} color="#007AFF" />
              <div className="sidebar-text">
                <h3>Lịch sử trận đấu</h3>
                <p>Xem lại các trận đấu đã qua của bạn.</p>
              </div>
              <button
                className="view-history-button"
                onClick={onViewHistory}
              >
                Xem
              </button>
            </div>

            <div className="avatar-section">
              <div className="avatar-container">
                <img
                  src={user.avatar || userIcon}
                  alt="User Avatar"
                  className="user-avatar"
                />
              </div>
              <div className="avatar-info">
                <h4 className="avatar-name">{user.username}</h4>
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
