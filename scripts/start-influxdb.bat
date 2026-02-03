@echo off
chcp 65001 >nul
echo ========================================
echo    启动 InfluxDB 1.8
echo ========================================
echo.

set INSTALL_DIR=C:\InfluxDB

if not exist "%INSTALL_DIR%\influxd.exe" (
    echo ❌ 找不到 InfluxDB！
    echo 请先运行 install-influxdb.bat 安装
    pause
    exit /b 1
)

echo 正在启动 InfluxDB...
echo 数据目录: %INSTALL_DIR%\data
echo HTTP 端口: 8086
echo.
echo ⚠️  请保持此窗口打开！按 Ctrl+C 可停止服务
echo.
echo ========================================
echo.

cd /d "%INSTALL_DIR%"
influxd.exe
