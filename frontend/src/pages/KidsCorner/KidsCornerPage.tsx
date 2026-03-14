import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKidsCorner } from '../../contexts/KidsCornerContext';
import ChildSelector from '../../components/KidsCorner/ChildSelector';

// --- IMPORT YOUR ZONES HERE ---
import HubZone from './zones/HubZone';
import PlayZone from './zones/PlayZone';
import LearnZone from './zones/LearnZone';
import HelpZone from './zones/HelpZone';

// Legacy type for backward compatibility with zones
import { KidsData } from '../../types/kidscorner.types';

const KidsCornerPage = () => {
  const navigate = useNavigate();
  const { activeChild, progress, loading, error } = useKidsCorner();

  // Active zone state
  const [activeZone, setActiveZone] = useState<'hub' | 'play' | 'learn' | 'help'>('hub');

  // 3. EFFECT: Reset session check-ins when entering Kids Corner
  useEffect(() => {
    setKidsData(prev => {
      const updated = { ...prev, lastMood: undefined, hasReadBook: false, hasPlayedGame: false };
      // Save it so the reload doesn't resurrect the mood unexpectedly
      localStorage.setItem('totoz_kids_data', JSON.stringify(updated));
      return updated;
    });
  }, []);

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

  // Zone configuration with beautiful colors
  const zones = [
    { 
      id: 'hub', 
      label: 'My Hub', 
      icon: '🏠', 
      gradient: 'from-purple-400 to-purple-600',
      hoverGradient: 'from-purple-500 to-purple-700',
      ringColor: 'ring-purple-400/50',
      bgColor: 'bg-purple-500'
    },
    { 
      id: 'play', 
      label: 'Play Zone', 
      icon: '🎮', 
      gradient: 'from-blue-400 to-indigo-600',
      hoverGradient: 'from-blue-500 to-indigo-700',
      ringColor: 'ring-blue-400/50',
      bgColor: 'bg-blue-500'
    },
    { 
      id: 'learn', 
      label: 'Learn Zone', 
      icon: '📚', 
      gradient: 'from-green-400 to-emerald-600',
      hoverGradient: 'from-green-500 to-emerald-700',
      ringColor: 'ring-green-400/50',
      bgColor: 'bg-green-500'
    },
    { 
      id: 'help', 
      label: 'Help Zone', 
      icon: '🛡️', 
      gradient: 'from-pink-400 to-rose-600',
      hoverGradient: 'from-pink-500 to-rose-700',
      ringColor: 'ring-pink-400/50',
      bgColor: 'bg-pink-500'
    },
  ];

  const activeZoneConfig = zones.find(z => z.id === activeZone);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* --- NAVIGATION BAR --- */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-purple-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Back Button */}
            <button 
              onClick={handleBack} 
              className="flex items-center gap-2 text-purple-600 font-bold hover:bg-purple-50 px-3 sm:px-4 py-2 rounded-xl transition-all transform hover:scale-105"
            >
              <span className="text-xl sm:text-2xl">🏠</span> 
              <span className="hidden sm:inline">Home</span>
            </button>

            {/* Active Child Info */}
            {activeChild && (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Child Avatar */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-3 sm:px-4 py-2 rounded-full border-2 border-purple-300/50 shadow-sm">
                  <span className="text-xl sm:text-2xl">{activeChild.avatarEmoji}</span>
                  <span className="font-bold text-purple-700 text-sm sm:text-base hidden xs:inline">{activeChild.name}</span>
                </div>
                
                {/* Streak Badge */}
                <div className="bg-gradient-to-r from-orange-100 to-yellow-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2 border-2 border-orange-300/50 shadow-sm">
                  <span className="text-base sm:text-xl">🔥</span>
                  <span className="font-bold text-orange-700 text-xs sm:text-sm">{progress?.streak || 0}</span>
                  <span className="hidden sm:inline font-bold text-orange-700 text-xs sm:text-sm">Day{progress?.streak !== 1 ? 's' : ''}</span>
                </div>
                
                {/* Stickers Badge */}
                <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2 shadow-md font-bold text-xs sm:text-sm">
                  <span className="text-base sm:text-lg">🎒</span> 
                  <span>{progress?.stickers.length || 0}</span>
                </div>
              </div>
            )}
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
              <HubZone kidsData={kidsData} onUpdateData={handleUpdateData} onNavigate={setActiveZone} />
            )}
            
            {activeZone === 'play' && (
              <PlayZone kidsData={kidsData} onUpdateData={handleUpdateData} />
            )}
            
            {/* LearnZone usually only reads data, doesn't update it, but passing it is fine */}
            {activeZone === 'learn' && (
              <LearnZone kidsData={kidsData} onUpdateData={handleUpdateData} />
            )}
            
            {activeZone === 'help' && (
              <HelpZone kidsData={kidsData} onUpdateData={handleUpdateData} />
            )}
          </div>
          
        </div>
      </main>

      {/* Add custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @media (min-width: 375px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
};

export default KidsCornerPage;