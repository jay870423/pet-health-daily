# 字段映射快速参考

本文档提供客户表结构与系统代码的字段映射关系。

## 📋 完整字段列表

### 设备标识字段 (14个)

| 字段名 | 类型 | 说明 | 客户表示例值 | 代码中使用 |
|--------|------|------|-------------|-----------|
| APPID | String | 项目ID | R002 | ✅ |
| CUSTOMER | Integer | 客户ID | 30584 | ✅ |
| DOMAIN | Integer | 域名ID | 2 | ✅ |
| SPECIES | Integer | 物种ID | 2 | ✅ |
| TID | Integer | 设备ID | 18200221 | ✅ |
| TRACKERID | Integer | 跟踪器ID | 18200221 | ✅ |
| HICCID | String | ICCID(高位) | 898608141623D0257989 | ✅ |
| ICCID | String | ICCID | 898608141623D0257989 | ✅ |
| IMEI | String | IMEI号 | 8.63E+14 | ✅ |
| TRACKERBLEMACADR | String | 蓝牙MAC地址 | 746f746f6f6f8f | ✅ |
| HARDWAREVERSION | Integer | 硬件版本 | 7 | ✅ |
| SOFTWAREVERSION | Integer | 软件版本 | 64 | ✅ |
| FLOWNUMBER | Integer | 流水号 | 1 | ✅ |
| LAMPINDICATE | Integer | 呼吸灯状态 | 1 | ✅ |

### 三轴传感器字段 (6个)

| 字段名 | 类型 | 说明 | 客户表示例值 | 单位 | 代码中使用 |
|--------|------|------|-------------|------|-----------|
| ACCELERATIONX | Float | 三轴数据值X | -4525 | - | ✅ |
| ACCELERATIONY | Float | 三轴数据值Y | 593 | - | ✅ |
| ACCELERATIONZ | Float | 三轴数据值Z | -998 | - | ✅ |
| ANGLEX | Float | 三轴角度值X | -75.61 | 度 | ✅ |
| ANGLEY | Float | 三轴角度值Y | 7.29 | 度 | ✅ |
| ANGLEZ | Float | 三轴角度值Z | -12.34 | 度 | ✅ |

### 活动数据字段 (8个)

| 字段名 | 类型 | 说明 | 客户表示例值 | 单位 | 代码中使用 |
|--------|------|------|-------------|------|-----------|
| STEP | Integer | 计步总数 | 2170 | 步 | ✅ 日报、地图 |
| STEPTH | Integer | 上报步数阈值 | 100 | 步 | ✅ |
| STEPLIMIT | Integer | 寄存器配置 | 20272 | 步 | ✅ |
| STRIDE | Integer | 寄存器配置 | 7076 | 步 | ✅ |
| T1 | Integer | 走路时长 | 29 | 秒 | ✅ 地图统计 |
| T2 | Integer | 快走时长 | 39 | 秒 | ✅ 地图统计 |
| T3 | Integer | 跑步时长 | 134 | 秒 | ✅ 地图统计 |
| TRACKINGMODE | Integer | 当前运动状态 | 1 | - | ✅ |

**重要**: 
- STEP是累计值，日总步数 = MAX(STEP)
- T1/T2/T3单位是秒，显示时转为分钟
- STRIDE/STEPLIMIT是保留字段（寄存器配置）

### GPS定位字段 (6个)

| 字段名 | 类型 | 说明 | 客户表示例值 | 单位 | 代码中使用 |
|--------|------|------|-------------|------|-----------|
| LATITUDE | Float | 纬度 | 30.2500722 | 度 | ✅ 地图轨迹 |
| LONGITUDE | Float | 经度 | 120.0246134 | 度 | ✅ 地图轨迹 |
| HEIGHT | Float | 设备高度计算值 | *米 | 米 | ✅ 地图信息 |
| RADIUS | Float | 定位半径 | *米 | 米 | ✅ 精度显示 |
| DEM | Float | 高程数据 | 11.33 | 米 | ✅ |
| LOCATIONTYPE | Integer | 定位类型 | 0 | - | ✅ |

**重要**:
- RADIUS值越小定位越精确
- HEIGHT是设备计算值，DEM是高程模型
- 坐标系可能需要转换（WGS84→BD09）

### 环境传感器字段 (3个)

| 字段名 | 类型 | 说明 | 客户表示例值 | 单位 | 代码中使用 |
|--------|------|------|-------------|------|-----------|
| TEMP | Float | 温度 | 17.531 | 摄氏度 | ✅ 日报、体征 |
| PRESS | Float | 气压 | 1030.05 | 百帕 | ✅ 日报、体征 |
| STDPRESS | Float | 当地标准气压值 | 1026 | 百帕 | ✅ |

### 电源管理字段 (2个)

| 字段名 | 类型 | 说明 | 客户表示例值 | 单位 | 代码中使用 |
|--------|------|------|-------------|------|-----------|
| BATVOL | Float | 电池电压 | 3.679 | 伏 | ✅ 设备状态 |
| SOC | Integer | 电量百分比 | 55 | % | ✅ 设备状态 |

### 通信数据字段 (5个)

| 字段名 | 类型 | 说明 | 客户表示例值 | 单位 | 代码中使用 |
|--------|------|------|-------------|------|-----------|
| RSRP | Integer | 信号强度 | -69 | dBm | ✅ 设备状态 |
| MCC | Integer | 移动国家代码 | 1120 | - | ✅ |
| MNC | Integer | 移动网络号码 | 0 | - | ✅ |
| LAC | Integer | 位置区域码 | 10072 | - | ✅ |
| CI | Integer | 基站编号 | 1122079500 | - | ✅ |

### 告警和消息字段 (3个)

| 字段名 | 类型 | 说明 | 客户表示例值 | 单位 | 代码中使用 |
|--------|------|------|-------------|------|-----------|
| TAMPERALARM | Integer | 触发消息类别 | 1 | - | ✅ |
| MESSAGEID | Integer | 定位消息类别 | 11 | - | ✅ |
| SOURCETYPE | Integer | 数据源类型 | 0 | - | ✅ |

## 🔄 字段变更对照

### 变更字段

| 旧字段名 | 新字段名 | 变更说明 |
|---------|---------|---------|
| ALTITUDE | HEIGHT | 语义调整：海拔高度→设备高度 |
| - | RADIUS | 新增：定位精度半径 |
| - | DEM | 新增：数字高程模型 |
| SPEED | *移除* | 客户表无此字段，改用计算 |
| HEADING | *移除* | 客户表无此字段 |

### 类型变更

| 字段名 | 旧类型 | 新类型 | 说明 |
|--------|--------|--------|------|
| STRIDE | Float | Integer | 寄存器配置值（非步幅） |
| SOC | Float | Integer | 电量百分比（整数） |
| RSRP | Float | Integer | 信号强度（整数） |

## 📊 数据使用场景

### 1. 日报计算 (dailyReportService.js)

使用字段：
- ✅ STEP - 日总步数
- ✅ TEMP - 平均体温
- ✅ PRESS - 平均气压
- ✅ BATVOL - 电池电压
- ✅ SOC - 电量百分比
- ✅ RSRP - 信号强度
- ✅ T1/T2/T3 - 活动时长统计

### 2. GPS轨迹 (locationService.js)

使用字段：
- ✅ LATITUDE/LONGITUDE - 坐标点
- ✅ HEIGHT - 高度信息
- ✅ RADIUS - 定位精度
- ✅ DEM - 高程数据
- ✅ STEP - 步数
- ✅ T1/T2/T3 - 运动模式时长
- ✅ TRACKINGMODE - 运动状态

### 3. 前端地图 (ActivityMapBaidu.js)

显示内容：
- ✅ lat/lng - 轨迹渲染
- ✅ height - 高度显示（可选）
- ✅ radius - 精度圆圈
- ✅ step - 步数标记
- ✅ walkTime/jogTime/runTime - 统计面板

### 4. AI分析 (aiAnalysisService.js)

分析维度：
- ✅ STEP - 活动量
- ✅ T1/T2/T3 - 运动强度
- ✅ TEMP - 体温异常
- ✅ SOC - 设备电量
- ✅ GPS数据 - 活动范围

## 🔍 快速查询模板

### 查询所有字段
```sql
SELECT 
  -- 活动数据
  STEP, T1, T2, T3, TRACKINGMODE,
  -- GPS定位
  LATITUDE, LONGITUDE, HEIGHT, RADIUS, DEM,
  -- 传感器
  TEMP, PRESS, ACCELERATIONX, ANGLEX,
  -- 电源
  BATVOL, SOC,
  -- 通信
  RSRP, MCC, MNC,
  -- 设备标识
  TRACKERID, IMEI
FROM pet_activity 
WHERE "petId" = '221' 
ORDER BY time DESC 
LIMIT 1
```

### 查询关键字段（日报）
```sql
SELECT 
  STEP, T1, T2, T3,
  TEMP, PRESS,
  BATVOL, SOC, RSRP
FROM pet_activity 
WHERE "petId" = '221' 
  AND time >= '2026-02-02T00:00:00Z'
ORDER BY time ASC
```

### 查询GPS轨迹
```sql
SELECT 
  time, 
  LATITUDE, LONGITUDE, 
  HEIGHT, RADIUS, DEM,
  STEP, T1, T2, T3
FROM pet_activity 
WHERE "petId" = '221' 
  AND LATITUDE IS NOT NULL
  AND time >= '2026-02-02T00:00:00Z'
ORDER BY time ASC
```

## ⚡ 性能建议

### 高频查询字段（建议索引）
- petId (Tag, 已索引)
- time (内置索引)
- LATITUDE/LONGITUDE (WHERE条件频繁使用)

### 大字段（避免SELECT *）
- TRACKERBLEMACADR
- HICCID, ICCID, IMEI

### 建议查询模式
```sql
-- ✅ 推荐：只查询需要的字段
SELECT STEP, TEMP, SOC FROM pet_activity WHERE ...

-- ❌ 不推荐：查询所有字段
SELECT * FROM pet_activity WHERE ...
```

## 📝 注意事项

### 1. 累计字段
- **STEP**: 日累计值，取MAX()为日总数
- **T1/T2/T3**: 累计秒数，需转换为分钟

### 2. NULL值处理
```javascript
// 所有字段都可能为NULL
height: point.HEIGHT || 0
radius: point.RADIUS || 0
dem: point.DEM || 0
```

### 3. 单位转换
```javascript
// 温度：已是摄氏度，无需转换
temp: point.TEMP

// 时间：秒→分钟
walkMinutes: point.T1 / 60

// 坐标：可能需要坐标系转换
// WGS84/GCJ02 → BD09 (百度地图)
```

### 4. 字段语义
- **STRIDE**: 不是步幅！是寄存器配置值
- **HEIGHT**: 设备计算高度，不是GPS高度
- **DEM**: 高程模型数据，用于高度校准

## 🔗 相关文档

- [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) - 完整表结构说明
- [QUERY-EXAMPLES.md](./QUERY-EXAMPLES.md) - 200+查询示例
- [SCHEMA-UPDATE.md](./SCHEMA-UPDATE.md) - 变更记录
- [UPDATE-SUMMARY.md](./UPDATE-SUMMARY.md) - 更新总结

---

**最后更新**: 2026-02-02  
**字段总数**: 50+  
**适配版本**: v1.3.0
