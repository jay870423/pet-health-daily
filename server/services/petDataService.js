const influx = require('../config/influx');
const moment = require('moment-timezone');

const TIMEZONE = 'Asia/Shanghai';

class PetDataService {
  /**
   * 获取指定日期的宠物原始数据
   * @param {string} petId - 宠物ID
   * @param {string} date - 日期 YYYY-MM-DD
   * @returns {Promise<Array>} 原始数据数组
   */
  async getDailyRawData(petId, date) {
    const startTime = moment.tz(date, TIMEZONE).startOf('day').utc().toISOString();
    const endTime = moment.tz(date, TIMEZONE).endOf('day').utc().toISOString();

    const query = `
      SELECT * FROM pet_activity
      WHERE "petId" = '${petId}'
        AND time >= '${startTime}'
        AND time <= '${endTime}'
      ORDER BY time ASC
    `;

    try {
      const results = await influx.query(query);
      return results;
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  /**
   * 获取昨日数据用于对比
   */
  async getYesterdayData(petId, date) {
    const yesterday = moment.tz(date, TIMEZONE).subtract(1, 'day').format('YYYY-MM-DD');
    return this.getDailyRawData(petId, yesterday);
  }

  /**
   * 获取近7天数据用于趋势计算
   */
  async getLast7DaysData(petId, date) {
    const results = [];
    for (let i = 1; i <= 7; i++) {
      const targetDate = moment.tz(date, TIMEZONE).subtract(i, 'day').format('YYYY-MM-DD');
      const data = await this.getDailyRawData(petId, targetDate);
      results.push({ date: targetDate, data });
    }
    return results;
  }

  /**
   * 获取最近一条数据（用于设备状态判断）
   */
  async getLatestData(petId) {
    const query = `
      SELECT * FROM pet_activity
      WHERE "petId" = '${petId}'
      ORDER BY time DESC
      LIMIT 1
    `;

    try {
      const results = await influx.query(query);
      return results[0] || null;
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }
}

module.exports = new PetDataService();
