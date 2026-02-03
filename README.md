# 宠物日报系统 (Pet Health Daily Report)

基于 InfluxDB 1.8 的宠物健康数据日报系统，将宠物可穿戴设备的原始数据转化为结构化、可解释的每日健康摘要。

![系统界面](docs/screenshot.png)

## 📋 系统概述

### 核心功能
- **活动数据分析**：计算日步数、达标率、活动等级
- **体征监测**：体表温度、气压等生理指标监测
- **趋势对比**：今日 vs 昨日、今日 vs 近7日均值
- **设备状态监控**：电量、信号强度、设备在线状态
- **多物种管理** 🆕：支持10个不同宠物的数据切换查看
  - 智能下拉选择器
  - 动态头部显示
  - 物种差异化数据
  - 不同城市GPS轨迹
- **AI 深度健康洞察**：DeepSeek AI 提供专业健康分析和个性化建议
  - 智能健康评分（0-100分）
  - 关键发现识别
  - 详细的活动、体征、趋势分析
  - 个性化专家建议
  - 风险告警提示
  - 支持流式实时分析
- **GPS 轨迹地图**：百度地图实时展示宠物活动轨迹
  - 实时读取 InfluxDB GPS 数据
  - 起点/终点/轨迹点标记
  - 轨迹统计（距离、时长、速度）
  - 支持轨迹抽稀和优化
  - 响应式设计（PC/平板/手机）

### 技术栈
- **后端**：Node.js + Express
- **数据库**：InfluxDB 1.8（时序数据库）
- **前端**：React 18
- **AI 服务**：DeepSeek API
- **地图服务**：百度地图 JavaScript GL API
- **数据可视化**：自定义 SVG + 百度地图

## 🚀 快速开始

### 方式1：一键启动（推荐）⚡

**Windows 用户最简单的启动方式：**

```bash
# 双击运行或在命令行执行
scripts\start.bat
```

一键启动脚本会自动完成：
1. ✅ 检查 Node.js 和 npm 环境
2. ✅ 检查并启动 InfluxDB 服务
3. ✅ 创建 .env 配置文件
4. ✅ 安装所有依赖（前端+后端）
5. ✅ 初始化数据库和表
6. ✅ 导入测试数据（10个宠物）
7. ✅ 启动前后端服务

> 💡 **提示**：如果 InfluxDB 未安装，脚本会提示下载地址

### 方式2：快速启动（已完成初始化）

如果已经完成过一次完整启动：

```bash
scripts\quick-start.bat
```

### 方式3：手动启动（完整控制）

#### 环境要求
- Node.js >= 14.x
- InfluxDB 1.8
- npm or yarn

#### 1. 安装 InfluxDB 1.8

**Windows:**
```bash
# 方式1：使用安装脚本（推荐）
scripts\install-influxdb.bat

# 方式2：手动下载
# https://portal.influxdata.com/downloads/
```

**Linux/Mac:**
```bash
# 使用 Docker
docker run -d -p 8086:8086 \
  --name influxdb \
  -v influxdb-data:/var/lib/influxdb \
  influxdb:1.8
```

#### 2. 启动 InfluxDB

```bash
# Windows
scripts\start-influxdb.bat

# Linux/Mac (Docker)
docker start influxdb
```

#### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，配置数据库连接和 API Keys
```

`.env` 文件内容：
```env
INFLUX_HOST=localhost
INFLUX_PORT=8086
INFLUX_DATABASE=pet_health
INFLUX_USERNAME=admin
INFLUX_PASSWORD=admin

# AI 服务配置（可选）
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
AI_TIMEOUT=30000

# 百度地图配置
BAIDU_MAP_AK=your_baidu_map_ak_here

PORT=3001
NODE_ENV=development
```

> 💡 **配置说明**：
> - **AI 功能**：配置 DeepSeek API Key 启用 AI 分析，否则使用规则引擎。详见 [AI-SETUP.md](docs/AI-SETUP.md)
> - **地图功能**：配置百度地图 AK 启用轨迹地图。详见 [BAIDU-MAP-SETUP.md](docs/BAIDU-MAP-SETUP.md)

#### 4. 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

#### 5. 创建数据库

```bash
# Windows
scripts\create-database.bat

# 或手动创建
influx
> CREATE DATABASE pet_health
> exit
```

#### 6. 导入测试数据

**方式1：导入10个宠物数据（推荐）** 🆕
```bash
node scripts/importMultiPetData.js
```

**方式2：导入单个宠物数据（快速测试）**
```bash
node scripts/importTestData.js
```

**导入内容**：
- 10个不同宠物（5只狗 + 5只猫）
- 分布在10个不同城市
- 不同活动等级（低/中/高/极高）
- 近7天完整数据（1680条记录）

详见：[多物种数据导入指南](docs/MULTI-PET-GUIDE.md)

#### 7. 启动服务

```bash
# 开发模式（同时启动前后端）
npm run dev

# 或分别启动
npm run server  # 后端服务：http://localhost:3001
npm run client  # 前端服务：http://localhost:3000
```

访问 `http://localhost:3000` 查看系统界面。

### 实用脚本命令

```bash
# 检查系统状态
scripts\check-status.bat

# 停止所有服务
scripts\stop.bat

# 完整启动流程（详细输出）
scripts\full-start.bat

# 重启 InfluxDB
scripts\restart-influxdb.bat
```

## 📊 数据模型

### InfluxDB Measurement: pet_activity

| Field | Type | Description |
|-------|------|-------------|
| STEP | Integer | 累计步数 |
| STRIDE | Float | 步幅 |
| STEPLIMIT | Integer | 目标步数 |
| T1/T2/T3 | Integer | 分时段活动 |
| TRACKINGMODE | Integer | 运动状态 |
| TEMP | Float | 体表温度 |
| PRESS | Float | 气压 |
| BATVOL | Float | 电池电压 |
| SOC | Float | 电量百分比 |
| RSRP | Float | 信号强度 |
| TAMPERALARM | Integer | 防拆告警 |
| **LATITUDE** 🆕 | Float | GPS纬度 |
| **LONGITUDE** 🆕 | Float | GPS经度 |
| **ALTITUDE** 🆕 | Float | 海拔高度 |
| **SPEED** 🆕 | Float | 移动速度 |
| **HEADING** 🆕 | Float | 方向角 |

**Tags:**
- `petId`: 宠物ID

## 🔌 API 接口

### 获取日报
```
GET /api/report/:petId?date=YYYY-MM-DD
```

**参数：**
- `petId` (必填): 宠物ID
- `date` (可选): 日期，默认今天

**响应示例：**
```json
{
  "success": true,
  "data": {
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
}
```

### 获取历史日报
```
GET /api/report/:petId/history?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

### AI 深度健康分析 🆕
```
POST /api/ai/analyze
Content-Type: application/json

{
  "petId": "221",
  "date": "2026-02-02"
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "healthScore": 85,
    "healthLevel": "良好",
    "keyFindings": ["...", "...", "..."],
    "detailedAnalysis": {
      "activity": "...",
      "vitals": "...",
      "trend": "..."
    },
    "recommendations": [
      {
        "priority": "high",
        "category": "运动",
        "title": "活动量不足",
        "content": "建议增加...",
        "icon": "🏃"
      }
    ],
    "alerts": [],
    "summary": "综合评估..."
  }
}
```

详细 API 文档请查看 [AI-SETUP.md](docs/AI-SETUP.md)

### GPS 轨迹查询 🆕

**获取日轨迹**
```
GET /api/location/track/:petId?date=YYYY-MM-DD&simplify=true
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "petId": "221",
    "date": "2026-02-02",
    "track": [
      {
        "time": "2026-02-02 06:15:23",
        "lat": 39.9042,
        "lng": 116.4074,
        "altitude": 45.5,
        "speed": 1.2,
        "heading": 135.5,
        "step": 1500
      }
    ],
    "stats": {
      "totalDistance": 2580.5,
      "totalPoints": 16,
      "maxSpeed": 2.8,
      "avgSpeed": 1.5,
      "duration": 480
    }
  }
}
```

详细 API 文档请查看 [BAIDU-MAP-SETUP.md](docs/BAIDU-MAP-SETUP.md)

## 📁 项目结构

```
pet-health-daily/
├── server/                    # 后端服务
│   ├── config/               # 配置文件
│   │   └── influx.js        # InfluxDB 配置
│   ├── services/            # 业务逻辑
│   │   ├── petDataService.js        # 数据访问层
│   │   ├── dailyReportService.js    # 日报生成服务
│   │   ├── aiAnalysisService.js     # AI 分析服务
│   │   └── locationService.js       # GPS 轨迹服务 🆕
│   ├── routes/              # 路由
│   │   ├── reportRoutes.js
│   │   ├── aiRoutes.js
│   │   └── locationRoutes.js        # GPS API 路由 🆕
│   └── index.js             # 入口文件
├── client/                   # 前端应用
│   ├── public/
│   └── src/
│       ├── components/      # React 组件
│       │   ├── ActivityCard.js
│       │   ├── VitalsCard.js
│       │   ├── TrendCard.js
│       │   ├── DeviceCard.js
│       │   ├── AIInsightEnhanced.js
│       │   └── ActivityMapBaidu.js  # 百度地图组件 🆕
│       ├── App.js
│       └── index.js
├── scripts/                  # 工具脚本
│   └── importTestData.js    # 测试数据导入（含GPS）
├── docs/                     # 文档
│   ├── design-document.md   # 设计文档
│   ├── AI-SETUP.md          # AI 配置指南
│   └── BAIDU-MAP-SETUP.md   # 地图配置指南 🆕
├── .env.example             # 环境变量模板
├── package.json
└── README.md
```

## 🧪 测试数据

系统提供了测试数据导入脚本，包含：
- 宠物ID：221
- 日期范围：最近7天
- 模拟真实的活动、体征、设备数据

运行测试数据导入：
```bash
node scripts/importTestData.js
```

## 🆕 新功能亮点

### AI 深度健康洞察

系统集成了 DeepSeek AI，提供专业级的健康分析：

#### 功能特性
- 🎯 **智能健康评分**：0-100分量化评估
- 🔍 **关键发现识别**：自动提取重要健康信号
- 📊 **多维度分析**：活动、体征、趋势全方位解读
- 💡 **个性化建议**：根据宠物实际情况定制
- ⚠️ **风险预警**：及时发现异常情况
- ⚡ **流式体验**：实时显示分析过程

#### 响应式设计
- ✅ 完美适配 PC、平板、手机
- ✅ 流畅的动画和交互
- ✅ 优雅的加载和错误处理

#### 降级方案
当 AI 服务不可用时，系统自动使用基于规则的分析引擎，确保功能始终可用。

配置详见：[AI-SETUP.md](docs/AI-SETUP.md)

## 📖 设计文档

详细设计文档请参考：
- [宠物日报设计文档](docs/design-document.md) - 核心设计原则和数据模型
- [数据库Schema说明](docs/DATABASE-SCHEMA.md) - InfluxDB完整表结构文档
- [Schema更新记录](docs/SCHEMA-UPDATE.md) - 数据库变更和迁移指南
- [字段映射快速参考](docs/FIELD-MAPPING.md) - 字段对照表和使用说明
- [InfluxQL查询示例](docs/QUERY-EXAMPLES.md) - 200+条查询示例
- [多物种数据管理](docs/MULTI-PET-GUIDE.md) - 10个宠物数据导入和切换 🆕
- [AI 配置指南](docs/AI-SETUP.md) - DeepSeek AI 集成和使用指南
- [百度地图配置指南](docs/BAIDU-MAP-SETUP.md) - GPS 轨迹地图集成指南

核心设计原则：
1. 不直接展示原始设备字段
2. 不将设备异常等同于健康异常
3. 优先使用相对趋势而非绝对值
4. 所有结论需可解释、可复现

## 🔧 开发指南

### 添加新的计算指标

1. 在 `server/services/dailyReportService.js` 中添加计算方法
2. 更新日报输出结构
3. 在前端添加对应的展示组件

### 自定义 AI 建议规则

编辑 `server/services/dailyReportService.js` 中的 `generateAdvice` 方法。

## 🚨 故障排查

### InfluxDB 连接失败
- 确认 InfluxDB 服务已启动
- 检查 `.env` 配置是否正确
- 验证数据库是否已创建

### 前端无法加载数据
- 确认后端服务已启动（端口 3001）
- 检查浏览器控制台错误信息
- 确认宠物ID在数据库中存在数据

### AI 分析不可用
- 检查 `.env` 中 `DEEPSEEK_API_KEY` 配置
- 验证 API Key 是否有效
- 查看后端日志排查错误
- 系统会自动降级到规则引擎

### 数据显示异常
- 确认时区配置（默认 Asia/Shanghai）
- 检查原始数据是否完整
- 查看后端日志排查计算错误

## 📝 更新日志

### v1.4.0 (2026-02-02)
- ✨ **新增多物种管理功能**
- 🐕🐱 支持10个不同宠物数据切换（5只狗 + 5只猫）
- 🎨 智能下拉选择器（带图标和宠物信息）
- 🗺️ 不同城市GPS轨迹分布
- 📊 物种差异化数据展示
- 🏃 不同活动等级配置（低/中/高/极高）
- 🎯 动态头部显示当前宠物
- 📝 新增多物种数据导入指南

### v1.3.0 (2026-02-02)
- ✨ **重大更新**: 适配客户实际 InfluxDB 表结构
- 📊 新增50+字段支持（设备标识、传感器、通信数据等）
- 🔄 GPS字段调整：ALTITUDE→HEIGHT, 新增RADIUS、DEM
- 🏃 活动统计优化：基于T1/T2/T3计算走路/快走/跑步时长
- 📝 新增完整的数据库Schema文档
- 📝 新增Schema更新迁移指南
- 🐛 修复速度计算逻辑

### v1.2.0 (2026-02-02)
- ✨ 新增百度地图 GPS 轨迹功能
- ✨ 实时读取 InfluxDB GPS 坐标数据
- ✨ 轨迹统计（距离、时长、速度）
- ✨ 起点/终点/轨迹点标记
- ✨ 支持轨迹抽稀优化
- ✨ 完美响应式设计
- 📊 数据库新增 GPS 相关字段
- 🐛 修复已知问题

### v1.1.0 (2026-02-02)
- ✨ 新增 AI 深度健康洞察功能
- ✨ 集成 DeepSeek API 进行智能分析
- ✨ 支持流式分析实时反馈
- ✨ 添加降级方案确保服务可用
- 🎨 优化移动端响应式体验
- 📱 完美适配 PC、平板、手机
- 🐛 修复已知问题

### v1.0.0 (2026-01-26)
- 🎉 初始版本发布
- ✨ 基础日报功能
- ✨ InfluxDB 1.8 集成
- ✨ 活动、体征、趋势分析
- ✨ 设备状态监控

## 📝 待办事项

- [ ] 添加数据导出功能（PDF/Excel）
- [ ] 实现多宠物对比视图
- [ ] 集成更多体征指标（心率、血氧等）
- [ ] 添加用户认证系统
- [ ] 实现实时数据推送（WebSocket）
- [ ] 移动端适配优化

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 邮箱：support@example.com
