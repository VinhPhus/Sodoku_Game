import React from "react";
import { LogOut, Swords, BarChart3 } from "lucide-react";
import ChallengeDialog from "./ChallengeDialog";
import "../style/Lobby.css";
import userIcon from "../assets/img/user-icon.png";

const DefaultAvatar = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="player-avatar">
    <circle cx="20" cy="20" r="20" fill="#E4E6EB" />
    <path d="M20 25C24.4183 25 28 28.5817 28 33H12C12 28.5817 15.5817 25 20 25Z" fill="#B0B3B8" />
    <circle cx="20" cy="18" r="5" fill="#B0B3B8" />
  </svg>
);

const Lobby = ({ user, challenger, setChallenger, onlinePlayers, onAcceptChallenge, onViewHistory, onLogout, socket }) => {
  const sendChallenge = (opponent) => {
  if (!socket) return;
  socket.emit("sendChallenge", { opponentId: opponent.id, challengerId: user.id });
  // Hiển thị thử thông báo chờ
  setChallenger({ ...opponent, username: opponent.username });
};

  const acceptChallenge = () => {
  if (!socket || !challenger) return;
  socket.emit("acceptChallenge", { challengerId: challenger.id });
  onAcceptChallenge(challenger);
  setChallenger(null);
};

  const declineChallenge = () => {
    if (!socket || !challenger) return;
    socket.emit("declineChallenge", { challengerId: challenger.id });
    setChallenger(null);
  };

  return (
    <div className="lobby-screen">
      {challenger && (
        <ChallengeDialog challenger={challenger} currentUser={user} onAccept={acceptChallenge} onDecline={declineChallenge} />
      )}

      {/* Header */}
      <header className="lobby-header">
        <h1 className="welcome-text">Xin chào, {user.username}</h1>
        <button className="logout-button" onClick={onLogout}>
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </header>

      <main className="main-content">
        {/* Online Players */}
        <section className="player-list-card">
          <h2>Người chơi Online ({onlinePlayers.length})</h2>
          <div className="player-list">
            {onlinePlayers.map((p) => (
              <div key={p.id} className="player-item">
                <div className="player-info">
                  {p.avatar ? <img src={p.avatar} alt={p.username} className="player-avatar" /> : <DefaultAvatar />}
                  <div className="player-details">
                    <span className="player-name">{p.username}</span>
                    <span className={`player-status status-${p.status || "online"}`}>{p.status === "busy" ? "Đang bận" : "Online"}</span>
                  </div>
                </div>
                <button className="challenge-button" disabled={p.status === "busy"} onClick={() => sendChallenge(p)}>
                  <Swords size={16} /> <span>Thách đấu</span>
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
            <button className="view-history-button" onClick={onViewHistory}>Xem</button>
          </div>

          <div className="avatar-section">
            <div className="avatar-container">
              <img src={user.avatar || userIcon} alt="User Avatar" className="user-avatar" />
            </div>
            <div className="avatar-info">
              <h4 className="avatar-name">{user.username}</h4>
              <p className="avatar-status">Đang online</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Lobby;
