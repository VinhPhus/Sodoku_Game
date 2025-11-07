// src/components/Lobby.jsx
import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import ChallengeDialog from "./ChallengeDialog";

// Lobby: hiển thị danh sách người chơi online và xử lý thách đấu
const Lobby = ({
  user,
  challenger,
  setChallenger,
  onLogout,
  onAcceptChallenge,
  onViewHistory,
}) => {
  const { socket } = useSocket();
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!socket) return;

    // Khi server gửi danh sách người chơi online
    socket.on("onlinePlayers", (players) => {
      const filtered = players.filter((p) => p.id !== user?.id);
      setOnlinePlayers(filtered);
      setLoading(false);
    });

    // Khi server gửi lời mời thách đấu tới bạn
    socket.on("challengeReceived", (data) => {
      // data: { challenger }
      setChallenger(data.challenger);
    });

    // Khi có phản hồi về lời mời
    socket.on("challengeResponse", (data) => {
      if (data.accepted && data.matchId) {
        if (onAcceptChallenge) onAcceptChallenge(data.matchId);
      } else if (!data.accepted) {
        setInfo("Lời mời bị từ chối");
        setTimeout(() => setInfo(null), 3000);
      }
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
      setInfo(err?.message || "Lỗi kết nối");
      setTimeout(() => setInfo(null), 3000);
    });

    // Yêu cầu server gửi danh sách online
    socket.emit("requestOnlinePlayers");

    return () => {
      socket.off("onlinePlayers");
      socket.off("challengeReceived");
      socket.off("challengeResponse");
      socket.off("error");
    };
  }, [socket, user, setChallenger, onAcceptChallenge]);

  const handleSendChallenge = (opponent) => {
    if (!socket) {
      setInfo("Chưa kết nối tới server");
      return;
    }
    if (!user) {
      setInfo("Bạn cần đăng nhập");
      return;
    }

    socket.emit("sendChallenge", {
      opponentId: opponent.id,
      challengerId: user.id,
    });

    setInfo(`Đã gửi lời mời tới ${opponent.username}`);
    setTimeout(() => setInfo(null), 3000);
  };

  const handleAccept = () => {
    if (!socket || !challenger) return;
    socket.emit("acceptChallenge", { challengerId: challenger.id });
    setChallenger(null);
  };

  const handleDecline = () => {
    if (!socket || !challenger) return;
    socket.emit("declineChallenge", { challengerId: challenger.id });
    setChallenger(null);
  };

  return (
    <div className="lobby-screen">
      <ChallengeDialog
        challenger={challenger}
        currentUser={user}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />

      <div className="lobby-container">
        <header className="lobby-header">
          <h2>Phòng chờ</h2>
          <div className="lobby-actions">
            <button onClick={onViewHistory}>Lịch sử</button>
            <button onClick={onLogout}>Đăng xuất</button>
          </div>
        </header>

        {info && <div className="lobby-info">{info}</div>}

        <section className="players-section">
          <h3>Người chơi online ({onlinePlayers.length})</h3>
          {loading ? (
            <p>Đang tải...</p>
          ) : onlinePlayers.length === 0 ? (
            <p>Không có người chơi online</p>
          ) : (
            <ul className="players-list">
              {onlinePlayers.map((p) => (
                <li key={p.id} className="player-item">
                  <span className="player-name">{p.username}</span>
                  <div className="player-actions">
                    <button
                      onClick={() => handleSendChallenge(p)}
                      disabled={p.status === "in-game"}
                    >
                      Thách đấu
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default Lobby;