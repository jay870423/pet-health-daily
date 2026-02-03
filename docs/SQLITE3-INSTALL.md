# SQLite3 安装问题解决方案

`sqlite3` 是一个需要编译原生模块的 Node.js 包，在 Windows 上安装经常遇到问题。

---

## 🔧 解决方案（按推荐顺序）

### 方案1：使用 better-sqlite3（推荐）⭐

`better-sqlite3` 是更现代、更快速、安装更简单的替代方案。

**优势：**
- ✅ 安装成功率高
- ✅ 性能更好（同步API）
- ✅ API 更简洁
- ✅ 维护活跃

**操作：**
```cmd
# 1. 卸载 sqlite3
npm uninstall sqlite3

# 2. 安装 better-sqlite3
npm install better-sqlite3

# 3. 运行修复脚本（自动修改代码）
node scripts\fix-sqlite3.js
```

---

### 方案2：安装 Windows 构建工具

`sqlite3` 需要编译原生模块，需要 Windows 构建工具。

**步骤：**

#### 2.1 安装 Windows Build Tools

```cmd
# 以管理员身份运行 PowerShell 或 CMD
npm install --global windows-build-tools
```

等待安装完成（可能需要10-20分钟）。

#### 2.2 重新安装 sqlite3

```cmd
npm install sqlite3
```

---

### 方案3：使用预编译版本

使用带有预编译二进制文件的版本。

```cmd
# 方式1：从 GitHub 下载预编译版本
npm install sqlite3 --build-from-source=false

# 方式2：使用特定版本
npm install sqlite3@5.1.6 --build-from-source=false

# 方式3：清理缓存后重装
npm cache clean --force
npm install sqlite3 --build-from-source=false
```

---

### 方案4：使用 Node.js 原生版本

确保使用官方 Node.js 版本（不是 nvm 或其他管理器）。

```cmd
# 1. 检查 Node.js 版本
node --version

# 2. 如果是 v14-v18，安装 sqlite3@5.1.6
npm install sqlite3@5.1.6

# 3. 如果是 v18+，安装最新版本
npm install sqlite3@latest
```

---

### 方案5：手动下载预编译二进制文件

```cmd
# 1. 设置环境变量
set npm_config_build_from_source=false

# 2. 安装
npm install sqlite3

# 3. 如果失败，手动下载
# 访问：https://github.com/TryGhost/node-sqlite3/releases
# 下载对应 Node.js 版本的 .node 文件
# 放到：node_modules\sqlite3\lib\binding\
```

---

## 🚀 自动修复脚本

我们提供了自动修复脚本，一键切换到 `better-sqlite3`：

```cmd
node scripts\fix-sqlite3.js
```

**脚本功能：**
1. 卸载 `sqlite3`
2. 安装 `better-sqlite3`
3. 自动修改代码适配新 API
4. 更新 package.json

---

## 📋 常见错误及解决方案

### 错误1：gyp ERR! stack Error: Can't find Python executable

**原因：** 缺少 Python 环境

**解决：**
```cmd
# 安装 Python 2.7 或 3.x
# 下载：https://www.python.org/downloads/

# 或安装 windows-build-tools（包含 Python）
npm install --global windows-build-tools
```

---

### 错误2：error MSB8020: The build tools for v142 cannot be found

**原因：** 缺少 Visual Studio 构建工具

**解决：**
```cmd
# 方式1：安装 windows-build-tools
npm install --global windows-build-tools

# 方式2：安装 Visual Studio Build Tools
# 下载：https://visualstudio.microsoft.com/downloads/
# 选择"C++ 桌面开发"工作负载
```

---

### 错误3：node-gyp rebuild 失败

**原因：** node-gyp 版本问题

**解决：**
```cmd
# 1. 更新 npm 和 node-gyp
npm install -g npm
npm install -g node-gyp

# 2. 清理缓存
npm cache clean --force

# 3. 删除 node_modules
rmdir /s /q node_modules

# 4. 重新安装
npm install
```

---

### 错误4：Module version mismatch

**原因：** Node.js 版本与编译版本不匹配

**解决：**
```cmd
# 重新编译
npm rebuild sqlite3

# 或重新安装
npm uninstall sqlite3
npm install sqlite3
```

---

## 🔄 切换到 better-sqlite3 的代码改动

### 原代码（sqlite3）
```javascript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pet_health.db', (err) => {
  if (err) console.error(err);
});

db.run('INSERT INTO pets VALUES (?, ?)', [id, name], (err) => {
  if (err) console.error(err);
});

db.all('SELECT * FROM pets', [], (err, rows) => {
  if (err) console.error(err);
  console.log(rows);
});
```

### 新代码（better-sqlite3）
```javascript
const Database = require('better-sqlite3');
const db = new Database('./pet_health.db');

// 同步API，无需回调
const stmt = db.prepare('INSERT INTO pets VALUES (?, ?)');
stmt.run(id, name);

const rows = db.prepare('SELECT * FROM pets').all();
console.log(rows);
```

**主要区别：**
- ✅ 同步API（更简单）
- ✅ 更好的性能
- ✅ 更少的嵌套回调

---

## 📦 推荐配置（package.json）

### 使用 better-sqlite3
```json
{
  "dependencies": {
    "better-sqlite3": "^9.4.0"
  }
}
```

### 使用 sqlite3（如果必须）
```json
{
  "dependencies": {
    "sqlite3": "^5.1.6"
  },
  "scripts": {
    "postinstall": "npm rebuild sqlite3 --build-from-source"
  }
}
```

---

## ✅ 验证安装

创建测试文件 `test-sqlite.js`：

```javascript
// 测试 better-sqlite3
try {
  const Database = require('better-sqlite3');
  const db = new Database(':memory:');
  
  db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
  db.prepare('INSERT INTO test VALUES (?, ?)').run(1, 'Test');
  
  const row = db.prepare('SELECT * FROM test WHERE id = ?').get(1);
  console.log('✅ better-sqlite3 安装成功！');
  console.log('测试数据:', row);
  
  db.close();
} catch (err) {
  console.error('❌ 安装失败:', err.message);
}
```

运行测试：
```cmd
node test-sqlite.js
```

---

## 🎯 快速决策树

```
安装 sqlite3 失败？
├─ 是否需要异步API？
│  ├─ 否 → 使用 better-sqlite3（推荐）
│  └─ 是 → 继续以下步骤
├─ 是否有管理员权限？
│  ├─ 是 → 安装 windows-build-tools
│  └─ 否 → 使用预编译版本
└─ 是否仍然失败？
   └─ 切换到 better-sqlite3
```

---

## 📞 获取帮助

如果尝试所有方案仍然失败：

1. 运行诊断脚本：
   ```cmd
   node scripts\diagnose-sqlite.js
   ```

2. 查看详细错误日志：
   ```cmd
   npm install sqlite3 --verbose
   ```

3. 提供以下信息提交 Issue：
   - Node.js 版本（`node --version`）
   - npm 版本（`npm --version`）
   - 操作系统版本
   - 完整错误日志

---

**更新时间：2026-02-03**
