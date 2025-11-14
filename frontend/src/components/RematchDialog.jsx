import React from "react";
import "../style/RematchDialog.css";

const RematchDialog = ({ requesterName, onAccept, onDecline }) => {
    return (
        <div className="rematch-dialog-overlay">
            <div className="rematch-dialog">
                {/* ... icon và tiêu đề ... */}
                <p className="rematch-message">
                    <strong>{requesterName}</strong> muốn chơi lại với bạn!
                </p>
                <div className="rematch-actions">
                    <button className="rematch-accept-btn" onClick={onAccept}>
                        ✓ Chấp nhận
                    </button>
                    <button className="rematch-decline-btn" onClick={onDecline}>
                        ✗ Từ chối
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RematchDialog;