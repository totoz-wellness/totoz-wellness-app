import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KidsCorner from './KidsCorner'; // Adjust path if needed
// You might need to move your 'types' import here or keep it shared
import { KidsData } from '../../types/kidscorner.types'; 

const KidsCornerPage = () => {
  const navigate = useNavigate();

  // 1. Initialize State (Load from LocalStorage so stickers persist)
  const [kidsData, setKidsData] = useState<KidsData>(() => {
    const saved = localStorage.getItem('totoz_kids_data');
    return saved ? JSON.parse(saved) : {
      stickers: [],
      streak: 0,
      worries: [],
      lastMood: undefined
    };
  });

  // 2. Handle Data Updates
  const handleUpdateData = (newData: Partial<KidsData>) => {
    setKidsData((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('totoz_kids_data', JSON.stringify(updated));
      return updated;
    });
  };

  // 3. Handle Navigation
  const handleBack = () => {
    navigate('/'); // Or navigate to '/growtrack' if that is the parent feature
  };

  return (
    <KidsCorner 
      kidsData={kidsData} 
      onUpdateData={handleUpdateData} 
      onBackToHome={handleBack} 
    />
  );
};

export default KidsCornerPage;