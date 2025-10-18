import React, { useState } from "react";
import "../style/History.css";
import { Menu, Swords, ArrowRight, ArrowLeft } from "lucide-react";

// Dữ liệu giả lập (để sau này thay thế bằng dữ liệu API thực tế)
const mockHistoryData = [
    { id: 1, date: '01.01.12', opponent: 'Player A', status: 'THẮNG', time: '05:30' },
    { id: 2, date: '01.01.21', opponent: 'Player B', status: 'THẮNG', time: '05:30' },
    { id: 3, date: '01.01.14', opponent: 'Player C', status: 'THẮNG', time: '05:30' },
    { id: 4, date: '01.01.31', opponent: 'Player D', status: 'THUA', time: '05:30' },
    { id: 5, date: '04.01.16', opponent: 'Player 123', status: 'THUA', time: '05:30' },
    { id: 6, date: '02.03.01', opponent: 'Player 23', status: 'THUA', time: '05:30' },
    { id: 7, date: '03.04.10', opponent: 'Long B', status: 'THẮNG', time: '04:15' },
    { id: 8, date: '03.04.11', opponent: 'Tuan P', status: 'THUA', time: '06:01' },
];


const History = ({ onMenuClick, onViewDetails, onBack }) => {
    const [history, setHistory] = useState(mockHistoryData);

    // Xử lý khi nhấn Xem Chi tiết
    const handleViewDetails = (matchId) => {
        // Giả lập logic chuyển trang/hiển thị modal chi tiết
        if (onViewDetails) {
            onViewDetails(matchId);
        } else {
            console.log(`Xem chi tiết trận đấu ID: ${matchId}`);
        }
    };

    // Component con hiển thị từng dòng trận đấu
    const MatchItem = ({ match }) => {
        const isWin = match.status === 'THẮNG';
        const statusClass = isWin ? 'match-status-win' : 'match-status-loss';

        return (
            <div className="match-item">
                <div>{match.date}</div>
                <div>{match.opponent}</div>
                <div className={statusClass}>{match.status}</div>
                <div className="view-details-btn" onClick={() => handleViewDetails(match.id)}>
                    Xem Chi tiết
                    <ArrowRight size={16} />
                </div>
                <div>{match.time}</div>
            </div>
        );
    };


    return (
        <div className="history-screen">
            <div className="history-container">
                <header className="history-header">
                    <button className="back-button" onClick={onBack}>
                        <ArrowLeft size={20} />
                        <span>Quay lại</span>
                    </button>
                    <div className="header-logo">
                        <Swords size={20} style={{marginRight: 8}}/>
                        Sudoku Battle
                    </div>
                    <Menu className="menu-icon" size={24} onClick={onMenuClick} />
                </header>
                
                <h2 className="header-title">Lịch sử Trận đấu</h2>
                
                <div className="match-list">
                    {/* Header Bảng */}
                    <div className="match-list-header">
                        <div>Ngày giờ</div>
                        <div>Đối thủ</div>
                        <div>Kết quả</div>
                        <div></div> {/* Cột Xem Chi tiết */}
                        <div>Thời gian</div>
                    </div>

                    {/* Danh sách Trận đấu */}
                    {history.map(match => (
                        <MatchItem key={match.id} match={match} />
                    ))}
                </div>
                
            </div>
        </div>
    );
};

export default History;