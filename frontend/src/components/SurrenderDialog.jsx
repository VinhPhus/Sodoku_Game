import React from 'react';
import '../style/SurrenderDialog.css';
import { LogOut } from 'lucide-react';

/**
 * Component Modal xác nhận Đầu Hàng.
 * * @param {function} onAccept - Hàm được gọi khi người dùng chấp nhận Đầu Hàng (Chuyển sang MatchResult thua).
 * @param {function} onCancel - Hàm được gọi khi người dùng Hủy (Đóng modal, tiếp tục chơi).
 */
const SurrenderDialog = ({ onAccept, onCancel }) => {
    return (
        <div className="surrender-modal-overlay" onClick={onCancel}>
            <div className="surrender-dialog" onClick={e => e.stopPropagation()}>
                
                <LogOut size={40} color="#dc2626" style={{marginBottom: '10px'}}/>
                
                <h3>Đầu Hàng</h3>
                
                <p>
                    Bạn có chắc chắn muốn Đầu Hàng? 
                    Nếu chấp nhận, trận đấu sẽ kết thúc ngay lập tức và bạn sẽ bị tính là người thua cuộc.
                </p>
                
                <div className="surrender-actions">
                    <button 
                        className="action-button button-cancel" 
                        onClick={onCancel}
                    >
                        HỦY
                    </button>
                    <button 
                        className="action-button button-accept" 
                        onClick={onAccept}
                    >
                        CHẤP NHẬN
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SurrenderDialog;