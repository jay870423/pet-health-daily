const express = require('express');
const router = express.Router();
const aiAnalysisService = require('../services/aiAnalysisService');
const dailyReportService = require('../services/dailyReportService');
const moment = require('moment-timezone');

/**
 * POST /api/ai/analyze
 * 获取 AI 深度健康分析
 * Body: { petId, date, provider: 'deepseek'|'qwen' }
 */
router.post('/analyze', async (req, res) => {
  try {
    const { petId, date, provider } = req.body;
    
    if (!petId) {
      return res.status(400).json({
        success: false,
        error: 'petId is required'
      });
    }

    const analysisDate = date || moment().tz('Asia/Shanghai').format('YYYY-MM-DD');

    // 获取日报数据
    const reportData = await dailyReportService.generateDailyReport(petId, analysisDate);

    // AI 分析（支持指定provider）
    const analysis = await aiAnalysisService.analyzeHealthData(reportData, provider);

    res.json({
      success: true,
      data: {
        ...analysis,
        petId,
        date: analysisDate,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Analysis API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ai/analyze-stream
 * 流式 AI 分析（支持实时返回）
 */
router.post('/analyze-stream', async (req, res) => {
  try {
    const { petId, date } = req.body;
    
    if (!petId) {
      return res.status(400).json({
        success: false,
        error: 'petId is required'
      });
    }

    const analysisDate = date || moment().tz('Asia/Shanghai').format('YYYY-MM-DD');

    // 设置 SSE 头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 获取日报数据
    const reportData = await dailyReportService.generateDailyReport(petId, analysisDate);

    // 发送初始状态
    res.write(`data: ${JSON.stringify({ type: 'start', message: '开始分析...' })}\n\n`);

    // 流式 AI 分析
    await aiAnalysisService.analyzeHealthDataStream(reportData, (chunk) => {
      if (chunk.done) {
        res.write(`data: ${JSON.stringify({ type: 'done', content: chunk.content })}\n\n`);
        res.end();
      } else {
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk.content })}\n\n`);
      }
    });

  } catch (error) {
    console.error('Stream Analysis API Error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
    res.end();
  }
});

/**
 * GET /api/ai/health-check
 * 检查 AI 服务状态
 */
router.get('/health-check', async (req, res) => {
  try {
    const deepseekAvailable = !!process.env.DEEPSEEK_API_KEY && 
                              process.env.DEEPSEEK_API_KEY !== 'your_deepseek_api_key_here';
    const qwenAvailable = !!process.env.QWEN_API_KEY && 
                          process.env.QWEN_API_KEY !== 'your_qwen_api_key_here';
    
    res.json({
      success: true,
      data: {
        providers: {
          deepseek: {
            available: deepseekAvailable,
            model: 'deepseek-chat',
            name: 'DeepSeek'
          },
          qwen: {
            available: qwenAvailable,
            model: 'qwen-plus',
            name: '通义千问'
          }
        },
        currentProvider: process.env.AI_PROVIDER || 'deepseek',
        message: deepseekAvailable || qwenAvailable ? 
          'AI 服务可用' : 'AI 服务未配置（将使用规则引擎）'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
