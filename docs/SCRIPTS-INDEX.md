# 📜 脚本命令索引

本文档列出所有可用的脚本命令及其用途。

---

## 🚀 启动脚本

### `start.bat` - 一键启动（推荐）

**用途：** 完整的一键启动脚本，自动完成所有初始化步骤

**功能：**
- ✅ 检查 Node.js 和 npm 环境
- ✅ 检查并自动启动 InfluxDB
- ✅ 创建 .env 配置文件
- ✅ 安装前后端依赖
- ✅ 初始化数据库
- ✅ 导入测试数据（首次）
- ✅ 启动前后端服务

**使用：**
```cmd
scripts\start.bat
```

**适用场景：**
- 首次使用系统
- 完整的环境初始化
- 不确定环境是否完整

---

### `quick-start.bat` - 快速启动

**用途：** 快速启动服务（跳过初始化检查）

**功能：**
- 检查 InfluxDB 连接
- 可选自动启动 InfluxDB
- 直接启动服务

**使用：**
```cmd
scripts\quick-start.bat
```

**适用场景：**
- 已完成初始化
- 日常开发启动
- 追求快速启动

---

### `full-start.bat` - 完整启动流程

**用途：** 详细的完整启动流程，提供详细输出

**功能：**
- 与 `start.bat` 类似
- 提供更详细的日志输出
- 适合排查问题

**使用：**
```cmd
scripts\full-start.bat
```

**适用场景：**
- 需要详细日志
- 排查启动问题
- 学习启动流程

---

## 🛑 停止脚本

### `stop.bat` - 停止所有服务

**用途：** 停止所有运行中的服务

**功能：**
- 停止所有 Node.js 进程
- 可选停止 InfluxDB

**使用：**
```cmd
scripts\stop.bat
```

**适用场景：**
- 完全停止系统
- 端口被占用需要清理
- 准备重启服务

---

## 📊 状态检查

### `check-status.bat` - 系统状态检查

**用途：** 全面检查系统运行状态

**检查项：**
- Node.js / npm 版本
- 后端/前端依赖状态
- InfluxDB 运行状态
- 数据库和数据状态
- SQLite 数据库状态
- 服务运行状态（端口监听）
- 配置文件状态

**使用：**
```cmd
scripts\check-status.bat
```

**输出示例：**
```
📦 Node.js
   ✅ 已安装 v18.16.0
📦 npm
   ✅ 已安装 v9.5.1

📦 后端依赖
   ✅ 已安装
📦 前端依赖
   ✅ 已安装

🗄️  InfluxDB 服务
   ✅ 运行中 (http://localhost:8086)
   ✅ 数据库 pet_health 已创建
   ✅ 已有测试数据

🗄️  SQLite 数据库
   ✅ 已创建

⚙️  配置文件
   ✅ .env 已配置

🚀 运行中的服务
   ✅ Node.js 进程运行中
   ✅ 后端服务 (http://localhost:3001)
   ✅ 前端服务 (http://localhost:3000)
```

**适用场景：**
- 排查问题
- 确认环境完整性
- 部署前检查

---

## 🗄️ InfluxDB 管理

### `install-influxdb.bat` - 安装 InfluxDB

**用途：** 自动下载并安装 InfluxDB 1.8

**功能：**
- 下载 InfluxDB 1.8 Windows 版
- 解压到 C:\InfluxDB
- 创建数据目录
- 配置基本设置

**使用：**
```cmd
scripts\install-influxdb.bat
```

**适用场景：**
- 首次安装
- InfluxDB 损坏需重装

---

### `start-influxdb.bat` - 启动 InfluxDB

**用途：** 启动 InfluxDB 服务

**功能：**
- 启动 InfluxDB 守护进程
- 监听端口 8086

**使用：**
```cmd
scripts\start-influxdb.bat
```

**适用场景：**
- InfluxDB 未运行时
- 系统重启后

---

### `restart-influxdb.bat` - 重启 InfluxDB

**用途：** 重启 InfluxDB 服务

**功能：**
- 停止现有 InfluxDB 进程
- 重新启动服务

**使用：**
```cmd
scripts\restart-influxdb.bat
```

**适用场景：**
- InfluxDB 异常需要重启
- 配置更改后

---

### `create-database.bat` - 创建数据库

**用途：** 创建 pet_health 数据库

**功能：**
- 连接 InfluxDB
- 创建数据库
- 显示数据库列表

**使用：**
```cmd
scripts\create-database.bat
```

**适用场景：**
- 首次初始化
- 数据库误删需重建

---

## 📥 数据导入

### `importMultiPetData.js` - 导入多宠物数据（推荐）

**用途：** 导入10个宠物的完整测试数据

**数据量：**
- 10个宠物（5只狗 + 5只猫）
- 近7天数据
- 约1680条记录

**使用：**
```cmd
node scripts\importMultiPetData.js
```

**适用场景：**
- 完整功能测试
- 演示系统
- 多宠物功能测试

---

### `importTestData.js` - 导入单宠物数据

**用途：** 导入单个宠物（ID: 221）的测试数据

**数据量：**
- 1个宠物
- 近7天数据
- 约168条记录

**使用：**
```cmd
node scripts\importTestData.js
```

**适用场景：**
- 快速测试
- 开发调试
- 单宠物功能测试

---

### `importQuickData.js` - 快速导入

**用途：** 快速导入少量测试数据

**数据量：**
- 3个宠物
- 近3天数据
- 约144条记录

**使用：**
```cmd
node scripts\importQuickData.js
```

**适用场景：**
- 最快速测试
- CI/CD 环境
- 最小数据集测试

---

## 📋 脚本使用建议

### 首次使用

```cmd
# 1. 一键启动（推荐）
scripts\start.bat

# 或手动步骤：
# 2. 安装 InfluxDB（如果未安装）
scripts\install-influxdb.bat

# 3. 启动 InfluxDB
scripts\start-influxdb.bat

# 4. 创建数据库
scripts\create-database.bat

# 5. 导入测试数据
node scripts\importMultiPetData.js

# 6. 启动服务
npm run dev
```

### 日常开发

```cmd
# 检查状态
scripts\check-status.bat

# 快速启动
scripts\quick-start.bat

# 停止服务
scripts\stop.bat
```

### 问题排查

```cmd
# 1. 检查状态
scripts\check-status.bat

# 2. 停止所有服务
scripts\stop.bat

# 3. 重启 InfluxDB
scripts\restart-influxdb.bat

# 4. 完整重启
scripts\start.bat
```

---

## 🔧 自定义脚本

### 创建自定义启动脚本

```cmd
@echo off
chcp 65001 >nul
echo 启动我的自定义配置...

:: 设置自定义环境变量
set PORT=3002
set NODE_ENV=development

:: 启动服务
npm run dev
```

### 创建自定义数据导入脚本

```javascript
// scripts/importMyData.js
const { importData } = require('./importMultiPetData');

// 自定义数据
const myPets = [
  { id: 'PET001', name: '我的宠物', ... }
];

importData(myPets);
```

---

## 📝 脚本开发规范

如果你想添加新的脚本，请遵循以下规范：

### 1. 命名规范
- 使用小写字母和连字符
- 批处理文件使用 `.bat` 扩展名
- Node.js 脚本使用 `.js` 扩展名

### 2. 编码规范
- 批处理文件开头添加 `chcp 65001 >nul`（支持中文）
- 提供清晰的错误提示
- 添加进度提示

### 3. 文档规范
- 在脚本顶部添加注释说明用途
- 在本文档中添加脚本说明
- 在 README 中添加使用示例

---

## 📞 获取帮助

如果脚本运行遇到问题：

1. 查看脚本内的错误提示
2. 运行 `scripts\check-status.bat` 检查状态
3. 查看相关日志文件
4. 参考 [常见问题](QUICKSTART.md#常见问题)
5. 提交 GitHub Issue

---

**脚本列表更新时间：2026-02-03**
