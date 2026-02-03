import React from 'react';
import './ActivityCard.css';

function ActivityCard({ activity }) {
  const { steps, completionRate, activeLevel } = activity;
  const percentage = Math.round(completionRate * 100);
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getLevelColor = (level) => {
    switch (level) {
      case 'HIGH': return '#27ae60';
      case 'NORMAL': return '#f39c12';
      case 'LOW': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const levelColor = getLevelColor(activeLevel);

  return (
    <div className="activity-card card">
      <div className="card-content">
        {/* 左侧进度圆环 */}
        <div className="progress-circle-wrapper">
          <svg className="progress-circle" width="180" height="180">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6b6b" />
                <stop offset="100%" stopColor="#ff8e53" />
              </linearGradient>
            </defs>
            <circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke="#f0f0f0"
              strokeWidth="12"
            />
            <circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 90 90)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="progress-text">
            <div className="steps-value">{steps.toLocaleString()}</div>
            <div className="steps-label">今日步数</div>
          </div>
        </div>

        {/* 右侧信息 */}
        <div className="activity-info">
          <div className="info-item">
            <div className="info-label">当前状态</div>
            <div className="info-value status-badge" style={{ color: levelColor }}>
              <span className="status-dot" style={{ background: levelColor }}></span>
              {activeLevel === 'HIGH' && 'NORMAL'}
              {activeLevel === 'NORMAL' && 'NORMAL'}
              {activeLevel === 'LOW' && 'NORMAL'}
            </div>
          </div>

          <div className="info-item">
            <div className="info-label">完成度</div>
            <div className="info-value completion-rate">
              <span className="rate-number">{percentage}%</span>
              <div className="rate-bar">
                <div 
                  className="rate-bar-fill" 
                  style={{ width: `${percentage}%`, background: levelColor }}
                ></div>
              </div>
            </div>
          </div>

          <div className="daily-target">
            <span className="target-label">今日目标</span>
            <span className="target-value">20,000步</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityCard;
