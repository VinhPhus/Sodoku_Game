import React, { useState, useEffect } from "react";
import "../style/ChallengeDialog.css";
import defaultUserIcon from "../assets/img/user-icon.png";

const ChallengeDialog = ({
  challenger,
  currentUser,
  onAccept,
  onDecline,
  duration = 15,
}) => {
  if (!challenger) {
    return null;
  }

  const [countdown, setCountdown] = useState(duration);
  const RING_RADIUS = 25;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onDecline();
    }
  }, [countdown, onDecline]);

  const progress = ((duration - countdown) / duration) * 100;
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress / 100);

  return (
    <div className="challenge-overlay">
      <div className="challenge-dialog">
        {/* Header */}
        <div className="challenge-header">
          <div className="title-container">
            <h2 className="challenge-title">
              Người chơi{" "}
              <span className="challenger-name">{challenger.name}</span> muốn
              thách đấu với bạn!
            </h2>
            <div className="countdown-ring">
              <svg className="progress-ring" width="60" height="60">
                <circle
                  className="progress-ring-background"
                  cx="30"
                  cy="30"
                  r={RING_RADIUS}
                />
                <circle
                  className="progress-ring-fill"
                  cx="30"
                  cy="30"
                  r={RING_RADIUS}
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <span className="countdown-number">{countdown}</span>
            </div>
          </div>
        </div>

        {/* VS Section */}
        <div className="vs-section">
          <div className="player-avatar-container">
            <img
              src={challenger.avatar || defaultUserIcon}
              alt={challenger.name}
              className="player-avatar-img"
            />
            <span className="player-name">{challenger.name}</span>
          </div>
          <div className="vs-container">
            <span className="vs-text">VS</span>
          </div>
          <div className="player-avatar-container">
            <img
              src={currentUser.avatar || defaultUserIcon}
              alt={currentUser.name}
              className="player-avatar-img"
            />
            <span className="player-name">{currentUser.name}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="accept-button" onClick={onAccept}>
            CHẤP NHẬN
          </button>
          <button className="decline-button" onClick={onDecline}>
            TỪ CHỐI
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDialog;
