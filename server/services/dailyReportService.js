const petDataService = require('./petDataService');

class DailyReportService {
  /**
   * 生成宠物日报
   * @param {string} petId - 宠物ID
   * @param {string} date - 日期 YYYY-MM-DD
   * @returns {Promise<Object>} 日报对象
   */
  async generateDailyReport(petId, date) {
    try {
      // 1. 获取当日数据
      const todayData = await petDataService.getDailyRawData(petId, date);
      
      if (!todayData || todayData.length === 0) {
        throw new Error('No data available for the specified date');
      }

      // 2. 计算活动数据
      const activity = this.calculateActivity(todayData);

      // 3. 计算体征数据
      const vitals = this.calculateVitals(todayData);

      // 4. 计算趋势对比
      const trend = await this.calculateTrend(petId, date, activity.steps);

      // 5. 计算设备状态
      const device = await this.calculateDeviceStatus(petId, todayData);

      // 6. 生成建议
      const advice = this.generateAdvice(activity, vitals, trend, device);

      // 7. 生成摘要
      const summary = this.generateSummary(activity, vitals, trend);

      return {
        date,
        petId,
        summary,
        activity,
        vitals,
        trend,
        device,
        advice
      };
    } catch (error) {
      console.error('Generate daily report error:', error);
      throw error;
    }
  }

  /**
   * 计算活动数据
   */
  calculateActivity(data) {
    if (!data || data.length === 0) {
      return {
        steps: 0,
        completionRate: 0,
        activeLevel: 'LOW',
        distribution: { T1: 0, T2: 0, T3: 0 }
      };
    }

    // 计算日步数：max(STEP) - min(STEP)
    const steps = data.map(d => d.STEP || 0);
    const dailySteps = Math.max(...steps) - Math.min(...steps);

    // 获取目标步数（假设为 20000）
    const stepLimit = data[0].STEPLIMIT || 20000;
    const completionRate = parseFloat((dailySteps / stepLimit).toFixed(2));

    // 判断活动等级
    let activeLevel = 'LOW';
    if (completionRate >= 0.8) {
      activeLevel = 'HIGH';
    } else if (completionRate >= 0.5) {
      activeLevel = 'NORMAL';
    }

    // 分时段活动分布
    const distribution = {
      T1: Math.max(...data.map(d => d.T1 || 0)),
      T2: Math.max(...data.map(d => d.T2 || 0)),
      T3: Math.max(...data.map(d => d.T3 || 0))
    };

    return {
      steps: dailySteps,
      completionRate,
      activeLevel,
      distribution
    };
  }

  /**
   * 计算体征数据
   */
  calculateVitals(data) {
    if (!data || data.length === 0) {
      return {
        avgTemp: 0,
        avgPressure: 0,
        status: 'UNKNOWN'
      };
    }

    // 计算平均体表温度
    const temps = data.filter(d => d.TEMP !== undefined && d.TEMP !== null).map(d => d.TEMP);
    const avgTemp = temps.length > 0 
      ? parseFloat((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2))
      : 0;

    // 计算平均气压
    const pressures = data.filter(d => d.PRESS !== undefined && d.PRESS !== null).map(d => d.PRESS);
    const avgPressure = pressures.length > 0
      ? parseFloat((pressures.reduce((a, b) => a + b, 0) / pressures.length).toFixed(2))
      : 0;

    // 判断体征状态（简化版：温度异常判断）
    let status = 'NORMAL';
    if (avgTemp > 40 || avgTemp < 10) {
      status = 'WARNING';
    }

    return {
      avgTemp,
      avgPressure,
      status
    };
  }

  /**
   * 计算趋势对比
   */
  async calculateTrend(petId, date, todaySteps) {
    try {
      // 获取昨日数据
      const yesterdayData = await petDataService.getYesterdayData(petId, date);
      const yesterdayActivity = this.calculateActivity(yesterdayData);
      const yesterdaySteps = yesterdayActivity.steps;

      // 计算 vs 昨日
      const vsYesterday = yesterdaySteps > 0 
        ? parseFloat(((todaySteps - yesterdaySteps) / yesterdaySteps).toFixed(2))
        : 0;

      // 获取近7天数据
      const last7DaysData = await petDataService.getLast7DaysData(petId, date);
      const last7DaysSteps = last7DaysData.map(item => this.calculateActivity(item.data).steps);
      const avg7DaySteps = last7DaysSteps.length > 0
        ? last7DaysSteps.reduce((a, b) => a + b, 0) / last7DaysSteps.length
        : 0;

      // 计算 vs 近7日均值
      const vs7DayAvg = avg7DaySteps > 0
        ? parseFloat(((todaySteps - avg7DaySteps) / avg7DaySteps).toFixed(2))
        : 0;

      // 判断趋势标签
      let trendLabel = 'STABLE';
      if (vsYesterday < -0.1) {
        trendLabel = 'DOWN';
      } else if (vsYesterday > 0.1) {
        trendLabel = 'UP';
      }

      return {
        vsYesterday,
        vs7DayAvg,
        trendLabel,
        yesterdaySteps,
        avg7DaySteps: Math.round(avg7DaySteps)
      };
    } catch (error) {
      console.error('Calculate trend error:', error);
      return {
        vsYesterday: 0,
        vs7DayAvg: 0,
        trendLabel: 'STABLE',
        yesterdaySteps: 0,
        avg7DaySteps: 0
      };
    }
  }

  /**
   * 计算设备状态
   */
  async calculateDeviceStatus(petId, todayData) {
    try {
      const latestData = await petDataService.getLatestData(petId);
      
      if (!latestData) {
        return {
          dataStatus: 'OFFLINE',
          battery: 0,
          soc: 0,
          rsrp: 0,
          lastSeen: null,
          healthScore: 0
        };
      }

      // 检查最后上报时间
      const lastSeen = latestData.time;
      const now = new Date();
      const minutesSinceLastSeen = (now - new Date(lastSeen)) / 1000 / 60;

      let dataStatus = 'NORMAL';
      if (minutesSinceLastSeen > 10) {
        dataStatus = 'OFFLINE';
      } else if (latestData.BATVOL < 3.3 || latestData.RSRP < -100) {
        dataStatus = 'DEGRADED';
      }

      // 检查防拆告警
      if (latestData.TAMPERALARM === 1) {
        dataStatus = 'ALARM';
      }

      // 计算健康评分 (0-100)
      const healthScore = this.calculateHealthScore(latestData, todayData, dataStatus);

      return {
        dataStatus,
        battery: latestData.BATVOL || 0,
        soc: latestData.SOC || 0,
        rsrp: latestData.RSRP || 0,
        lastSeen,
        healthScore
      };
    } catch (error) {
      console.error('Calculate device status error:', error);
      return {
        dataStatus: 'UNKNOWN',
        battery: 0,
        soc: 0,
        rsrp: 0,
        lastSeen: null,
        healthScore: 0
      };
    }
  }

  /**
   * 计算健康评分 (0-100)
   */
  calculateHealthScore(latestData, todayData, dataStatus) {
    let score = 100;

    // 1. 设备状态扣分
    if (dataStatus === 'OFFLINE') {
      score -= 50;
    } else if (dataStatus === 'DEGRADED') {
      score -= 20;
    } else if (dataStatus === 'ALARM') {
      score -= 30;
    }

    // 2. 电池电量评分 (最多扣20分)
    const soc = latestData.SOC || 0;
    if (soc < 20) {
      score -= 20;
    } else if (soc < 40) {
      score -= 10;
    } else if (soc < 60) {
      score -= 5;
    }

    // 3. 信号强度评分 (最多扣15分)
    const rsrp = latestData.RSRP || -120;
    if (rsrp < -110) {
      score -= 15;
    } else if (rsrp < -100) {
      score -= 10;
    } else if (rsrp < -90) {
      score -= 5;
    }

    // 4. 体温异常评分 (最多扣15分)
    const temp = latestData.TEMP || 38;
    if (temp > 40 || temp < 36) {
      score -= 15;
    } else if (temp > 39.5 || temp < 37) {
      score -= 8;
    }

    // 5. 数据完整性评分 (有数据上报加分)
    if (todayData && todayData.length > 0) {
      // 数据点越多，评分越高 (最多加5分)
      const dataCompleteness = Math.min(todayData.length / 24, 1);
      score += Math.round(dataCompleteness * 5);
    }

    // 确保评分在 0-100 之间
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 生成建议
   */
  generateAdvice(activity, vitals, trend, device) {
    const advice = [];

    // 设备状态建议
    if (device.dataStatus === 'OFFLINE') {
      advice.push('设备已离线，请检查设备连接状态');
      return advice;
    }

    if (device.dataStatus === 'DEGRADED') {
      advice.push('设备电量或信号较弱，建议充电或移动位置');
    }

    // 活动建议
    if (activity.activeLevel === 'LOW') {
      advice.push('建议增加一次 15–30 分钟互动活动');
    } else if (activity.activeLevel === 'HIGH') {
      advice.push('今日活动充足，注意适当休息');
    }

    // 趋势建议
    if (trend.trendLabel === 'DOWN') {
      advice.push('连续观察 2–3 天活动变化');
    }

    // 体征建议
    if (vitals.status === 'WARNING') {
      advice.push('体征数据异常，建议联系兽医检查');
    }

    if (advice.length === 0) {
      advice.push('各项指标正常，继续保持良好习惯');
    }

    return advice;
  }

  /**
   * 生成摘要
   */
  generateSummary(activity, vitals, trend) {
    let summary = '';

    // 活动评价
    if (activity.activeLevel === 'LOW') {
      summary += '今天活动偏少';
    } else if (activity.activeLevel === 'NORMAL') {
      summary += '今天活动适中';
    } else {
      summary += '今天活动充足';
    }

    // 体征评价
    if (vitals.status === 'NORMAL') {
      summary += '，体征稳定';
    } else {
      summary += '，体征异常';
    }

    // 趋势评价
    if (trend.trendLabel === 'DOWN') {
      summary += '，活动量有所下降';
    } else if (trend.trendLabel === 'UP') {
      summary += '，活动量有所上升';
    }

    summary += '。';

    return summary;
  }
}

module.exports = new DailyReportService();
