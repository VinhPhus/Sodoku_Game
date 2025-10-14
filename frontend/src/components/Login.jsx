// src/components/Login.jsx

import React, { useState } from "react";
import "../style/Login.css"; // Import file CSS để tạo kiểu
import userIcon from "../assets/img/user-icon.png"; // Đường dẫn đúng đến file ảnh

const Login = ({ onLoginSuccess }) => {
  // Sử dụng state để lưu tên người dùng nhập vào
  const [name, setName] = useState("");

  // Hàm xử lý khi người dùng nhấn nút START
  const handleSubmit = (event) => {
    event.preventDefault(); // Ngăn trình duyệt tải lại trang
    if (name.trim() === "") {
      alert("Vui lòng nhập tên của bạn!");
    } else {
      // Gọi hàm callback để chuyển sang màn hình Lobby
      onLoginSuccess(name.trim());
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="title">SUDOKU BATTLE</h1>

        <div className="avatar-wrapper">
          {/* Thay userIcon bằng state chứa ảnh người dùng đã chọn nếu có */}
          <img src={userIcon} alt="User Avatar" className="avatar" />
        </div>

        <button className="choose-photo-btn">Choose Photo</button>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            className="name-input"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="start-btn">
            START
          </button>
        </form>

        <p className="footer-text">Version 1.0.0 | Developed by: Team </p>
      </div>
    </div>
  );
};

export default Login;
