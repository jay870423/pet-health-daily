@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo    📊 宠物日报系统 - 状态检查
echo ========================================
echo.

cd /d "%~dp0.."

:: 检查 Node.js
echo  📦 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo     ❌ 未安装
) else (
    for /f "tokens=*" %%i in ('node --version') do echo     ✅ 已安装 %%i
)

:: 检查 npm
echo  📦 npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo     ❌ 未安装
) else (
    for /f "tokens=*" %%i in ('npm --version') do echo     ✅ 已安装 v%%i
)
echo.

:: 检查后端依赖
echo  📦 后端依赖
if exist "node_modules\express" (
    echo     ✅ 已安装
) else (
    echo     ❌ 未安装 (运行 npm install)
)

:: 检查前端依赖
echo  📦 前端依赖
if exist "client\node_modules\react" (
    echo     ✅ 已安装
) else (
    echo     ❌ 未安装 (运行 npm install)
)
echo.

:: 检查 InfluxDB
echo  🗄️  InfluxDB 服务
curl -s http://localhost:8086/ping >nul 2>&1
if errorlevel 1 (
    echo     ❌ 未运行
    tasklist /FI "IMAGENAME eq influxd.exe" 2>NUL | find /I /N "influxd.exe">NUL
    if "%ERRORLEVEL%"=="0" (
        echo     ⚠️  进程存在但无法连接
    ) else (
        set INSTALL_DIR=C:\InfluxDB
        if exist "!INSTALL_DIR!\influxd.exe" (
            echo     ℹ️  已安装但未启动
        ) else (
            echo     ❌ 未安装
        )
    )
) else (
    echo     ✅ 运行中 (http://localhost:8086)
    
    :: 检查数据库
    curl -s -G "http://localhost:8086/query" --data-urlencode "q=SHOW DATABASES" 2>nul | find "pet_health" >nul
    if errorlevel 1 (
        echo     ⚠️  数据库 pet_health 不存在
    ) else (
        echo     ✅ 数据库 pet_health 已创建
        
        :: 检查数据
        for /f "tokens=*" %%i in ('curl -s -G "http://localhost:8086/query" --data-urlencode "db=pet_health" --data-urlencode "q=SELECT COUNT(*) FROM pet_location" 2^>nul') do set RESULT=%%i
        echo !RESULT! | find "values" >nul
        if errorlevel 1 (
            echo     ℹ️  暂无测试数据
        ) else (
            echo     ✅ 已有测试数据
        )
    )
)

:: 检查 SQLite
echo  🗄️  SQLite 数据库
if exist "pet_health.db" (
    echo     ✅ 已创建
) else (
    echo     ℹ️  未创建 (首次启动时自动创建)
)
echo.

:: 检查配置文件
echo  ⚙️  配置文件
if exist ".env" (
    echo     ✅ .env 已配置
) else (
    echo     ⚠️  .env 不存在 (将使用默认配置)
)
echo.

:: 检查服务进程
echo  🚀 运行中的服务
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo     ✅ Node.js 进程运行中
    
    :: 检查端口
    netstat -ano | findstr ":3001" >nul
    if errorlevel 1 (
        echo     ❌ 后端服务 (3001) 未监听
    ) else (
        echo     ✅ 后端服务 (http://localhost:3001)
    )
    
    netstat -ano | findstr ":3000" >nul
    if errorlevel 1 (
        echo     ❌ 前端服务 (3000) 未监听
    ) else (
        echo     ✅ 前端服务 (http://localhost:3000)
    )
) else (
    echo     ℹ️  应用服务未运行
)
echo.

echo ========================================
echo    📋 操作建议
echo ========================================
echo.

:: 给出建议
if not exist "node_modules\express" (
    echo  1. 安装依赖: npm install
)
if not exist "client\node_modules\react" (
    echo  2. 安装前端: cd client ^&^& npm install
)

curl -s http://localhost:8086/ping >nul 2>&1
if errorlevel 1 (
    echo  3. 启动 InfluxDB: scripts\start-influxdb.bat
)

tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo  4. 启动应用: scripts\start.bat
)

echo.
pause
