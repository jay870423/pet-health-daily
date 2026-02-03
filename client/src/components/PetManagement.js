import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PetManagement.css';
import PetForm from './PetForm';

function PetManagement({ onLogout }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [species, setSpecies] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);

  const pageSize = 10;

  useEffect(() => {
    fetchPets();
  }, [page, keyword, species]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/pets', {
        params: { page, pageSize, keyword, species }
      });

      if (response.data.success) {
        setPets(response.data.data.list);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      console.error('获取宠物列表失败:', error);
      alert('获取宠物列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchPets();
  };

  const handleAdd = () => {
    setEditingPet(null);
    setShowForm(true);
  };

  const handleEdit = (pet) => {
    setEditingPet(pet);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个宠物吗？')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/admin/pets/${id}`);
      if (response.data.success) {
        alert('删除成功');
        fetchPets();
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  const handleFormClose = (shouldRefresh) => {
    setShowForm(false);
    setEditingPet(null);
    if (shouldRefresh) {
      fetchPets();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    onLogout();
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="pet-management-container">
      {/* 头部 */}
      <div className="management-header">
        <div className="header-left">
          <h1>🐾 宠物信息管理</h1>
          <p className="subtitle">管理系统中的所有宠物信息</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          退出登录
        </button>
      </div>

      {/* 搜索栏 */}
      <div className="search-bar">
        <div className="search-group">
          <input
            type="text"
            placeholder="搜索宠物ID、名称或主人..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <select value={species} onChange={(e) => setSpecies(e.target.value)}>
            <option value="">全部物种</option>
            <option value="1">狗</option>
            <option value="2">猫</option>
          </select>
          <button onClick={handleSearch} className="search-btn">
            🔍 搜索
          </button>
        </div>
        <button onClick={handleAdd} className="add-btn">
          ➕ 新增宠物
        </button>
      </div>

      {/* 宠物列表 */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      ) : (
        <>
          <div className="pets-table">
            <table>
              <thead>
                <tr>
                  <th>图标</th>
                  <th>ID</th>
                  <th>名称</th>
                  <th>物种</th>
                  <th>主人</th>
                  <th>位置</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {pets.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-state">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  pets.map((pet) => (
                    <tr key={pet.id}>
                      <td>
                        <span className="pet-icon">{pet.icon}</span>
                      </td>
                      <td className="pet-id">{pet.id}</td>
                      <td className="pet-name">{pet.name}</td>
                      <td>{pet.species_name}</td>
                      <td>{pet.customer || '-'}</td>
                      <td>{pet.location_name || '-'}</td>
                      <td>{new Date(pet.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(pet)}
                            className="edit-btn"
                            title="编辑"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(pet.id)}
                            className="delete-btn"
                            title="删除"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="page-btn"
              >
                上一页
              </button>
              <span className="page-info">
                第 {page} / {totalPages} 页 (共 {total} 条)
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="page-btn"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}

      {/* 表单弹窗 */}
      {showForm && (
        <PetForm
          pet={editingPet}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

export default PetManagement;
