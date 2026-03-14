import React, { useState } from 'react';
import { KidsData, Mood } from '../../../types/kidscorner.types';

interface HubZoneProps {
  kidsData: KidsData;
  onUpdateData: (newData: Partial<KidsData>) => void;
  onNavigate?: (zone: 'hub' | 'play' | 'learn' | 'help') => void;
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

const HubZone: React.FC<HubZoneProps> = ({ kidsData, onUpdateData, onNavigate }) => {
  const [dailyFact] = useState(DAILY_FACTS[Math.floor(Math.random() * DAILY_FACTS.length)]);
  const [view, setView] = useState<'selector' | 'dashboard'>('selector');
  const [isLogging, setIsLogging] = useState(false);
  const [lastMood, setLastMood] = useState<Mood | null>(null);

  // Helper: Time-based Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleMoodSelect = async (mood: Mood) => {
    if (!activeChild) {
      toast.error('Please select a child first');
      return;
    }

    setIsLogging(true);

    try {
      const result = await kidsCornerAPI.logMood(activeChild.id, mood);
      
      // Update local state
      setLastMood(mood);
      
      // Refresh progress from backend
      await refreshProgress();

      // Show success message
      const moodEmoji = MOODS.find(m => m.type === mood)?.emoji || '✨';
      toast.success(`${moodEmoji} Mood logged! Streak: ${result.progress.streak} days!`, {
        duration: 3000,
        icon: '🎉'
      });

      // Switch to dashboard
      setView('dashboard');

    } catch (error: any) {
      console.error('Failed to log mood:', error);
      toast.error('Oops! Could not save your mood. Try again!');
    } finally {
      setIsLogging(false);
    }
  };

  // --- VIEW 1: MOOD SELECTOR ---
  if (view === 'selector') {
    return (
      <div className="max-w-2xl mx-auto text-center mt-10 animate-fade-in">
        {lastMood && (
          <button 
            onClick={() => setView('dashboard')}
            className="mb-6 text-teal font-bold hover:underline"
          >
            ⬅ Back to Dashboard
          </button>
        )}
        <h1 className="text-4xl md:text-5xl font-heading font-black text-gray-800 mb-4">
          {getGreeting()}, {activeChild?.name}! 👋
        </h1>
        <p className="text-xl text-gray-600 mb-10">How are you feeling right now?</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {MOODS.map(m => (
            <button 
              key={m.type}
              onClick={() => handleMoodSelect(m.type)}
              disabled={isLogging}
              className={`bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-110 border-4 border-transparent hover:border-teal-400 group ${
                isLogging ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="text-6xl mb-3 group-hover:animate-bounce transition-transform">{m.emoji}</div>
              <div className="font-bold text-gray-800">{m.label}</div>
            </button>
          ))}
        </div>

        {isLogging && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-purple-100 px-6 py-3 rounded-full">
              <div className="animate-spin">⚙️</div>
              <span className="font-bold text-purple-700">Saving your mood...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW 2: DASHBOARD ---
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-500 to-green-400 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-heading font-black mb-2">
            Welcome Back, {activeChild?.name}! {activeChild?.avatarEmoji}
          </h2>
          <p className="text-white/90 text-lg italic mb-4">"{dailyFact}"</p>
          
          {/* Update Mood Button */}
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
          <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-dashed border-pastel-green flex flex-col">
            <h3 className="font-black text-xl mb-4 text-dark-text">Your Sticker Book 📓</h3>
            <div className="flex-1 overflow-y-auto max-h-[22rem] pr-2 custom-scrollbar">
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(Math.max(12, kidsData.stickers.length + (4 - (kidsData.stickers.length % 4 || 4))))].map((_, i) => (
                     <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-all hover:scale-110 ${i < kidsData.stickers.length ? 'bg-pastel-green/20' : 'bg-gray-100 grayscale opacity-30'}`}>
                       {i < kidsData.stickers.length ? kidsData.stickers[i] : '❓'}
                     </div>
                  ))}
                </div>
            </div>
            <p className="mt-4 text-sm text-center text-gray-500">Collect more by trying new activities!</p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-lg">
            <h3 className="font-black text-xl mb-4 text-dark-text">Daily Progress 📈</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold p-3 bg-gray-50 rounded-xl">
                 <div className="flex flex-col">
                    <span>Mood Check-in</span>
                    {kidsData.lastMood && <span className="text-xs text-gray-400 font-normal">Feeling {kidsData.lastMood}</span>}
                 </div>
                 <span className={kidsData.lastMood ? 'text-green-500 flex items-center gap-1' : 'text-gray-400 italic'}>
                   {kidsData.lastMood ? 'Done! ✅' : 'Not yet'}
                 </span>
              </div>
              <div 
                 className="flex justify-between items-center text-sm font-bold p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                 onClick={() => onNavigate && onNavigate('play')}
              >
                 <span>Play a Game</span>
                 <span className={kidsData.hasPlayedGame ? 'text-green-500 flex items-center gap-1' : 'text-gray-400 italic'}>
                   {kidsData.hasPlayedGame ? 'Done! ✅' : 'Not yet'}
                 </span>
              </div>
              <div 
                 className="flex justify-between items-center text-sm font-bold p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                 onClick={() => onNavigate && onNavigate('learn')}
              >
                 <span>Read a Book</span>
                 <span className={kidsData.hasReadBook ? 'text-green-500 flex items-center gap-1' : 'text-gray-400 italic'}>
                   {kidsData.hasReadBook ? 'Done! ✅' : 'Not yet'}
                 </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Activities */}
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 border-2 border-purple-200 shadow-md">
          <div className="text-4xl mb-2">⭐</div>
          <div className="text-3xl font-black text-purple-700">
            {activeChild?._count?.activityLogs || 0}
          </div>
          <div className="text-sm font-bold text-purple-600">Activities Done</div>
        </div>

        {/* Worries Locked */}
        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-6 border-2 border-blue-200 shadow-md">
          <div className="text-4xl mb-2">🔒</div>
          <div className="text-3xl font-black text-blue-700">
            {activeChild?._count?.worries || 0}
          </div>
          <div className="text-sm font-bold text-blue-600">Worries Locked Away</div>
        </div>

        {/* Buddy Chats */}
        <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl p-6 border-2 border-green-200 shadow-md">
          <div className="text-4xl mb-2">💬</div>
          <div className="text-3xl font-black text-green-700">
            {activeChild?._count?.buddyChats || 0}
          </div>
          <div className="text-sm font-bold text-green-600">Buddy Chats</div>
        </div>
      </div>
    </div>
  );
};

export default HubZone;