# 百度地图活动轨迹 - 配置指南

## 功能概述

系统集成百度地图 API，实时从 InfluxDB 读取宠物 GPS 轨迹数据并在地图上展示。

## 功能特性

### 1. 实时轨迹展示
- 📍 起点和终点标记
- 🛣️ 完整轨迹路径绘制
- 📊 轨迹点信息展示
- 🎯 自动调整地图视野

### 2. 统计信息
- 📏 总距离（米）
- ⏱️ 运动时长（分钟）
- ⚡ 平均速度（m/s）
- 📍 轨迹点数量

### 3. 交互功能
- 🔄 一键刷新轨迹
- 📊 显示/隐藏统计信息
- 🗺️ 缩放和平移地图
- 💬 点击标记查看详情

### 4. 响应式设计
- ✅ PC 端完美展示
- ✅ 平板自适应
- ✅ 移动端优化

## 🚀 快速配置

### 步骤 1：获取百度地图 AK

1. 访问 [百度地图开放平台](https://lbsyun.baidu.com/)
2. 注册并登录账号
3. 进入"应用管理" - "我的应用"
4. 点击"创建应用"
5. 填写应用信息：
   - 应用名称：宠物日报系统
   - 应用类型：浏览器端
   - IP白名单：留空或填写服务器IP
6. 创建成功后，复制 AK（访问应用密钥）

### 步骤 2：配置环境变量

编辑 `.env` 文件：

```env
# 百度地图配置
BAIDU_MAP_AK=your_baidu_map_ak_here
```

### 步骤 3：重启服务

```bash
# 停止当前服务（Ctrl+C）
# 重新启动
npm run dev
```

### 步骤 4：导入测试数据

新的测试数据脚本会自动生成 GPS 坐标：

```bash
node scripts/importTestData.js
```

测试数据包含：
- 坐标范围：北京市中心（天安门）周边约1公里
- 活动时间：06:00 - 22:00
- 轨迹点：每小时一个点

## 📊 数据库字段说明

### GPS 相关字段

| 字段 | 类型 | 说明 | 单位 |
|------|------|------|------|
| LATITUDE | Float | 纬度 | 度 |
| LONGITUDE | Float | 经度 | 度 |
| ALTITUDE | Float | 海拔高度 | 米 |
| SPEED | Float | 移动速度 | m/s |
| HEADING | Float | 方向角 | 度（0-360） |

### 数据示例

```json
{
  "time": "2026-02-02T08:30:00Z",
  "petId": "221",
  "LATITUDE": 39.9042,
  "LONGITUDE": 116.4074,
  "ALTITUDE": 45.5,
  "SPEED": 1.2,
  "HEADING": 135.5,
  "STEP": 3500
}
```

## 🔌 API 接口

### 获取日轨迹

```bash
GET /api/location/track/:petId?date=YYYY-MM-DD&simplify=true
```

**参数：**
- `petId` (必填)：宠物ID
- `date` (可选)：日期，默认今天
- `simplify` (可选)：是否简化轨迹，默认 false

**响应：**
```json
{
  "success": true,
  "data": {
    "petId": "221",
    "date": "2026-02-02",
    "track": [
      {
        "time": "2026-02-02 06:15:23",
        "lat": 39.9042,
        "lng": 116.4074,
        "altitude": 45.5,
        "speed": 1.2,
        "heading": 135.5,
        "step": 1500
      }
    ],
    "stats": {
      "totalDistance": 2580.5,
      "totalPoints": 16,
      "maxSpeed": 2.8,
      "avgSpeed": 1.5,
      "duration": 480,
      "startTime": "2026-02-02 06:15:23",
      "endTime": "2026-02-02 21:45:12"
    },
    "pointCount": 16
  }
}
```

### 获取当前位置

```bash
GET /api/location/current/:petId
```

**响应：**
```json
{
  "success": true,
  "data": {
    "petId": "221",
    "location": {
      "time": "2026-02-02 21:45:12",
      "lat": 39.9042,
      "lng": 116.4074,
      "altitude": 45.5,
      "speed": 0.8,
      "heading": 90.0
    }
  }
}
```

### 获取时间范围轨迹

```bash
GET /api/location/range/:petId?startTime=YYYY-MM-DD HH:mm:ss&endTime=YYYY-MM-DD HH:mm:ss
```

### 获取地图配置

```bash
GET /api/location/config
```

**响应：**
```json
{
  "success": true,
  "data": {
    "baiduMapAk": "your_ak_here",
    "mapType": "baidu"
  }
}
```

## 🗺️ 地图功能详解

### 1. 轨迹绘制

- **颜色渐变**：紫色渐变线条 `#667eea → #764ba2`
- **线条粗细**：4px
- **透明度**：80%
- **样式**：实线

### 2. 标记说明

#### 起点标记
- 颜色：绿色 `#27ae60`
- 图标：带"起"字的圆形
- 信息：显示起点时间和步数

#### 终点标记
- 颜色：红色 `#e74c3c`
- 图标：带"终"字的圆形
- 信息：显示终点时间和步数

#### 轨迹点标记
- 颜色：紫色 `#667eea`
- 间隔：每隔N个点显示一个
- 信息：时间、速度、步数

### 3. 信息窗口

点击任意标记显示详细信息：
- 时间戳
- 当前速度
- 累计步数

### 4. 统计面板

实时显示：
- 📏 总距离：Haversine 公式计算
- ⏱️ 运动时长：起止时间差
- ⚡ 平均速度：所有有效速度的平均值
- 📍 轨迹点数：实际数据点数量

## 💡 使用技巧

### 轨迹抽稀

当轨迹点过多时，可以启用抽稀功能：

```javascript
// 请求时添加 simplify 参数
axios.get(`/api/location/track/${petId}?simplify=true`)
```

抽稀算法：
- 保留起点和终点
- 中间点按间隔抽取
- 最多保留 100 个点

### 自定义中心点

修改测试数据脚本中的坐标：

```javascript
// 北京中心坐标
const CENTER_LAT = 39.9042;
const CENTER_LNG = 116.4074;

// 改为你的位置，例如上海
const CENTER_LAT = 31.2304;
const CENTER_LNG = 121.4737;
```

### 调整活动范围

```javascript
// 轨迹半径（约1公里）
const radius = 0.01;

// 扩大范围到2公里
const radius = 0.02;
```

## 🎨 地图样式自定义

### 修改轨迹颜色

编辑 `ActivityMapBaidu.js`：

```javascript
const polyline = new window.BMapGL.Polyline(points, {
  strokeColor: '#667eea',  // 改为你喜欢的颜色
  strokeWeight: 4,
  strokeOpacity: 0.8
});
```

### 修改标记图标

```javascript
// 自定义 SVG 图标
const icon = new window.BMapGL.Icon(
  'data:image/svg+xml;base64,' + btoa(`
    <svg>...</svg>
  `),
  new window.BMapGL.Size(32, 32)
);
```

## 🔧 故障排查

### 问题 1：地图不显示

**可能原因：**
- 百度地图 AK 未配置
- AK 配置错误
- IP 白名单限制

**解决方法：**
1. 检查 `.env` 中 `BAIDU_MAP_AK` 配置
2. 验证 AK 是否有效
3. 检查浏览器控制台错误

### 问题 2：无轨迹数据

**可能原因：**
- 数据库中没有 GPS 数据
- 日期参数错误
- 查询条件不匹配

**解决方法：**
1. 运行测试数据导入脚本
2. 检查数据库是否有 LATITUDE 和 LONGITUDE 字段
3. 查看后端日志

### 问题 3：轨迹显示异常

**可能原因：**
- GPS 坐标格式错误
- 坐标超出有效范围
- 数据点过少

**解决方法：**
1. 验证坐标格式（纬度 -90~90，经度 -180~180）
2. 检查数据完整性
3. 增加数据采集频率

### 问题 4：移动端显示问题

**可能原因：**
- 触摸事件冲突
- 地图容器高度不足
- 响应式样式未生效

**解决方法：**
1. 检查 CSS 响应式断点
2. 调整地图容器高度
3. 测试不同设备尺寸

## 📱 响应式设计

### PC 端（> 1024px）
- 地图高度：450px
- 统计面板：4列网格
- 完整功能展示

### 平板（768px - 1024px）
- 地图高度：450px
- 统计面板：2列网格
- 优化按钮布局

### 移动端（< 768px）
- 地图高度：350px
- 统计面板：2列网格
- 精简图例显示

### 小屏手机（< 480px）
- 地图高度：300px
- 统计面板：1列
- 最小化控件

## 🔐 安全注意事项

### API Key 保护
- AK 仅在服务端存储
- 前端通过 API 获取
- 不要在代码中硬编码

### IP 白名单
建议在百度地图控制台设置 IP 白名单：
- 开发环境：127.0.0.1, localhost
- 生产环境：服务器实际 IP

### 数据隐私
- GPS 数据敏感，注意保护
- 实施访问控制
- 定期清理过期数据

## 🚀 性能优化

### 1. 轨迹抽稀
减少渲染点数：
```javascript
const simplified = locationService.simplifyTrack(track, 10);
```

### 2. 缓存策略
```javascript
// 缓存地图配置
localStorage.setItem('mapConfig', JSON.stringify(config));
```

### 3. 懒加载
```javascript
// 仅在需要时加载地图脚本
if (visible) {
  loadBaiduMapScript(ak);
}
```

## 📚 扩展开发

### 添加热力图

```javascript
const heatmapOverlay = new window.BMapGL.HeatmapOverlay({radius: 20});
map.addOverlay(heatmapOverlay);
heatmapOverlay.setDataSet({data: points, max: 100});
```

### 添加动画效果

```javascript
// 轨迹动画
let i = 0;
const animate = setInterval(() => {
  if (i < points.length) {
    map.addOverlay(new window.BMapGL.Marker(points[i]));
    i++;
  } else {
    clearInterval(animate);
  }
}, 100);
```

### 集成路况信息

```javascript
const trafficLayer = new window.BMapGL.TrafficLayer();
map.addTileLayer(trafficLayer);
```

## 📖 相关文档

- [百度地图 JavaScript API](https://lbsyun.baidu.com/index.php?title=jspopularGL)
- [百度地图开发示例](https://lbsyun.baidu.com/jsdemo.htm)
- [InfluxDB 文档](https://docs.influxdata.com/influxdb/v1.8/)

---

**祝你的宠物健康快乐！** 🐾
