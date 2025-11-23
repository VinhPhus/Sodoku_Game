import React, { useState } from "react";
import "../style/Login.css"; 
import userIcon from "../assets/img/user-icon.png"; // corrected path

const LoginScreen = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const safeLogin = (userData) => {
    if (typeof onLoginSuccess === "function") onLoginSuccess(userData);
  };

  const safeSwitchToRegister = () => {
    if (typeof onSwitchToRegister === "function") onSwitchToRegister();
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); 
    setError("");
    
    // Logic kiểm tra nhập liệu (Giả lập)
    if (username.trim() === "" || password.trim() === "") {
      setError("Vui lòng nhập đầy đủ Username và Password!");
      return;
    } 
    
    try {
      // ===== SỬA DÒNG NÀY =====
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/login`;
      
      const response = await fetch(apiUrl, { // SỬ DỤNG BIẾN apiUrl
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        }),
      });
      // =======================

      const data = await response.json();

      if (!response.ok) {
        // Nếu server trả về lỗi (ví dụ: sai pass)
        setError(data.detail || "Đăng nhập thất bại.");
      } else {
        // Đăng nhập thành công
        // data.user chứa { id, username, created_at }
        safeLogin(data.user); 
      }

    } catch (err) {
      console.error("Login error:", err);
      setError("Không thể kết nối đến máy chủ. Hãy đảm bảo backend đang chạy!");
    }
  };

  return (
    <div className="login-card">
      <h1 className="title">SUDOKU BATTLE</h1>

      <div className="avatar-wrapper">
        <img src={userIcon} alt="User Avatar" className="avatar" />
      </div>
      
      {/* Hiển thị lỗi nếu có */}
      {error && <p style={{ color: 'red', fontSize: '14px', fontWeight: 500 }}>{error}</p>}
      
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          className="name-input"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={30}
        />
        <span className="input-helper-text">Tối đa 30 kí tự</span>
        <input
          type="password"
          className="name-input"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={20}
        />
        <span className="input-helper-text">Tối đa 20 kí tự</span>
        <button type="submit" className="start-btn">
          START
        </button>
      </form>
      
      <button type="button" className="text-link-btn" onClick={safeSwitchToRegister}>
        Chưa có tài khoản? Đăng ký
      </button>

      <p className="footer-text">Version 1.0.0 | Developed by: Nhóm 5 </p>
    </div>
  );
};

export default LoginScreen;