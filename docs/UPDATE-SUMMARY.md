# 客户表结构适配完成通知

## ✅ 更新完成

已成功将系统代码适配为客户的实际 InfluxDB 表结构。

## 📊 主要变更

### 1. 数据库Schema (50+字段)

**新增字段类别**：
- ✅ 设备标识字段 (14个): APPID, CUSTOMER, DOMAIN, IMEI, ICCID等
- ✅ 三轴传感器 (6个): ACCELERATIONX/Y/Z, ANGLEX/Y/Z
- ✅ GPS定位增强 (3个): HEIGHT, RADIUS, DEM
- ✅ 通信数据 (4个): MCC, MNC, LAC, CI
- ✅ 环境传感器 (1个): STDPRESS
- ✅ 消息类型 (2个): MESSAGEID, SOURCETYPE

**字段类型调整**：
- STRIDE: Float → Integer
- ALTITUDE → HEIGHT (语义调整)
- 移除: SPEED, HEADING (客户表中无此字段)

### 2. 代码文件更新

#### 后端 (3个文件)
- ✅ `server/config/influx.js` - Schema定义完全匹配
- ✅ `server/services/locationService.js` - GPS查询和统计逻辑
- ✅ `scripts/importTestData.js` - 测试数据生成

#### 前端 (1个文件)
- ✅ `client/src/components/ActivityMapBaidu.js` - 地图组件显示

### 3. 文档完善

新增4个文档：
- 📄 `docs/DATABASE-SCHEMA.md` - **完整表结构说明**（必读）
- 📄 `docs/SCHEMA-UPDATE.md` - 变更记录和迁移指南
- 📄 `docs/QUERY-EXAMPLES.md` - 200+ InfluxQL查询示例
- ✏️ `README.md` - 更新日志和文档链接

## 🔍 关键改动说明

### GPS字段变更对比

| 变更前 | 变更后 | 说明 |
|--------|--------|------|
| ALTITUDE | HEIGHT | 设备计算的高度值 |
| SPEED | *移除* | 改用距离/时间计算 |
| HEADING | *移除* | 客户表无此字段 |
| - | RADIUS | 定位精度半径 |
| - | DEM | 数字高程模型 |

### 统计计算变更

**速度计算**：
```
变更前: 直接从SPEED字段读取
变更后: avgSpeed = totalDistance / totalActiveTime
其中: totalActiveTime = T1 + T2 + T3 (秒)
```

**新增统计**：
- ✅ totalWalkTime (分钟) - 走路时长
- ✅ totalJogTime (分钟) - 快走时长  
- ✅ totalRunTime (分钟) - 跑步时长
- ✅ totalActiveTime (分钟) - 总活动时长

### 地图组件更新

**信息窗口**：
```
变更前: 时间 | 速度 | 步数
变更后: 时间 | 步数 | 定位精度
```

**统计面板**：新增3个统计项（有数据时显示）
- 🚶 走路 (分钟)
- 🏃 快走 (分钟)
- 💨 跑步 (分钟)

## 📝 下一步操作

### 1. 重新导入测试数据

```bash
cd pet-health-daily
node scripts/importTestData.js
```

**注意**：测试数据现在包含所有新字段，更贴近真实数据。

### 2. 验证数据

```bash
influx -database pet_health -execute "SELECT * FROM pet_activity LIMIT 1"
```

确认能看到：HEIGHT, RADIUS, DEM, ACCELERATIONX, ANGLEX等新字段。

### 3. 启动服务测试

```bash
# 启动后端
cd pet-health-daily
npm run dev

# 新终端启动前端
cd client
npm start
```

访问 http://localhost:3000 测试：
- ✅ 活动轨迹地图是否正常显示
- ✅ 统计面板是否显示走路/快走/跑步时长
- ✅ 点击轨迹点查看定位精度

### 4. 导入真实数据（可选）

如果您有客户的真实数据CSV/JSON文件，可以：

1. 参考 `scripts/importTestData.js` 的数据格式
2. 编写导入脚本
3. 确保字段名和类型匹配 `docs/DATABASE-SCHEMA.md`

## 📚 必读文档

### 优先级1（必读）
1. **[DATABASE-SCHEMA.md](docs/DATABASE-SCHEMA.md)**
   - 完整的50+字段说明
   - 字段类型、单位、示例值
   - 非常重要！

2. **[SCHEMA-UPDATE.md](docs/SCHEMA-UPDATE.md)**
   - 详细的变更记录
   - API响应格式变更
   - 兼容性说明

### 优先级2（推荐）
3. **[QUERY-EXAMPLES.md](docs/QUERY-EXAMPLES.md)**
   - 200+条InfluxQL查询示例
   - 按场景分类（GPS、活动、健康、设备）
   - 性能优化建议

### 优先级3（参考）
4. **[QUICKSTART.md](QUICKSTART.md)** - 快速开始指南
5. **[AI-SETUP.md](docs/AI-SETUP.md)** - AI功能配置
6. **[BAIDU-MAP-SETUP.md](docs/BAIDU-MAP-SETUP.md)** - 地图配置

## ⚠️ 重要提示

### 1. 字段类型严格匹配
```javascript
// ❌ 错误
STRIDE: 0.5  // Float类型

// ✅ 正确  
STRIDE: 7076  // Integer类型（寄存器配置值）
```

### 2. GPS字段变更
```javascript
// ❌ 错误（旧字段）
point.ALTITUDE
point.SPEED
point.HEADING

// ✅ 正确（新字段）
point.HEIGHT
point.RADIUS
point.DEM
```

### 3. 时间单位转换
```javascript
// T1/T2/T3 单位是秒，显示时需转换为分钟
walkTimeMinutes = point.T1 / 60
```

### 4. NULL值处理
所有新增字段在旧数据中都是NULL，代码已做兼容：
```javascript
height: point.HEIGHT || 0
radius: point.RADIUS || 0
```

## 🧪 测试检查清单

- [ ] 运行 `node scripts/importTestData.js` 成功
- [ ] InfluxDB中能查到包含新字段的数据
- [ ] 后端服务 `npm run dev` 启动无报错
- [ ] 前端服务 `npm start` 启动无报错
- [ ] 浏览器访问 http://localhost:3000 正常
- [ ] 地图显示GPS轨迹
- [ ] 统计面板显示走路/快走/跑步时长
- [ ] 点击轨迹点显示定位精度
- [ ] 日报API返回正常数据
- [ ] AI分析功能正常（如已配置）

## 🐛 常见问题

### Q1: 地图不显示轨迹？
```bash
# 检查GPS数据
influx -database pet_health -execute \
  "SELECT COUNT(*) FROM pet_activity WHERE petId='221' AND LATITUDE IS NOT NULL"
```

### Q2: 统计面板显示0？
- 确保T1/T2/T3字段有数据
- 检查后端计算逻辑：`totalActiveTime = T1 + T2 + T3`

### Q3: 字段类型错误？
- 查看 `docs/DATABASE-SCHEMA.md` 确认正确类型
- 检查测试数据生成代码

### Q4: 旧测试数据冲突？
```bash
# 删除旧数据
influx -database pet_health -execute "DROP MEASUREMENT pet_activity"
# 重新导入
node scripts/importTestData.js
```

## 💡 技术支持

如遇问题：

1. **查看日志**
   - 后端: 终端输出
   - 前端: 浏览器控制台 (F12)

2. **检查配置**
   - `.env` 文件中的InfluxDB连接配置
   - 数据库名称、用户名、密码

3. **阅读文档**
   - 按优先级依次阅读上述文档
   - 特别注意 `DATABASE-SCHEMA.md` 的注意事项

## 📦 文件清单

更新的文件（需要git提交）：

```
server/config/influx.js                    (Schema定义)
server/services/locationService.js         (GPS服务)
scripts/importTestData.js                  (测试数据)
client/src/components/ActivityMapBaidu.js  (地图组件)
docs/DATABASE-SCHEMA.md                    (新增)
docs/SCHEMA-UPDATE.md                      (新增)
docs/QUERY-EXAMPLES.md                     (新增)
docs/UPDATE-SUMMARY.md                     (本文档)
README.md                                   (更新)
```

## ✅ 验收标准

系统成功适配的标志：

1. ✅ 测试数据包含50+字段
2. ✅ API返回数据结构符合新Schema
3. ✅ 前端地图正常显示轨迹和统计
4. ✅ 无console错误或警告
5. ✅ 文档完整且准确

---

**更新时间**: 2026-02-02  
**版本**: v1.3.0  
**适配对象**: 客户实际InfluxDB表结构

**状态**: ✅ 已完成，待测试验证
