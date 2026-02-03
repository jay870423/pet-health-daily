const express = require('express');
const router = express.Router();
const locationService = require('../services/locationService');
const moment = require('moment-timezone');

/**
 * GET /api/location/track/:petId
 * 获取指定日期的GPS轨迹
 */
router.get('/track/:petId', async (req, res) => {
  try {
    const { petId } = req.params;
    const date = req.query.date || moment().tz('Asia/Shanghai').format('YYYY-MM-DD');
    const simplify = req.query.simplify === 'true';

    // 获取轨迹数据
    let track = await locationService.getDailyTrack(petId, date);

    // 如果请求简化，则进行轨迹抽稀
    if (simplify && track.length > 0) {
      track = locationService.simplifyTrack(track);
    }

    // 计算统计信息
    const stats = locationService.calculateTrackStats(track);

    res.json({
      success: true,
      data: {
        petId,
        date,
        track,
        stats,
        pointCount: track.length
      }
    });
  } catch (error) {
    console.error('Get track error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/location/current/:petId
 * 获取当前位置
 */
router.get('/current/:petId', async (req, res) => {
  try {
    const { petId } = req.params;
    const location = await locationService.getCurrentLocation(petId);

    if (!location) {
      return res.json({
        success: true,
        data: null,
        message: 'No location data available'
      });
    }

    res.json({
      success: true,
      data: {
        petId,
        location
      }
    });
  } catch (error) {
    console.error('Get current location error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/location/range/:petId
 * 获取指定时间范围的轨迹
 */
router.get('/range/:petId', async (req, res) => {
  try {
    const { petId } = req.params;
    const { startTime, endTime } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'startTime and endTime are required'
      });
    }

    const track = await locationService.getTrackByTimeRange(petId, startTime, endTime);
    const stats = locationService.calculateTrackStats(track);

    res.json({
      success: true,
      data: {
        petId,
        startTime,
        endTime,
        track,
        stats,
        pointCount: track.length
      }
    });
  } catch (error) {
    console.error('Get track by range error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/location/config
 * 获取地图配置（百度地图AK）
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      baiduMapAk: process.env.BAIDU_MAP_AK || '',
      mapType: 'baidu'
    }
  });
});

module.exports = router;
