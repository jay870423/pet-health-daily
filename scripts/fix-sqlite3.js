/**
 * SQLite3 自动修复脚本
 * 功能：自动切换到 better-sqlite3 并修改代码
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('========================================');
console.log('  SQLite3 自动修复脚本');
console.log('========================================');
console.log();

// 步骤1：卸载 sqlite3
console.log('[1/4] 卸载 sqlite3...');
try {
  execSync('npm uninstall sqlite3', { stdio: 'inherit' });
  console.log('✅ sqlite3 已卸载');
} catch (err) {
  console.log('⚠️  sqlite3 未安装或已卸载');
}
console.log();

// 步骤2：安装 better-sqlite3
console.log('[2/4] 安装 better-sqlite3...');
try {
  execSync('npm install better-sqlite3', { stdio: 'inherit' });
  console.log('✅ better-sqlite3 安装成功');
} catch (err) {
  console.error('❌ better-sqlite3 安装失败');
  console.error(err.message);
  process.exit(1);
}
console.log();

// 步骤3：修改代码
console.log('[3/4] 修改代码适配 better-sqlite3...');

const databaseFile = path.join(__dirname, '../server/config/database.js');

if (fs.existsSync(databaseFile)) {
  let content = fs.readFileSync(databaseFile, 'utf8');
  
  // 替换 require 语句
  content = content.replace(
    /const sqlite3 = require\('sqlite3'\)\.verbose\(\);/g,
    "const Database = require('better-sqlite3');"
  );
  
  // 替换数据库创建
  content = content.replace(
    /const db = new sqlite3\.Database\((.*?), \(err\) => {[\s\S]*?}\);/g,
    'const db = new Database($1);'
  );
  
  // 替换 db.run (异步 -> 同步)
  content = content.replace(
    /db\.run\((.*?), \(err\) => {[\s\S]*?}\);/g,
    'db.exec($1);'
  );
  
  // 替换 db.all (Promise化)
  const oldQuery = `  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },`;
  
  const newQuery = `  query: (sql, params = []) => {
    try {
      const stmt = db.prepare(sql);
      const rows = stmt.all(...params);
      return Promise.resolve(rows);
    } catch (err) {
      return Promise.reject(err);
    }
  },`;
  
  content = content.replace(oldQuery, newQuery);
  
  // 替换 db.get
  const oldGet = `  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },`;
  
  const newGet = `  get: (sql, params = []) => {
    try {
      const stmt = db.prepare(sql);
      const row = stmt.get(...params);
      return Promise.resolve(row);
    } catch (err) {
      return Promise.reject(err);
    }
  },`;
  
  content = content.replace(oldGet, newGet);
  
  // 替换 db.run (返回值)
  const oldRun = `  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }`;
  
  const newRun = `  run: (sql, params = []) => {
    try {
      const stmt = db.prepare(sql);
      const info = stmt.run(...params);
      return Promise.resolve({ lastID: info.lastInsertRowid, changes: info.changes });
    } catch (err) {
      return Promise.reject(err);
    }
  }`;
  
  content = content.replace(oldRun, newRun);
  
  // 写回文件
  fs.writeFileSync(databaseFile, content, 'utf8');
  console.log('✅ database.js 已更新');
} else {
  console.log('⚠️  未找到 database.js，跳过修改');
}
console.log();

// 步骤4：更新 package.json
console.log('[4/4] 更新 package.json...');
const packageFile = path.join(__dirname, '../package.json');
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  
  // 删除 sqlite3
  if (packageJson.dependencies && packageJson.dependencies.sqlite3) {
    delete packageJson.dependencies.sqlite3;
  }
  
  // 添加 better-sqlite3
  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }
  packageJson.dependencies['better-sqlite3'] = '^9.4.0';
  
  fs.writeFileSync(packageFile, JSON.stringify(packageJson, null, 2), 'utf8');
  console.log('✅ package.json 已更新');
} else {
  console.log('⚠️  未找到 package.json');
}
console.log();

// 完成
console.log('========================================');
console.log('  ✅ 修复完成！');
console.log('========================================');
console.log();
console.log('📋 更改内容:');
console.log('  - 已卸载 sqlite3');
console.log('  - 已安装 better-sqlite3');
console.log('  - 已更新 database.js 代码');
console.log('  - 已更新 package.json');
console.log();
console.log('🚀 下一步:');
console.log('  - 重启服务: npm run dev');
console.log('  - 测试功能: http://localhost:3000/admin');
console.log();
