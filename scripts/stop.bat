@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo    🛑 停止宠物日报系统
echo ========================================
echo.

:: 停止 Node.js 进程
echo  🔍 查找 Node.js 进程...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo  ⏳ 正在停止 Node.js 进程...
    taskkill /F /IM node.exe >nul 2>&1
    echo  ✅ Node.js 进程已停止
) else (
    echo  ℹ️  未发现运行中的 Node.js 进程
)
echo.

:: 询问是否停止 InfluxDB
set /p STOP_INFLUX="是否停止 InfluxDB 服务？(Y/N): "
if /i "%STOP_INFLUX%"=="Y" (
    echo.
    echo  🔍 查找 InfluxDB 进程...
    tasklist /FI "IMAGENAME eq influxd.exe" 2>NUL | find /I /N "influxd.exe">NUL
    if "%ERRORLEVEL%"=="0" (
        echo  ⏳ 正在停止 InfluxDB...
        taskkill /F /IM influxd.exe >nul 2>&1
        echo  ✅ InfluxDB 已停止
    ) else (
        echo  ℹ️  未发现运行中的 InfluxDB 进程
    )
)

echo.
echo ========================================
echo    ✅ 服务已停止
echo ========================================
echo.
pause
