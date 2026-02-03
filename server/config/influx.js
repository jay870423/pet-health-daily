const Influx = require('influx');
require('dotenv').config();

const influx = new Influx.InfluxDB({
  host: process.env.INFLUX_HOST || 'localhost',
  port: parseInt(process.env.INFLUX_PORT || '8086'),
  database: process.env.INFLUX_DATABASE || 'pet_health',
  username: process.env.INFLUX_USERNAME,
  password: process.env.INFLUX_PASSWORD,
  schema: [
    {
      measurement: 'pet_activity',
      fields: {
        // 设备标识字段
        APPID: Influx.FieldType.STRING,
        CUSTOMER: Influx.FieldType.INTEGER,
        DOMAIN: Influx.FieldType.INTEGER,
        SPECIES: Influx.FieldType.INTEGER,
        TID: Influx.FieldType.INTEGER,
        TRACKERID: Influx.FieldType.INTEGER,
        HICCID: Influx.FieldType.STRING,
        ICCID: Influx.FieldType.STRING,
        IMEI: Influx.FieldType.STRING,
        TRACKERBLEMACADR: Influx.FieldType.STRING,
        HARDWAREVERSION: Influx.FieldType.INTEGER,
        SOFTWAREVERSION: Influx.FieldType.INTEGER,
        FLOWNUMBER: Influx.FieldType.INTEGER,
        LAMPINDICATE: Influx.FieldType.INTEGER,
        
        // 三轴加速度
        ACCELERATIONX: Influx.FieldType.FLOAT,
        ACCELERATIONY: Influx.FieldType.FLOAT,
        ACCELERATIONZ: Influx.FieldType.FLOAT,
        
        // 三轴角度
        ANGLEX: Influx.FieldType.FLOAT,
        ANGLEY: Influx.FieldType.FLOAT,
        ANGLEZ: Influx.FieldType.FLOAT,
        
        // 活动数据
        STEP: Influx.FieldType.INTEGER,          // 计步总数
        STEPTH: Influx.FieldType.INTEGER,        // 上报步数阈值
        STEPLIMIT: Influx.FieldType.INTEGER,     // 寄存器配置（保留）
        STRIDE: Influx.FieldType.INTEGER,        // 寄存器配置（保留）
        T1: Influx.FieldType.INTEGER,            // 走路时长（秒）
        T2: Influx.FieldType.INTEGER,            // 快走时长（秒）
        T3: Influx.FieldType.INTEGER,            // 跑步时长（秒）
        TRACKINGMODE: Influx.FieldType.INTEGER,  // 当前运动状态
        
        // GPS定位字段
        LATITUDE: Influx.FieldType.FLOAT,        // 纬度
        LONGITUDE: Influx.FieldType.FLOAT,       // 经度
        HEIGHT: Influx.FieldType.FLOAT,          // 设备高度计算值（米）
        RADIUS: Influx.FieldType.FLOAT,          // 定位半径（米）
        DEM: Influx.FieldType.FLOAT,             // 高程数据（米）
        LOCATIONTYPE: Influx.FieldType.INTEGER,  // 定位类型
        
        // 环境传感器
        TEMP: Influx.FieldType.FLOAT,            // 温度（摄氏度）
        PRESS: Influx.FieldType.FLOAT,           // 气压（百帕）
        STDPRESS: Influx.FieldType.FLOAT,        // 当地标准气压值（百帕）
        
        // 电源管理
        BATVOL: Influx.FieldType.FLOAT,          // 电池电压（伏）
        SOC: Influx.FieldType.INTEGER,           // 电量百分比（%）
        
        // 通信数据
        RSRP: Influx.FieldType.INTEGER,          // 信号强度（dBm）
        MCC: Influx.FieldType.INTEGER,           // 移动国家代码
        MNC: Influx.FieldType.INTEGER,           // 移动网络号码
        LAC: Influx.FieldType.INTEGER,           // 位置区域码
        CI: Influx.FieldType.INTEGER,            // 基站编号
        
        // 告警和消息
        TAMPERALARM: Influx.FieldType.INTEGER,   // 触发消息类别
        MESSAGEID: Influx.FieldType.INTEGER,     // 定位消息类别
        SOURCETYPE: Influx.FieldType.INTEGER     // 数据源类型
      },
      tags: [
        'petId'
      ]
    }
  ]
});

module.exports = influx;
