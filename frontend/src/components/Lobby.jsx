import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

const Lobby = ({ user, onAcceptChallenge, onViewHistory, onLogout }) => {
  const { socket } = useSocket();
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [challenger, setChallenger] = useState(null);

  useEffect(() => {
    if (!socket) return;

    // login user
    socket.emit("login", user);

    // nhận danh sách online
    socket.on("onlinePlayers", (players) => {
      setOnlinePlayers(players.filter((p) => p.id !== user.id));
    });

    // nhận thách đấu
    socket.on("challengeReceived", ({ challenger }) => {
      setChallenger(challenger);
      alert(`${challenger.name} thách đấu bạn!`);
    });

    // phản hồi thách đấu
    socket.on("challengeResponse", (data) => {
      if (data.accepted) alert("Đối phương chấp nhận!");
      else alert("Đối phương từ chối!");
    });

    return () => {
      socket.off("onlinePlayers");
      socket.off("challengeReceived");
      socket.off("challengeResponse");
    };
  }, [socket, user]);

  const sendChallenge = (opponent) => {
    socket.emit("sendChallenge", {
      opponentId: opponent.id,
      challengerId: user.id,
    });
  };

  const acceptChallenge = () => {
    if (!challenger) return;
    socket.emit("acceptChallenge", { challengerId: challenger.id });
    onAcceptChallenge(challenger);
    setChallenger(null);
  };

  const declineChallenge = () => {
    if (!challenger) return;
    socket.emit("declineChallenge", { challengerId: challenger.id });
    setChallenger(null);
  };

  return (
    <div>
      <h2>Phòng chờ</h2>
      <button onClick={onViewHistory}>Lịch sử</button>
      <button onClick={onLogout}>Đăng xuất</button>

      {challenger && (
        <div>
          <p>{challenger.name} thách đấu bạn!</p>
          <button onClick={acceptChallenge}>Chấp nhận</button>
          <button onClick={declineChallenge}>Từ chối</button>
        </div>
      )}

      <h3>Người chơi online ({onlinePlayers.length})</h3>
      <ul>
        {onlinePlayers.map((p) => (
          <li key={p.id}>
            {p.name}{" "}
            <button onClick={() => sendChallenge(p)}>Thách đấu</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;
