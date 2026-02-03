@echo off
chcp 65001 >nul
echo ========================================
echo    创建 pet_health 数据库
echo ========================================
echo.

set INSTALL_DIR=C:\InfluxDB

if not exist "%INSTALL_DIR%\influx.exe" (
    echo ❌ 找不到 InfluxDB CLI！
    echo 请先运行 install-influxdb.bat 安装
    pause
    exit /b 1
)

echo 正在连接 InfluxDB...
echo.

cd /d "%INSTALL_DIR%"

:: 创建临时 SQL 文件
echo CREATE DATABASE pet_health > %TEMP%\create_db.sql
echo SHOW DATABASES >> %TEMP%\create_db.sql

:: 执行 SQL 命令
influx.exe < %TEMP%\create_db.sql

del %TEMP%\create_db.sql

echo.
echo ========================================
echo    ✅ 数据库创建完成！
echo ========================================
echo.
echo 📋 下一步操作:
echo.
echo 1. 导入测试数据:
echo    cd /d d:\codex-project\pet-health-daily\pet-health-daily
echo    node scripts/importMultiPetData.js
echo.
echo 2. 启动项目:
echo    npm run dev
echo.
pause
