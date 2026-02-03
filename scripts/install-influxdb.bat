@echo off
chcp 65001 >nul
echo ========================================
echo    InfluxDB 1.8.10 Windows 自动安装脚本
echo ========================================
echo.

:: 设置安装目录
set INSTALL_DIR=C:\InfluxDB
set DOWNLOAD_URL=https://dl.influxdata.com/influxdb/releases/influxdb-1.8.10_windows_amd64.zip
set ZIP_FILE=%TEMP%\influxdb-1.8.10_windows_amd64.zip

echo [1/6] 检查安装目录...
if exist "%INSTALL_DIR%" (
    echo ⚠️  目录已存在: %INSTALL_DIR%
    echo 是否删除并重新安装？ (Y/N)
    set /p CONFIRM=
    if /i "%CONFIRM%"=="Y" (
        echo 正在删除旧版本...
        rmdir /s /q "%INSTALL_DIR%"
    ) else (
        echo 安装已取消
        pause
        exit /b
    )
)

echo [2/6] 创建安装目录...
mkdir "%INSTALL_DIR%"
mkdir "%INSTALL_DIR%\data"
mkdir "%INSTALL_DIR%\meta"
mkdir "%INSTALL_DIR%\wal"
echo ✅ 目录创建成功

echo.
echo [3/6] 下载 InfluxDB 1.8.10...
echo 下载地址: %DOWNLOAD_URL%
echo 下载到: %ZIP_FILE%
echo.
echo 正在使用 PowerShell 下载...
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%ZIP_FILE%'}"

if not exist "%ZIP_FILE%" (
    echo ❌ 下载失败！
    echo.
    echo 请手动下载:
    echo %DOWNLOAD_URL%
    echo.
    echo 然后解压到: %INSTALL_DIR%
    pause
    exit /b 1
)
echo ✅ 下载完成

echo.
echo [4/6] 解压文件...
powershell -Command "& {Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '%INSTALL_DIR%' -Force}"
echo ✅ 解压完成

:: 移动文件到根目录
if exist "%INSTALL_DIR%\influxdb-1.8.10-1\*" (
    echo 正在整理文件...
    xcopy /s /y "%INSTALL_DIR%\influxdb-1.8.10-1\*" "%INSTALL_DIR%\"
    rmdir /s /q "%INSTALL_DIR%\influxdb-1.8.10-1"
)

echo.
echo [5/6] 添加到系统 PATH...
powershell -Command "& {[Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'User') + ';%INSTALL_DIR%', 'User')}"
echo ✅ PATH 已更新

echo.
echo [6/6] 清理临时文件...
del "%ZIP_FILE%"
echo ✅ 清理完成

echo.
echo ========================================
echo    ✅ InfluxDB 1.8.10 安装成功！
echo ========================================
echo.
echo 安装目录: %INSTALL_DIR%
echo.
echo 📋 下一步操作:
echo.
echo 1. 启动 InfluxDB 服务器:
echo    cd %INSTALL_DIR%
echo    influxd.exe
echo.
echo 2. 打开新的命令提示符，创建数据库:
echo    influx.exe
echo    CREATE DATABASE pet_health
echo    exit
echo.
echo 3. 返回项目目录，导入测试数据:
echo    cd /d d:\codex-project\pet-health-daily\pet-health-daily
echo    node scripts/importMultiPetData.js
echo.
echo 4. 启动项目:
echo    npm run dev
echo.
echo ========================================
echo.
pause
