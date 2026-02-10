import React, { useState } from 'react';
import { KidsData } from '../../../types/kidscorner.types';

// UPDATED IMPORTS TO MATCH NEW STRUCTURE
import MindfulGames from './PlayZone/MindfulGames';
import CreativeCorner from './PlayZone/CreativeCorner';
import EmotionAdventures from './PlayZone/EmotionAdventures';
import Puzzle from './PlayZone/Puzzle';

interface PlayZoneProps {
  kidsData: KidsData;
  onUpdateData: (newData: Partial<KidsData>) => void;
}

type CategoryID = 'emotion' | 'mindful' | 'creative' | 'puzzle';

const PlayZone: React.FC<PlayZoneProps> = ({ kidsData, onUpdateData }) => {
    const [activeCategory, setActiveCategory] = useState<CategoryID | null>(null);

    const handleWin = () => {
        onUpdateData({ stickers: [...kidsData.stickers, '⭐'] });
        alert("Yay! You earned a sticker!");
    };

    // 1. Render Active Category
    if (activeCategory === 'mindful') return <MindfulGames onWin={handleWin} onBack={() => setActiveCategory(null)} />;
    if (activeCategory === 'creative') return <CreativeCorner onWin={handleWin} onBack={() => setActiveCategory(null)} />;
    if (activeCategory === 'emotion') return <EmotionAdventures onWin={handleWin} onBack={() => setActiveCategory(null)} />;
    if (activeCategory === 'puzzle') return <Puzzle onWin={handleWin} onBack={() => setActiveCategory(null)} />;

    // 2. Render Main Menu
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Mindful */}
            <button onClick={() => setActiveCategory('mindful')} className="bg-green-50 border-green-200 text-green-800 p-8 rounded-[2rem] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-left flex flex-col h-48 justify-between border-2">
                <div className="text-6xl">🌿</div>
                <div><h3 className="text-2xl font-black">Mindful Games</h3><p className="opacity-80 font-medium">Calm your mind</p></div>
            </button>

            {/* Creative */}
            <button onClick={() => setActiveCategory('creative')} className="bg-purple-50 border-purple-200 text-purple-800 p-8 rounded-[2rem] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-left flex flex-col h-48 justify-between border-2">
                <div className="text-6xl">🎨</div>
                <div><h3 className="text-2xl font-black">Creative Corner</h3><p className="opacity-80 font-medium">Draw & write</p></div>
            </button>

            {/* Emotion */}
            <button onClick={() => setActiveCategory('emotion')} className="bg-blue-50 border-blue-200 text-blue-800 p-8 rounded-[2rem] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-left flex flex-col h-48 justify-between border-2">
                <div className="text-6xl">🎭</div>
                <div><h3 className="text-2xl font-black">Emotion Adventures</h3><p className="opacity-80 font-medium">Learn feelings</p></div>
            </button>

            {/* Puzzle */}
            <button onClick={() => setActiveCategory('puzzle')} className="bg-yellow-50 border-yellow-200 text-yellow-800 p-8 rounded-[2rem] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-left flex flex-col h-48 justify-between border-2">
                <div className="text-6xl">🧩</div>
                <div><h3 className="text-2xl font-black">Puzzles</h3><p className="opacity-80 font-medium">Brain teasers</p></div>
            </button>
        </div>
    );
};

export default PlayZone;