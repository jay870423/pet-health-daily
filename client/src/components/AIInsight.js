import React from 'react';
import './AIInsight.css';

function AIInsight({ summary, advice, date }) {
  return (
    <div className="ai-insight card">
      <div className="ai-header">
        <div className="ai-icon">🤖</div>
        <div className="ai-title">
          <h3>AI 深度健康评估</h3>
          <p className="ai-subtitle">AI模拟处理 {date}</p>
        </div>
      </div>

      <div className="ai-summary">
        <p className="summary-text">{summary}</p>
      </div>

      <div className="ai-recommendations">
        <div className="recommendations-header">
          <span className="sparkle-icon">✨</span>
          <span className="recommendations-title">专业建议 [GEMINI]</span>
        </div>
        <ul className="recommendations-list">
          {advice && advice.map((item, index) => (
            <li key={index} className="recommendation-item">
              <span className="bullet">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AIInsight;
