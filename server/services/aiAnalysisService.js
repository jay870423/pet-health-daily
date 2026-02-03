const axios = require('axios');
require('dotenv').config();

class AIAnalysisService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'deepseek';
    this.timeout = parseInt(process.env.AI_TIMEOUT || '30000');
    
    // DeepSeek 配置
    this.deepseekConfig = {
      apiKey: process.env.DEEPSEEK_API_KEY,
      apiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions',
      model: 'deepseek-chat'
    };
    
    // 千问配置
    this.qwenConfig = {
      apiKey: process.env.QWEN_API_KEY,
      apiUrl: process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      model: 'qwen-plus'
    };
  }

  /**
   * 获取当前AI配置
   */
  getCurrentConfig() {
    return this.provider === 'qwen' ? this.qwenConfig : this.deepseekConfig;
  }

  /**
   * 设置AI提供商
   */
  setProvider(provider) {
    if (['deepseek', 'qwen'].includes(provider)) {
      this.provider = provider;
      console.log(`AI Provider switched to: ${provider}`);
    }
  }

  /**
   * 使用 AI 分析宠物健康数据（支持 DeepSeek 和千问）
   * @param {Object} reportData - 日报数据
   * @param {String} provider - AI提供商 (deepseek/qwen)
   * @returns {Promise<Object>} AI 分析结果
   */
  async analyzeHealthData(reportData, provider = null) {
    try {
      const selectedProvider = provider || this.provider;
      const config = selectedProvider === 'qwen' ? this.qwenConfig : this.deepseekConfig;
      
      if (!config.apiKey || config.apiKey === 'your_deepseek_api_key_here' || config.apiKey === 'your_qwen_api_key_here') {
        console.log(`${selectedProvider} API Key not configured, using fallback analysis`);
        return this.getFallbackAnalysis(reportData);
      }

      const { activity, vitals, trend, device, date } = reportData;

      // 构建分析提示词
      const prompt = this.buildAnalysisPrompt(activity, vitals, trend, device, date);

      console.log(`Using AI Provider: ${selectedProvider} (${config.model})`);

      // 调用 AI API
      const response = await axios.post(
        config.apiUrl,
        {
          model: config.model,
          messages: [
            {
              role: 'system',
              content: '你是一位资深的宠物健康顾问和兽医专家，拥有10年以上的临床经验。你擅长：\n1. 精准分析宠物活动数据、体征数据和行为模式\n2. 识别潜在健康风险和异常信号\n3. 提供科学、专业且易懂的健康建议\n4. 给出可操作的改善方案\n\n请基于数据进行深度分析，提供有价值的专业洞察。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
          stream: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          },
          timeout: this.timeout
        }
      );

      const aiContent = response.data.choices[0].message.content;
      
      // 解析 AI 返回的结构化数据
      const analysis = this.parseAIResponse(aiContent);
      analysis.aiProvider = selectedProvider;
      analysis.aiModel = config.model;
      
      return analysis;

    } catch (error) {
      console.error('AI Analysis Error:', error.response?.data || error.message);
      
      // 返回降级方案
      return this.getFallbackAnalysis(reportData);
    }
  }

  /**
   * 构建分析提示词（增强版）
   */
  buildAnalysisPrompt(activity, vitals, trend, device, date) {
    return `作为资深宠物健康专家，请对以下宠物的健康数据进行**深度专业分析**（日期：${date}）：

━━━━━━━━━━━━━━━━━━━━━━━━
📊 【活动数据】
━━━━━━━━━━━━━━━━━━━━━━━━
• 今日总步数：${activity.steps} 步
• 目标达成率：${(activity.completionRate * 100).toFixed(0)}%
• 活动强度等级：${activity.activeLevel}
• 活动分布：
  - 走路时长：${activity.distribution.T1} 秒
  - 快走时长：${activity.distribution.T2} 秒  
  - 跑步时长：${activity.distribution.T3} 秒
• 总活动时长：${activity.totalActiveTime} 秒

━━━━━━━━━━━━━━━━━━━━━━━━
🌡️ 【生理体征】
━━━━━━━━━━━━━━━━━━━━━━━━
• 平均体表温度：${vitals.avgTemp}°C
• 体征状态：${vitals.status}
• 温度范围：${vitals.minTemp}°C ~ ${vitals.maxTemp}°C
• 环境气压：${vitals.avgPressure} hPa

━━━━━━━━━━━━━━━━━━━━━━━━
📈 【趋势对比分析】
━━━━━━━━━━━━━━━━━━━━━━━━
• 较昨日变化：${trend.vsYesterday >= 0 ? '+' : ''}${(trend.vsYesterday * 100).toFixed(1)}%
• 较7日均值变化：${trend.vs7DayAvg >= 0 ? '+' : ''}${(trend.vs7DayAvg * 100).toFixed(1)}%
• 趋势判断：${trend.trendLabel}

━━━━━━━━━━━━━━━━━━━━━━━━
🔋 【设备状态】
━━━━━━━━━━━━━━━━━━━━━━━━
• 数据质量：${device.dataStatus}
• 电池电压：${device.battery}V (${device.battery > 4.0 ? '良好' : device.battery > 3.7 ? '中等' : '偏低'})
• 信号强度：${device.rsrp}dBm

━━━━━━━━━━━━━━━━━━━━━━━━

**分析要求：**
1. 综合分析活动量、体征、趋势三个维度
2. 识别潜在健康风险（体温异常、活动量骤减/增、趋势异常等）
3. 评估宠物当前健康状况并打分
4. 提供至少2-3条专业且可操作的建议
5. 如有异常，明确指出并给出就医建议

**返回格式（纯JSON，不要markdown代码块）：**
{
  "healthScore": 85,
  "healthLevel": "优秀",
  "keyFindings": [
    "核心发现1：具体数据分析",
    "核心发现2：趋势变化解读",
    "核心发现3：潜在风险提示"
  ],
  "detailedAnalysis": {
    "activity": "活动分析：从步数、活动时长、强度分布等维度进行专业评估（3-4句话）",
    "vitals": "体征分析：评估体温是否正常，是否有发热或体温偏低迹象（2-3句话）",
    "trend": "趋势分析：对比历史数据，判断健康走向，预警潜在问题（2-3句话）"
  },
  "recommendations": [
    {
      "priority": "high",
      "category": "运动",
      "title": "建议标题",
      "content": "具体可操作的建议，包含时长、频率等细节",
      "icon": "🏃"
    }
  ],
  "alerts": ["如有异常，在此列出告警信息"],
  "summary": "综合评估：整体健康状况 + 关键风险点 + 改善建议（4-5句话）"
}`;
  }

  /**
   * 解析 AI 返回内容
   */
  parseAIResponse(content) {
    try {
      // 提取 JSON 部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error('Parse AI Response Error:', error);
      // 如果解析失败，返回基础结构
      return {
        healthScore: 75,
        healthLevel: '良好',
        keyFindings: [content.substring(0, 100)],
        detailedAnalysis: {
          activity: content.substring(0, 200),
          vitals: '',
          trend: ''
        },
        recommendations: [],
        alerts: [],
        summary: content.substring(0, 300)
      };
    }
  }

  /**
   * 获取降级分析（当 AI 服务不可用时）
   */
  getFallbackAnalysis(reportData) {
    const { activity, vitals, trend } = reportData;
    
    const recommendations = [];
    const alerts = [];
    let healthScore = 75;

    // 基于规则的分析
    if (activity.completionRate < 0.3) {
      healthScore -= 10;
      recommendations.push({
        priority: 'high',
        category: '运动',
        title: '活动量不足',
        content: '建议增加 15-30 分钟的户外活动或互动游戏，促进宠物身心健康。',
        icon: '🏃'
      });
    }

    if (vitals.status === 'WARNING') {
      healthScore -= 15;
      alerts.push('体征数据出现异常，建议密切关注或咨询兽医');
    }

    if (trend.trendLabel === 'DOWN') {
      healthScore -= 5;
      recommendations.push({
        priority: 'medium',
        category: '观察',
        title: '活动趋势下降',
        content: '连续观察 2-3 天，如持续下降建议就医检查。',
        icon: '📊'
      });
    }

    return {
      healthScore,
      healthLevel: healthScore >= 80 ? '优秀' : healthScore >= 60 ? '良好' : '需关注',
      keyFindings: [
        `今日完成 ${activity.steps} 步，达成目标 ${(activity.completionRate * 100).toFixed(0)}%`,
        `体表温度 ${vitals.avgTemp}°C，体征${vitals.status === 'NORMAL' ? '正常' : '需关注'}`,
        `活动量较昨日${trend.vsYesterday >= 0 ? '增加' : '减少'} ${Math.abs(trend.vsYesterday * 100).toFixed(0)}%`
      ],
      detailedAnalysis: {
        activity: `宠物今日活动量${activity.activeLevel === 'LOW' ? '偏低' : activity.activeLevel === 'HIGH' ? '充足' : '适中'}，建议保持规律运动习惯。`,
        vitals: `体征数据${vitals.status === 'NORMAL' ? '在正常范围内' : '出现异常'}，${vitals.status === 'NORMAL' ? '继续保持' : '建议就医检查'}。`,
        trend: `活动趋势${trend.trendLabel === 'UP' ? '上升' : trend.trendLabel === 'DOWN' ? '下降' : '稳定'}，需持续观察。`
      },
      recommendations,
      alerts,
      summary: `总体评估：宠物健康状况${healthScore >= 80 ? '优秀' : healthScore >= 60 ? '良好' : '需要关注'}。建议${activity.activeLevel === 'LOW' ? '增加运动量' : '保持当前状态'}，${vitals.status === 'WARNING' ? '密切关注体征变化' : '继续保持健康习惯'}。`
    };
  }

  /**
   * 流式分析（支持实时返回）
   */
  async analyzeHealthDataStream(reportData, onChunk) {
    try {
      const { activity, vitals, trend, device, date } = reportData;
      const prompt = this.buildAnalysisPrompt(activity, vitals, trend, device, date);

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一位专业的宠物健康顾问，擅长分析宠物活动数据和体征数据。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          stream: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          responseType: 'stream',
          timeout: this.timeout
        }
      );

      let fullContent = '';

      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              onChunk({ done: true, content: fullContent });
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                onChunk({ done: false, content, fullContent });
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      });

      return new Promise((resolve, reject) => {
        response.data.on('end', () => {
          resolve(this.parseAIResponse(fullContent));
        });
        response.data.on('error', reject);
      });

    } catch (error) {
      console.error('Stream Analysis Error:', error);
      throw error;
    }
  }
}

module.exports = new AIAnalysisService();
