import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KidsData } from '../../types/kidscorner.types';

// --- IMPORT YOUR ZONES HERE ---
// Make sure you create these files in a 'zones' subfolder!
import HubZone from './zones/HubZone';
import PlayZone from './zones/PlayZone';
import LearnZone from './zones/LearnZone';
import HelpZone from './zones/HelpZone';

const KidsCornerPage = () => {
  const navigate = useNavigate();

  // 1. STATE: Manage Data (Persisted in LocalStorage)
  const [kidsData, setKidsData] = useState<KidsData>(() => {
    const saved = localStorage.getItem('totoz_kids_data');
    return saved ? JSON.parse(saved) : {
      stickers: [],
      streak: 0,
      worries: [],
      lastMood: undefined
    };
  });

  // 2. STATE: Manage Active Zone
  const [activeZone, setActiveZone] = useState<'hub' | 'play' | 'learn' | 'help'>('hub');

  // 3. HANDLER: Update Data Wrapper
  const handleUpdateData = (newData: Partial<KidsData>) => {
    setKidsData((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('totoz_kids_data', JSON.stringify(updated));
      return updated;
    });
  };

  // 4. HANDLER: Navigation
  const handleBack = () => {
    navigate('/'); 
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-light-bg">
      {/* --- SHARED NAVIGATION BAR --- */}
      <nav className="bg-white/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-pastel-green/20">
        <button onClick={handleBack} className="flex items-center gap-2 text-teal font-bold hover:bg-teal/10 px-4 py-2 rounded-xl transition-all">
          <span className="text-xl">🏠</span> Home
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 px-3 py-1 rounded-full flex items-center gap-2 border border-yellow-200 shadow-sm animate-bounce-slow">
            <span className="text-xl">⭐</span>
            <span className="font-bold text-yellow-700">{kidsData.streak || 0} Streak</span>
          </div>
          <div className="bg-teal text-white px-3 py-1 rounded-full flex items-center gap-2 shadow-sm font-bold">
             <span>🎒</span> 
             <span>{kidsData.stickers.length} Stickers</span>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto animate-fade-in">
            
          {/* --- ZONE MENU SELECTOR --- */}
          {/* Only show menu if user has selected a mood (optional logic) or always show it */}
          <div className="flex gap-4 mb-8 overflow-x-auto pb-4 no-scrollbar">
            {[
              { id: 'hub', label: 'My Hub', icon: '🏠' },
              { id: 'play', label: 'Play Zone', icon: '🎮' },
              { id: 'learn', label: 'Learn Zone', icon: '📚' },
              { id: 'help', label: 'Help Zone', icon: '🛡️' },
            ].map(z => (
              <button
                key={z.id}
                onClick={() => setActiveZone(z.id as any)}
                className={`px-6 py-4 rounded-2xl font-black whitespace-nowrap transition-all shadow-md flex items-center gap-2 ${
                  activeZone === z.id 
                  ? 'bg-teal text-white scale-105 shadow-xl ring-4 ring-teal/20' 
                  : 'bg-white text-teal hover:bg-teal/5'
                }`}
              >
                <span className="text-xl">{z.icon}</span> {z.label}
              </button>
            ))}
          </div>

          {/* --- RENDER THE ACTIVE ZONE --- */}
          <div className="min-h-[500px]">
            {activeZone === 'hub' && (
              <HubZone kidsData={kidsData} onUpdateData={handleUpdateData} />
            )}
            
            {activeZone === 'play' && (
              <PlayZone kidsData={kidsData} onUpdateData={handleUpdateData} />
            )}
            
            {/* LearnZone usually only reads data, doesn't update it, but passing it is fine */}
            {activeZone === 'learn' && (
              <LearnZone kidsData={kidsData} />
            )}
            
            {activeZone === 'help' && (
              <HelpZone kidsData={kidsData} onUpdateData={handleUpdateData} />
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default KidsCornerPage;