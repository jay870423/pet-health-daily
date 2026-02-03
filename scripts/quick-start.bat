@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo    🚀 宠物日报系统 - 快速启动
echo ========================================
echo.
echo  (跳过环境检查，适合已完成初始化的用户)
echo.

cd /d "%~dp0.."

:: 检查 InfluxDB
echo  📡 检查 InfluxDB 连接...
curl -s http://localhost:8086/ping >nul 2>&1
if errorlevel 1 (
    echo  ❌ InfluxDB 未启动！
    echo.
    echo  请选择以下操作:
    echo  1. 自动启动 InfluxDB (推荐)
    echo  2. 手动启动 InfluxDB
    echo  3. 退出
    echo.
    set /p CHOICE="请输入选项 (1-3): "
    
    if "!CHOICE!"=="1" (
        set INSTALL_DIR=C:\InfluxDB
        if exist "!INSTALL_DIR!\influxd.exe" (
            echo.
            echo  🚀 启动 InfluxDB...
            start "InfluxDB 1.8" cmd /c "cd /d !INSTALL_DIR! && influxd.exe"
            echo  ⏳ 等待启动（8秒）...
            timeout /t 8 >nul
        ) else (
            echo.
            echo  ❌ 未找到 InfluxDB，请运行完整启动脚本
            pause
            exit /b 1
        )
    ) else if "!CHOICE!"=="2" (
        echo.
        echo  请在新窗口运行: scripts\start-influxdb.bat
        echo  启动完成后按任意键继续...
        pause
    ) else (
        exit /b 0
    )
)

echo  ✅ InfluxDB 已连接
echo.
echo ========================================
echo    🎯 启动应用服务
echo ========================================
echo.
echo  📍 访问地址:
echo     http://localhost:3000
echo.
echo  💡 按 Ctrl+C 停止服务
echo.
echo ========================================
echo.

call npm run dev
