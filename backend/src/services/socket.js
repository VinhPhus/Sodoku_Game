const socket = new WebSocket("ws://127.0.0.1:8000/ws/game");

// Khi server chấp nhận kết nối
socket.onopen = () => {
  console.log("Connected to WebSocket server");
  socket.send(JSON.stringify({ action: "echo", payload: { msg: "Hello server!" } }));
};

// Khi có tin nhắn từ server gửi về
socket.onmessage = (event) => {
  console.log("Message from server:", event.data);
};

// Khi bị ngắt kết nối
socket.onclose = () => {
  console.log("WebSocket closed");
};

// Khi gặp lỗi
socket.onerror = (error) => {
  console.error("WebSocket error:", error);
};

export default socket;
