const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // frontend connect từ localhost:5173
});

let onlinePlayers = []; // danh sách user online

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Khi user login
  socket.on("login", (user) => {
    socket.user = user;
    onlinePlayers.push({ ...user, socketId: socket.id });
    io.emit("onlinePlayers", onlinePlayers);
  });

  // Khi gửi challenge
  socket.on("sendChallenge", ({ opponentId, challengerId }) => {
    const opponent = onlinePlayers.find((p) => p.id === opponentId);
    const challenger = onlinePlayers.find((p) => p.id === challengerId);
    if (opponent && challenger) {
      io.to(opponent.socketId).emit("challengeReceived", { challenger });
    }
  });

  // Khi accept challenge
  socket.on("acceptChallenge", ({ challengerId }) => {
    const challenger = onlinePlayers.find((p) => p.id === challengerId);
    if (challenger) {
      io.to(challenger.socketId).emit("challengeResponse", {
        accepted: true,
        matchId: Date.now(),
      });
    }
  });

  // Khi decline challenge
  socket.on("declineChallenge", ({ challengerId }) => {
    const challenger = onlinePlayers.find((p) => p.id === challengerId);
    if (challenger) {
      io.to(challenger.socketId).emit("challengeResponse", {
        accepted: false,
      });
    }
  });

  // Khi disconnect
  socket.on("disconnect", () => {
    onlinePlayers = onlinePlayers.filter((p) => p.socketId !== socket.id);
    io.emit("onlinePlayers", onlinePlayers);
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));
