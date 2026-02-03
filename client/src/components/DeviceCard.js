import React from 'react';
import './DeviceCard.css';

function DeviceCard({ device }) {
  const { dataStatus, battery, soc, rsrp, healthScore } = device;

  const getStatusColor = (status) => {
    switch (status) {
      case 'NORMAL': return '#27ae60';
      case 'DEGRADED': return '#f39c12';
      case 'OFFLINE': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getBatteryLevel = () => {
    if (soc >= 60) return 'high';
    if (soc >= 30) return 'medium';
    return 'low';
  };

  const getSignalBars = () => {
    if (rsrp >= -80) return 4;
    if (rsrp >= -90) return 3;
    if (rsrp >= -100) return 2;
    return 1;
  };

  const statusColor = getStatusColor(dataStatus);
  const batteryLevel = getBatteryLevel();
  const signalBars = getSignalBars();

  return (
    <div className="device-card card">
      <div className="card-header">
        <h3 className="card-title">健康状态</h3>
        <div className="status-dot-indicator" style={{ background: statusColor }}></div>
      </div>

      <div className="device-status">
        <div className={`status-badge-large ${dataStatus.toLowerCase()}`}>
          <span className="status-icon">●</span>
          {dataStatus}
        </div>
        <div className="status-percentage">
          {healthScore || 0}% <span className="percentage-suffix">DAILY</span>
        </div>
      </div>

      <div className="device-metrics">
        <div className="metric-item">
          <div className="metric-label">设备电量</div>
          <div className="metric-value">
            <div className={`battery-icon ${batteryLevel}`}>
              <div className="battery-fill" style={{ width: `${soc}%` }}></div>
            </div>
            <span className="metric-number">{battery.toFixed(2)}V</span>
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">信号强度</div>
          <div className="metric-value">
            <div className="signal-bars">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`signal-bar ${bar <= signalBars ? 'active' : ''}`}
                  style={{ height: `${bar * 25}%` }}
                ></div>
              ))}
            </div>
            <span className="metric-number">{rsrp}dBm</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeviceCard;
