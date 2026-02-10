import React, { useState } from 'react';
import { KidsData, Mood } from '../../../types/kidscorner.types';

interface HubZoneProps {
  kidsData: KidsData;
  onUpdateData: (newData: Partial<KidsData>) => void;
}

const MOODS: { type: Mood; emoji: string; label: string }[] = [
  { type: 'happy', emoji: '😊', label: 'Happy' },
  { type: 'calm', emoji: '😌', label: 'Calm' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😡', label: 'Angry' },
  { type: 'silly', emoji: '🤪', label: 'Silly' },
  { type: 'worried', emoji: '😟', label: 'Worried' },
];

const DAILY_FACTS = [
  "Did you know? Taking deep breaths can tell your brain to feel calm!",
  "Fun fact: Your brain is like a muscle – the more you use it to be kind, the stronger it gets!",
  "Stretching your body can help your mind feel more awake and happy.",
  "Drinking a glass of water is like giving your brain a big, refreshing hug!",
  "Smiling can actually trick your brain into feeling a little bit happier!",
];

const HubZone: React.FC<HubZoneProps> = ({ kidsData, onUpdateData }) => {
  const [dailyFact] = useState(DAILY_FACTS[Math.floor(Math.random() * DAILY_FACTS.length)]);
  
  // LOGIC FIX: Determine initial view based on if data exists
  const [view, setView] = useState<'selector' | 'dashboard'>(
    kidsData.lastMood ? 'dashboard' : 'selector'
  );

  // Helper: Time-based Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleMoodSelect = (mood: Mood) => {
    onUpdateData({ lastMood: mood, streak: (kidsData.streak || 0) + 1 });
    setView('dashboard'); // Switch to dashboard after selection
  };

  // --- VIEW 1: MOOD SELECTOR ---
  if (view === 'selector') {
    return (
      <div className="max-w-2xl mx-auto text-center mt-10 animate-fade-in">
        {kidsData.lastMood && (
             <button 
               onClick={() => setView('dashboard')}
               className="mb-6 text-teal font-bold hover:underline"
             >
               ⬅ Back to Dashboard
             </button>
        )}
        <h1 className="text-4xl md:text-5xl font-heading font-black text-dark-text mb-4">
            {getGreeting()}, Explorer! 👋
        </h1>
        <p className="text-xl text-dark-text/70 mb-10">How are you feeling right now?</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {MOODS.map(m => (
            <button 
              key={m.type}
              onClick={() => handleMoodSelect(m.type)}
              className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-110 border-4 border-transparent hover:border-pastel-green group"
            >
              <div className="text-6xl mb-3 group-hover:animate-bounce transition-transform">{m.emoji}</div>
              <div className="font-bold text-dark-text">{m.label}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- VIEW 2: DASHBOARD ---
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal to-pastel-green p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-heading font-black mb-2">Welcome Back!</h2>
          <p className="text-white/90 text-lg italic mb-4">"{dailyFact}"</p>
          
          {/* NEW BUTTON: Allows re-selecting mood */}
          <button 
            onClick={() => setView('selector')}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/50 px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
          >
             <span>🔄</span> Update my Mood
          </button>
        </div>
        <div className="absolute top-[-20%] right-[-5%] text-9xl opacity-20 rotate-12">🌟</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sticker Book */}
          <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-dashed border-pastel-green">
            <h3 className="font-black text-xl mb-4 text-dark-text">Your Sticker Book 📓</h3>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                 <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-all hover:scale-110 ${i < kidsData.stickers.length ? 'bg-pastel-green/20' : 'bg-gray-100 grayscale opacity-30'}`}>
                   {i < kidsData.stickers.length ? kidsData.stickers[i] : '❓'}
                 </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-center text-gray-500">Collect more by trying new activities!</p>
          </div>
          
          {/* Daily Progress */}
          <div className="bg-white p-6 rounded-3xl shadow-lg">
            <h3 className="font-black text-xl mb-4 text-dark-text">Daily Progress 📈</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold p-3 bg-gray-50 rounded-xl">
                 <div className="flex flex-col">
                    <span>Mood Check-in</span>
                    {kidsData.lastMood && <span className="text-xs text-gray-400 font-normal">Feeling {kidsData.lastMood}</span>}
                 </div>
                 <span className="text-green-500 flex items-center gap-1">Done! ✅</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold p-3 bg-gray-50 rounded-xl">
                 <span>Play a Game</span>
                 <span className={kidsData.stickers.length > 0 ? 'text-green-500' : 'text-gray-400 italic'}>
                   {kidsData.stickers.length > 0 ? 'Done! ✅' : 'Not yet'}
                 </span>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default HubZone;