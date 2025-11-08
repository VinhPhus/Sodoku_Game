const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Lưu danh sách online
let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // --- Khi user login ---
  socket.on("login", (user) => {
    console.log(`${user.username} logged in`);
    socket.user = user;
    onlineUsers.push(user);

    // Gửi danh sách online cho tất cả
    io.emit("onlinePlayers", onlineUsers);
  });

  // --- Khi gửi challenge ---
  socket.on("sendChallenge", ({ opponentId, challengerId }) => {
    const opponentSocket = Array.from(io.sockets.sockets.values()).find(
      (s) => s.user?.id === opponentId
    );
    if (opponentSocket) {
      // gửi tới đối thủ
      opponentSocket.emit("challengeReceived", { challenger: socket.user });
    }
  });

  // --- Khi chấp nhận challenge ---
  socket.on("acceptChallenge", ({ challengerId }) => {
    const challengerSocket = Array.from(io.sockets.sockets.values()).find(
      (s) => s.user?.id === challengerId
    );
    if (challengerSocket) {
      // Gửi phản hồi cho cả 2
      challengerSocket.emit("challengeResponse", {
        accepted: true,
        matchId: Math.floor(Math.random() * 100000),
        challenger: challengerSocket.user,
        opponent: socket.user,
      });
      socket.emit("challengeResponse", {
        accepted: true,
        matchId: Math.floor(Math.random() * 100000),
        challenger: challengerSocket.user,
        opponent: socket.user,
      });
    }
  });

  // --- Khi từ chối challenge ---
  socket.on("declineChallenge", ({ challengerId }) => {
    const challengerSocket = Array.from(io.sockets.sockets.values()).find(
      (s) => s.user?.id === challengerId
    );
    if (challengerSocket) {
      challengerSocket.emit("challengeResponse", { accepted: false });
      socket.emit("challengeResponse", { accepted: false });
    }
  });

  // --- Khi disconnect ---
  socket.on("disconnect", () => {
    if (socket.user) {
      onlineUsers = onlineUsers.filter((u) => u.id !== socket.user.id);
      io.emit("onlinePlayers", onlineUsers);
      console.log(`${socket.user.username} disconnected`);
    }
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));
