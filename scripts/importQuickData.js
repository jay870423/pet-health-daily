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

const DAYS = 3; // 3天数据

// 10个宠物完整配置 - 每个宠物有不同的特征和数据范围
const PETS = [
  {
    id: 'DOG001',
    name: '豆豆',
    species: 1,
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
    species: 2,
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

const ACTIVITY_LEVELS = {
  very_low: { stepMultiplier: 0.5, activeHours: 4 },
  low: { stepMultiplier: 0.7, activeHours: 6 },
  medium: { stepMultiplier: 1.0, activeHours: 8 },
  high: { stepMultiplier: 1.3, activeHours: 10 },
  very_high: { stepMultiplier: 1.6, activeHours: 12 }
};

function generateGPSTrack(pet, hour, activityLevel) {
  const config = ACTIVITY_LEVELS[activityLevel];
  const startHour = 6;
  const endHour = startHour + config.activeHours;
  
  if (hour < startHour || hour >= endHour) {
    return { lat: null, lng: null, height: 0, radius: 0 };
  }

  const radius = 0.01;
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radius;

  const lat = pet.location.lat + distance * Math.cos(angle);
  const lng = pet.location.lng + distance * Math.sin(angle);

  const height = 40 + Math.random() * 20;
  const locationRadius = 5 + Math.random() * 10;

  return { lat, lng, height, radius: locationRadius };
}

function generateDataPoints(pet, date, dayIndex) {
  const points = [];
  const config = ACTIVITY_LEVELS[pet.activityLevel];
  
  // 根据日期和宠物的 dailyVariation 调整每日步数
  const dayVariation = 1 + (Math.random() - 0.5) * pet.dailyVariation;
  const dailyBaseSteps = Math.floor(pet.baseSteps * dayVariation * config.stepMultiplier);
  
  // 每天24小时
  for (let hour = 0; hour < 24; hour++) {
    const timestamp = moment.tz(date, 'Asia/Shanghai')
      .hour(hour)
      .minute(Math.floor(Math.random() * 60))
      .utc()
      .toDate();

    // 累计步数：在活动时间内逐步累加
    const cumulativeSteps = hour < 6 ? 0 : Math.floor(dailyBaseSteps * (hour - 5) / 18);
    
    // 体温变化：根据宠物基础体温和时间波动
    const tempVariation = pet.species === 1 ? 0.3 : 0.2; // 狗的体温波动比猫大
    const temp = pet.baseTemp + (Math.random() * tempVariation * 2 - tempVariation);
    
    // 气压变化
    const pressure = 1013 + (Math.random() * 20 - 10);
    
    // 电池电量随时间降低
    const batteryVoltage = 4.2 - (hour * 0.02) - (Math.random() * 0.1);
    const soc = Math.max(10, 100 - (hour * 3) - Math.floor(Math.random() * 5));
    
    // 信号强度
    const rsrp = -70 - Math.floor(Math.random() * 30);
    
    // GPS轨迹
    const gps = generateGPSTrack(pet, hour, pet.activityLevel);
    const dem = gps.height ? parseFloat((pressure / 10 + gps.height * 0.1).toFixed(2)) : 0;

    // 活动时长分布
    const isActive = hour >= 6 && hour < (6 + config.activeHours);
    const t1 = isActive ? Math.floor(cumulativeSteps * 0.3) : 0;
    const t2 = isActive ? Math.floor(cumulativeSteps * 0.4) : 0;
    const t3 = isActive ? Math.floor(cumulativeSteps * 0.3) : 0;

    const fields = {
      CUSTOMER: pet.customer,
      DOMAIN: 2,
      SPECIES: pet.species,
      TID: pet.trackerid,
      TRACKERID: pet.trackerid,
      HARDWAREVERSION: 7,
      SOFTWAREVERSION: 64,
      FLOWNUMBER: 1,
      LAMPINDICATE: 1,
      ACCELERATIONX: Math.floor(-5000 + Math.random() * 10000),
      ACCELERATIONY: Math.floor(-5000 + Math.random() * 10000),
      ACCELERATIONZ: Math.floor(-5000 + Math.random() * 10000),
      ANGLEX: parseFloat((-90 + Math.random() * 180).toFixed(2)),
      ANGLEY: parseFloat((-90 + Math.random() * 180).toFixed(2)),
      ANGLEZ: parseFloat((-90 + Math.random() * 180).toFixed(2)),
      STEP: cumulativeSteps,
      STEPTH: 100,
      STEPLIMIT: 20272,
      STRIDE: 7076,
      T1: t1,
      T2: t2,
      T3: t3,
      TRACKINGMODE: isActive ? 1 : 0,
      TEMP: parseFloat(temp.toFixed(3)),
      PRESS: parseFloat(pressure.toFixed(2)),
      STDPRESS: 1026,
      BATVOL: parseFloat(batteryVoltage.toFixed(3)),
      SOC: soc,
      RSRP: rsrp,
      MCC: 1120,
      MNC: 0,
      LAC: 10072,
      CI: 1122079500,
      TAMPERALARM: 1,
      MESSAGEID: 11,
      SOURCETYPE: 0
    };

    // 只在有GPS数据时添加GPS字段
    if (gps.lat && gps.lng) {
      fields.LATITUDE = gps.lat;
      fields.LONGITUDE = gps.lng;
      fields.HEIGHT = gps.height;
      fields.RADIUS = gps.radius;
      fields.DEM = dem;
      fields.LOCATIONTYPE = 0;
    }

    points.push({
      measurement: 'pet_activity',
      tags: { petId: pet.id },
      fields,
      timestamp
    });
  }

  return points;
}

async function importAllPetsData() {
  const startTime = Date.now();
  
  try {
    console.log('🐾 快速导入测试数据...\n');
    console.log(`宠物数量: ${PETS.length}`);
    console.log(`数据天数: ${DAYS} 天`);
    console.log(`预计数据量: ${PETS.length * DAYS * 24} 条\n`);

    const databases = await influx.getDatabaseNames();
    if (!databases.includes(process.env.INFLUX_DATABASE)) {
      console.log(`📊 创建数据库: ${process.env.INFLUX_DATABASE}`);
      await influx.createDatabase(process.env.INFLUX_DATABASE);
    }

    let totalPoints = 0;

    for (let petIndex = 0; petIndex < PETS.length; petIndex++) {
      const pet = PETS[petIndex];
      const percentage = Math.floor((petIndex / PETS.length) * 100);
      
      process.stdout.write(`\r正在导入: ${pet.icon} ${pet.name} [${percentage}%]`);
      
      let petPoints = 0;
      for (let i = DAYS - 1; i >= 0; i--) {
        const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
        const points = generateDataPoints(pet, date, DAYS - i);
        await influx.writePoints(points);
        petPoints += points.length;
      }

      totalPoints += petPoints;
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`\r\n\n✅ 数据导入完成！`);
    console.log(`总计: ${totalPoints} 条数据`);
    console.log(`耗时: ${elapsed} 秒\n`);
    
    console.log(`📋 宠物列表（${PETS.length}个）：`);
    PETS.forEach(pet => {
      console.log(`   ${pet.icon} ${pet.name} (${pet.id}) - ${pet.species === 1 ? '狗' : '猫'}`);
    });

    console.log(`\n🌐 启动服务后访问: http://localhost:3000`);

  } catch (error) {
    console.error('\n❌ 导入失败:', error.message);
    process.exit(1);
  }
}

importAllPetsData().then(() => {
  console.log('\n程序执行完毕');
  process.exit(0);
});
