@echo off
chcp 65001 >nul
echo ========================================
echo    宠物日报系统 - 完整启动流程
echo ========================================
echo.

:: 检查 Node.js
echo [检查] Node.js 版本...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未安装 Node.js！
    echo 请访问 https://nodejs.org/ 下载安装
    pause
    exit /b 1
)
echo ✅ Node.js 已安装

:: 检查 npm
echo [检查] npm 版本...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未找到！
    pause
    exit /b 1
)
echo ✅ npm 已安装
echo.

:: 检查 InfluxDB
echo [检查] InfluxDB 连接...
curl -s http://localhost:8086/ping >nul 2>&1
if errorlevel 1 (
    echo ❌ InfluxDB 未启动！
    echo.
    echo 请先运行: scripts\start-influxdb.bat
    echo.
    pause
    exit /b 1
)
echo ✅ InfluxDB 已启动
echo.

:: 安装根目录依赖
echo ========================================
echo [步骤 1/4] 安装后端依赖...
echo ========================================
cd /d "%~dp0.."
if not exist node_modules (
    echo 正在安装后端依赖...
    call npm install
    if errorlevel 1 (
        echo ❌ 后端依赖安装失败！
        pause
        exit /b 1
    )
) else (
    echo ✅ 后端依赖已安装
)
echo.

:: 安装前端依赖
echo ========================================
echo [步骤 2/4] 安装前端依赖...
echo ========================================
cd client
if not exist node_modules (
    echo 正在安装前端依赖（这可能需要几分钟）...
    call npm install
    if errorlevel 1 (
        echo ❌ 前端依赖安装失败！
        pause
        exit /b 1
    )
) else (
    echo ✅ 前端依赖已安装
)
cd ..
echo.

:: 检查数据库
echo ========================================
echo [步骤 3/4] 检查数据库...
echo ========================================
curl -s -G "http://localhost:8086/query" --data-urlencode "q=SHOW DATABASES" | find "pet_health" >nul
if errorlevel 1 (
    echo ⚠️  数据库 pet_health 不存在
    echo 正在创建数据库...
    call scripts\create-database.bat
)
echo ✅ 数据库已就绪
echo.

:: 检查测试数据
echo ========================================
echo [步骤 4/4] 检查测试数据...
echo ========================================
curl -s -G "http://localhost:8086/query" --data-urlencode "db=pet_health" --data-urlencode "q=SELECT COUNT(*) FROM pet_location" | find "values" >nul
if errorlevel 1 (
    echo ⚠️  没有测试数据
    set /p IMPORT_DATA="是否导入10个宠物的测试数据？(Y/N): "
    if /i "!IMPORT_DATA!"=="Y" (
        echo 正在导入测试数据...
        node scripts\importMultiPetData.js
    )
) else (
    echo ✅ 测试数据已存在
)
echo.

:: 启动服务
echo ========================================
echo    🚀 启动服务中...
echo ========================================
echo.
echo 后端服务: http://localhost:3001
echo 前端服务: http://localhost:3000
echo.
echo ⚠️  启动后会自动打开浏览器
echo ⚠️  按 Ctrl+C 可停止服务
echo.
echo ========================================
echo.

:: 使用 concurrently 同时启动前后端
call npm run dev

pause
