@echo off
echo.
echo ========================================
echo    宠物日报 - 最小启动
echo ========================================
echo.

cd /d "%~dp0.."

echo 检查 Node.js...
node --version
if errorlevel 1 (
    echo 错误: Node.js 未安装
    pause
    exit /b 1
)
echo.

echo 检查 InfluxDB...
curl -s http://localhost:8086/ping >nul 2>&1
if errorlevel 1 (
    echo 警告: InfluxDB 未运行
    echo 请先运行: scripts\start-influxdb.bat
    pause
    exit /b 1
)
echo InfluxDB 已运行
echo.

echo 检查依赖...
if not exist "node_modules" (
    echo 安装后端依赖...
    call npm install
)

if not exist "client\node_modules" (
    echo 安装前端依赖...
    cd client
    call npm install
    cd ..
)
echo.

echo ========================================
echo    启动服务
echo ========================================
echo.
echo 后端: http://localhost:3001
echo 前端: http://localhost:3000
echo.

call npm run dev
