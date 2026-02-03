import React from 'react';
import './ActivityMap.css';

function ActivityMap() {
  return (
    <div className="activity-map card">
      <div className="map-header">
        <h3 className="card-title">活动轨迹</h3>
        <div className="map-time">实时更新</div>
      </div>

      <div className="map-container">
        <svg viewBox="0 0 400 300" className="activity-path">
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
          </defs>
          
          {/* 活动路径 */}
          <path
            d="M 50 250 Q 100 200, 150 220 T 250 180 T 350 150"
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            className="animated-path"
          />
          
          {/* 起点 */}
          <circle cx="50" cy="250" r="6" fill="#667eea">
            <animate
              attributeName="r"
              values="6;8;6"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <text x="50" y="270" fontSize="10" fill="#667eea" textAnchor="middle" fontWeight="600">
            START
          </text>
          
          {/* 终点 */}
          <circle cx="350" cy="150" r="8" fill="#764ba2" />
          <circle cx="350" cy="150" r="12" fill="#764ba2" opacity="0.3">
            <animate
              attributeName="r"
              values="12;16;12"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>

        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#667eea' }}></div>
            <span>起点</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#764ba2' }}></div>
            <span>当前位置</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityMap;
