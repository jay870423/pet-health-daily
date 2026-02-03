const express = require('express');
const router = express.Router();
const dailyReportService = require('../services/dailyReportService');
const moment = require('moment-timezone');

/**
 * GET /api/report/:petId
 * 获取指定宠物的日报
 * Query参数：date (可选，默认今天)
 */
router.get('/:petId', async (req, res) => {
  try {
    const { petId } = req.params;
    const date = req.query.date || moment().tz('Asia/Shanghai').format('YYYY-MM-DD');

    // 验证日期格式
    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    const report = await dailyReportService.generateDailyReport(petId, date);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/report/:petId/history
 * 获取历史日报列表
 * Query参数：startDate, endDate
 */
router.get('/:petId/history', async (req, res) => {
  try {
    const { petId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate are required'
      });
    }

    const reports = [];
    const start = moment(startDate);
    const end = moment(endDate);

    while (start.isSameOrBefore(end)) {
      try {
        const report = await dailyReportService.generateDailyReport(
          petId, 
          start.format('YYYY-MM-DD')
        );
        reports.push(report);
      } catch (error) {
        console.error(`Error generating report for ${start.format('YYYY-MM-DD')}:`, error.message);
      }
      start.add(1, 'day');
    }

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
