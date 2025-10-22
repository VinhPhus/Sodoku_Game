import React, { useState } from "react";
import "../style/Login.css"; 
import userIcon from "../assets/img/user-icon.png"; // Cập nhật đường dẫn nếu cần

const RegisterScreen = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Safe fallback callbacks to avoid runtime errors if parent doesn't provide them
  const handleRegisterSuccess = (name) => {
    if (typeof onRegisterSuccess === "function") onRegisterSuccess(name);
  };

  const handleSwitchToLogin = () => {
    if (typeof onSwitchToLogin === "function") onSwitchToLogin();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Logic kiểm tra nhập liệu (Giả lập)
    if (username.trim() === "" || password.trim() === "" || confirmPassword.trim() === "") {
      alert("Vui lòng nhập đầy đủ thông tin đăng ký!");
      return;
    }
    
    if (password.trim() !== confirmPassword.trim()) {
        alert("Xác nhận mật khẩu không khớp!");
        return;
    }

    // Đăng ký thành công, gọi callback an toàn
    handleRegisterSuccess(username.trim());
  };

  return (
    <div className="login-card">
      <h1 className="title">SUDOKU BATTLE</h1>

      {/* Avatar Section */}
      <div className="avatar-wrapper">
        <img src={userIcon} alt="User Avatar" className="avatar" />
      </div>
      <button type="button" className="choose-photo-btn" onClick={() => alert('Choose photo not implemented')}>
        Choose Photo
      </button>

      {/* Form Đăng ký */}
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
        <input
          type="password"
          className="name-input"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit" className="start-btn signup-btn">
          Sign Up
        </button>
      </form>

      {/* Nút chuyển sang Đăng nhập */}
      <button type="button" className="text-link-btn" onClick={handleSwitchToLogin}>
        Login
      </button>

      <p className="footer-text">Version 1.0.0 | Developed by: Team A </p>
    </div>
  );
};

export default RegisterScreen;