import React from 'react';
import './TrendCard.css';

function TrendCard({ trend }) {
  const { vsYesterday, vs7DayAvg, trendLabel } = trend;

  const formatPercentage = (value) => {
    const percentage = Math.abs(value * 100).toFixed(0);
    return value >= 0 ? `+${percentage}%` : `-${percentage}%`;
  };

  const getTrendIcon = (value) => {
    if (value > 0) return '↑';
    if (value < 0) return '↓';
    return '→';
  };

  const getTrendColor = (value) => {
    if (value > 0.1) return '#27ae60';
    if (value < -0.1) return '#e74c3c';
    return '#f39c12';
  };

  return (
    <div className="trend-card card trend-warning">
      <div className="card-header">
        <h3 className="card-title" style={{ color: '#e74c3c' }}>趋势提醒</h3>
        <div className="warning-badge">低风险提醒</div>
      </div>

      <div className="trend-items">
        <div className="trend-item">
          <div className="trend-label">较昨日</div>
          <div className="trend-value" style={{ color: getTrendColor(vsYesterday) }}>
            <span className="trend-icon">{getTrendIcon(vsYesterday)}</span>
            <span className="trend-percentage">{formatPercentage(vsYesterday)}</span>
          </div>
        </div>

        <div className="trend-item">
          <div className="trend-label">7日均值</div>
          <div className="trend-value" style={{ color: getTrendColor(vs7DayAvg) }}>
            <span className="trend-icon">{getTrendIcon(vs7DayAvg)}</span>
            <span className="trend-percentage">{formatPercentage(vs7DayAvg)}</span>
          </div>
        </div>
      </div>

      <div className="activity-mode">
        <div className="mode-label">ACTIVITY MODE</div>
        <div className="mode-bar">
          <div className="mode-bar-fill"></div>
        </div>
      </div>
    </div>
  );
}

export default TrendCard;
