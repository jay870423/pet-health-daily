# AI 深度健康洞察 - 配置指南

## 功能概述

新增的 AI 深度健康洞察功能使用 DeepSeek API 对宠物健康数据进行专业分析，提供：

- 🎯 **健康评分**：0-100分的量化评估
- 🔍 **关键发现**：数据中的重要发现点
- 📊 **详细分析**：活动、体征、趋势的深度解读
- 💡 **专家建议**：个性化的健康改善建议
- ⚠️ **风险告警**：需要关注的异常情况
- 📝 **综合评估**：整体健康状态总结

## 配置 DeepSeek API

### 1. 获取 API Key

访问 [DeepSeek 官网](https://platform.deepseek.com/) 注册并获取 API Key。

### 2. 配置环境变量

编辑 `.env` 文件：

```env
# AI 服务配置
DEEPSEEK_API_KEY=your_actual_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
AI_TIMEOUT=30000
```

### 3. 安装依赖

```bash
# 后端依赖
npm install

# 重启服务器
npm run server
```

### 4. 验证配置

访问 API 端点测试：

```bash
curl http://localhost:3001/api/ai/health-check
```

返回示例：
```json
{
  "success": true,
  "data": {
    "available": true,
    "provider": "DeepSeek",
    "message": "AI 服务可用"
  }
}
```

## 功能特性

### 1. 智能分析模式

**完整分析**：
- 一次性返回完整的分析结果
- 适合需要快速查看完整报告的场景

**流式分析**：
- 实时显示 AI 的思考过程
- 提供更好的用户体验
- 适合深度分析场景

### 2. 降级方案

当 AI 服务不可用或未配置时，系统会自动切换到基于规则的分析引擎：
- 使用预设规则进行健康评估
- 提供基础的建议和告警
- 确保功能始终可用

### 3. 响应式设计

- ✅ 完美适配 PC 端（1024px+）
- ✅ 优化平板显示（768px - 1024px）
- ✅ 流畅的移动端体验（< 768px）

### 4. 交互体验

- 🎨 精美的渐变背景动画
- ⚡ 流畅的加载和过渡效果
- 💬 实时的打字机效果（流式模式）
- 🔄 一键刷新重新分析
- 📱 展开/收起详情功能

## API 接口

### 获取 AI 分析

**请求：**
```http
POST /api/ai/analyze
Content-Type: application/json

{
  "petId": "221",
  "date": "2026-02-02"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "healthScore": 85,
    "healthLevel": "良好",
    "keyFindings": [
      "今日完成 6312 步，达成目标 31%",
      "体表温度 17.53°C，体征正常",
      "活动量较昨日减少 18%"
    ],
    "detailedAnalysis": {
      "activity": "宠物今日活动量偏低，建议保持规律运动习惯。",
      "vitals": "体征数据在正常范围内，继续保持。",
      "trend": "活动趋势下降，需持续观察。"
    },
    "recommendations": [
      {
        "priority": "high",
        "category": "运动",
        "title": "活动量不足",
        "content": "建议增加 15-30 分钟的户外活动或互动游戏。",
        "icon": "🏃"
      }
    ],
    "alerts": [],
    "summary": "总体评估：宠物健康状况良好..."
  }
}
```

### 流式分析

**请求：**
```http
POST /api/ai/analyze-stream
Content-Type: application/json

{
  "petId": "221",
  "date": "2026-02-02"
}
```

**响应（SSE 流）：**
```
data: {"type":"start","message":"开始分析..."}

data: {"type":"chunk","content":"根据数据分析"}

data: {"type":"chunk","content":"，宠物今日"}

data: {"type":"done","content":"{...完整JSON...}"}
```

## 使用示例

### 前端调用

```javascript
// 1. 普通分析
const analyzeHealth = async () => {
  const response = await axios.post('/api/ai/analyze', {
    petId: '221',
    date: '2026-02-02'
  });
  console.log(response.data);
};

// 2. 流式分析
const analyzeHealthStream = async () => {
  const response = await fetch('/api/ai/analyze-stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ petId: '221', date: '2026-02-02' })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    console.log('收到数据:', chunk);
  }
};
```

## 性能优化

### 1. 超时控制
```env
AI_TIMEOUT=30000  # 30秒超时
```

### 2. 错误重试
- 前端自动重试功能
- 优雅的错误提示

### 3. 缓存策略
可以在前端添加缓存避免重复请求：

```javascript
const cache = new Map();

const getCachedAnalysis = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < 300000) { // 5分钟缓存
    return cached.data;
  }
  return null;
};
```

## 成本控制

DeepSeek API 按 token 计费：

- 每次分析约消耗 500-1000 tokens
- 建议设置每日请求限额
- 监控 API 使用情况

### 实现请求限流

```javascript
// 简单的内存限流（server/middleware/rateLimiter.js）
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10, // 最多10次请求
  message: '请求过于频繁，请稍后再试'
});

app.use('/api/ai', aiLimiter);
```

## 故障排查

### 问题 1：AI 服务不可用

**症状**：显示"AI 服务未配置"

**解决**：
1. 检查 `.env` 中 `DEEPSEEK_API_KEY` 是否正确
2. 验证 API Key 是否有效
3. 检查网络连接

### 问题 2：分析超时

**症状**：长时间加载后失败

**解决**：
1. 增加 `AI_TIMEOUT` 值
2. 检查网络延迟
3. 使用降级方案

### 问题 3：解析失败

**症状**：返回错误的分析结果

**解决**：
1. 查看后端日志
2. 检查 AI 返回的原始内容
3. 优化提示词（prompt）

## 扩展开发

### 自定义提示词

编辑 `server/services/aiAnalysisService.js`：

```javascript
buildAnalysisPrompt(activity, vitals, trend, device, date) {
  return `你是宠物健康专家...
  
  【自定义分析要求】
  1. 重点关注...
  2. 提供...
  
  ...`;
}
```

### 添加新的分析维度

```javascript
// 在 aiAnalysisService.js 中添加新方法
async analyzeNutrition(reportData) {
  // 营养分析逻辑
}

async analyzeSleep(reportData) {
  // 睡眠分析逻辑
}
```

### 多语言支持

```javascript
const prompts = {
  'zh-CN': '你是一位专业的宠物健康顾问...',
  'en-US': 'You are a professional pet health advisor...'
};

const prompt = prompts[locale] || prompts['zh-CN'];
```

## 最佳实践

1. **合理使用 AI 分析**
   - 不是每次查看都需要分析
   - 建议每日首次查看时分析
   - 数据变化大时再次分析

2. **用户体验优化**
   - 优先使用流式分析（更好的体验）
   - 提供清晰的加载状态
   - 错误时显示友好提示

3. **数据隐私**
   - 不要在提示词中包含敏感信息
   - API Key 保密存储
   - 考虑数据加密传输

4. **监控和日志**
   - 记录每次 AI 调用
   - 监控失败率和响应时间
   - 定期审查分析质量

## 更新日志

### v1.1.0 (2026-02-02)
- ✨ 新增 AI 深度健康洞察功能
- ✨ 支持 DeepSeek API 集成
- ✨ 实现流式分析体验
- ✨ 添加降级方案
- 🎨 优化移动端响应式设计
- 🐛 修复若干已知问题

---

如有问题，请查看主 README.md 或提交 Issue。
