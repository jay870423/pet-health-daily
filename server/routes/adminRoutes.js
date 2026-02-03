const express = require('express');
const router = express.Router();
const { query, get, run } = require('../config/database');

/**
 * POST /api/admin/login
 * 管理员登录
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: '用户名和密码不能为空'
      });
    }

    // 查询管理员
    const admin = await get(
      'SELECT id, username, role FROM admins WHERE username = ? AND password = ?',
      [username, password]
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: '用户名或密码错误'
      });
    }

    // 简单的session模拟（生产环境应使用JWT或真实session）
    res.json({
      success: true,
      data: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        token: Buffer.from(`${admin.id}:${admin.username}:${Date.now()}`).toString('base64')
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/admin/logout
 * 管理员登出
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: '登出成功'
  });
});

/**
 * GET /api/admin/pets
 * 获取宠物列表
 */
router.get('/pets', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, keyword = '', species = '' } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClauses = ['status = 1'];
    let params = [];

    if (keyword) {
      whereClauses.push('(name LIKE ? OR id LIKE ? OR customer LIKE ?)');
      const keywordPattern = `%${keyword}%`;
      params.push(keywordPattern, keywordPattern, keywordPattern);
    }

    if (species) {
      whereClauses.push('species = ?');
      params.push(species);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // 查询总数
    const countResult = await get(
      `SELECT COUNT(*) as total FROM pets ${whereSQL}`,
      params
    );

    // 查询列表
    const pets = await query(
      `SELECT * FROM pets ${whereSQL} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );

    res.json({
      success: true,
      data: {
        list: pets,
        total: countResult.total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/admin/pets/:id
 * 获取单个宠物信息
 */
router.get('/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await get('SELECT * FROM pets WHERE id = ?', [id]);

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: '宠物不存在'
      });
    }

    res.json({
      success: true,
      data: pet
    });
  } catch (error) {
    console.error('Get pet error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/admin/pets
 * 新增宠物
 */
router.post('/pets', async (req, res) => {
  try {
    const {
      id, name, species, species_name, icon, type,
      customer, location_lat, location_lng, location_name,
      birth_date, weight, gender, breed, description
    } = req.body;

    if (!id || !name || !species || !species_name || !type) {
      return res.status(400).json({
        success: false,
        error: '宠物ID、名称、物种信息和类型为必填项'
      });
    }

    // 检查ID是否已存在
    const existing = await get('SELECT id FROM pets WHERE id = ?', [id]);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: '宠物ID已存在'
      });
    }

    // 插入宠物信息
    await run(`
      INSERT INTO pets (
        id, name, species, species_name, icon, type, customer,
        location_lat, location_lng, location_name,
        birth_date, weight, gender, breed, description, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      id, name, species, species_name, icon || '🐕', type, customer,
      location_lat, location_lng, location_name,
      birth_date, weight, gender, breed, description
    ]);

    res.json({
      success: true,
      data: { id },
      message: '宠物添加成功'
    });
  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/admin/pets/:id
 * 更新宠物信息
 */
router.put('/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, species, species_name, icon, type,
      customer, location_lat, location_lng, location_name,
      birth_date, weight, gender, breed, description
    } = req.body;

    // 检查宠物是否存在
    const existing = await get('SELECT id FROM pets WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: '宠物不存在'
      });
    }

    // 更新宠物信息
    await run(`
      UPDATE pets SET
        name = ?, species = ?, species_name = ?, icon = ?, type = ?,
        customer = ?, location_lat = ?, location_lng = ?, location_name = ?,
        birth_date = ?, weight = ?, gender = ?, breed = ?, description = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name, species, species_name, icon, type,
      customer, location_lat, location_lng, location_name,
      birth_date, weight, gender, breed, description,
      id
    ]);

    res.json({
      success: true,
      message: '宠物信息更新成功'
    });
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/admin/pets/:id
 * 删除宠物（软删除）
 */
router.delete('/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查宠物是否存在
    const existing = await get('SELECT id FROM pets WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: '宠物不存在'
      });
    }

    // 软删除
    await run('UPDATE pets SET status = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '宠物删除成功'
    });
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
