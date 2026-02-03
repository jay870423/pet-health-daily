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

const DAYS = 7;

// 10个不同的宠物配置 - 每个宠物有独特的特征和数据范围
const PETS = [
  {
    id: 'DOG001',
    name: '豆豆',
    species: 1, // 狗
    icon: '🐕',
    baseSteps: 2100,        // 低活跃度 - 对应图中 2100 步
    baseTemp: 38.5,
    activityLevel: 'low',
    location: { lat: 39.9042, lng: 116.4074 }, // 北京
    trackerid: 18200221,
    customer: 30584,
    dailyVariation: 0.1     // 每日变化小
  },
  {
    id: 'CAT001',
    name: '喵喵',
    species: 2, // 猫
    icon: '🐱',
    baseSteps: 5500,        // 中等活跃度
    baseTemp: 38.0,
    activityLevel: 'medium',
    location: { lat: 31.2304, lng: 121.4737 }, // 上海
    trackerid: 18200222,
    customer: 30585,
    dailyVariation: 0.2
  },
  {
    id: 'DOG002',
    name: '旺财',
    species: 1,
    icon: '🐕',
    baseSteps: 12000,       // 高活跃度
    baseTemp: 38.3,
    activityLevel: 'high',
    location: { lat: 22.5431, lng: 114.0579 }, // 深圳
    trackerid: 18200223,
    customer: 30586,
    dailyVariation: 0.15
  },
  {
    id: 'CAT002',
    name: '咪咪',
    species: 2,
    icon: '🐈',
    baseSteps: 1800,        // 非常低活跃度
    baseTemp: 38.2,
    activityLevel: 'very_low',
    location: { lat: 30.5728, lng: 104.0668 }, // 成都
    trackerid: 18200224,
    customer: 30587,
    dailyVariation: 0.05
  },
  {
    id: 'DOG003',
    name: '大黄',
    species: 1,
    icon: '🦮',
    baseSteps: 16000,       // 非常高活跃度
    baseTemp: 38.6,
    activityLevel: 'very_high',
    location: { lat: 23.1291, lng: 113.2644 }, // 广州
    trackerid: 18200225,
    customer: 30588,
    dailyVariation: 0.25
  },
  {
    id: 'CAT003',
    name: '小白',
    species: 2,
    icon: '🐱',
    baseSteps: 3200,        // 低-中活跃度
    baseTemp: 37.9,
    activityLevel: 'low',
    location: { lat: 29.8683, lng: 121.5440 }, // 宁波
    trackerid: 18200226,
    customer: 30589,
    dailyVariation: 0.12
  },
  {
    id: 'DOG004',
    name: '黑子',
    species: 1,
    icon: '🐕‍🦺',
    baseSteps: 8500,        // 中-高活跃度
    baseTemp: 38.4,
    activityLevel: 'high',
    location: { lat: 34.3416, lng: 108.9398 }, // 西安
    trackerid: 18200227,
    customer: 30590,
    dailyVariation: 0.18
  },
  {
    id: 'CAT004',
    name: '橘子',
    species: 2,
    icon: '🐈‍⬛',
    baseSteps: 6800,        // 中-高活跃度
    baseTemp: 38.1,
    activityLevel: 'medium',
    location: { lat: 30.2936, lng: 120.1614 }, // 杭州
    trackerid: 18200228,
    customer: 30591,
    dailyVariation: 0.22
  },
  {
    id: 'DOG005',
    name: '雪糕',
    species: 1,
    icon: '🐩',
    baseSteps: 4500,        // 低-中活跃度
    baseTemp: 38.2,
    activityLevel: 'medium',
    location: { lat: 26.0614, lng: 119.3061 }, // 福州
    trackerid: 18200229,
    customer: 30592,
    dailyVariation: 0.14
  },
  {
    id: 'CAT005',
    name: '芝麻',
    species: 2,
    icon: '🐱',
    baseSteps: 7200,        // 中-高活跃度
    baseTemp: 38.0,
    activityLevel: 'medium',
    location: { lat: 36.6512, lng: 117.1201 }, // 济南
    trackerid: 18200230,
    customer: 30593,
    dailyVariation: 0.16
  }
];

// 活动等级配置
const ACTIVITY_LEVELS = {
  very_low: { stepMultiplier: 0.5, activeHours: 4 },
  low: { stepMultiplier: 0.7, activeHours: 6 },
  medium: { stepMultiplier: 1.0, activeHours: 8 },
  high: { stepMultiplier: 1.3, activeHours: 10 },
  very_high: { stepMultiplier: 1.6, activeHours: 12 }
};

/**
 * 生成GPS轨迹
 */
function generateGPSTrack(pet, hour, activityLevel) {
  const config = ACTIVITY_LEVELS[activityLevel];
  const startHour = 6;
  const endHour = startHour + config.activeHours;
  
  // 只在活动时间生成GPS数据
  if (hour < startHour || hour >= endHour) {
    return { lat: null, lng: null, height: 0, radius: 0 };
  }

  // 在宠物位置周围随机游走
  const radius = 0.01; // 约1公里范围
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radius;

  const lat = pet.location.lat + distance * Math.cos(angle);
  const lng = pet.location.lng + distance * Math.sin(angle);

  const height = 40 + Math.random() * 20;
  const locationRadius = 5 + Math.random() * 10;

  return { lat, lng, height, radius: locationRadius };
}

/**
 * 生成单个宠物的数据点
 */
function generateDataPoints(pet, date, dayIndex) {
  const points = [];
  const config = ACTIVITY_LEVELS[pet.activityLevel];
  
  // 根据日期和宠物的 dailyVariation 调整每日步数
  const dayVariation = 1 + (Math.random() - 0.5) * pet.dailyVariation;
  const dailyBaseSteps = Math.floor(pet.baseSteps * dayVariation * config.stepMultiplier);
  
  // 每天24小时，每小时一个数据点
  for (let hour = 0; hour < 24; hour++) {
    const timestamp = moment.tz(date, 'Asia/Shanghai')
      .hour(hour)
      .minute(Math.floor(Math.random() * 60))
      .utc()
      .toDate();

    // 累计步数（活动时间内增长）
    const cumulativeSteps = hour < 6 ? 0 : Math.floor(dailyBaseSteps * (hour - 5) / 18);

    // 体温（根据物种基础值波动）- 狗的体温波动比猫大
    const tempVariation = pet.species === 1 ? 0.3 : 0.2;
    const temp = pet.baseTemp + (Math.random() * tempVariation * 2 - tempVariation);

    // 气压
    const pressure = 1013 + (Math.random() * 20 - 10);

    // 电池电压（逐渐降低）
    const batteryVoltage = 4.2 - (hour * 0.02) - (Math.random() * 0.1);

    // 电量百分比
    const soc = Math.max(10, 100 - (hour * 3) - Math.floor(Math.random() * 5));

    // 信号强度
    const rsrp = -70 - Math.floor(Math.random() * 30);

    // GPS轨迹
    const gps = generateGPSTrack(pet, hour, pet.activityLevel);
    
    // 高程数据
    const dem = gps.height ? parseFloat((pressure / 10 + gps.height * 0.1).toFixed(2)) : 0;

    // 活动时长（根据活动等级）
    const isActive = hour >= 6 && hour < (6 + config.activeHours);
    const t1 = isActive ? Math.floor(cumulativeSteps * 0.3) : 0; // 走路
    const t2 = isActive ? Math.floor(cumulativeSteps * 0.4) : 0; // 快走
    const t3 = isActive ? Math.floor(cumulativeSteps * 0.3) : 0; // 跑步

    points.push({
      measurement: 'pet_activity',
      tags: {
        petId: pet.id
      },
      fields: {
        // 设备标识
        APPID: 'R002',
        CUSTOMER: pet.customer,
        DOMAIN: 2,
        SPECIES: pet.species,
        TID: pet.trackerid,
        TRACKERID: pet.trackerid,
        HICCID: `89860814162${pet.trackerid}`,
        ICCID: `89860814162${pet.trackerid}`,
        IMEI: `86300001400${pet.trackerid}`,
        TRACKERBLEMACADR: `746f746f6f${pet.trackerid.toString(16)}`,
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
        
        // GPS定位
        LATITUDE: gps.lat,
        LONGITUDE: gps.lng,
        HEIGHT: gps.height,
        RADIUS: gps.radius,
        DEM: dem,
        LOCATIONTYPE: gps.lat ? 0 : null,
        
        // 环境传感器
        TEMP: parseFloat(temp.toFixed(3)),
        PRESS: parseFloat(pressure.toFixed(2)),
        STDPRESS: 1026,
        
        // 电源管理
        BATVOL: parseFloat(batteryVoltage.toFixed(3)),
        SOC: soc,
        
        // 通信数据
        RSRP: rsrp,
        MCC: 1120,
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
 * 导入所有宠物的测试数据
 */
async function importAllPetsData() {
  try {
    console.log('🐾 开始导入多物种测试数据...\n');
    console.log(`物种数量: ${PETS.length}`);
    console.log(`数据天数: ${DAYS} 天\n`);

    // 检查数据库
    const databases = await influx.getDatabaseNames();
    if (!databases.includes(process.env.INFLUX_DATABASE)) {
      console.log(`📊 创建数据库: ${process.env.INFLUX_DATABASE}`);
      await influx.createDatabase(process.env.INFLUX_DATABASE);
    }

    let totalPoints = 0;

    // 为每个宠物生成数据
    for (const pet of PETS) {
      console.log(`\n${pet.icon} ${pet.name} (${pet.id})`);
      console.log(`   物种: ${pet.species === 1 ? '🐕 狗' : '🐱 猫'}`);
      console.log(`   活动等级: ${pet.activityLevel}`);
      console.log(`   位置: ${pet.location.lat.toFixed(4)}, ${pet.location.lng.toFixed(4)}`);
      
      let petPoints = 0;

      // 生成最近N天的数据
      for (let i = DAYS - 1; i >= 0; i--) {
        const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
        const points = generateDataPoints(pet, date, DAYS - i);
        await influx.writePoints(points);
        petPoints += points.length;
      }

      totalPoints += petPoints;
      console.log(`   ✓ 成功写入 ${petPoints} 条数据`);
    }

    console.log(`\n✅ 数据导入完成！`);
    console.log(`总计导入: ${totalPoints} 条数据 (${PETS.length} 个宠物 × ${DAYS} 天 × 24 小时)`);
    
    console.log(`\n📋 宠物列表：`);
    PETS.forEach(pet => {
      console.log(`   ${pet.icon} ${pet.name} - ID: ${pet.id} - 物种: ${pet.species}`);
    });

    console.log(`\n🔍 查询示例：`);
    console.log(`influx -database ${process.env.INFLUX_DATABASE} -execute "SELECT * FROM pet_activity WHERE petId='${PETS[0].id}' LIMIT 5"`);
    console.log(`\n🌐 访问 API：`);
    console.log(`http://localhost:3001/api/report/${PETS[0].id}`);

  } catch (error) {
    console.error('❌ 导入数据失败:', error);
    process.exit(1);
  }
}

// 执行导入
importAllPetsData().then(() => {
  console.log('\n程序执行完毕');
  process.exit(0);
});
