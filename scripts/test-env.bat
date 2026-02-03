@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    启动脚本测试
echo ========================================
echo.

cd /d "%~dp0.."

echo 当前目录: %CD%
echo.

echo 测试 1: Node.js
node --version
if errorlevel 1 (
    echo 错误: Node.js 不可用
    pause
    exit /b 1
)
echo OK
echo.

echo 测试 2: npm
npm --version
if errorlevel 1 (
    echo 错误: npm 不可用
    pause
    exit /b 1
)
echo OK
echo.

echo 测试 3: InfluxDB
curl -s http://localhost:8086/ping >nul 2>&1
if errorlevel 1 (
    echo 警告: InfluxDB 未运行
) else (
    echo OK: InfluxDB 运行中
)
echo.

echo 测试 4: 检查文件
if exist "package.json" (
    echo OK: package.json 存在
) else (
    echo 错误: package.json 不存在
)

if exist "scripts\start.bat" (
    echo OK: start.bat 存在
) else (
    echo 错误: start.bat 不存在
)

if exist "server\index.js" (
    echo OK: server\index.js 存在
) else (
    echo 错误: server\index.js 不存在
)
echo.

echo 测试 5: 依赖检查
if exist "node_modules" (
    echo OK: node_modules 存在
) else (
    echo 警告: node_modules 不存在，需要运行 npm install
)

if exist "client\node_modules" (
    echo OK: client\node_modules 存在
) else (
    echo 警告: client\node_modules 不存在，需要运行 cd client ^&^& npm install
)
echo.

echo ========================================
echo    测试完成
echo ========================================
echo.
echo 如果所有测试通过，可以运行:
echo   scripts\start.bat
echo.
pause
