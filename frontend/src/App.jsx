// src/App.jsx
import React, { useState } from "react";
import Login from "./components/Login";
import Lobby from "./components/Lobby";
import MatchSetup from "./components/MatchSetup";
import Game from "./components/Maingame";
import MatchResult from "./components/MatchResult";
import History from "./components/History";

function App() {
  const [currentScreen, setCurrentScreen] = useState("login"); // "login", "lobby", "matchSetup", "game", "matchResult", "history"
  const [previousScreen, setPreviousScreen] = useState("lobby"); // Để biết quay lại màn nào từ history
  const [username, setUsername] = useState("");
  const [opponent, setOpponent] = useState(null);
  const [matchResult, setMatchResult] = useState(null);

  const handleLoginSuccess = (userName) => {
    setUsername(userName);
    setCurrentScreen("lobby");
  };

  const handleAcceptChallenge = (opponentInfo) => {
    setOpponent(opponentInfo);
    setCurrentScreen("matchSetup");
  };

  const handleBackToLobby = () => {
    setOpponent(null);
    setCurrentScreen("lobby");
  };

  const handleLogout = () => {
    setUsername("");
    setOpponent(null);
    setCurrentScreen("login");
  };

  // Hàm được truyền cho MatchSetup — sẽ được gọi khi countdown = 0
  const handleStartGame = () => {
    setMatchResult(null); // Reset kết quả khi bắt đầu game mới
    setCurrentScreen("game");
  };

  const handleSurrender = () => {
    // Set kết quả: người chơi hiện tại thua
    setMatchResult({
      winner: opponent,
      loser: { name: username },
      reason: 'surrender'
    });
    setCurrentScreen("matchResult");
  };



  const renderScreen = () => {
    switch (currentScreen) {
      case "login":
        return <Login onLoginSuccess={handleLoginSuccess} />;
      case "lobby":
        return (
          <Lobby
            username={username}
            onLogout={handleLogout}
            onAcceptChallenge={handleAcceptChallenge}
            onViewHistory={() => {
              setPreviousScreen("lobby");
              setCurrentScreen("history");
            }}
          />
        );
      case "matchSetup":
        return (
          <MatchSetup
            user={{ name: username }}
            opponent={opponent}
            onBack={handleBackToLobby}
            onStartGame={handleStartGame} // <-- truyền callback ở đây
          />
        );
      case "game":
        return (
          <Game
            user={{ name: username }}
            opponent={opponent}
            onSurrender={handleSurrender}
            onFinish={() => {
              setMatchResult({
                winner: { name: username },
                loser: opponent,
                reason: 'complete'
              });
              setCurrentScreen("matchResult");
            }}
          />
        );
      case "matchResult":
        return (
          <MatchResult
            user={{ name: username }}
            opponent={opponent}
              result={matchResult}
              onGoToLobby={() => {
                setMatchResult(null);
                setCurrentScreen("lobby");
              }}
            onViewHistory={() => {
              setPreviousScreen("matchResult");
              setCurrentScreen("history");
            }}
          />
        );
      case "history":
        return (
          <History
            username={username}
            onBack={() => setCurrentScreen(previousScreen)}
          />
        );
      default:
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return <div className="App">{renderScreen()}</div>;
}

export default App;
