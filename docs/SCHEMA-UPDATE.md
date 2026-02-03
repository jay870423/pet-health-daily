# 数据库Schema更新说明

## 更新时间
2026-02-02

## 更新原因
根据客户实际InfluxDB表结构进行适配调整。

## 主要变更

### 1. GPS字段调整

**变更前**:
```javascript
LATITUDE: Float    // 纬度
LONGITUDE: Float   // 经度
ALTITUDE: Float    // 海拔高度
SPEED: Float       // 移动速度(m/s)
HEADING: Float     // 方向角(0-360度)
```

**变更后**:
```javascript
LATITUDE: Float     // 纬度
LONGITUDE: Float    // 经度
HEIGHT: Float       // 设备高度计算值（米）
RADIUS: Float       // 定位半径（精度，米）
DEM: Float          // 高程数据（米）
LOCATIONTYPE: Integer // 定位类型
```

**原因**: 客户表中没有SPEED和HEADING字段，而是使用HEIGHT、RADIUS、DEM来表示定位相关信息。

### 2. 新增设备标识字段

增加了完整的设备标识信息：
- `APPID`: 项目ID
- `CUSTOMER`: 客户ID
- `DOMAIN`: 域名ID
- `SPECIES`: 物种ID
- `TID`: 设备ID
- `TRACKERID`: 跟踪器ID
- `HICCID`, `ICCID`, `IMEI`: 设备唯一标识
- `TRACKERBLEMACADR`: 蓝牙MAC地址
- `HARDWAREVERSION`, `SOFTWAREVERSION`: 版本信息

### 3. 新增传感器字段

增加三轴加速度和三轴角度数据：
- `ACCELERATIONX/Y/Z`: 三轴加速度值
- `ANGLEX/Y/Z`: 三轴角度值（度）

### 4. 活动数据字段调整

**STRIDE字段**:
- 变更前: Float类型，表示步幅
- 变更后: Integer类型，寄存器配置（保留字段）

**新增字段**:
- `STEPTH`: 上报步数阈值
- `STDPRESS`: 当地标准气压值

### 5. 通信字段增强

新增移动网络基站信息：
- `MCC`: 移动国家代码
- `MNC`: 移动网络号码
- `LAC`: 位置区域码
- `CI`: 基站编号

### 6. 消息类型字段

新增：
- `MESSAGEID`: 定位消息类别
- `SOURCETYPE`: 数据源类型

## 代码变更文件

### 后端文件

1. **server/config/influx.js**
   - 更新schema定义，增加50+个字段
   - 调整字段类型（如STRIDE: Float→Integer）

2. **server/services/locationService.js**
   - 查询字段：ALTITUDE→HEIGHT, 增加DEM、RADIUS
   - 移除SPEED、HEADING字段
   - 统计计算：基于T1/T2/T3计算平均速度
   - 返回数据增加：walkTime、jogTime、runTime、mode

3. **server/services/petDataService.js**
   - SELECT * 自动包含所有新增字段
   - 无需修改查询逻辑

### 前端文件

4. **client/src/components/ActivityMapBaidu.js**
   - 信息窗口：移除速度显示，增加定位精度显示
   - 统计面板：增加走路/快走/跑步时长显示
   - 兼容处理：stats.totalActiveTime || stats.duration
   - 条件显示：当时长>0时才显示对应统计项

### 测试文件

5. **scripts/importTestData.js**
   - 更新测试数据生成逻辑
   - 生成所有新增字段的模拟数据
   - 设备标识使用客户示例数据
   - GPS数据生成：移除SPEED/HEADING，增加HEIGHT/RADIUS/DEM

### 文档文件

6. **docs/DATABASE-SCHEMA.md** (新增)
   - 完整的表结构文档
   - 字段说明和示例值
   - 查询示例
   - 注意事项

7. **docs/SCHEMA-UPDATE.md** (本文档)
   - 变更记录
   - 迁移指南

## 数据迁移

### 现有数据无需迁移

如果您已经有旧的测试数据：

```bash
# 选项1：删除旧数据，重新导入
influx -database pet_health -execute "DROP MEASUREMENT pet_activity"
node scripts/importTestData.js

# 选项2：保留旧数据，新旧数据共存
# InfluxDB会自动兼容缺失字段（查询时返回NULL）
# 只需确保新数据包含所有必需字段
```

### 兼容性说明

- 新Schema向后兼容：查询旧数据时，新增字段返回NULL
- 前端已做NULL值兼容处理
- 速度计算逻辑改为基于距离和时间

## API响应变更

### GET /api/location/track/:petId

**变更前**:
```json
{
  "track": [
    {
      "time": "2026-01-26 10:00:00",
      "lat": 39.9042,
      "lng": 116.4074,
      "altitude": 50.5,
      "speed": 1.5,
      "heading": 45.2,
      "step": 1000
    }
  ]
}
```

**变更后**:
```json
{
  "track": [
    {
      "time": "2026-01-26 10:00:00",
      "lat": 39.9042,
      "lng": 116.4074,
      "height": 50.5,
      "dem": 11.33,
      "radius": 8.5,
      "step": 1000,
      "walkTime": 600,
      "jogTime": 300,
      "runTime": 100,
      "mode": 1
    }
  ]
}
```

### 统计信息变更

**变更前**:
```json
{
  "stats": {
    "totalDistance": 1500.5,
    "totalPoints": 16,
    "maxSpeed": 2.8,
    "avgSpeed": 1.5,
    "duration": 120
  }
}
```

**变更后**:
```json
{
  "stats": {
    "totalDistance": 1500.5,
    "totalPoints": 16,
    "avgSpeed": 1.5,
    "totalWalkTime": 45,
    "totalJogTime": 30,
    "totalRunTime": 10,
    "totalActiveTime": 85,
    "duration": 120
  }
}
```

## 测试验证

### 1. 重新导入测试数据

```bash
cd pet-health-daily
node scripts/importTestData.js
```

### 2. 验证数据结构

```bash
influx -database pet_health -execute "SELECT * FROM pet_activity LIMIT 1"
```

应该看到所有新增字段。

### 3. 测试API

```bash
# 测试轨迹查询
curl http://localhost:3001/api/location/track/221?date=2026-02-02

# 测试日报
curl http://localhost:3001/api/report/221?date=2026-02-02
```

### 4. 前端测试

访问 http://localhost:3000 查看：
- 活动轨迹地图是否正常显示
- 统计面板是否显示走路/快走/跑步时长
- 点击轨迹点是否显示定位精度

## 注意事项

1. **字段类型**: STRIDE从Float改为Integer，确保写入数据类型正确
2. **NULL处理**: 新增字段在旧数据中为NULL，查询时需处理
3. **速度计算**: 不再依赖SPEED字段，改用距离/时间计算
4. **时间统计**: T1/T2/T3单位为秒，前端显示需转换为分钟
5. **定位精度**: RADIUS值越小定位越准确，可用于轨迹质量评估

## 问题排查

### 问题1: 地图不显示轨迹

**可能原因**: LATITUDE/LONGITUDE为NULL

**解决方案**:
```bash
# 检查GPS数据
influx -database pet_health -execute "SELECT COUNT(*) FROM pet_activity WHERE petId='221' AND LATITUDE IS NOT NULL"

# 如果数量为0，重新导入测试数据
node scripts/importTestData.js
```

### 问题2: 统计数据不准确

**可能原因**: 速度计算逻辑变更

**解决方案**:
- 确保T1/T2/T3字段有数据
- 检查后端计算逻辑：`totalActiveTime = T1 + T2 + T3`

### 问题3: 前端报错

**可能原因**: 字段名变更（altitude→height）

**解决方案**:
- 清除浏览器缓存
- 重启前端开发服务器：`cd client && npm start`

## 回滚方案

如果需要回滚到旧Schema：

```bash
# 1. 检出旧代码
git checkout HEAD~1 server/config/influx.js
git checkout HEAD~1 server/services/locationService.js
git checkout HEAD~1 scripts/importTestData.js
git checkout HEAD~1 client/src/components/ActivityMapBaidu.js

# 2. 删除数据库重新导入
influx -database pet_health -execute "DROP MEASUREMENT pet_activity"
node scripts/importTestData.js

# 3. 重启服务
npm run dev
```

## 联系支持

如有问题，请查看：
- [完整Schema文档](./DATABASE-SCHEMA.md)
- [快速开始指南](../QUICKSTART.md)
- [项目README](../README.md)
