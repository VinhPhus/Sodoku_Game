import React, { useState, useEffect } from "react";
import "../style/History.css";
import { Menu, Swords, ArrowLeft } from "lucide-react";

const History = ({ user, onMenuClick, onBack }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Fetch history từ backend
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Gọi API lấy lịch sử trận đấu
        const historyResponse = await fetch(`http://26.135.199.240:8000/api/match/history/${user.id}`);
        if (!historyResponse.ok) {
          throw new Error('Không thể tải lịch sử trận đấu');
        }
        const historyData = await historyResponse.json();

        // Gọi API lấy thống kê
        const statsResponse = await fetch(`http://26.135.199.240:8000/api/match/stats/${user.id}`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        // Xử lý dữ liệu lịch sử
        const formattedHistory = historyData.matches.map(match => {
          const isWinner = match.winner_id === user.id;
          const opponentId = match.player1_id === user.id ? match.player2_id : match.player1_id;
          const opponentName = match.player1_id === user.id ? match.player2_name : match.player1_name;
          const userTime = match.player1_id === user.id ? match.player1_time : match.player2_time;

          // Format date
          const matchDate = new Date(match.finished_at || match.created_at);
          const formattedDate = matchDate.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          });

          return {
            id: match.match_id,
            date: formattedDate,
            opponent: opponentName || 'Đối thủ',
            status: isWinner ? 'THẮNG' : 'THUA',
            time: userTime || 'N/A',
            matchData: match
          };
        });

        setHistory(formattedHistory);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  // Component con hiển thị từng dòng trận đấu
  const MatchItem = ({ match }) => {
    const isWin = match.status === "THẮNG";
    const statusClass = isWin ? "match-status-win" : "match-status-loss";

    return (
      <div className="match-item">
        <div>{match.date}</div>
        <div>{match.opponent}</div>
        <div className={statusClass}>{match.status}</div>
        {/* Đã xóa cột 'Xem Chi tiết' */}
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
            <Swords size={20} style={{ marginRight: 8 }} />
            Sudoku Battle
          </div>
          <Menu className="menu-icon" size={24} onClick={onMenuClick} />
        </header>

        <h2 className="header-title">Lịch sử Trận đấu</h2>

        {/* Hiển thị thống kê */}
        {stats && (
          <div className="stats-summary" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '15px',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f0f2f5',
            borderRadius: '12px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007aff' }}>
                {stats.total_matches}
              </div>
              <div style={{ fontSize: '14px', color: '#606770' }}>Tổng trận</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                {stats.wins}
              </div>
              <div style={{ fontSize: '14px', color: '#606770' }}>Thắng</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                {stats.losses}
              </div>
              <div style={{ fontSize: '14px', color: '#606770' }}>Thua</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007aff' }}>
                {stats.win_rate}%
              </div>
              <div style={{ fontSize: '14px', color: '#606770' }}>Tỷ lệ thắng</div>
            </div>
          </div>
        )}

        <div className="match-list">
          {/* Header Bảng */}
          <div className="match-list-header">
            <div>Ngày giờ</div>
            <div>Đối thủ</div>
            <div>Kết quả</div>
            <div>Thời gian</div>
          </div>

          {/* Loading state */}
          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#606770'
            }}>
              <div style={{ fontSize: '18px' }}>⏳ Đang tải lịch sử...</div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#dc2626'
            }}>
              <div style={{ fontSize: '18px' }}>❌ {error}</div>
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginTop: '15px',
                  padding: '8px 16px',
                  backgroundColor: '#007aff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && history.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#606770'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎮</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>
                Chưa có lịch sử trận đấu
              </div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                Hãy bắt đầu thách đấu với người chơi khác!
              </div>
            </div>
          )}

          {/* Danh sách Trận đấu */}
          {!loading && !error && history.map((match) => (
            <MatchItem key={match.id} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
