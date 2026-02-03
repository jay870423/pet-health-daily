import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PetForm.css';

const ICONS = ['🐕', '🐶', '🦮', '🐕‍🦺', '🐩', '🐱', '🐈', '🐈‍⬛'];

function PetForm({ pet, onClose }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    species: '1',
    species_name: '狗',
    icon: '🐕',
    type: '狗',
    customer: '',
    location_lat: '',
    location_lng: '',
    location_name: '',
    birth_date: '',
    weight: '',
    gender: '',
    breed: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pet) {
      setFormData(pet);
    }
  }, [pet]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 自动更新相关字段
    if (name === 'species') {
      const isDog = value === '1';
      setFormData(prev => ({
        ...prev,
        species: value,
        species_name: isDog ? '狗' : '猫',
        type: isDog ? '狗' : '猫',
        icon: isDog ? '🐕' : '🐱'
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = pet ? `/api/admin/pets/${pet.id}` : '/api/admin/pets';
      const method = pet ? 'put' : 'post';

      const response = await axios[method](url, formData);

      if (response.data.success) {
        alert(pet ? '更新成功' : '添加成功');
        onClose(true); // 传true表示需要刷新列表
      }
    } catch (err) {
      setError(err.response?.data?.error || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-modal">
      <div className="form-overlay" onClick={() => onClose(false)}></div>
      <div className="form-container">
        <div className="form-header">
          <h2>{pet ? '编辑宠物信息' : '新增宠物'}</h2>
          <button className="close-btn" onClick={() => onClose(false)}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pet-form">
          {error && (
            <div className="form-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="form-grid">
            {/* ID */}
            <div className="form-field">
              <label htmlFor="id">
                宠物ID <span className="required">*</span>
              </label>
              <input
                type="text"
                id="id"
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder="例如: DOG001"
                required
                disabled={!!pet}
              />
            </div>

            {/* 名称 */}
            <div className="form-field">
              <label htmlFor="name">
                名称 <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="宠物名称"
                required
              />
            </div>

            {/* 物种 */}
            <div className="form-field">
              <label htmlFor="species">
                物种 <span className="required">*</span>
              </label>
              <select
                id="species"
                name="species"
                value={formData.species}
                onChange={handleChange}
                required
              >
                <option value="1">狗</option>
                <option value="2">猫</option>
              </select>
            </div>

            {/* 图标 */}
            <div className="form-field">
              <label>图标</label>
              <div className="icon-selector">
                {ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    className={`icon-btn ${formData.icon === icon ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* 主人 */}
            <div className="form-field">
              <label htmlFor="customer">主人</label>
              <input
                type="text"
                id="customer"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                placeholder="主人姓名"
              />
            </div>

            {/* 品种 */}
            <div className="form-field">
              <label htmlFor="breed">品种</label>
              <input
                type="text"
                id="breed"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                placeholder="品种"
              />
            </div>

            {/* 性别 */}
            <div className="form-field">
              <label htmlFor="gender">性别</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">请选择</option>
                <option value="雄性">雄性</option>
                <option value="雌性">雌性</option>
              </select>
            </div>

            {/* 体重 */}
            <div className="form-field">
              <label htmlFor="weight">体重 (kg)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="体重"
                step="0.1"
              />
            </div>

            {/* 出生日期 */}
            <div className="form-field">
              <label htmlFor="birth_date">出生日期</label>
              <input
                type="date"
                id="birth_date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
              />
            </div>

            {/* 位置名称 */}
            <div className="form-field">
              <label htmlFor="location_name">位置</label>
              <input
                type="text"
                id="location_name"
                name="location_name"
                value={formData.location_name}
                onChange={handleChange}
                placeholder="城市或地点"
              />
            </div>

            {/* 经度 */}
            <div className="form-field">
              <label htmlFor="location_lng">经度</label>
              <input
                type="number"
                id="location_lng"
                name="location_lng"
                value={formData.location_lng}
                onChange={handleChange}
                placeholder="116.4074"
                step="0.000001"
              />
            </div>

            {/* 纬度 */}
            <div className="form-field">
              <label htmlFor="location_lat">纬度</label>
              <input
                type="number"
                id="location_lat"
                name="location_lat"
                value={formData.location_lat}
                onChange={handleChange}
                placeholder="39.9042"
                step="0.000001"
              />
            </div>
          </div>

          {/* 描述 */}
          <div className="form-field full-width">
            <label htmlFor="description">描述</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="宠物描述信息..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="cancel-btn"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PetForm;
