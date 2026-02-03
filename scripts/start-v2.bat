@echo off
echo.
echo ====================================
echo    宠物日报系统 - 一键启动
echo ====================================
echo.

:: 切换到脚本所在目录的上级（项目根目录）
cd /d "%~dp0.."

:: 显示当前目录
echo 项目目录: %CD%
echo.

:: 检查 Node.js
echo [1/4] 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未安装 Node.js
    echo 请访问 https://nodejs.org/ 下载安装
    pause
    exit /b 1
)
echo OK
echo.

:: 检查 InfluxDB
echo [2/4] 检查 InfluxDB...
curl -s http://localhost:8086/ping >nul 2>&1
if %errorlevel% neq 0 (
    echo 警告: InfluxDB 未运行
    echo.
    echo 正在尝试启动 InfluxDB...
    if exist "C:\InfluxDB\influxd.exe" (
        start "InfluxDB" cmd /c "cd /d C:\InfluxDB && influxd.exe"
        echo 等待 10 秒...
        timeout /t 10 /nobreak >nul
        echo OK
    ) else (
        echo 错误: 未找到 InfluxDB
        echo 请运行: scripts\install-influxdb.bat
        pause
        exit /b 1
    )
) else (
    echo OK
)
echo.

:: 安装依赖
echo [3/4] 检查依赖...
if not exist "node_modules" (
    echo 安装后端依赖...
    call npm install --loglevel=error
    if %errorlevel% neq 0 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
)

if not exist "client\node_modules" (
    echo 安装前端依赖...
    cd client
    call npm install --loglevel=error
    if %errorlevel% neq 0 (
        cd ..
        echo 错误: 前端依赖安装失败
        pause
        exit /b 1
    )
    cd ..
)
echo OK
echo.

:: 启动服务
echo [4/4] 启动服务...
echo.
echo ====================================
echo.
echo 访问地址:
echo   http://localhost:3000
echo.
echo 管理后台:
echo   http://localhost:3000/admin
echo   用户名: admin
echo   密码: admin123
echo.
echo 提示: 按 Ctrl+C 停止服务
echo.
echo ====================================
echo.

:: 启动服务
call npm run dev
