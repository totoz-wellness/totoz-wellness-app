import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
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
    const [showReward, setShowReward] = useState(false);
    const [earnedSticker, setEarnedSticker] = useState('⭐');

    const handleWin = (icon: string = '⭐') => {
        onUpdateData({ stickers: [...kidsData.stickers, icon], hasPlayedGame: true });
        setEarnedSticker(icon);
        setShowReward(true);
    };

    const handleCloseReward = () => {
        setShowReward(false);
        setActiveCategory(null); // Optional: return to main menu after win
    };

    // 1. Render Active Category (conditionally wrap them so RewardModal can overlay)
    const renderActiveCategory = () => {
        if (activeCategory === 'mindful') return <MindfulGames onWin={handleWin} onBack={() => setActiveCategory(null)} />;
        if (activeCategory === 'creative') return <CreativeCorner onWin={handleWin} onBack={() => setActiveCategory(null)} />;
        if (activeCategory === 'emotion') return <EmotionAdventures onWin={handleWin} onBack={() => setActiveCategory(null)} />;
        if (activeCategory === 'puzzle') return <Puzzle onWin={handleWin} onBack={() => setActiveCategory(null)} />;
        return null; // Should not happen here
    };

    return (
        <div className="relative">
            {/* Modal Overlay for Rewards */}
            <AnimatePresence>
                {showReward && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-teal/80 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.5, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.8, y: 20, opacity: 0 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            className="bg-white rounded-3xl w-full max-w-lg p-10 shadow-2xl flex flex-col items-center border-4 border-white/50 text-center"
                        >
                            <PartyPopper size={100} className="text-yellow-400 mb-6 animate-bounce" />
                            <h3 className="text-5xl font-black text-teal mb-4">You Did It!</h3>
                            <p className="text-2xl font-bold text-gray-600 mb-6">Awesome job completing the activity!</p>
                            
                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="bg-pastel-green/20 px-6 py-4 rounded-3xl flex items-center gap-4 border-2 border-pastel-green/50 shadow-sm mb-8"
                            >
                                <span className="text-4xl drop-shadow-sm">{earnedSticker}</span>
                                <span className="font-bold text-teal text-lg">Unique Sticker Awarded!</span>
                            </motion.div>

                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCloseReward}
                                className="font-black text-white bg-blue-500 px-8 py-4 rounded-2xl shadow-md transition-all active:shadow-sm text-lg w-full hover:bg-blue-600"
                            >
                                Play More Games
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {activeCategory ? (
                renderActiveCategory()
            ) : (
                // 2. Render Main Menu
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
            )}
        </div>
    );
};

export default PlayZone;