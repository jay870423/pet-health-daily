const Influx = require('influx');
const moment = require('moment-timezone');
require('dotenv').config();

const influx = new Influx.InfluxDB({
  host: process.env.INFLUX_HOST || 'localhost',
  port: parseInt(process.env.INFLUX_PORT || '8086'),
  database: process.env.INFLUX_DATABASE || 'pet_health',
  username: process.env.INFLUX_USERNAME,
  password: process.env.INFLUX_PASSWORD
});

const PET_ID = '221';
const DAYS = 7;

// 北京中心坐标（天安门附近）
const CENTER_LAT = 39.9042;
const CENTER_LNG = 116.4074;

// 宠物配置（可修改以生成不同特征的数据）
const PET_CONFIG = {
  baseSteps: 2100,        // 基础步数 - 对应图中显示的低活跃度
  baseTemp: 38.5,         // 基础体温
  species: 2,             // 1=狗, 2=猫
  activityLevel: 'low',   // 活动等级: very_low, low, medium, high, very_high
  dailyVariation: 0.1     // 每日变化幅度 (0-1)
};

// 活动等级配置
const ACTIVITY_LEVELS = {
  very_low: { stepMultiplier: 0.5, activeHours: 4 },
  low: { stepMultiplier: 0.7, activeHours: 6 },
  medium: { stepMultiplier: 1.0, activeHours: 8 },
  high: { stepMultiplier: 1.3, activeHours: 10 },
  very_high: { stepMultiplier: 1.6, activeHours: 12 }
};

/**
 * 生成随机GPS轨迹（模拟宠物在某个区域内活动）
 */
function generateGPSTrack(date, hour, activityLevel) {
  const config = ACTIVITY_LEVELS[activityLevel];
  const startHour = 6;
  const endHour = startHour + config.activeHours;
  
  // 只在活动时间生成GPS数据
  if (hour < startHour || hour >= endHour) {
    return { lat: null, lng: null, height: 0, radius: 0 };
  }

  // 生成轨迹：在中心点周围随机游走
  const radius = 0.01; // 约1公里范围
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radius;

  const lat = CENTER_LAT + distance * Math.cos(angle);
  const lng = CENTER_LNG + distance * Math.sin(angle);

  // 模拟设备高度（单位：米）
  const height = 40 + Math.random() * 20;
  
  // 模拟定位精度半径（GPS定位误差，单位：米）
  const locationRadius = 5 + Math.random() * 10;

  return { lat, lng, height, radius: locationRadius };
}

/**
 * 生成模拟数据点
 */
function generateDataPoints(date, dayIndex) {
  const points = [];
  const config = ACTIVITY_LEVELS[PET_CONFIG.activityLevel];
  
  // 根据日期和 dailyVariation 调整每日步数
  const dayVariation = 1 + (Math.random() - 0.5) * PET_CONFIG.dailyVariation;
  const dailyBaseSteps = Math.floor(PET_CONFIG.baseSteps * dayVariation * config.stepMultiplier);
  
  // 每天生成24小时的数据，每小时一个数据点
  for (let hour = 0; hour < 24; hour++) {
    const timestamp = moment.tz(date, 'Asia/Shanghai')
      .hour(hour)
      .minute(Math.floor(Math.random() * 60))
      .utc()
      .toDate();

    // 累计步数（在活动时间内逐步增加）
    const cumulativeSteps = hour < 6 ? 0 : Math.floor(dailyBaseSteps * (hour - 5) / 18);

    // 模拟体表温度（根据物种不同，波动范围不同）
    const tempVariation = PET_CONFIG.species === 1 ? 0.3 : 0.2; // 狗的体温波动比猫大
    const temp = PET_CONFIG.baseTemp + (Math.random() * tempVariation * 2 - tempVariation);

    // 模拟气压
    const pressure = 1013 + (Math.random() * 20 - 10);

    // 模拟电池电压（逐渐降低）
    const batteryVoltage = 4.2 - (hour * 0.02) - (Math.random() * 0.1);

    // 模拟电量百分比
    const soc = Math.max(10, 100 - (hour * 3) - Math.floor(Math.random() * 5));

    // 模拟信号强度
    const rsrp = -70 - Math.floor(Math.random() * 30);

    // 生成GPS轨迹
    const gps = generateGPSTrack(date, hour, PET_CONFIG.activityLevel);
    
    // 计算DEM（高程数据，基于气压）
    const dem = gps.height ? parseFloat((pressure / 10 + gps.height * 0.1).toFixed(2)) : 0;

    // 活动时长分布（根据活动等级）
    const isActive = hour >= 6 && hour < (6 + config.activeHours);
    const t1 = isActive ? Math.floor(cumulativeSteps * 0.3) : 0; // 走路时长（秒）
    const t2 = isActive ? Math.floor(cumulativeSteps * 0.4) : 0; // 快走时长（秒）
    const t3 = isActive ? Math.floor(cumulativeSteps * 0.3) : 0; // 跑步时长（秒）

    points.push({
      measurement: 'pet_activity',
      tags: {
        petId: PET_ID
      },
      fields: {
        // 设备标识字段
        APPID: 'R002',
        CUSTOMER: 30584,
        DOMAIN: 2,
        SPECIES: PET_CONFIG.species,
        TID: 18200221,
        TRACKERID: 18200221,
        HICCID: '898608141623D0257989',
        ICCID: '898608141623D0257989',
        IMEI: '863000014000000',
        TRACKERBLEMACADR: '746f746f6f6f8f',
        HARDWAREVERSION: 7,
        SOFTWAREVERSION: 64,
        FLOWNUMBER: 1,
        LAMPINDICATE: 1,
        
        // 三轴加速度
        ACCELERATIONX: parseFloat((-5000 + Math.random() * 10000).toFixed(0)),
        ACCELERATIONY: parseFloat((-5000 + Math.random() * 10000).toFixed(0)),
        ACCELERATIONZ: parseFloat((-5000 + Math.random() * 10000).toFixed(0)),
        
        // 三轴角度
        ANGLEX: parseFloat((-90 + Math.random() * 180).toFixed(2)),
        ANGLEY: parseFloat((-90 + Math.random() * 180).toFixed(2)),
        ANGLEZ: parseFloat((-90 + Math.random() * 180).toFixed(2)),
        
        // 活动数据
        STEP: cumulativeSteps,
        STEPTH: 100,
        STEPLIMIT: 20272,
        STRIDE: 7076,
        T1: t1,
        T2: t2,
        T3: t3,
        TRACKINGMODE: isActive ? 1 : 0,
        
        // GPS定位字段
        LATITUDE: gps.lat,
        LONGITUDE: gps.lng,
        HEIGHT: gps.height,
        RADIUS: gps.radius,
        DEM: dem,
        LOCATIONTYPE: gps.lat ? 0 : null,
        
        // 环境传感器
        TEMP: parseFloat(temp.toFixed(3)),         // 温度（摄氏度）
        PRESS: parseFloat(pressure.toFixed(2)),    // 气压（百帕）
        STDPRESS: 1026,                            // 标准气压
        
        // 电源管理
        BATVOL: parseFloat(batteryVoltage.toFixed(3)), // 电池电压（伏）
        SOC: soc,                                      // 电量百分比
        
        // 通信数据
        RSRP: rsrp,                                // 信号强度
        MCC: 1120,                                 // 中国移动
        MNC: 0,
        LAC: 10072,
        CI: 1122079500,
        
        // 告警和消息
        TAMPERALARM: 1,
        MESSAGEID: 11,
        SOURCETYPE: 0
      },
      timestamp
    });
  }

  return points;
}

/**
 * 导入测试数据
 */
async function importTestData() {
  try {
    console.log('开始导入测试数据...');
    console.log(`宠物ID: ${PET_ID}`);
    console.log(`数据天数: ${DAYS} 天`);

    // 检查数据库是否存在
    const databases = await influx.getDatabaseNames();
    if (!databases.includes(process.env.INFLUX_DATABASE)) {
      console.log(`创建数据库: ${process.env.INFLUX_DATABASE}`);
      await influx.createDatabase(process.env.INFLUX_DATABASE);
    }

    let totalPoints = 0;

    // 生成最近N天的数据
    for (let i = DAYS - 1; i >= 0; i--) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      console.log(`\n生成 ${date} 的数据...`);

      const points = generateDataPoints(date, DAYS - i);
      await influx.writePoints(points);

      totalPoints += points.length;
      console.log(`✓ 成功写入 ${points.length} 条数据`);
    }

    console.log(`\n✅ 数据导入完成！`);
    console.log(`总计导入: ${totalPoints} 条数据`);
    console.log(`\n可以使用以下命令查询数据：`);
    console.log(`influx -database ${process.env.INFLUX_DATABASE} -execute "SELECT * FROM pet_activity WHERE petId='${PET_ID}' LIMIT 10"`);
    console.log(`\n或访问 API：`);
    console.log(`http://localhost:3001/api/report/${PET_ID}`);

  } catch (error) {
    console.error('❌ 导入数据失败:', error);
    process.exit(1);
  }
}

// 执行导入
importTestData().then(() => {
  console.log('\n程序执行完毕');
  process.exit(0);
});
