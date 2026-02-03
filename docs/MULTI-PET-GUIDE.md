# 多物种数据导入指南

## 📊 概述

本指南说明如何导入10个不同宠物的测试数据，并在前端切换查看不同宠物的日报。

## 🐾 宠物列表

系统包含10个不同的宠物，分布在不同城市，每个宠物都有独特的活动特征：

| 宠物ID | 名称 | 图标 | 物种 | 物种ID | 活动等级 | 基础步数 | 每日变化 | 位置 |
|--------|------|------|------|--------|---------|---------|---------|------|
| DOG001 | 豆豆 | 🐕 | 狗 | 1 | 低 | ~2100步 | 10% | 北京 |
| CAT001 | 喵喵 | 🐱 | 猫 | 2 | 中 | ~5500步 | 20% | 上海 |
| DOG002 | 旺财 | 🐕 | 狗 | 1 | 高 | ~12000步 | 15% | 深圳 |
| CAT002 | 咪咪 | 🐈 | 猫 | 2 | 极低 | ~1800步 | 5% | 成都 |
| DOG003 | 大黄 | 🦮 | 狗 | 1 | 极高 | ~16000步 | 25% | 广州 |
| CAT003 | 小白 | 🐱 | 猫 | 2 | 低 | ~3200步 | 12% | 宁波 |
| DOG004 | 黑子 | 🐕‍🦺 | 狗 | 1 | 高 | ~8500步 | 18% | 西安 |
| CAT004 | 橘子 | 🐈‍⬛ | 猫 | 2 | 中 | ~6800步 | 22% | 杭州 |
| DOG005 | 雪糕 | 🐩 | 狗 | 1 | 中 | ~4500步 | 14% | 福州 |
| CAT005 | 芝麻 | 🐱 | 猫 | 2 | 中 | ~7200步 | 16% | 济南 |

### 🎯 宠物特征说明

- **基础步数**：每个宠物的日均目标步数，范围从 1800（咪咪）到 16000（大黄）
- **活动等级**：
  - 极低 (very_low): 步数 × 0.5，活动 4 小时
  - 低 (low): 步数 × 0.7，活动 6 小时
  - 中 (medium): 步数 × 1.0，活动 8 小时
  - 高 (high): 步数 × 1.3，活动 10 小时
  - 极高 (very_high): 步数 × 1.6，活动 12 小时
- **每日变化**：数据随机波动幅度，使每天的数据更真实
- **体温差异**：狗的体温波动（±0.3℃）比猫（±0.2℃）更大

## 🚀 导入数据

### 步骤1: 运行导入脚本

```bash
cd pet-health-daily
node scripts/importMultiPetData.js
```

**预期输出**：
```
🐾 开始导入多物种测试数据...

物种数量: 10
数据天数: 7 天

🐕 豆豆 (DOG001)
   物种: 🐕 狗
   活动等级: high
   位置: 39.9042, 116.4074
   ✓ 成功写入 168 条数据

🐱 喵喵 (CAT001)
   物种: 🐱 猫
   活动等级: medium
   位置: 31.2304, 121.4737
   ✓ 成功写入 168 条数据

...（其他8个宠物）

✅ 数据导入完成！
总计导入: 1680 条数据 (10 个宠物 × 7 天 × 24 小时)

📋 宠物列表：
   🐕 豆豆 - ID: DOG001 - 物种: 1
   🐱 喵喵 - ID: CAT001 - 物种: 2
   ...
```

### 步骤2: 验证数据

```bash
# 查看豆豆的数据
influx -database pet_health -execute "SELECT * FROM pet_activity WHERE petId='DOG001' LIMIT 5"

# 查看喵喵的数据
influx -database pet_health -execute "SELECT * FROM pet_activity WHERE petId='CAT001' LIMIT 5"

# 统计每个宠物的数据量
influx -database pet_health -execute "SELECT COUNT(*) FROM pet_activity GROUP BY petId"
```

**预期结果**：每个宠物应该有 168 条记录（7天 × 24小时）

## 🖥️ 前端使用

### 1. 启动服务

```bash
# 终端1：启动后端
cd pet-health-daily
npm run dev

# 终端2：启动前端
cd client
npm start
```

### 2. 界面功能

访问 http://localhost:3000，你会看到：

#### **头部区域** 
- 动态显示当前选中宠物的图标和名称
- 示例：🐕 豆豆的日报
- 副标题：狗 • DOG001

#### **宠物选择器**
- 下拉菜单列出所有10个宠物
- 每项显示：图标 + 名称 + (类型 - ID)
- 当前宠物信息卡片（紫色渐变）：
  - 大号动态图标（跳动动画）
  - 宠物名称
  - 物种ID

#### **日期选择器**
- 选择查看历史日期的日报

### 3. 切换宠物演示

**观察不同宠物的数据差异**：

1. **选择"豆豆"（DOG001）**
   - 步数：~8000步
   - 活动时长：10小时
   - GPS轨迹：北京天安门周边
   - 活动等级：高

2. **选择"喵喵"（CAT001）**
   - 步数：~4000步
   - 活动时长：8小时
   - GPS轨迹：上海外滩附近
   - 活动等级：中

3. **选择"大黄"（DOG003）**
   - 步数：~12000步
   - 活动时长：12小时
   - GPS轨迹：广州
   - 活动等级：极高（最活跃）

4. **选择"咪咪"（CAT002）**
   - 步数：~3500步
   - 活动时长：6小时
   - GPS轨迹：成都
   - 活动等级：低（懒猫）

## 📊 数据特点

### 活动等级配置

| 等级 | 步数倍数 | 活动时长 | 适用宠物 |
|------|---------|---------|---------|
| very_high | 1.6× | 12小时 | 大黄 |
| high | 1.3× | 10小时 | 豆豆、旺财、黑子 |
| medium | 1.0× | 8小时 | 喵喵、橘子、雪糕、芝麻 |
| low | 0.7× | 6小时 | 咪咪、小白 |

### 物种差异

**狗（SPECIES=1）**：
- 步数范围：7000-12000步
- 活动时间：8-12小时
- 体温：38.2-38.6°C
- GPS轨迹范围：较大（活动积极）

**猫（SPECIES=2）**：
- 步数范围：3000-4500步
- 活动时间：6-8小时
- 体温：37.9-38.2°C
- GPS轨迹范围：较小（活动范围有限）

### GPS分布

每个宠物在不同城市的GPS坐标中心：

| 宠物 | 城市 | 纬度 | 经度 |
|------|------|------|------|
| 豆豆 | 北京 | 39.9042 | 116.4074 |
| 喵喵 | 上海 | 31.2304 | 121.4737 |
| 旺财 | 深圳 | 22.5431 | 114.0579 |
| 咪咪 | 成都 | 30.5728 | 104.0668 |
| 大黄 | 广州 | 23.1291 | 113.2644 |
| 小白 | 宁波 | 29.8683 | 121.5440 |
| 黑子 | 西安 | 34.3416 | 108.9398 |
| 橘子 | 杭州 | 30.2936 | 120.1614 |
| 雪糕 | 福州 | 26.0614 | 119.3061 |
| 芝麻 | 济南 | 36.6512 | 117.1201 |

## 🔍 API测试

### 查询不同宠物的日报

```bash
# 豆豆的日报
curl http://localhost:3001/api/report/DOG001

# 喵喵的日报
curl http://localhost:3001/api/report/CAT001

# 大黄的日报（极高活动量）
curl http://localhost:3001/api/report/DOG003?date=2026-02-02

# 咪咪的日报（低活动量）
curl http://localhost:3001/api/report/CAT002?date=2026-02-02
```

### 查询GPS轨迹

```bash
# 豆豆的轨迹（北京）
curl "http://localhost:3001/api/location/track/DOG001?date=2026-02-02"

# 喵喵的轨迹（上海）
curl "http://localhost:3001/api/location/track/CAT001?date=2026-02-02"
```

### 对比查询

```bash
# 查看所有宠物今天的步数
for id in DOG001 CAT001 DOG002 CAT002 DOG003; do
  echo "$id:"
  curl -s "http://localhost:3001/api/report/$id" | grep -o '"totalSteps":[0-9]*'
done
```

## 🎨 前端界面细节

### 宠物选择器样式

**下拉菜单**：
```
🐕 豆豆 (狗 - DOG001)
🐱 喵喵 (猫 - CAT001)
🐕 旺财 (狗 - DOG002)
...
```

**当前宠物信息卡片**：
- 背景：紫色渐变（#667eea → #764ba2）
- 图标：32px，跳动动画
- 阴影：悬浮时上浮效果
- 响应式：移动端全宽显示

### 头部动态效果

切换宠物时的变化：
1. 图标立即更新（emoji变化）
2. 标题文字更新（"{宠物名}的日报"）
3. 副标题更新（"{物种类型} • {宠物ID}"）
4. 平滑过渡动画

## 🛠️ 自定义修改

### 添加新宠物

需要修改两个文件保持同步：

**1. scripts/importMultiPetData.js**
```javascript
const PETS = [
  // ... 现有宠物
  {
    id: 'DOG006',           // 宠物ID
    name: '球球',           // 宠物名称
    species: 1,             // 1=狗, 2=猫
    icon: '🐕',            // emoji图标
    baseSteps: 9000,        // 基础步数
    baseTemp: 38.4,         // 基础体温
    activityLevel: 'high',  // 活动等级
    location: { lat: 39.9042, lng: 116.4074 }, // GPS坐标
    trackerid: 18200231,    // 设备ID
    customer: 30594         // 客户ID
  }
];
```

**2. client/src/components/DateSelector.js**
```javascript
const PETS = [
  // ... 现有宠物
  { id: 'DOG006', name: '球球', species: 1, icon: '🐕', type: '狗' }
];
```

**3. client/src/App.js**（同上）

### 修改活动等级参数

```javascript
const ACTIVITY_LEVELS = {
  low: { 
    stepMultiplier: 0.7,    // 步数倍数
    activeHours: 6          // 活动小时数
  },
  medium: { 
    stepMultiplier: 1.0, 
    activeHours: 8 
  },
  high: { 
    stepMultiplier: 1.3, 
    activeHours: 10 
  },
  very_high: { 
    stepMultiplier: 1.6, 
    activeHours: 12 
  }
};
```

### 修改GPS范围

```javascript
// 在 generateGPSTrack 函数中
const radius = 0.01; // 0.01 ≈ 1公里, 0.02 ≈ 2公里
```

## 📝 注意事项

1. **数据量**：
   - 10个宠物 × 7天 × 24小时 = 1680条记录
   - 每条记录包含50+字段
   - 总存储：约2-5MB（压缩后）

2. **导入时间**：
   - 本地数据库：10-20秒
   - 远程数据库：可能需要1-2分钟

3. **ID命名规则**：
   - 狗：DOG001, DOG002, DOG003...
   - 猫：CAT001, CAT002, CAT003...
   - 建议保持此格式便于识别

4. **物种ID标准**：
   - 1 = 狗
   - 2 = 猫
   - 其他物种ID需扩展定义

5. **同步修改**：
   - 修改宠物列表时，必须同时更新：
     - importMultiPetData.js
     - DateSelector.js
     - App.js

## 🔄 重新导入数据

### 完全重置

```bash
# 1. 删除旧数据
influx -database pet_health -execute "DROP MEASUREMENT pet_activity"

# 2. 重新导入所有宠物
node scripts/importMultiPetData.js
```

### 只导入特定宠物

修改脚本临时注释部分宠物：

```javascript
const PETS = [
  { id: 'DOG001', ... },  // 保留
  // { id: 'CAT001', ... },  // 注释掉不导入
  { id: 'DOG002', ... },  // 保留
];
```

### 删除单个宠物数据

```bash
influx -database pet_health -execute "DELETE FROM pet_activity WHERE petId='DOG001'"
```

## ✅ 验收检查清单

导入完成后，检查以下项目：

- [ ] 运行 `importMultiPetData.js` 成功无报错
- [ ] 数据库包含1680条记录
- [ ] 每个宠物有168条记录（7×24）
- [ ] 前端下拉菜单显示10个宠物
- [ ] 切换宠物后头部图标和名称更新
- [ ] 当前宠物信息卡片正确显示
- [ ] 日报数据随宠物切换变化
- [ ] GPS地图显示对应城市的轨迹
- [ ] 步数数据符合活动等级
- [ ] API查询所有宠物都返回正常

## 🐛 常见问题

### Q1: 导入脚本报错"数据库连接失败"

**解决方案**：
```bash
# 检查InfluxDB是否运行
influx ping

# 检查.env配置
cat .env | grep INFLUX

# 确认配置正确
INFLUX_HOST=localhost
INFLUX_PORT=8086
INFLUX_DATABASE=pet_health
```

### Q2: 前端下拉菜单为空

**原因**：DateSelector.js中的PETS数组未定义

**解决方案**：确保DateSelector.js和App.js中都有PETS数组定义

### Q3: 切换宠物后数据不变

**原因**：petId状态未正确传递

**解决方案**：检查App.js中的`setPetId`是否正确传递给DateSelector

### Q4: GPS地图不显示轨迹

**检查**：
```bash
# 查看该宠物是否有GPS数据
influx -database pet_health -execute \
  "SELECT COUNT(*) FROM pet_activity WHERE petId='DOG001' AND LATITUDE IS NOT NULL"
```

### Q5: 步数显示为0

**原因**：活动时间配置或数据生成逻辑问题

**检查**：
```bash
# 查看具体步数数据
influx -database pet_health -execute \
  "SELECT time, STEP FROM pet_activity WHERE petId='DOG001' ORDER BY time DESC LIMIT 10"
```

## 📚 相关文档

- [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) - 完整表结构说明
- [QUERY-EXAMPLES.md](./QUERY-EXAMPLES.md) - InfluxQL查询示例
- [FIELD-MAPPING.md](./FIELD-MAPPING.md) - 字段映射快速参考
- [UPDATE-SUMMARY.md](./UPDATE-SUMMARY.md) - Schema更新说明

## 🎯 下一步

完成多宠物功能后，可以：

1. **添加宠物对比功能**：同时查看多个宠物的数据对比
2. **宠物分组**：按物种、活动等级、城市分组
3. **排行榜**：显示步数、活动时长排名
4. **数据统计**：多宠物的聚合统计
5. **批量操作**：批量查询、导出数据

---

**版本**: v1.4.0  
**更新时间**: 2026-02-02  
**功能**: 多物种数据管理
