import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import '../style/Login.css'; 

/**
 * Component quản lý trạng thái xác thực (Login/Register).
 * Đây là component bạn nên render trong App.jsx khi trạng thái là 'login'.
 * @param {function} onAuthSuccess - Hàm được gọi khi Login hoặc Register thành công.
 */
const AuthWrapper = ({ onAuthSuccess }) => {
    // State để quản lý màn hình hiện tại: 'login' hoặc 'register'
    const [currentMode, setCurrentMode] = useState('login');

    const handleAuthSuccess = (username) => {
        // Sau khi Login hoặc Register thành công, gọi callback để chuyển sang Lobby
        onAuthSuccess(username);
    };

    return (
        <div className="login-container"> 
            {/* Lớp login-container được dùng để căn giữa và áp dụng nền gradient */}
            {currentMode === 'login' ? (
                <LoginScreen
                    onLoginSuccess={handleAuthSuccess}
                    onSwitchToRegister={() => setCurrentMode('register')}
                />
            ) : (
                <RegisterScreen
                    onRegisterSuccess={handleAuthSuccess}
                    onSwitchToLogin={() => setCurrentMode('login')}
                />
            )}
        </div>
    );
};

export default AuthWrapper;