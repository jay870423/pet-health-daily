# 宠物日报设计文档

## Daily Pet Report Design Document（Based on InfluxDB 1.8）

### 1. 设计背景

随着宠物可穿戴设备的普及，系统会持续采集宠物的运动、体征、环境及设备状态等原始数据。原始数据粒度高、语义弱，无法直接面向用户展示，也不利于健康评估与趋势分析。因此，需要在原始数据之上构建"宠物日报（Daily Pet Report）"，将设备数据转化为结构化、可解释、可对比的每日健康摘要。

### 2. 设计目标

本设计文档用于定义宠物日报的：
- 数据归类方式
- 指标计算口径
- 生成流程
- 标准输出结构

以确保后端、算法、产品、前端对日报含义和口径理解一致。

### 3. 系统与数据前提

#### 3.1 技术环境
- **数据库**：InfluxDB 1.8
- **查询语言**：InfluxQL
- **Measurement**：pet_activity

#### 3.2 原始数据特性
- STEP / STRIDE 为累计值
- TEMP / PRESS / BATVOL / RSRP 为瞬时状态
- 每条数据包含时间戳
- 数据写入统一使用 UTC 时间
- 展示与统计按宠物所在时区（如 Asia/Shanghai）

### 4. 日报统计周期定义

- **统计对象**：单只宠物（petId）
- **统计周期**：自然日（Daily）
- **时区**：Asia/Shanghai
- **统计时间范围**：00:00:00 ～ 23:59:59（本地自然日）

### 5. 日报总体结构

宠物日报由四大类信息组成，所有原始字段必须被归类到以下四类之一：

1. **活动数据（Activity）**
2. **体征数据（Vitals）**
3. **趋势对比（Trend）**
4. **设备与数据可信度（Device & Data Quality）**

### 6. 数据归类与计算规则

#### 6.1 活动数据（Activity）

**设计目的**：衡量宠物当日的运动量与运动结构。

**原始字段**：
- STEP（累计步数）
- STRIDE（步幅）
- STEPLIMIT（设备目标）
- T1 / T2 / T3（分时段活动）
- TRACKINGMODE（是否处于运动状态）

**核心计算规则**：
```
dailySteps = max(STEP) - min(STEP)
```

**日报输出指标**：
- 日步数（dailySteps）
- 达标率（completionRate）
- 活动等级（LOW / NORMAL / HIGH）
- 分时段活动分布

#### 6.2 体征数据（Vitals）

**设计目的**：判断宠物身体状态是否存在异常信号。

**原始字段**：
- TEMP（体表温度）
- PRESS（气压）

**聚合方式**：
```
avgTemp = mean(TEMP)
avgPressure = mean(PRESS)
```

**日报输出指标**：
- 平均体表温度
- 体征状态（NORMAL / WARNING）

**注**：体征异常需结合活动趋势综合判断，不单独作为健康结论。

#### 6.3 趋势对比（Trend）

**设计目的**：评估宠物行为是否发生变化。

**对比维度**：
- 今日 vs 昨日
- 今日 vs 近 7 日均值

**计算方式**：
```
vsYesterday = (todaySteps - yesterdaySteps) / yesterdaySteps
vs7DayAvg = (todaySteps - avg7DaySteps) / avg7DaySteps
```

**日报输出指标**：
- vsYesterday
- vs7DayAvg
- 趋势标签（UP / STABLE / DOWN）

#### 6.4 设备与数据可信度（Device & Data Quality）

**设计目的**：避免将设备异常误判为宠物健康异常。

**原始字段**：
- BATVOL / SOC（电量）
- RSRP（信号强度）
- TAMPERALARM（防拆告警）
- 上报时间间隔

**状态判断规则**：
- 最近 10 分钟无数据 → OFFLINE
- 电量低或信号弱 → DEGRADED
- 其他情况 → NORMAL

**日报输出指标**：
- dataStatus
- battery
- rsrp
- lastSeen

### 7. 宠物日报生成流程

1. 按 petId + 自然日取数
2. 计算日步数（STEP 差值）
3. 聚合体征与设备状态
4. 计算趋势对比指标
5. 执行规则判断（健康 / 设备）
6. 生成结构化日报结果
7. 输出用户可读摘要与建议

### 8. 日报标准输出结构

```json
{
  "date": "2026-01-26",
  "petId": "221",
  "summary": "今天活动偏少，但体征稳定，建议增加一次互动。",
  "activity": {
    "steps": 6312,
    "completionRate": 0.31,
    "activeLevel": "LOW"
  },
  "vitals": {
    "avgTemp": 17.53,
    "status": "NORMAL"
  },
  "trend": {
    "vsYesterday": -0.18,
    "vs7DayAvg": -0.12,
    "trendLabel": "DOWN"
  },
  "device": {
    "dataStatus": "NORMAL",
    "battery": 3.68,
    "rsrp": -69
  },
  "advice": [
    "建议增加一次 15–30 分钟互动活动",
    "连续观察 2–3 天活动变化"
  ]
}
```

### 9. 设计原则

1. **不直接展示原始设备字段**
2. **不将设备异常等同于健康异常**
3. **优先使用相对趋势而非绝对值**
4. **所有结论需可解释、可复现**

### 10. 总结

宠物日报通过对原始设备数据的归类、差值计算、聚合与规则判断，形成面向用户的每日健康摘要，是宠物健康分析体系的基础能力。

---

## 实现细节

### InfluxQL 查询示例

```sql
-- 查询当日数据
SELECT * FROM pet_activity
WHERE "petId" = '221'
  AND time >= '2026-01-26T00:00:00Z'
  AND time <= '2026-01-26T23:59:59Z'
ORDER BY time ASC

-- 计算日步数
SELECT MAX(STEP) - MIN(STEP) as dailySteps
FROM pet_activity
WHERE "petId" = '221'
  AND time >= '2026-01-26T00:00:00Z'
  AND time <= '2026-01-26T23:59:59Z'

-- 计算平均体温
SELECT MEAN(TEMP) as avgTemp
FROM pet_activity
WHERE "petId" = '221'
  AND time >= '2026-01-26T00:00:00Z'
  AND time <= '2026-01-26T23:59:59Z'
```

### 活动等级判定规则

```javascript
if (completionRate >= 0.8) {
  activeLevel = 'HIGH';
} else if (completionRate >= 0.5) {
  activeLevel = 'NORMAL';
} else {
  activeLevel = 'LOW';
}
```

### 趋势标签判定规则

```javascript
if (vsYesterday < -0.1) {
  trendLabel = 'DOWN';
} else if (vsYesterday > 0.1) {
  trendLabel = 'UP';
} else {
  trendLabel = 'STABLE';
}
```

### 设备状态判定规则

```javascript
if (minutesSinceLastSeen > 10) {
  dataStatus = 'OFFLINE';
} else if (battery < 3.3 || rsrp < -100) {
  dataStatus = 'DEGRADED';
} else if (tamperAlarm === 1) {
  dataStatus = 'ALARM';
} else {
  dataStatus = 'NORMAL';
}
```
