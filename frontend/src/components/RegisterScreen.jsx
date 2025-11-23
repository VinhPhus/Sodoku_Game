import React, { useState } from "react";
import "../style/Login.css"; 
import userIcon from "../assets/img/user-icon.png"; // Cập nhật đường dẫn nếu cần

const RegisterScreen = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(""); // Thêm state cho lỗi

  // Safe fallback callbacks to avoid runtime errors if parent doesn't provide them
  const handleRegisterSuccess = (name) => {
    if (typeof onRegisterSuccess === "function") onRegisterSuccess(name);
  };

  const handleSwitchToLogin = () => {
    if (typeof onSwitchToLogin === "function") onSwitchToLogin();
  };

  const handleSubmit = async (event) => { // Chuyển thành async
    event.preventDefault();
    setError(""); // Xóa lỗi cũ

    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    
    if (password.trim() !== confirmPassword.trim()) {
        setError("Xác nhận mật khẩu không khớp.");
        return;
    }

    try {
      // ===== SỬA DÒNG NÀY =====
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/register`;

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
        // Nếu server trả về lỗi (ví dụ: username tồn tại)
        setError(data.detail || "Đăng ký thất bại.");
      } else {
        // Đăng ký thành công
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        handleSwitchToLogin(); // Chuyển về trang đăng nhập
      }

    } catch (err) {
      console.error("Register error:", err);
      setError("Không thể kết nối đến máy chủ. Hãy đảm bảo backend đang chạy!");
    }
  };

  return (
    <div className="login-card">
      <h1 className="title">ĐĂNG KÝ</h1>

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

      <button type="button" className="text-link-btn" onClick={handleSwitchToLogin}>
        Đã có tài khoản? Đăng nhập
      </button>

      <p className="footer-text">Version 1.0.0 | Developed by: Nhóm 5 </p>
    </div>
  );
};

export default RegisterScreen;