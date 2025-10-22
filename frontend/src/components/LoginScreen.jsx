import React, { useState } from "react";
import "../style/Login.css"; 
import userIcon from "../assets/img/user-icon.png"; // corrected path

const LoginScreen = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const safeLogin = (name) => {
    if (typeof onLoginSuccess === "function") onLoginSuccess(name);
  };

  const safeSwitchToRegister = () => {
    if (typeof onSwitchToRegister === "function") onSwitchToRegister();
  };

  const handleSubmit = (event) => {
    event.preventDefault(); 
    
    // Logic kiểm tra nhập liệu (Giả lập)
    if (username.trim() === "" || password.trim() === "") {
      alert("Vui lòng nhập đầy đủ Username và Password!");
      return;
    } 
    
    // Đăng nhập thành công, gọi callback an toàn
    safeLogin(username.trim());
  };

  return (
    <div className="login-card">
      <h1 className="title">SUDOKU BATTLE</h1>

      {/* Avatar Section */}
      <div className="avatar-wrapper">
        <img src={userIcon} alt="User Avatar" className="avatar" />
      </div>
      
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          className="name-input"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="name-input"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="start-btn">
          START
        </button>
      </form>
      
      {/* Nút chuyển sang Đăng ký */}
      <button type="button" className="text-link-btn" onClick={safeSwitchToRegister}>
        Sign Up
      </button>

      <p className="footer-text">Version 1.0.0 | Developed by: Team A </p>
    </div>
  );
};

export default LoginScreen;