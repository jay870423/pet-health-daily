import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import './App.css';
import DailyReport from './components/DailyReport';
import DateSelector from './components/DateSelector';
import AdminPanel from './components/AdminPanel';

function App() {
  const [petId, setPetId] = useState('DOG001'); // 默认选择豆豆
  const [date, setDate] = useState(moment().tz('Asia/Shanghai').format('YYYY-MM-DD'));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [pets, setPets] = useState([]); // 动态宠物列表
  const [petsLoading, setPetsLoading] = useState(true);

  // 获取宠物列表
  const fetchPets = async () => {
    setPetsLoading(true);
    try {
      const response = await axios.get('/api/pets'); // 使用公开的宠物列表接口
      if (response.data.success) {
        const petList = response.data.data;
        setPets(petList);
        
        // 如果当前选中的宠物不在列表中，选择第一个
        if (petList.length > 0 && !petList.find(p => p.id === petId)) {
          setPetId(petList[0].id);
        }
      }
    } catch (error) {
      console.error('获取宠物列表失败:', error);
      // 降级：使用默认宠物列表
      const defaultPets = [
        { id: 'DOG001', name: '豆豆', species: 1, icon: '🐕', type: '狗', species_name: '狗' },
        { id: 'CAT001', name: '喵喵', species: 2, icon: '🐱', type: '猫', species_name: '猫' }
      ];
      setPets(defaultPets);
    } finally {
      setPetsLoading(false);
    }
  };

  // 初始加载宠物列表
  useEffect(() => {
    fetchPets();
  }, []);

  // 获取当前宠物信息
  const currentPet = pets.find(p => p.id === petId) || pets[0] || { id: 'DOG001', name: '豆豆', icon: '🐕', type: '狗' };

  useEffect(() => {
    if (!showAdmin && petId) {
      fetchReport();
    }
  }, [petId, date, showAdmin]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/report/${petId}?date=${date}`);
      if (response.data.success) {
        setReport(response.data.data);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 从管理后台返回时，刷新宠物列表
  const handleBackFromAdmin = () => {
    setShowAdmin(false);
    fetchPets(); // 刷新宠物列表
  };

  // 如果显示管理后台
  if (showAdmin) {
    return <AdminPanel onBack={handleBackFromAdmin} />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">{currentPet.icon}</div>
            <div className="logo-text">
              <h1>{currentPet.name}的日报</h1>
              <p className="subtitle">{currentPet.species_name || currentPet.type} • {currentPet.id}</p>
            </div>
          </div>
          <div className="header-tabs">
            <button className="login-btn" onClick={() => setShowAdmin(true)}>
              登入
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <DateSelector 
          date={date} 
          onDateChange={setDate}
          petId={petId}
          onPetIdChange={setPetId}
          pets={pets}
          petsLoading={petsLoading}
        />

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p>⚠️ {error}</p>
            <button onClick={fetchReport}>重试</button>
          </div>
        )}

        {!loading && !error && report && (
          <DailyReport report={report} />
        )}
      </main>
    </div>
  );
}

export default App;
