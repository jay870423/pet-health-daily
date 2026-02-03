# InfluxDB 数据库表结构说明

## 数据库信息
- **数据库名称**: pet_health
- **Measurement**: pet_activity
- **InfluxDB 版本**: 1.8

## Tag 字段

| Tag名称 | 说明 | 示例值 |
|---------|------|--------|
| petId | 宠物ID（用于查询过滤） | "221" |

## Field 字段

### 设备标识字段

| 字段名 | 类型 | 说明 | 示例值 | 单位 |
|--------|------|------|--------|------|
| APPID | String | 项目ID | "R002" | - |
| CUSTOMER | Integer | 客户ID | 30584 | - |
| DOMAIN | Integer | 域名ID | 2 | - |
| SPECIES | Integer | 物种ID | 2 | - |
| TID | Integer | 设备ID | 18200221 | - |
| TRACKERID | Integer | 跟踪器ID | 18200221 | - |
| HICCID | String | ICCID（高位） | "898608141623D0257989" | - |
| ICCID | String | ICCID | "898608141623D0257989" | - |
| IMEI | String | IMEI号 | "863000014000000" | - |
| TRACKERBLEMACADR | String | 蓝牙MAC地址 | "746f746f6f6f8f" | - |
| HARDWAREVERSION | Integer | 硬件版本 | 7 | - |
| SOFTWAREVERSION | Integer | 软件版本 | 64 | - |
| FLOWNUMBER | Integer | 流水号 | 1 | - |
| LAMPINDICATE | Integer | 呼吸灯状态签名 | 1 | - |

### 传感器数据字段

#### 三轴加速度
| 字段名 | 类型 | 说明 | 示例值 | 单位 |
|--------|------|------|--------|------|
| ACCELERATIONX | Float | 三轴数据值X | -4525 | - |
| ACCELERATIONY | Float | 三轴数据值Y | 593 | - |
| ACCELERATIONZ | Float | 三轴数据值Z | -998 | - |

#### 三轴角度
| 字段名 | 类型 | 说明 | 示例值 | 单位 |
|--------|------|------|--------|------|
| ANGLEX | Float | 三轴角度值X | -75.61 | 度 |
| ANGLEY | Float | 三轴角度值Y | 7.29 | 度 |
| ANGLEZ | Float | 三轴角度值Z | -12.34 | 度 |

### 活动数据字段

| 字段名 | 类型 | 说明 | 示例值 | 单位 |
|--------|------|------|--------|------|
| STEP | Integer | 计步总数 | 2170 | 步 |
| STEPTH | Integer | 上报步数阈值 | 100 | 步 |
| STEPLIMIT | Integer | 寄存器配置（保留） | 20272 | 步 |
| STRIDE | Integer | 寄存器配置（保留） | 7076 | 步 |
| T1 | Integer | 走路时长 | 29 | 秒 |
| T2 | Integer | 快走时长 | 39 | 秒 |
| T3 | Integer | 跑步时长 | 134 | 秒 |
| TRACKINGMODE | Integer | 当前运动状态 | 1 | - |

**活动时长说明**：
- T1: 慢速行走时长（秒）
- T2: 快速行走/慢跑时长（秒）
- T3: 快速跑步时长（秒）

### GPS定位字段

| 字段名 | 类型 | 说明 | 示例值 | 单位 |
|--------|------|------|--------|------|
| LATITUDE | Float | 纬度 | 30.2500722 | 度 |
| LONGITUDE | Float | 经度 | 120.0246134 | 度 |
| HEIGHT | Float | 设备高度计算值 | 30 | 米 |
| RADIUS | Float | 定位半径（精度） | 30 | 米 |
| DEM | Float | 高程数据 | 11.33 | 米 |
| LOCATIONTYPE | Integer | 定位类型 | 0 | - |

**定位说明**：
- LATITUDE/LONGITUDE: WGS84/GCJ02坐标系
- HEIGHT: 设备计算的高度值
- RADIUS: GPS定位精度半径，值越小精度越高
- DEM: Digital Elevation Model（数字高程模型）

### 环境传感器字段

| 字段名 | 类型 | 说明 | 示例值 | 单位 |
|--------|------|------|--------|------|
| TEMP | Float | 温度 | 17.531 | 摄氏度 |
| PRESS | Float | 气压 | 1030.05 | 百帕 |
| STDPRESS | Float | 当地标准气压值 | 1026 | 百帕 |

### 电源管理字段

| 字段名 | 类型 | 说明 | 示例值 | 单位 |
|--------|------|------|--------|------|
| BATVOL | Float | 电池电压 | 3.679 | 伏 |
| SOC | Integer | 电量百分比 | 55 | % |

### 通信数据字段

| 字段名 | 类型 | 说明 | 示例值 | 单位 |
|--------|------|------|--------|------|
| RSRP | Integer | 信号强度 | -69 | dBm |
| MCC | Integer | 移动国家代码 | 1120 | - |
| MNC | Integer | 移动网络号码 | 0 | - |
| LAC | Integer | 位置区域码 | 10072 | - |
| CI | Integer | 基站编号 | 1122079500 | - |

**信号强度说明**：
- -50 ~ -70 dBm: 信号优秀
- -70 ~ -85 dBm: 信号良好
- -85 ~ -100 dBm: 信号较弱
- < -100 dBm: 信号很差

### 告警和消息字段

| 字段名 | 类型 | 说明 | 示例值 | 单位 |
|--------|------|------|--------|------|
| TAMPERALARM | Integer | 触发消息类别 | 1 | - |
| MESSAGEID | Integer | 定位消息类别 | 11 | - |
| SOURCETYPE | Integer | 数据源类型 | 0 | - |

**TAMPERALARM说明**：
- 0x00: 定时触发
- 0x01: 运动触发
- 0x06: 开机触发

## 时间字段

- **time**: InfluxDB内置时间戳（UTC时间）
- 查询时建议使用 `Asia/Shanghai` 时区转换

## 查询示例

### 查询指定日期的所有数据
```sql
SELECT * FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= '2026-01-26T00:00:00Z' 
  AND time <= '2026-01-26T23:59:59Z'
ORDER BY time ASC
```

### 查询GPS轨迹数据
```sql
SELECT time, LATITUDE, LONGITUDE, HEIGHT, DEM, RADIUS, STEP 
FROM pet_activity 
WHERE "petId" = '221' 
  AND LATITUDE IS NOT NULL 
  AND LONGITUDE IS NOT NULL
  AND time >= '2026-01-26T00:00:00Z' 
  AND time <= '2026-01-26T23:59:59Z'
ORDER BY time ASC
```

### 查询当天活动统计
```sql
SELECT 
  MAX(STEP) as total_steps,
  LAST(T1) as walk_time,
  LAST(T2) as jog_time,
  LAST(T3) as run_time,
  MEAN(TEMP) as avg_temp,
  MEAN(SOC) as avg_battery
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= now() - 24h
```

### 查询最新设备状态
```sql
SELECT * FROM pet_activity 
WHERE "petId" = '221' 
ORDER BY time DESC 
LIMIT 1
```

## 数据采集频率

根据客户实际数据，推测采集频率：
- **GPS数据**: 活动时段（6:00-22:00）每小时1-2个点
- **活动数据**: 连续累计（STEP为累计值）
- **传感器数据**: 实时采集
- **电池数据**: 随每次上报更新

## 注意事项

1. **累计字段**: STEP、T1、T2、T3 是累计值，不是增量值
2. **NULL处理**: GPS字段在非活动时段可能为NULL
3. **精度**: 温度精度到0.001℃，GPS精度到小数点后7位
4. **坐标系**: 百度地图需要坐标转换（WGS84→BD09）
5. **时区**: InfluxDB存储UTC时间，查询时需转换为本地时区

## 系统配置

在 `.env` 文件中配置数据库连接：

```env
# InfluxDB配置
INFLUX_HOST=localhost
INFLUX_PORT=8086
INFLUX_DATABASE=pet_health
INFLUX_USERNAME=admin
INFLUX_PASSWORD=admin123
```

## 相关文档

- [InfluxDB 1.8 官方文档](https://docs.influxdata.com/influxdb/v1.8/)
- [百度地图API文档](https://lbsyun.baidu.com/index.php?title=jspopularGL)
- [项目快速开始](../QUICKSTART.md)
