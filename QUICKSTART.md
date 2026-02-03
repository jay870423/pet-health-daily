# 🚀 宠物日报系统 - 快速启动指南

## 一键启动（推荐）

### Windows 用户

**最简单的方式 - 双击运行：**

1. 在文件管理器中找到 `scripts\start.bat`
2. 双击运行
3. 等待自动完成所有初始化（约2-5分钟）
4. 浏览器会自动打开 http://localhost:3000

**或在命令行运行：**

```cmd
# 进入项目目录
cd pet-health-daily

# 运行一键启动脚本
scripts\start.bat
```

### 一键启动脚本会做什么？

✅ **环境检查**
- 检查 Node.js 和 npm 是否已安装
- 如果缺少环境，会提示安装地址

✅ **InfluxDB 管理**
- 检查 InfluxDB 是否运行
- 如果未运行但已安装，自动启动
- 如果未安装，提示安装方式

✅ **配置管理**
- 自动创建 `.env` 配置文件
- 从 `.env.example` 复制默认配置

✅ **依赖安装**
- 自动安装后端依赖（根目录）
- 自动安装前端依赖（client/）

✅ **数据库初始化**
- 创建 InfluxDB 数据库 `pet_health`
- 初始化 SQLite 数据库（管理功能）

✅ **测试数据导入**
- 导入10个宠物的测试数据
- 包含近7天的完整数据
- 只在首次运行时导入

✅ **启动服务**
- 同时启动前端和后端服务
- 前端：http://localhost:3000
- 后端：http://localhost:3001
- 管理后台：http://localhost:3000/admin

---

## 快速启动（已完成初始化）

如果你已经运行过一次完整启动，可以使用快速启动：

```cmd
scripts\quick-start.bat
```

**快速启动特点：**
- ⚡ 跳过依赖安装检查
- ⚡ 跳过数据导入步骤
- ⚡ 仅检查 InfluxDB 连接
- ⚡ 直接启动服务

---

## 实用脚本命令

### 检查系统状态

```cmd
scripts\check-status.bat
```

**检查内容：**
- ✅ Node.js / npm 版本
- ✅ 后端/前端依赖安装状态
- ✅ InfluxDB 运行状态
- ✅ 数据库和数据是否存在
- ✅ SQLite 数据库状态
- ✅ 服务运行状态（端口3000/3001）
- ✅ 配置文件状态

### 停止所有服务

```cmd
scripts\stop.bat
```

**停止内容：**
- 🛑 停止 Node.js 进程（前端+后端）
- 🛑 可选停止 InfluxDB 服务

### 完整启动流程

```cmd
scripts\full-start.bat
```

与 `start.bat` 类似，但提供更详细的输出信息。

### InfluxDB 管理

```cmd
# 启动 InfluxDB
scripts\start-influxdb.bat

# 重启 InfluxDB
scripts\restart-influxdb.bat

# 创建数据库
scripts\create-database.bat

# 安装 InfluxDB（如果未安装）
scripts\install-influxdb.bat
```

### 数据导入

```cmd
# 导入10个宠物的测试数据（推荐）
node scripts\importMultiPetData.js

# 导入单个宠物数据（快速测试）
node scripts\importTestData.js

# 快速导入（3个宠物）
node scripts\importQuickData.js
```

---

## 访问地址

启动成功后，可以访问以下地址：

| 服务 | 地址 | 说明 |
|------|------|------|
| 🏠 **前端页面** | http://localhost:3000 | 宠物健康日报主界面 |
| 🔧 **后端API** | http://localhost:3001 | RESTful API 服务 |
| 👤 **管理后台** | http://localhost:3000/admin | 宠物信息管理（需登录） |
| 📊 **InfluxDB** | http://localhost:8086 | 时序数据库 |

### 默认账号

**管理员登录：**
- 用户名：`admin`
- 密码：`admin123`

---

## 常见问题

### 1. InfluxDB 启动失败

**症状：** 提示 "InfluxDB 未启动"

**解决方案：**
```cmd
# 方式1：使用脚本启动
scripts\start-influxdb.bat

# 方式2：检查是否已安装
# 查看 C:\InfluxDB 目录是否存在

# 方式3：手动安装
scripts\install-influxdb.bat
```

### 2. 依赖安装失败

**症状：** npm install 报错

**解决方案：**
```cmd
# 清理缓存
npm cache clean --force

# 删除 node_modules
rmdir /s /q node_modules
rmdir /s /q client\node_modules

# 重新安装
npm install
cd client && npm install
```

### 3. 端口被占用

**症状：** "port 3000 already in use"

**解决方案：**
```cmd
# 查看占用端口的进程
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# 停止占用进程
taskkill /F /PID <进程ID>

# 或使用停止脚本
scripts\stop.bat
```

### 4. 无法访问前端页面

**症状：** 浏览器显示无法连接

**检查步骤：**
```cmd
# 1. 检查服务状态
scripts\check-status.bat

# 2. 查看是否有错误日志
# 3. 确认防火墙没有阻止端口3000

# 4. 手动访问
# http://localhost:3000
```

### 5. 数据显示为空

**症状：** 界面显示但没有数据

**解决方案：**
```cmd
# 1. 检查 InfluxDB 是否有数据
curl -G "http://localhost:8086/query" --data-urlencode "db=pet_health" --data-urlencode "q=SELECT COUNT(*) FROM pet_location"

# 2. 重新导入测试数据
node scripts\importMultiPetData.js

# 3. 检查日期是否正确（默认显示今天）
```

### 6. AI 分析不可用

**症状：** "AI分析服务暂不可用"

**解决方案：**
```cmd
# 1. 编辑 .env 文件
# 2. 配置 DEEPSEEK_API_KEY
# 3. 重启服务

# 注意：即使不配置，系统会使用规则引擎降级处理
```

### 7. 地图不显示

**症状：** GPS轨迹地图显示空白

**解决方案：**
```cmd
# 1. 检查 .env 配置
# BAIDU_MAP_AK=your_baidu_map_ak_here

# 2. 获取百度地图 AK
# https://lbsyun.baidu.com/

# 3. 配置后重启服务
```

---

## 手动启动（完整步骤）

如果你想要了解完整的启动流程，可以按以下步骤手动操作：

### 1. 安装 InfluxDB 1.8

#### Windows
```bash
# 方式1：使用安装脚本
scripts\install-influxdb.bat

# 方式2：手动下载
# https://portal.influxdata.com/downloads/
```

#### Linux/Mac (Docker)
```bash
docker run -d -p 8086:8086 \
  --name influxdb \
  -v influxdb-data:/var/lib/influxdb \
  influxdb:1.8
```

### 2. 启动 InfluxDB

```bash
# Windows
scripts\start-influxdb.bat

# Linux/Mac (Docker)
docker start influxdb
```

### 3. 配置环境

```bash
# 复制环境变量模板
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac

# 编辑 .env 文件配置必要参数
```

### 4. 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

### 5. 创建数据库

```bash
# Windows
scripts\create-database.bat

# 或手动创建
influx
> CREATE DATABASE pet_health
> exit
```

### 6. 导入测试数据

```bash
node scripts\importMultiPetData.js
```

### 7. 启动服务

```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run server  # 后端：http://localhost:3001
npm run client  # 前端：http://localhost:3000
```

---

## 开发模式

### 单独启动前端

```cmd
cd client
npm start
```

### 单独启动后端

```cmd
npm run server
```

### 监听文件变化（热重载）

```cmd
# 后端使用 nodemon
npm install -g nodemon
nodemon server/index.js

# 前端自带热重载
cd client && npm start
```

---

## 更多文档

- 📖 [完整文档](README.md)
- 🎨 [设计文档](docs/design-document.md)
- 🤖 [AI配置指南](docs/AI-SETUP.md)
- 🗺️ [地图配置指南](docs/BAIDU-MAP-SETUP.md)
- 🐕 [多宠物管理](docs/MULTI-PET-GUIDE.md)
- 🗄️ [数据库Schema](docs/DATABASE-SCHEMA.md)

---

## 获取帮助

如果遇到问题：

1. 查看 [常见问题](#常见问题) 章节
2. 运行 `scripts\check-status.bat` 检查系统状态
3. 查看日志输出排查错误
4. 提交 GitHub Issue
5. 联系技术支持

---

**祝使用愉快！🐾**
