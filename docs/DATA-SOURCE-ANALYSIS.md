# 数据来源分析文档

## 📊 概述

本文档详细说明**趋势提醒**和**健康状态**两个版块的数据来源和计算逻辑。

---

## 1️⃣ 趋势提醒 (TrendCard)

### 显示内容

| 显示项 | 示例值 | 说明 |
|--------|--------|------|
| 较昨日 | +0% / -10% | 今日步数相比昨日的变化百分比 |
| 7日均值 | +250% / -15% | 今日步数相比近7天平均值的变化 |
| ACTIVITY MODE | 进度条 | 活动模式指示器 |

### ✅ 数据来源：**100% 来自 InfluxDB**

```javascript
// 服务端计算逻辑
// server/services/dailyReportService.js

async calculateTrend(petId, date, todaySteps) {
  // 1️⃣ 从 InfluxDB 获取昨日数据
  const yesterdayData = await petDataService.getYesterdayData(petId, date);
  const yesterdaySteps = this.calculateActivity(yesterdayData).steps;
  
  // 2️⃣ 从 InfluxDB 获取近7天数据
  const last7DaysData = await petDataService.getLast7DaysData(petId, date);
  const avg7DaySteps = 计算平均值;
  
  // 3️⃣ 计算趋势对比
  vsYesterday = (todaySteps - yesterdaySteps) / yesterdaySteps;
  vs7DayAvg = (todaySteps - avg7DaySteps) / avg7DaySteps;
  
  return { vsYesterday, vs7DayAvg, trendLabel };
}
```

### 数据流程

```
InfluxDB (pet_activity)
    ↓
petDataService.getYesterdayData()      → 昨日步数
petDataService.getLast7DaysData()      → 7天步数数组
    ↓
dailyReportService.calculateTrend()    → 计算对比百分比
    ↓
TrendCard 组件                          → 前端显示
```

### 相关字段

从 InfluxDB 读取的字段：
- `STEP` - 累计步数
- `time` - 时间戳

---

## 2️⃣ 健康状态 (DeviceCard)

### 显示内容

| 显示项 | 示例值 | 数据来源 |
|--------|--------|---------|
| 状态徽章 | ALARM / NORMAL | ✅ InfluxDB |
| 健康评分 | 58% DAILY | ✅ InfluxDB (新增动态计算) |
| 设备电量 | 3.65V | ✅ InfluxDB |
| 电量百分比 | 进度条 | ✅ InfluxDB |
| 信号强度 | -32dBm | ✅ InfluxDB |
| 信号格数 | 4格 | ✅ 根据 RSRP 计算 |

### ✅ 数据来源：**100% 来自 InfluxDB**

```javascript
// 服务端计算逻辑
// server/services/dailyReportService.js

async calculateDeviceStatus(petId, todayData) {
  // 1️⃣ 从 InfluxDB 获取最新数据
  const latestData = await petDataService.getLatestData(petId);
  
  // 2️⃣ 判断设备状态
  let dataStatus = 'NORMAL';
  if (minutesSinceLastSeen > 10) {
    dataStatus = 'OFFLINE';
  } else if (latestData.BATVOL < 3.3 || latestData.RSRP < -100) {
    dataStatus = 'DEGRADED';
  } else if (latestData.TAMPERALARM === 1) {
    dataStatus = 'ALARM';
  }
  
  // 3️⃣ 计算健康评分 (新增)
  const healthScore = this.calculateHealthScore(latestData, todayData, dataStatus);
  
  return {
    dataStatus,
    battery: latestData.BATVOL,
    soc: latestData.SOC,
    rsrp: latestData.RSRP,
    healthScore  // ✨ 新增字段
  };
}
```

### 健康评分算法 (NEW)

**基础分: 100分**，根据以下因素扣分：

| 评分项 | 扣分规则 | 最大扣分 |
|--------|---------|---------|
| 设备状态 | OFFLINE: -50分<br>ALARM: -30分<br>DEGRADED: -20分 | 50分 |
| 电池电量 | SOC < 20%: -20分<br>SOC < 40%: -10分<br>SOC < 60%: -5分 | 20分 |
| 信号强度 | RSRP < -110: -15分<br>RSRP < -100: -10分<br>RSRP < -90: -5分 | 15分 |
| 体温异常 | 异常 (>40℃ or <36℃): -15分<br>偏高/偏低: -8分 | 15分 |
| 数据完整性 | 根据当天数据点数量 | +5分 (加分项) |

```javascript
// 示例计算
// 正常情况: 100 - 0 = 100分
// 电量30%, 信号-95dBm: 100 - 10 - 5 = 85分
// ALARM状态, 电量15%: 100 - 30 - 20 = 50分
```

### 数据流程

```
InfluxDB (pet_activity)
    ↓
petDataService.getLatestData()         → 最新一条数据
    ↓
dailyReportService.calculateDeviceStatus()
    ├─ 提取字段: BATVOL, SOC, RSRP, TAMPERALARM, TEMP
    ├─ 判断状态: NORMAL / ALARM / OFFLINE / DEGRADED
    └─ 计算评分: calculateHealthScore()
    ↓
DeviceCard 组件                        → 前端显示
    ├─ 状态徽章 (ALARM 等)
    ├─ 健康评分 (58% DAILY)
    ├─ 设备电量 (3.65V)
    └─ 信号强度 (-32dBm)
```

### 相关字段

从 InfluxDB 读取的字段：
- `BATVOL` - 电池电压 (V)
- `SOC` - 电量百分比 (%)
- `RSRP` - 信号强度 (dBm)
- `TAMPERALARM` - 防拆告警 (0/1)
- `TEMP` - 体表温度 (℃)
- `time` - 时间戳

---

## 🔄 修复内容

### 问题
之前 **"58% DAILY"** 是硬编码的固定值，不会随数据变化。

### 解决方案
1. ✅ 在服务端新增 `calculateHealthScore()` 方法
2. ✅ 根据设备状态、电量、信号、体温等动态计算健康评分
3. ✅ 前端从 `device.healthScore` 读取动态值

### 修改文件
- `server/services/dailyReportService.js` - 新增健康评分计算逻辑
- `client/src/components/DeviceCard.js` - 改为动态显示评分

---

## 📊 数据对比

### 修改前
```javascript
// DeviceCard.js
<div className="status-percentage">
  58% <span>DAILY</span>  // ❌ 固定值
</div>
```

### 修改后
```javascript
// DeviceCard.js
<div className="status-percentage">
  {healthScore || 0}% <span>DAILY</span>  // ✅ 动态计算
</div>

// 健康评分会根据以下因素变化：
// - 设备在线状态
// - 电池电量
// - 信号强度
// - 体温是否正常
// - 数据完整性
```

---

## 🎯 总结

| 版块 | 数据来源 | 字段 | 是否动态 |
|------|---------|------|---------|
| **趋势提醒** | ✅ 100% InfluxDB | STEP, time | ✅ 完全动态 |
| **健康状态** | ✅ 100% InfluxDB | BATVOL, SOC, RSRP, TAMPERALARM, TEMP, time | ✅ 完全动态 |

### 关键点

1. ✅ **所有数据都来自 InfluxDB**，没有外部数据源
2. ✅ **趋势提醒**通过对比历史数据计算变化趋势
3. ✅ **健康状态**综合多个指标计算健康评分
4. ✅ **修复了硬编码问题**，现在 "58% DAILY" 是动态计算的

### 数据更新频率

- **趋势提醒**: 每次查询时计算（对比昨日和7日数据）
- **健康状态**: 每次查询时计算（使用最新数据）
- **健康评分**: 实时计算（基于当前设备状态）

---

## 🔍 验证方法

1. **启动服务**：
   ```bash
   npm start
   ```

2. **查看健康评分**：
   - 正常状态：应该显示 85-100%
   - 低电量：应该扣分显示 60-80%
   - ALARM 状态：应该显示 40-60%
   - OFFLINE：应该显示 0-50%

3. **查看趋势提醒**：
   - 切换不同宠物，观察百分比变化
   - 豆豆 (低活跃) vs 大黄 (高活跃)
   - 对比数值应该有明显差异

---

## 📚 相关文档

- [InfluxDB 字段映射](./FIELD-MAPPING.md)
- [数据库模式](./DATABASE-SCHEMA.md)
- [多宠物数据导入](./MULTI-PET-GUIDE.md)
- [数据差异化更新](./DATA-VARIATION-UPDATE.md)
