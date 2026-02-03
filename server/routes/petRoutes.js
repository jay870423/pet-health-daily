const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

/**
 * GET /api/pets
 * 获取所有宠物列表（公开接口，无需登录）
 */
router.get('/', async (req, res) => {
  try {
    const { status = 1 } = req.query; // 默认只返回启用的宠物

    let sql = 'SELECT id, name, species, species_name, icon, type, customer, location_name FROM pets';
    const params = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const pets = await query(sql, params);

    res.json({
      success: true,
      data: pets
    });
  } catch (error) {
    console.error('获取宠物列表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/pets/:id
 * 获取单个宠物信息（公开接口）
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const pet = await query(
      'SELECT * FROM pets WHERE id = ? AND status = 1',
      [id]
    );

    if (!pet || pet.length === 0) {
      return res.status(404).json({
        success: false,
        error: '宠物不存在'
      });
    }

    res.json({
      success: true,
      data: pet[0]
    });
  } catch (error) {
    console.error('获取宠物信息失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
