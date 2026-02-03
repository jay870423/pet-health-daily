import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AIInsightEnhanced.css';

function AIInsightEnhanced({ petId, date, reportData }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [aiProvider, setAiProvider] = useState('deepseek'); // deepseek | qwen
  const [availableProviders, setAvailableProviders] = useState({});

  // 检查 AI 服务是否可用
  const [aiAvailable, setAiAvailable] = useState(true);

  useEffect(() => {
    checkAIService();
  }, []);

  const checkAIService = async () => {
    try {
      const response = await axios.get('/api/ai/health-check');
      setAvailableProviders(response.data.data.providers);
      setAiProvider(response.data.data.currentProvider);
      const anyAvailable = Object.values(response.data.data.providers).some(p => p.available);
      setAiAvailable(anyAvailable);
    } catch (error) {
      console.error('AI service check failed:', error);
      setAiAvailable(false);
    }
  };

  const analyzeHealth = async (useStream = false) => {
    setLoading(true);
    setError(null);
    setStreamContent('');

    try {
      if (useStream && aiAvailable) {
        // 流式分析
        await handleStreamAnalysis();
      } else {
        // 普通分析
        const response = await axios.post('/api/ai/analyze', {
          petId,
          date,
          provider: aiProvider  // 传递选择的模型
        });

        if (response.data.success) {
          setAnalysis(response.data.data);
          setExpanded(true);
        } else {
          setError(response.data.error);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || '分析失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStreamAnalysis = async () => {
    setIsStreaming(true);
    setStreamContent('');

    try {
      const response = await fetch('/api/ai/analyze-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ petId, date })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.substring(6));
            
            if (data.type === 'chunk') {
              setStreamContent(prev => prev + data.content);
            } else if (data.type === 'done') {
              setIsStreaming(false);
              // 解析最终结果
              try {
                const parsed = JSON.parse(data.content);
                setAnalysis(parsed);
                setExpanded(true);
              } catch (e) {
                // 如果解析失败，使用流式内容
                setStreamContent(data.content);
              }
            } else if (data.type === 'error') {
              setError(data.message);
              setIsStreaming(false);
            }
          }
        }
      }
    } catch (err) {
      setError('流式分析失败: ' + err.message);
      setIsStreaming(false);
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#3498db';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="ai-insight-enhanced card">
      {/* 头部 */}
      <div className="ai-header-enhanced">
        <div className="ai-icon-large">
          <span className="robot-icon">🤖</span>
          <span className="ai-badge">
            {aiProvider === 'deepseek' ? 'DEEPSEEK' : 'QWEN'}
          </span>
        </div>
        <div className="ai-title-section">
          <h3>AI 深度健康洞察</h3>
          <p className="ai-subtitle">专业 AI 分析 · 个性化建议</p>
        </div>
        
        {/* 模型切换按钮 */}
        <div className="model-switcher">
          <button
            className={`model-btn ${aiProvider === 'deepseek' ? 'active' : ''}`}
            onClick={() => setAiProvider('deepseek')}
            disabled={!availableProviders.deepseek?.available}
            title={availableProviders.deepseek?.available ? 'DeepSeek' : 'DeepSeek 未配置'}
          >
            DEEPSEEK
          </button>
          <button
            className={`model-btn ${aiProvider === 'qwen' ? 'active' : ''}`}
            onClick={() => setAiProvider('qwen')}
            disabled={!availableProviders.qwen?.available}
            title={availableProviders.qwen?.available ? '通义千问' : '千问未配置'}
          >
            QWEN
          </button>
        </div>
        
        {!analysis && !loading && (
          <button 
            className="analyze-btn"
            onClick={() => analyzeHealth(false)}
            disabled={loading}
          >
            {aiAvailable ? '🚀 开始分析' : '📊 规则分析'}
          </button>
        )}
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="loading-animation">
          <div className="thinking-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="loading-text">
            {isStreaming ? 'AI 正在深度分析中...' : '正在连接 AI 服务...'}
          </p>
        </div>
      )}

      {/* 流式内容显示 */}
      {isStreaming && streamContent && (
        <div className="stream-content">
          <div className="typing-effect">{streamContent}</div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={() => analyzeHealth(false)} className="retry-btn">
            重试
          </button>
        </div>
      )}

      {/* 分析结果 */}
      {analysis && (
        <div className={`analysis-results ${expanded ? 'expanded' : ''}`}>
          {/* 健康评分 */}
          <div className="health-score-card">
            <div className="score-circle" style={{ borderColor: getHealthScoreColor(analysis.healthScore) }}>
              <div className="score-value" style={{ color: getHealthScoreColor(analysis.healthScore) }}>
                {analysis.healthScore}
              </div>
              <div className="score-label">健康评分</div>
            </div>
            <div className="health-level-badge" style={{ background: `${getHealthScoreColor(analysis.healthScore)}20`, color: getHealthScoreColor(analysis.healthScore) }}>
              {analysis.healthLevel}
            </div>
          </div>

          {/* 关键发现 */}
          {analysis.keyFindings && analysis.keyFindings.length > 0 && (
            <div className="key-findings">
              <h4 className="section-title">
                <span className="title-icon">🔍</span>
                关键发现
              </h4>
              <div className="findings-list">
                {analysis.keyFindings.map((finding, index) => (
                  <div key={index} className="finding-item">
                    <span className="finding-number">{index + 1}</span>
                    <span className="finding-text">{finding}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 详细分析 */}
          {analysis.detailedAnalysis && expanded && (
            <div className="detailed-analysis">
              <h4 className="section-title">
                <span className="title-icon">📊</span>
                详细分析
              </h4>
              {analysis.detailedAnalysis.activity && (
                <div className="analysis-section">
                  <div className="section-label">🏃 活动分析</div>
                  <p className="section-content">{analysis.detailedAnalysis.activity}</p>
                </div>
              )}
              {analysis.detailedAnalysis.vitals && (
                <div className="analysis-section">
                  <div className="section-label">❤️ 体征分析</div>
                  <p className="section-content">{analysis.detailedAnalysis.vitals}</p>
                </div>
              )}
              {analysis.detailedAnalysis.trend && (
                <div className="analysis-section">
                  <div className="section-label">📈 趋势分析</div>
                  <p className="section-content">{analysis.detailedAnalysis.trend}</p>
                </div>
              )}
            </div>
          )}

          {/* 专家建议 */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="expert-recommendations">
              <h4 className="section-title">
                <span className="title-icon">💡</span>
                专家建议
              </h4>
              <div className="recommendations-grid">
                {analysis.recommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    className="recommendation-card"
                    style={{ borderLeftColor: getPriorityColor(rec.priority) }}
                  >
                    <div className="rec-header">
                      <span className="rec-icon">{rec.icon || '💡'}</span>
                      <div className="rec-title-group">
                        <h5 className="rec-title">{rec.title}</h5>
                        <span className="rec-category">{rec.category}</span>
                      </div>
                      <span className={`priority-badge priority-${rec.priority}`}>
                        {rec.priority === 'high' ? '高' : rec.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                    <p className="rec-content">{rec.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 告警信息 */}
          {analysis.alerts && analysis.alerts.length > 0 && (
            <div className="alerts-section">
              <h4 className="section-title alert-title">
                <span className="title-icon">⚠️</span>
                重要提醒
              </h4>
              {analysis.alerts.map((alert, index) => (
                <div key={index} className="alert-item">
                  <span className="alert-icon">⚠️</span>
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          )}

          {/* 总结 */}
          {analysis.summary && (
            <div className="ai-summary-section">
              <h4 className="section-title">
                <span className="title-icon">📝</span>
                综合评估
              </h4>
              <p className="summary-text">{analysis.summary}</p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="action-buttons">
            <button 
              className="toggle-btn"
              onClick={() => setExpanded(!expanded)}
            >
              <span>{expanded ? '📖' : '📄'}</span>
              {expanded ? '收起详情' : '展开详情'}
            </button>
            <button 
              className="refresh-btn"
              onClick={() => analyzeHealth(true)}
              disabled={loading}
            >
              <span>🔄</span>
              重新分析
            </button>
          </div>
        </div>
      )}

      {/* 提示信息 */}
      {!analysis && !loading && !error && (
        <div className="placeholder-content">
          <div className="placeholder-icon">🤖</div>
          <h4>准备好获取专业健康建议了吗？</h4>
          <p>点击"开始分析"按钮，AI 将为您的宠物提供深度健康洞察和个性化建议。</p>
          <div className="features-preview">
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>精准分析</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💡</span>
              <span>专业建议</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>实时反馈</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIInsightEnhanced;
