# InfluxQL 查询示例

本文档提供常用的 InfluxQL 查询示例，帮助您快速上手数据查询。

## 基础查询

### 查询最新一条数据
```sql
SELECT * FROM pet_activity 
WHERE "petId" = '221' 
ORDER BY time DESC 
LIMIT 1
```

### 查询指定日期的所有数据
```sql
SELECT * FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= '2026-02-02T00:00:00Z' 
  AND time <= '2026-02-02T23:59:59Z'
ORDER BY time ASC
```

### 查询最近24小时数据
```sql
SELECT * FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= now() - 24h
ORDER BY time DESC
```

## GPS轨迹查询

### 查询指定日期的GPS轨迹
```sql
SELECT time, LATITUDE, LONGITUDE, HEIGHT, DEM, RADIUS, STEP 
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= '2026-02-02T00:00:00Z' 
  AND time <= '2026-02-02T23:59:59Z'
  AND LATITUDE IS NOT NULL 
  AND LONGITUDE IS NOT NULL
ORDER BY time ASC
```

### 查询高精度GPS点（定位半径<10米）
```sql
SELECT time, LATITUDE, LONGITUDE, RADIUS 
FROM pet_activity 
WHERE "petId" = '221' 
  AND RADIUS < 10
  AND LATITUDE IS NOT NULL
  AND time >= now() - 7d
ORDER BY time DESC
```

### 查询活动时段的GPS轨迹
```sql
SELECT time, LATITUDE, LONGITUDE, STEP, T1, T2, T3 
FROM pet_activity 
WHERE "petId" = '221' 
  AND TRACKINGMODE = 1
  AND LATITUDE IS NOT NULL
  AND time >= '2026-02-02T00:00:00Z'
ORDER BY time ASC
```

## 活动统计查询

### 查询当天活动数据
```sql
SELECT 
  MAX(STEP) as total_steps,
  LAST(T1) as walk_seconds,
  LAST(T2) as jog_seconds,
  LAST(T3) as run_seconds
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= now() - 24h
```

### 查询每小时步数变化
```sql
SELECT 
  MEAN(STEP) as avg_steps,
  MAX(STEP) as max_steps
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= now() - 24h
GROUP BY time(1h)
```

### 查询活动强度分布
```sql
SELECT 
  SUM(T1) as total_walk_time,
  SUM(T2) as total_jog_time,
  SUM(T3) as total_run_time
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= '2026-02-02T00:00:00Z' 
  AND time <= '2026-02-02T23:59:59Z'
GROUP BY time(1h)
```

## 健康数据查询

### 查询体温变化趋势
```sql
SELECT 
  time,
  TEMP,
  MEAN(TEMP) as avg_temp
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= now() - 7d
GROUP BY time(1h)
ORDER BY time DESC
```

### 查询异常体温记录（>39°C或<36°C）
```sql
SELECT time, TEMP 
FROM pet_activity 
WHERE "petId" = '221' 
  AND (TEMP > 39 OR TEMP < 36)
  AND time >= now() - 7d
ORDER BY time DESC
```

### 查询气压变化（用于高度估算）
```sql
SELECT 
  time,
  PRESS,
  STDPRESS,
  HEIGHT,
  DEM
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= '2026-02-02T00:00:00Z'
ORDER BY time ASC
```

## 设备状态查询

### 查询电池电量变化
```sql
SELECT 
  time,
  BATVOL,
  SOC
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= now() - 24h
ORDER BY time DESC
```

### 查询低电量记录（<20%）
```sql
SELECT time, SOC, BATVOL 
FROM pet_activity 
WHERE "petId" = '221' 
  AND SOC < 20
  AND time >= now() - 7d
ORDER BY time DESC
```

### 查询信号强度统计
```sql
SELECT 
  MEAN(RSRP) as avg_signal,
  MIN(RSRP) as worst_signal,
  MAX(RSRP) as best_signal
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= now() - 24h
```

### 查询弱信号时段（RSRP < -100）
```sql
SELECT time, RSRP, MCC, MNC, LAC, CI 
FROM pet_activity 
WHERE "petId" = '221' 
  AND RSRP < -100
  AND time >= now() - 24h
ORDER BY time DESC
```

## 传感器数据查询

### 查询三轴加速度数据
```sql
SELECT 
  time,
  ACCELERATIONX,
  ACCELERATIONY,
  ACCELERATIONZ
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= '2026-02-02T00:00:00Z' 
  AND time <= '2026-02-02T01:00:00Z'
ORDER BY time ASC
```

### 查询三轴角度数据
```sql
SELECT 
  time,
  ANGLEX,
  ANGLEY,
  ANGLEZ
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= now() - 1h
ORDER BY time DESC
```

### 查询运动模式变化
```sql
SELECT 
  time,
  TRACKINGMODE,
  STEP,
  ACCELERATIONX,
  ACCELERATIONY,
  ACCELERATIONZ
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= now() - 24h
ORDER BY time DESC
```

## 复杂统计查询

### 每日活动汇总
```sql
SELECT 
  MAX(STEP) as daily_steps,
  LAST(T1) as walk_time,
  LAST(T2) as jog_time,
  LAST(T3) as run_time,
  MEAN(TEMP) as avg_temp,
  MIN(SOC) as min_battery,
  COUNT(LATITUDE) as gps_points
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= now() - 7d
GROUP BY time(1d)
ORDER BY time DESC
```

### 近7天步数对比
```sql
SELECT 
  MAX(STEP) as daily_steps
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= now() - 7d
GROUP BY time(1d)
ORDER BY time DESC
```

### GPS覆盖率统计
```sql
SELECT 
  COUNT(*) as total_records,
  COUNT(LATITUDE) as gps_records,
  COUNT(LATITUDE) * 100.0 / COUNT(*) as gps_coverage_percent
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= now() - 24h
```

### 活动强度分级统计
```sql
SELECT 
  SUM(CASE WHEN T1 > 0 THEN 1 ELSE 0 END) as walk_periods,
  SUM(CASE WHEN T2 > 0 THEN 1 ELSE 0 END) as jog_periods,
  SUM(CASE WHEN T3 > 0 THEN 1 ELSE 0 END) as run_periods
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= '2026-02-02T00:00:00Z' 
  AND time <= '2026-02-02T23:59:59Z'
```

## 数据质量检查

### 检查缺失字段
```sql
SELECT 
  COUNT(*) as total,
  COUNT(LATITUDE) as has_gps,
  COUNT(TEMP) as has_temp,
  COUNT(STEP) as has_step
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= now() - 24h
```

### 查询异常值
```sql
SELECT 
  time,
  STEP,
  TEMP,
  BATVOL,
  SOC,
  RSRP
FROM pet_activity 
WHERE "petId" = '221' 
  AND (
    STEP < 0 OR STEP > 100000 OR
    TEMP < 30 OR TEMP > 45 OR
    BATVOL < 3.0 OR BATVOL > 5.0 OR
    SOC < 0 OR SOC > 100
  )
  AND time >= now() - 7d
ORDER BY time DESC
```

### 查询数据采集频率
```sql
SELECT 
  COUNT(*) as data_points,
  MAX(time) - MIN(time) as time_span
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= now() - 24h
```

## 设备信息查询

### 查询设备固件版本
```sql
SELECT 
  HARDWAREVERSION,
  SOFTWAREVERSION,
  COUNT(*) as count
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= now() - 7d
GROUP BY HARDWAREVERSION, SOFTWAREVERSION
```

### 查询设备标识信息
```sql
SELECT 
  APPID,
  CUSTOMER,
  DOMAIN,
  SPECIES,
  TRACKERID,
  IMEI,
  ICCID
FROM pet_activity 
WHERE "petId" = '221' 
ORDER BY time DESC 
LIMIT 1
```

### 查询触发消息类型分布
```sql
SELECT 
  TAMPERALARM,
  MESSAGEID,
  COUNT(*) as count
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= now() - 24h
GROUP BY TAMPERALARM, MESSAGEID
ORDER BY count DESC
```

## 时间转换

### UTC转本地时间（中国）
```sql
SELECT 
  time + 8h as beijing_time,
  STEP,
  TEMP
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= now() - 24h
ORDER BY time DESC
LIMIT 10
```

### 查询特定时间段（北京时间9:00-18:00）
```sql
-- 需要将北京时间转换为UTC时间查询
SELECT * FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= '2026-02-02T01:00:00Z'  -- 北京时间9:00
  AND time <= '2026-02-02T10:00:00Z'  -- 北京时间18:00
ORDER BY time ASC
```

## 性能优化建议

### 1. 使用时间范围限制
```sql
-- ❌ 不推荐：没有时间限制
SELECT * FROM pet_activity WHERE "petId" = '221'

-- ✅ 推荐：限制时间范围
SELECT * FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= now() - 7d
```

### 2. 使用聚合函数减少数据量
```sql
-- ❌ 不推荐：查询所有原始数据
SELECT * FROM pet_activity WHERE time >= now() - 30d

-- ✅ 推荐：使用GROUP BY聚合
SELECT MAX(STEP), MEAN(TEMP) 
FROM pet_activity 
WHERE time >= now() - 30d
GROUP BY time(1d)
```

### 3. 只查询需要的字段
```sql
-- ❌ 不推荐：SELECT *
SELECT * FROM pet_activity

-- ✅ 推荐：只查询需要的字段
SELECT time, STEP, TEMP, SOC 
FROM pet_activity
```

## 常见问题

### Q1: 为什么STEP是累计值？

A: STEP字段存储的是当天累计步数，需要通过MAX()获取日总步数：
```sql
SELECT MAX(STEP) as daily_total FROM pet_activity 
WHERE "petId" = '221' AND time >= '2026-02-02T00:00:00Z'
```

### Q2: 如何计算总活动时长？

A: T1/T2/T3单位为秒，需要累加并转换为分钟：
```sql
SELECT 
  (LAST(T1) + LAST(T2) + LAST(T3)) / 60.0 as total_active_minutes
FROM pet_activity 
WHERE "petId" = '221' AND time >= now() - 24h
```

### Q3: GPS坐标是什么坐标系？

A: LATITUDE/LONGITUDE通常是WGS84或GCJ02坐标系。使用百度地图时需要转换为BD09坐标系。

### Q4: 如何判断设备在线状态？

A: 检查最新数据的时间戳：
```sql
SELECT 
  time,
  now() - time as offline_duration
FROM pet_activity 
WHERE "petId" = '221' 
ORDER BY time DESC 
LIMIT 1
```

如果 offline_duration > 30分钟，可能设备离线。

## 相关工具

### InfluxDB CLI
```bash
# 进入InfluxDB命令行
influx

# 选择数据库
USE pet_health

# 执行查询
SELECT * FROM pet_activity LIMIT 10

# 退出
exit
```

### HTTP API
```bash
# 使用curl查询
curl -G 'http://localhost:8086/query' \
  --data-urlencode "db=pet_health" \
  --data-urlencode "q=SELECT * FROM pet_activity WHERE petId='221' LIMIT 10"
```

## 相关文档

- [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) - 完整表结构说明
- [InfluxDB 1.8 InfluxQL文档](https://docs.influxdata.com/influxdb/v1.8/query_language/)
- [QUICKSTART.md](../QUICKSTART.md) - 快速开始指南
