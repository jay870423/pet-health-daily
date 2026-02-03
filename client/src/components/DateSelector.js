import React from 'react';
import './DateSelector.css';

function DateSelector({ date, onDateChange, petId, onPetIdChange, pets = [], petsLoading = false }) {
  // 如果没有传入宠物列表，使用默认列表（降级方案）
  const defaultPets = [
    { id: 'DOG001', name: '豆豆', species: 1, icon: '🐕', type: '狗', species_name: '狗' },
    { id: 'CAT001', name: '喵喵', species: 2, icon: '🐱', type: '猫', species_name: '猫' },
    { id: 'DOG002', name: '旺财', species: 1, icon: '🐕', type: '狗', species_name: '狗' },
    { id: 'CAT002', name: '咪咪', species: 2, icon: '🐈', type: '猫', species_name: '猫' },
    { id: 'DOG003', name: '大黄', species: 1, icon: '🦮', type: '狗', species_name: '狗' },
    { id: 'CAT003', name: '小白', species: 2, icon: '🐱', type: '猫', species_name: '猫' },
    { id: 'DOG004', name: '黑子', species: 1, icon: '🐕‍🦺', type: '狗', species_name: '狗' },
    { id: 'CAT004', name: '橘子', species: 2, icon: '🐈‍⬛', type: '猫', species_name: '猫' },
    { id: 'DOG005', name: '雪糕', species: 1, icon: '🐩', type: '狗', species_name: '狗' },
    { id: 'CAT005', name: '芝麻', species: 2, icon: '🐱', type: '猫', species_name: '猫' }
  ];

  const petList = pets.length > 0 ? pets : defaultPets;
  const currentPet = petList.find(p => p.id === petId) || petList[0] || { id: 'DOG001', name: '豆豆', icon: '🐕', species_name: '狗' };

  return (
    <div className="date-selector">
      <div className="selector-group pet-selector">
        <label>选择宠物：</label>
        <select
          value={petId}
          onChange={(e) => onPetIdChange(e.target.value)}
          className="pet-select"
          disabled={petsLoading}
        >
          {petsLoading ? (
            <option>加载中...</option>
          ) : (
            petList.map(pet => (
              <option key={pet.id} value={pet.id}>
                {pet.icon} {pet.name} ({pet.species_name || pet.type} - {pet.id})
              </option>
            ))
          )}
        </select>
        <div className="current-pet-info">
          <span className="pet-icon-large">{currentPet.icon}</span>
          <div className="pet-details">
            <span className="pet-name">{currentPet.name}</span>
            <span className="pet-type">物种ID: {currentPet.species}</span>
          </div>
        </div>
      </div>
      <div className="selector-group">
        <label>选择日期：</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="date-input"
        />
      </div>
    </div>
  );
}

export default DateSelector;
