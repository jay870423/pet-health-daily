const influx = require('../config/influx');
const moment = require('moment-timezone');

const TIMEZONE = 'Asia/Shanghai';

class LocationService {
  /**
   * 获取指定日期的GPS轨迹数据
   * @param {string} petId - 宠物ID
   * @param {string} date - 日期 YYYY-MM-DD
   * @returns {Promise<Array>} GPS坐标数组
   */
  async getDailyTrack(petId, date) {
    const startTime = moment.tz(date, TIMEZONE).startOf('day').utc().toISOString();
    const endTime = moment.tz(date, TIMEZONE).endOf('day').utc().toISOString();

    const query = `
      SELECT time, LATITUDE, LONGITUDE, HEIGHT, DEM, RADIUS, STEP, 
             T1, T2, T3, TRACKINGMODE
      FROM pet_activity
      WHERE "petId" = '${petId}'
        AND time >= '${startTime}'
        AND time <= '${endTime}'
      ORDER BY time ASC
    `;

    try {
      const results = await influx.query(query);
      
      // 转换为前端需要的格式，并过滤掉没有GPS数据的点
      return results
        .filter(point => point.LATITUDE && point.LONGITUDE)
        .map(point => ({
          time: moment(point.time).tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss'),
          lat: point.LATITUDE,
          lng: point.LONGITUDE,
          height: point.HEIGHT || 0,        // 设备高度
          dem: point.DEM || 0,              // 高程数据
          radius: point.RADIUS || 0,        // 定位精度半径
          step: point.STEP || 0,
          walkTime: point.T1 || 0,          // 走路时长
          jogTime: point.T2 || 0,           // 快走时长
          runTime: point.T3 || 0,           // 跑步时长
          mode: point.TRACKINGMODE || 0     // 运动模式
        }));
    } catch (error) {
      console.error('Query track error:', error);
      throw error;
    }
  }

  /**
   * 获取实时位置（最近一条）
   * @param {string} petId - 宠物ID
   * @returns {Promise<Object>} 当前位置
   */
  async getCurrentLocation(petId) {
    const query = `
      SELECT time, LATITUDE, LONGITUDE, HEIGHT, DEM, RADIUS, STEP
      FROM pet_activity
      WHERE "petId" = '${petId}'
      ORDER BY time DESC
      LIMIT 1
    `;

    try {
      const results = await influx.query(query);
      if (results.length === 0 || !results[0].LATITUDE || !results[0].LONGITUDE) {
        return null;
      }

      const point = results[0];
      return {
        time: moment(point.time).tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss'),
        lat: point.LATITUDE,
        lng: point.LONGITUDE,
        height: point.HEIGHT || 0,
        dem: point.DEM || 0,
        radius: point.RADIUS || 0,
        step: point.STEP || 0
      };
    } catch (error) {
      console.error('Query current location error:', error);
      throw error;
    }
  }

  /**
   * 获取指定时间范围的轨迹
   * @param {string} petId - 宠物ID
   * @param {string} startTime - 开始时间
   * @param {string} endTime - 结束时间
   * @returns {Promise<Array>} GPS坐标数组
   */
  async getTrackByTimeRange(petId, startTime, endTime) {
    const start = moment.tz(startTime, TIMEZONE).utc().toISOString();
    const end = moment.tz(endTime, TIMEZONE).utc().toISOString();

    const query = `
      SELECT time, LATITUDE, LONGITUDE, HEIGHT, DEM, RADIUS, STEP,
             T1, T2, T3, TRACKINGMODE
      FROM pet_activity
      WHERE "petId" = '${petId}'
        AND time >= '${start}'
        AND time <= '${end}'
      ORDER BY time ASC
    `;

    try {
      const results = await influx.query(query);
      
      // 过滤掉没有GPS数据的点
      return results
        .filter(point => point.LATITUDE && point.LONGITUDE)
        .map(point => ({
          time: moment(point.time).tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss'),
          lat: point.LATITUDE,
          lng: point.LONGITUDE,
          height: point.HEIGHT || 0,
          dem: point.DEM || 0,
          radius: point.RADIUS || 0,
          step: point.STEP || 0,
          walkTime: point.T1 || 0,
          jogTime: point.T2 || 0,
          runTime: point.T3 || 0,
          mode: point.TRACKINGMODE || 0
        }));
    } catch (error) {
      console.error('Query track by time range error:', error);
      throw error;
    }
  }

  /**
   * 计算轨迹统计信息
   * @param {Array} track - 轨迹点数组
   * @returns {Object} 统计信息
   */
  calculateTrackStats(track) {
    if (!track || track.length === 0) {
      return {
        totalDistance: 0,
        totalPoints: 0,
        maxSpeed: 0,
        avgSpeed: 0,
        duration: 0,
        startTime: null,
        endTime: null
      };
    }

    // 计算总距离（使用 Haversine 公式）
    let totalDistance = 0;
    for (let i = 1; i < track.length; i++) {
      totalDistance += this.calculateDistance(
        track[i - 1].lat,
        track[i - 1].lng,
        track[i].lat,
        track[i].lng
      );
    }

    // 计算运动时间统计（基于T1, T2, T3）
    const totalWalkTime = track.reduce((sum, p) => sum + (p.walkTime || 0), 0);
    const totalJogTime = track.reduce((sum, p) => sum + (p.jogTime || 0), 0);
    const totalRunTime = track.reduce((sum, p) => sum + (p.runTime || 0), 0);
    const totalActiveTime = totalWalkTime + totalJogTime + totalRunTime; // 单位：秒
    
    // 计算平均速度（基于距离和时间）
    const avgSpeed = totalActiveTime > 0 
      ? totalDistance / totalActiveTime  // m/s
      : 0;

    // 计算时长
    const startTime = track[0].time;
    const endTime = track[track.length - 1].time;
    const duration = moment(endTime).diff(moment(startTime), 'minutes');

    return {
      totalDistance: parseFloat(totalDistance.toFixed(2)), // 单位：米
      totalPoints: track.length,
      avgSpeed: parseFloat(avgSpeed.toFixed(2)), // 单位：m/s
      totalWalkTime: Math.floor(totalWalkTime / 60), // 转换为分钟
      totalJogTime: Math.floor(totalJogTime / 60),   // 转换为分钟
      totalRunTime: Math.floor(totalRunTime / 60),   // 转换为分钟
      totalActiveTime: Math.floor(totalActiveTime / 60), // 转换为分钟
      duration, // GPS时间跨度（分钟）
      startTime,
      endTime
    };
  }

  /**
   * 计算两点之间的距离（Haversine 公式）
   * @param {number} lat1 - 起点纬度
   * @param {number} lng1 - 起点经度
   * @param {number} lat2 - 终点纬度
   * @param {number} lng2 - 终点经度
   * @returns {number} 距离（米）
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // 地球半径（米）
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * 轨迹抽稀（Douglas-Peucker 算法简化版）
   * @param {Array} track - 原始轨迹
   * @param {number} tolerance - 容差（米）
   * @returns {Array} 简化后的轨迹
   */
  simplifyTrack(track, tolerance = 10) {
    if (track.length <= 2) {
      return track;
    }

    // 简化版：每隔N个点保留一个
    const interval = Math.max(1, Math.floor(track.length / 100));
    const simplified = [];
    
    // 始终保留第一个点
    simplified.push(track[0]);
    
    for (let i = interval; i < track.length - 1; i += interval) {
      simplified.push(track[i]);
    }
    
    // 始终保留最后一个点
    simplified.push(track[track.length - 1]);
    
    return simplified;
  }
}

module.exports = new LocationService();
