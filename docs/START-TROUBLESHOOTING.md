# 🔧 启动脚本故障排查指南

## 问题：start.bat 启动后立即退出

---

## 🔍 快速诊断

### 步骤1：运行诊断脚本

```cmd
scripts\test-env.bat
```

这会检查：
- Node.js 是否安装
- npm 是否可用
- InfluxDB 是否运行
- 必要文件是否存在
- 依赖是否安装

---

## 💡 常见原因和解决方案

### 原因1：InfluxDB 未启动

**症状：**
- 脚本停在 "检查 InfluxDB" 步骤
- 提示 "InfluxDB 未启动"

**解决方案：**
```cmd
# 方式1：使用脚本启动
scripts\start-influxdb.bat

# 方式2：检查 InfluxDB 是否安装
dir C:\InfluxDB

# 方式3：手动安装
scripts\install-influxdb.bat
```

---

### 原因2：依赖未安装

**症状：**
- 脚本停在依赖安装步骤
- npm install 报错

**解决方案：**
```cmd
# 清理并重新安装
npm cache clean --force
rmdir /s /q node_modules
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

---

### 原因3：权限问题

**症状：**
- 提示 "拒绝访问"
- 文件无法创建

**解决方案：**
```cmd
# 以管理员身份运行 CMD
# 右键点击 CMD -> 以管理员身份运行
# 然后再运行启动脚本
```

---

### 原因4：路径问题

**症状：**
- 提示找不到文件
- 当前目录不正确

**解决方案：**
```cmd
# 确保在项目根目录运行
cd /d d:\codex-project\pet-health-daily\pet-health-daily

# 然后运行
scripts\start.bat
```

---

### 原因5：curl 命令不可用

**症状：**
- 提示 "'curl' 不是内部或外部命令"

**解决方案：**
```cmd
# Windows 10 1803+ 自带 curl
# 如果没有，使用 PowerShell 版本：
powershell -Command "Invoke-RestMethod http://localhost:8086/ping"

# 或下载 curl：
# https://curl.se/windows/
```

---

## 🚀 替代启动方式

### 方式1：使用简化启动脚本

```cmd
scripts\start-simple.bat
```

这是一个最小化的启动脚本，跳过复杂检查。

---

### 方式2：手动分步启动

```cmd
# 1. 启动 InfluxDB（新窗口）
start scripts\start-influxdb.bat

# 2. 等待 5 秒

# 3. 安装依赖（如果需要）
npm install
cd client && npm install && cd ..

# 4. 启动服务
npm run dev
```

---

### 方式3：使用 PowerShell

创建 `start.ps1`：
```powershell
Write-Host "启动宠物日报系统..." -ForegroundColor Green

# 检查 InfluxDB
$response = Invoke-WebRequest -Uri "http://localhost:8086/ping" -UseBasicParsing -ErrorAction SilentlyContinue
if (-not $response) {
    Write-Host "InfluxDB 未运行，请先启动" -ForegroundColor Red
    exit
}

# 启动服务
npm run dev
```

运行：
```cmd
powershell -ExecutionPolicy Bypass -File start.ps1
```

---

## 📝 调试技巧

### 1. 查看详细错误信息

在 `start.bat` 第一行后添加：
```batch
@echo on
```

这会显示所有执行的命令。

---

### 2. 添加暂停点

在怀疑出错的地方添加：
```batch
pause
```

这会暂停脚本，让你看到错误信息。

---

### 3. 输出到日志文件

```cmd
scripts\start.bat > start.log 2>&1
```

然后查看 `start.log` 文件。

---

### 4. 逐步执行

手动执行脚本中的每一步命令，找出哪一步失败。

---

## 🛠️ 创建自定义启动脚本

如果官方脚本有问题，创建自己的 `my-start.bat`：

```batch
@echo off
echo 启动我的宠物日报系统...

:: 1. 进入项目目录
cd /d d:\codex-project\pet-health-daily\pet-health-daily

:: 2. 检查 Node.js
node --version || (
    echo Node.js 未安装
    pause
    exit /b 1
)

:: 3. 启动服务（假设 InfluxDB 已运行）
npm run dev

pause
```

---

## 📊 状态检查命令

### 检查 Node.js
```cmd
node --version
npm --version
```

### 检查 InfluxDB
```cmd
curl http://localhost:8086/ping
```

### 检查依赖
```cmd
npm list --depth=0
```

### 检查端口占用
```cmd
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :8086
```

---

## 🎯 终极解决方案

如果所有方法都失败，使用最基础的启动方式：

```cmd
# 终端1：启动 InfluxDB
cd C:\InfluxDB
influxd.exe

# 终端2：启动后端
cd d:\codex-project\pet-health-daily\pet-health-daily
npm run server

# 终端3：启动前端
cd d:\codex-project\pet-health-daily\pet-health-daily\client
npm start
```

---

## 📞 获取帮助

如果问题仍未解决，请提供以下信息：

1. 运行 `scripts\test-env.bat` 的完整输出
2. 运行 `scripts\start.bat` 的完整错误信息
3. `node --version` 和 `npm --version` 输出
4. 操作系统版本（`winver` 命令）
5. 是否以管理员身份运行

将这些信息发送到 GitHub Issue 或技术支持。

---

## ✅ 成功启动的标志

启动成功后，你应该看到：

```
========================================
   启动服务中...
========================================

[后端日志]
Server running on port 3001
InfluxDB 连接成功
SQLite 数据库连接成功

[前端日志]
Compiled successfully!
Local: http://localhost:3000
```

浏览器会自动打开 http://localhost:3000

---

**更新时间：2026-02-03**
