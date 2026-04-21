import React, { useState } from 'react';
import FreeDrawCanvas from './FreeDrawCanvas';
import FeelingsJournal from './FeelingsJournal';
import ColoringBook from './ColoringBook';

interface GameProps {
  onWin: () => void;
  onBack: () => void;
}

type GameType = 'drawing' | 'journal' | 'coloring' | null;

const CreativeCorner: React.FC<GameProps> = ({ onWin, onBack }) => {
  const [activeGame, setActiveGame] = useState<GameType>(null);

  const handleComplete = () => {
    onWin();
    // Optionally return to menu after earning sticker
    setTimeout(() => setActiveGame(null), 2000);
  };

  // Render active game
  if (activeGame === 'drawing') {
    return <FreeDrawCanvas onComplete={handleComplete} onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'journal') {
    return <FeelingsJournal onComplete={handleComplete} onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'coloring') {
    return <ColoringBook onComplete={handleComplete} onBack={() => setActiveGame(null)} />;
  }

  // Main menu
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 bg-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all shadow-md hover:scale-105"
      >
        ⬅ Back to Play Zone
      </button>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 text-9xl opacity-10">🎨</div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-2 flex items-center gap-3">
            <span className="text-5xl animate-bounce-slow">🎨</span> Creative Corner
          </h2>
          <p className="text-xl opacity-90">
            Express yourself through art, writing, and creativity! ✨
          </p>
        </div>
      </div>

      {/* Game Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Draw */}
        <button 
          onClick={() => setActiveGame('drawing')}
          className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all text-left border-4 border-purple-100 group relative overflow-hidden"
        >
          <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-bold">
            Most Popular!
          </div>
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🖌️</div>
          <h3 className="text-2xl font-black text-gray-800 mb-2">Free Draw</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Create colorful drawings with rainbow brushes and unlimited colors!
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">7 colors</span>
            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">Custom brushes</span>
          </div>
          <div className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold">
            Earn 🎨 sticker
          </div>
        </button>

        {/* Coloring Book */}
        <button 
          onClick={() => setActiveGame('coloring')}
          className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all text-left border-4 border-blue-100 group"
        >
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🖍️</div>
          <h3 className="text-2xl font-black text-gray-800 mb-2">Coloring Book</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Color beautiful pre-made pictures of animals, nature, and more!
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">10+ pages</span>
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Easy mode</span>
          </div>
          <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
            Earn 🖍️ sticker
          </div>
        </button>

        {/* Journal */}
        <button 
          onClick={() => setActiveGame('journal')}
          className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all text-left border-4 border-pink-100 group"
        >
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📔</div>
          <h3 className="text-2xl font-black text-gray-800 mb-2">My Journal</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Write about your feelings, dreams, and daily adventures in a safe space!
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-full">Private</span>
            <span className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-full">Daily prompts</span>
          </div>
          <div className="inline-block bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-bold">
            Earn 📝 sticker
          </div>
        </button>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-2xl border-2 border-green-200">
        <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">💡</span> Why Creative Play Matters
        </h3>
        <ul className="space-y-2 text-sm text-green-700">
          <li className="flex items-start gap-2">
            <span className="text-lg">🎨</span>
            <span><strong>Expresses emotions:</strong> Art helps kids communicate feelings they can't put into words</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg">🧠</span>
            <span><strong>Builds confidence:</strong> Creating something unique boosts self-esteem</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg">✨</span>
            <span><strong>Reduces stress:</strong> Creative activities are calming and therapeutic</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CreativeCorner;