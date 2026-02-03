import React from 'react';
import './VitalsCard.css';

function VitalsCard({ vitals }) {
  const { avgTemp, status } = vitals;

  return (
    <div className="vitals-card card">
      <div className="card-header">
        <h3 className="card-title">概化概况</h3>
        <div className="info-icon">ℹ️</div>
      </div>
      
      <div className="vitals-content">
        <div className="temp-display">
          <div className="temp-label">平均体表温度</div>
          <div className="temp-value">{avgTemp.toFixed(1)}°C</div>
        </div>

        <div className="status-indicator">
          <div className={`status-label ${status.toLowerCase()}`}>
            {status === 'NORMAL' ? 'NORMAL' : status}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VitalsCard;
