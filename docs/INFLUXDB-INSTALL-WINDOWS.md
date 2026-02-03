# InfluxDB 1.8 Windows 安装指南

## 📥 下载安装

### 步骤 1：下载 InfluxDB 1.8.10（Windows版本）

访问官方下载页面：
```
https://dl.influxdata.com/influxdb/releases/influxdb-1.8.10_windows_amd64.zip
```

或使用以下备用链接：
- GitHub Releases: https://github.com/influxdata/influxdb/releases/tag/v1.8.10

### 步骤 2：解压到目录

建议解压到：
```
C:\Program Files\InfluxDB\
```

解压后的目录结构：
```
C:\Program Files\InfluxDB\
├── influxd.exe          # InfluxDB 服务端
├── influx.exe           # InfluxDB 客户端 CLI
└── influxdb.conf        # 配置文件（可选）
```

### 步骤 3：创建数据目录

```bash
# 创建数据存储目录
mkdir "C:\Program Files\InfluxDB\data"
mkdir "C:\Program Files\InfluxDB\meta"
mkdir "C:\Program Files\InfluxDB\wal"
```

### 步骤 4：启动 InfluxDB

打开命令提示符（管理员权限），运行：
```bash
cd "C:\Program Files\InfluxDB"
influxd.exe
```

启动成功后，你会看到类似输出：
```
[httpd] 8086 bind-address: [::]:8086
[httpd] 8086 opened HTTP service on [::]:8086
```

### 步骤 5：验证安装

打开**新的**命令提示符窗口，运行：
```bash
cd "C:\Program Files\InfluxDB"
influx.exe -precision rfc3339
```

如果看到以下提示，说明安装成功：
```
Connected to http://localhost:8086 version 1.8.10
InfluxDB shell version: 1.8.10
>
```

### 步骤 6：创建数据库

在 InfluxDB CLI 中执行：
```sql
CREATE DATABASE pet_health
SHOW DATABASES
```

退出 CLI：
```
exit
```

## 🔧 配置为 Windows 服务（可选）

使用 NSSM（Non-Sucking Service Manager）将 InfluxDB 配置为 Windows 服务：

### 1. 下载 NSSM
```
https://nssm.cc/download
```

### 2. 安装服务
```bash
cd "C:\path\to\nssm\win64"
nssm install InfluxDB "C:\Program Files\InfluxDB\influxd.exe"
```

### 3. 启动服务
```bash
nssm start InfluxDB
```

### 4. 设置开机自启
```bash
nssm set InfluxDB Start SERVICE_AUTO_START
```

## 🚀 快速启动脚本

保存以下内容为 `start-influxdb.bat`：

```batch
@echo off
echo Starting InfluxDB 1.8...
cd "C:\Program Files\InfluxDB"
start "InfluxDB Server" influxd.exe
timeout /t 3
echo InfluxDB is running on http://localhost:8086
pause
```

双击运行即可启动 InfluxDB。

## 📊 验证数据库连接

运行以下命令测试连接：
```bash
curl -i http://localhost:8086/ping
```

预期输出：
```
HTTP/1.1 204 No Content
```

## 🔍 常见问题

### Q1: 端口 8086 被占用
```bash
# 查看端口占用
netstat -ano | findstr :8086

# 停止占用进程
taskkill /PID <进程ID> /F
```

### Q2: 找不到 influxd.exe
- 检查是否正确解压
- 确认路径是否正确
- 以管理员权限运行

### Q3: 创建数据库失败
```sql
# 检查数据库是否已存在
SHOW DATABASES

# 删除已存在的数据库
DROP DATABASE pet_health

# 重新创建
CREATE DATABASE pet_health
```

## 📝 下一步

InfluxDB 安装完成后，继续执行项目启动步骤：
```bash
# 1. 导入测试数据
node scripts/importMultiPetData.js

# 2. 启动项目
npm run dev
```

## 🌐 管理界面（可选）

InfluxDB 1.8 内置的 Web UI 已废弃，推荐使用：
- **Chronograf**: https://www.influxdata.com/time-series-platform/chronograf/
- **Grafana**: https://grafana.com/

## 📚 参考资料

- 官方文档: https://docs.influxdata.com/influxdb/v1.8/
- 安装指南: https://docs.influxdata.com/influxdb/v1.8/introduction/install/
- InfluxQL 语法: https://docs.influxdata.com/influxdb/v1.8/query_language/
