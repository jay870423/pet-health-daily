@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo    宠物日报系统 - 一键启动
echo ========================================
echo.

cd /d "%~dp0.."

:: ============================================================
:: 步骤1: 环境检查
:: ============================================================
echo [1/7] 环境检查...
echo.

:: 检查 Node.js
echo  检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo    未安装 Node.js！
    echo    请访问 https://nodejs.org/ 下载安装 LTS 版本
    echo.
    pause
    exit /b 1
)
node --version
echo    Node.js 已安装
echo.

:: 检查 npm
echo  检查 npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo    npm 未找到！
    echo.
    pause
    exit /b 1
)
npm --version
echo    npm 已安装
echo.

:: ============================================================
:: 步骤2: 检查和启动 InfluxDB
:: ============================================================
echo [2/7] 检查 InfluxDB...
echo.

curl -s http://localhost:8086/ping >nul 2>&1
if errorlevel 1 (
    echo  InfluxDB 未启动
    echo.
    
    if exist "C:\InfluxDB\influxd.exe" (
        echo  正在启动 InfluxDB...
        start "InfluxDB 1.8" cmd /c "cd /d C:\InfluxDB && influxd.exe"
        echo  等待 InfluxDB 启动（10秒）...
        timeout /t 10 >nul
        
        curl -s http://localhost:8086/ping >nul 2>&1
        if errorlevel 1 (
            echo    InfluxDB 启动失败！
            echo    请手动运行: scripts\start-influxdb.bat
            echo.
            pause
            exit /b 1
        )
        echo    InfluxDB 已启动
    ) else (
        echo  未找到 InfluxDB！
        echo.
        echo  请先安装 InfluxDB 1.8:
        echo    1. 运行: scripts\install-influxdb.bat
        echo    2. 或手动下载: https://portal.influxdata.com/downloads/
        echo.
        pause
        exit /b 1
    )
) else (
    echo  InfluxDB 已运行
)
echo.

:: ============================================================
:: 步骤3: 环境配置
:: ============================================================
echo [3/7] 检查环境配置...
echo.

if not exist ".env" (
    if exist ".env.example" (
        echo  创建 .env 配置文件...
        copy /y ".env.example" ".env" >nul
        echo    已从 .env.example 创建 .env 文件
        echo    请编辑 .env 文件配置 API Keys
    ) else (
        echo    未找到 .env.example 文件
    )
) else (
    echo  环境配置文件已存在
)
echo.

:: ============================================================
:: 步骤4: 安装后端依赖
:: ============================================================
echo [4/7] 检查后端依赖...
echo.

if not exist "node_modules" (
    echo  正在安装后端依赖...
    call npm install
    if errorlevel 1 (
        echo    后端依赖安装失败！
        echo    请检查网络连接或尝试使用 npm 镜像
        echo.
        pause
        exit /b 1
    )
    echo    后端依赖安装完成
) else (
    echo  后端依赖已安装
)
echo.

:: ============================================================
:: 步骤5: 安装前端依赖
:: ============================================================
echo [5/7] 检查前端依赖...
echo.

cd client
if not exist "node_modules" (
    echo  正在安装前端依赖（这可能需要几分钟）...
    call npm install
    if errorlevel 1 (
        cd ..
        echo    前端依赖安装失败！
        echo    请检查网络连接
        echo.
        pause
        exit /b 1
    )
    echo    前端依赖安装完成
) else (
    echo  前端依赖已安装
)
cd ..
echo.

:: ============================================================
:: 步骤6: 初始化数据库
:: ============================================================
echo [6/7] 初始化数据库...
echo.

:: 检查 InfluxDB 数据库
echo  检查 InfluxDB 数据库...
curl -s -G "http://localhost:8086/query" --data-urlencode "q=SHOW DATABASES" 2>nul | find "pet_health" >nul
if errorlevel 1 (
    echo    创建 pet_health 数据库...
    curl -s -X POST "http://localhost:8086/query" --data-urlencode "q=CREATE DATABASE pet_health" >nul 2>&1
    echo    数据库创建完成
) else (
    echo    InfluxDB 数据库已存在
)

:: 检查 SQLite 数据库
if not exist "pet_health.db" (
    echo  SQLite 数据库将在首次启动时自动创建
) else (
    echo  SQLite 数据库已存在
)
echo.

:: ============================================================
:: 步骤7: 导入测试数据
:: ============================================================
echo [7/7] 检查测试数据...
echo.

if not exist ".data-imported" (
    echo  导入测试数据（10个宠物）...
    node scripts\importMultiPetData.js
    if errorlevel 1 (
        echo    数据导入失败，但可以继续启动
        echo    可稍后手动运行: node scripts\importMultiPetData.js
    ) else (
        echo    测试数据导入完成
        echo. > .data-imported
    )
) else (
    echo  测试数据已存在
)
echo.

:: ============================================================
:: 启动服务
:: ============================================================
echo ========================================
echo    启动服务中...
echo ========================================
echo.
echo  访问地址:
echo     后端服务: http://localhost:3001
echo     前端页面: http://localhost:3000
echo     管理后台: http://localhost:3000/admin
echo.
echo  默认管理员账号:
echo     用户名: admin
echo     密码: admin123
echo.
echo  提示:
echo     - 浏览器会自动打开前端页面
echo     - 保持此窗口打开以查看日志
echo     - 按 Ctrl+C 可停止服务
echo.
echo ========================================
echo.

:: 使用 concurrently 启动（如果已安装）
if exist "node_modules\concurrently" (
    echo  使用 concurrently 启动服务...
    echo.
    call npm run dev
) else (
    :: 降级方案：分别启动
    echo  启动服务...
    echo.
    start "宠物日报-后端" cmd /c "cd /d %~dp0.. && npm run server"
    timeout /t 3 >nul
    start "宠物日报-前端" cmd /c "cd /d %~dp0..\client && npm start"
    
    echo.
    echo  服务已在后台启动
    echo.
    echo  如果浏览器没有自动打开，请手动访问:
    echo  http://localhost:3000
    echo.
    pause
)
