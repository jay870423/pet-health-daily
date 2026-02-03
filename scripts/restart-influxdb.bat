@echo off
chcp 65001 >nul
echo ========================================
echo    重启 InfluxDB 并创建数据库
echo ========================================
echo.

:: 杀掉所有 InfluxDB 进程
echo [1/4] 停止现有 InfluxDB 进程...
taskkill /F /IM influxd.exe >nul 2>&1
timeout /t 2 >nul
echo ✅ 已停止

:: 清理可能损坏的数据（可选）
echo.
echo [2/4] 检查安装目录...
if not exist "C:\InfluxDB\influxd.exe" (
    echo ❌ 找不到 InfluxDB 安装！
    echo 请先运行: scripts\install-influxdb.bat
    pause
    exit /b 1
)
echo ✅ 安装目录正常

:: 启动 InfluxDB
echo.
echo [3/4] 启动 InfluxDB...
start "InfluxDB" cmd /c "cd /d C:\InfluxDB && influxd.exe"
timeout /t 5 >nul
echo ✅ InfluxDB 已启动

:: 创建数据库
echo.
echo [4/4] 创建数据库...
timeout /t 2 >nul

cd /d C:\InfluxDB

:: 使用 influx CLI 创建数据库
echo CREATE DATABASE pet_health > %TEMP%\setup.sql
echo SHOW DATABASES >> %TEMP%\setup.sql

influx.exe -execute "CREATE DATABASE pet_health" 2>nul
timeout /t 1 >nul
influx.exe -execute "SHOW DATABASES"

del %TEMP%\setup.sql 2>nul

echo.
echo ========================================
echo    ✅ InfluxDB 就绪！
echo ========================================
echo.
echo InfluxDB 运行在: http://localhost:8086
echo 数据库: pet_health
echo.
echo 下一步：
echo   cd /d d:\codex-project\pet-health-daily\pet-health-daily
echo   node scripts\importQuickData.js
echo.
pause
