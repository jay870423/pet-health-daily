const Database = require('better-sqlite3');
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, '../../pet_health.db');

// 创建数据库连接
const db = new Database(DB_PATH);
console.log('SQLite 数据库连接成功');

// 初始化数据库表
initDatabase();

// 初始化数据库表
function initDatabase() {
  // 创建管理员表
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('管理员表已创建或已存在');
  
  // 插入默认管理员账号 (用户名: admin, 密码: admin123)
  try {
    db.prepare(`
      INSERT OR IGNORE INTO admins (id, username, password, role) 
      VALUES (1, 'admin', 'admin123', 'superadmin')
    `).run();
  } catch (err) {
    // 忽略重复插入错误
  }

  // 创建宠物信息表
  db.exec(`
    CREATE TABLE IF NOT EXISTS pets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      species INTEGER NOT NULL,
      species_name TEXT NOT NULL,
      icon TEXT DEFAULT '🐕',
      type TEXT NOT NULL,
      customer TEXT,
      location_lat REAL,
      location_lng REAL,
      location_name TEXT,
      birth_date TEXT,
      weight REAL,
      gender TEXT,
      breed TEXT,
      description TEXT,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('宠物信息表已创建或已存在');
  insertDefaultPets();
}

// 插入默认宠物数据
function insertDefaultPets() {
  const defaultPets = [
    { id: 'DOG001', name: '豆豆', species: 1, species_name: '狗', icon: '🐕', type: '狗', customer: '张先生', location_lat: 39.9042, location_lng: 116.4074, location_name: '北京' },
    { id: 'CAT001', name: '喵喵', species: 2, species_name: '猫', icon: '🐱', type: '猫', customer: '李女士', location_lat: 31.2304, location_lng: 121.4737, location_name: '上海' },
    { id: 'DOG002', name: '旺财', species: 1, species_name: '狗', icon: '🐕', type: '狗', customer: '王先生', location_lat: 22.5431, location_lng: 114.0579, location_name: '深圳' },
    { id: 'CAT002', name: '咪咪', species: 2, species_name: '猫', icon: '🐈', type: '猫', customer: '赵女士', location_lat: 30.5728, location_lng: 104.0668, location_name: '成都' },
    { id: 'DOG003', name: '大黄', species: 1, species_name: '狗', icon: '🦮', type: '狗', customer: '刘先生', location_lat: 23.1291, location_lng: 113.2644, location_name: '广州' },
    { id: 'CAT003', name: '小白', species: 2, species_name: '猫', icon: '🐱', type: '猫', customer: '陈女士', location_lat: 29.8683, location_lng: 121.5440, location_name: '宁波' },
    { id: 'DOG004', name: '黑子', species: 1, species_name: '狗', icon: '🐕‍🦺', type: '狗', customer: '周先生', location_lat: 34.3416, location_lng: 108.9398, location_name: '西安' },
    { id: 'CAT004', name: '橘子', species: 2, species_name: '猫', icon: '🐈‍⬛', type: '猫', customer: '吴女士', location_lat: 30.2936, location_lng: 120.1614, location_name: '杭州' },
    { id: 'DOG005', name: '雪糕', species: 1, species_name: '狗', icon: '🐩', type: '狗', customer: '郑先生', location_lat: 26.0745, location_lng: 119.2965, location_name: '福州' },
    { id: 'CAT005', name: '芝麻', species: 2, species_name: '猫', icon: '🐱', type: '猫', customer: '孙女士', location_lat: 36.6512, location_lng: 117.1201, location_name: '济南' }
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO pets (id, name, species, species_name, icon, type, customer, location_lat, location_lng, location_name, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  for (const pet of defaultPets) {
    stmt.run(pet.id, pet.name, pet.species, pet.species_name, pet.icon, pet.type, pet.customer, pet.location_lat, pet.location_lng, pet.location_name);
  }
}

// 导出数据库实例和Promise化的方法
module.exports = {
  db,
  // Promise化的查询方法
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      try {
        const stmt = db.prepare(sql);
        const rows = params.length > 0 ? stmt.all(...params) : stmt.all();
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    });
  },
  // Promise化的单行查询
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      try {
        const stmt = db.prepare(sql);
        const row = params.length > 0 ? stmt.get(...params) : stmt.get();
        resolve(row);
      } catch (err) {
        reject(err);
      }
    });
  },
  // Promise化的执行方法
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      try {
        const stmt = db.prepare(sql);
        const info = params.length > 0 ? stmt.run(...params) : stmt.run();
        resolve({ lastID: info.lastInsertRowid, changes: info.changes });
      } catch (err) {
        reject(err);
      }
    });
  }
};
