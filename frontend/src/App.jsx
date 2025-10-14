// src/App.jsx
import React, { useState } from "react";
import Login from "./components/Login";
import Lobby from "./components/Lobby";
import MatchSetup from "./components/MatchSetup"; // 1. Import component mới

function App() {
  // 2. Thêm trạng thái "matchSetup" để quản lý màn hình mới
  const [currentScreen, setCurrentScreen] = useState("login"); // "login", "lobby", hoặc "matchSetup"
  const [username, setUsername] = useState("");
  const [opponent, setOpponent] = useState(null); // 3. State để lưu thông tin đối thủ

  // Xử lý khi đăng nhập thành công
  const handleLoginSuccess = (userName) => {
    setUsername(userName);
    setCurrentScreen("lobby");
  };

  // 4. Xử lý khi người dùng chấp nhận một lời thách đấu
  const handleAcceptChallenge = (opponentInfo) => {
    setOpponent(opponentInfo); // Lưu thông tin đối thủ
    setCurrentScreen("matchSetup"); // Chuyển sang màn hình thiết lập trận đấu
  };

  // Xử lý khi đăng xuất hoặc quay lại sảnh chờ
  const handleBackToLobby = () => {
    setOpponent(null); // Xóa thông tin đối thủ
    setCurrentScreen("lobby");
  };

  // Xử lý khi đăng xuất hoàn toàn
  const handleLogout = () => {
    setUsername("");
    setOpponent(null);
    setCurrentScreen("login");
  };

  // Hàm để render màn hình tương ứng
  const renderScreen = () => {
    switch (currentScreen) {
      case "login":
        return <Login onLoginSuccess={handleLoginSuccess} />;
      case "lobby":
        return (
          <Lobby
            username={username}
            onLogout={handleLogout}
            onAcceptChallenge={handleAcceptChallenge} // 5. Truyền hàm xử lý xuống Lobby
          />
        );
      case "matchSetup":
        return (
          <MatchSetup
            user={{ name: username }} // Truyền thông tin người chơi
            opponent={opponent} // Truyền thông tin đối thủ
            onBack={handleBackToLobby} // Truyền hàm để quay lại
          />
        );
      default:
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return <div className="App">{renderScreen()}</div>;
}

export default App;
