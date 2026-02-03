# 宠物管理系统 - 超管功能使用指南

## 功能概述

超管登录功能允许管理员：
- 📝 新增宠物信息
- ✏️ 编辑现有宠物信息
- 🗑️ 删除宠物信息
- 🔍 搜索和筛选宠物
- 📊 查看宠物列表和统计

## 快速开始

### 1. 安装依赖

```bash
# 安装 SQLite3 依赖
npm install sqlite3 --save
```

### 2. 启动服务器

```bash
# 重启后端服务器（会自动创建数据库和默认数据）
cd server
node index.js
```

服务器启动时会自动：
- 创建 `pet_health.db` SQLite数据库文件
- 创建 `admins` 管理员表
- 创建 `pets` 宠物信息表
- 插入默认管理员账号和10个宠物数据

### 3. 访问管理后台

1. 打开主页 `http://localhost:3000`
2. 点击右上角"登入"按钮
3. 使用默认账号登录：
   - 用户名：`admin`
   - 密码：`admin123`

## 功能说明

### 登录页面

- 输入用户名和密码
- 登录信息会保存到 localStorage，刷新页面不会丢失登录状态
- 登录成功后自动进入宠物管理页面

### 宠物管理页面

#### 1. 搜索功能
- 支持按宠物ID、名称、主人姓名搜索
- 支持按物种筛选（全部/狗/猫）
- 按 Enter 键快速搜索

#### 2. 新增宠物
点击"新增宠物"按钮，填写表单：

**必填项：**
- 宠物ID（如：DOG006）
- 名称
- 物种（狗/猫）

**选填项：**
- 图标（可选择预设的emoji）
- 主人姓名
- 品种
- 性别
- 体重
- 出生日期
- 位置（城市名称）
- 经纬度（用于地图显示）
- 描述信息

#### 3. 编辑宠物
- 点击宠物行的"✏️"按钮
- 修改需要更新的信息
- 点击"保存"提交修改
- 注意：宠物ID不可修改

#### 4. 删除宠物
- 点击宠物行的"🗑️"按钮
- 确认删除操作
- 删除为软删除，数据不会真正删除，只是标记为不可用

#### 5. 分页
- 每页显示10条记录
- 支持上一页/下一页翻页
- 显示当前页数和总记录数

### 退出登录

点击右上角"退出登录"按钮，会：
- 清除登录信息
- 返回主页

## 数据库结构

### admins 表（管理员）
```sql
CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### pets 表（宠物信息）
```sql
CREATE TABLE pets (
  id TEXT PRIMARY KEY,              -- 宠物ID
  name TEXT NOT NULL,               -- 名称
  species INTEGER NOT NULL,         -- 物种代码（1=狗, 2=猫）
  species_name TEXT NOT NULL,       -- 物种名称
  icon TEXT DEFAULT '🐕',          -- 图标
  type TEXT NOT NULL,               -- 类型
  customer TEXT,                    -- 主人
  location_lat REAL,                -- 纬度
  location_lng REAL,                -- 经度
  location_name TEXT,               -- 位置名称
  birth_date TEXT,                  -- 出生日期
  weight REAL,                      -- 体重
  gender TEXT,                      -- 性别
  breed TEXT,                       -- 品种
  description TEXT,                 -- 描述
  status INTEGER DEFAULT 1,         -- 状态（1=正常, 0=删除）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## API 接口

### 1. 管理员登录
```
POST /api/admin/login
Body: { username, password }
Response: { success, data: { id, username, role, token } }
```

### 2. 获取宠物列表
```
GET /api/admin/pets?page=1&pageSize=10&keyword=&species=
Response: { success, data: { list, total, page, pageSize } }
```

### 3. 获取单个宠物
```
GET /api/admin/pets/:id
Response: { success, data: { pet } }
```

### 4. 新增宠物
```
POST /api/admin/pets
Body: { id, name, species, species_name, icon, type, ... }
Response: { success, data: { id }, message }
```

### 5. 更新宠物
```
PUT /api/admin/pets/:id
Body: { name, species, species_name, icon, type, ... }
Response: { success, message }
```

### 6. 删除宠物
```
DELETE /api/admin/pets/:id
Response: { success, message }
```

## 安全建议

⚠️ **重要：生产环境部署前请务必：**

1. 修改默认管理员密码
2. 实现真正的密码加密（如bcrypt）
3. 使用JWT或session代替简单的token
4. 添加请求频率限制
5. 添加CSRF保护
6. 使用HTTPS协议
7. 实现密码复杂度验证
8. 添加登录失败次数限制

## 文件结构

```
server/
├── config/
│   └── database.js          # SQLite数据库配置和初始化
├── routes/
│   └── adminRoutes.js       # 管理员和宠物管理API
└── index.js                 # 主入口（已添加adminRoutes）

client/src/components/
├── AdminLogin.js            # 登录页面
├── AdminLogin.css
├── AdminPanel.js            # 管理后台入口
├── PetManagement.js         # 宠物列表管理
├── PetManagement.css
├── PetForm.js               # 宠物表单（新增/编辑）
└── PetForm.css
```

## 常见问题

### Q: 找不到数据库文件？
A: 数据库文件 `pet_health.db` 会在首次启动服务器时自动创建在项目根目录。

### Q: 如何重置数据？
A: 删除 `pet_health.db` 文件，重启服务器即可重新初始化。

### Q: 如何添加新的管理员？
A: 当前版本可直接操作数据库，或通过API添加。后续可以在管理页面添加用户管理功能。

### Q: 宠物数据会同步到前端下拉框吗？
A: 当前版本前端下拉框使用硬编码的PETS数组。可以通过添加API接口从数据库读取宠物列表来实现动态更新。

## 下一步优化建议

1. ✅ 基础登录和宠物CRUD功能
2. 🔜 密码加密和JWT认证
3. 🔜 用户权限管理（超管/普通管理员）
4. 🔜 操作日志记录
5. 🔜 导入/导出功能
6. 🔜 批量操作功能
7. 🔜 宠物头像上传
8. 🔜 前端宠物下拉框从数据库动态加载

## 支持

如有问题或建议，请联系开发团队。
