import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameProps {
  onWin: (icon?: string) => void;
  onBack: () => void;
}

const ScenarioGame = ({ onWin }: { onWin: (icon?: string) => void }) => {
    const [step, setStep] = useState(0);
    const [showError, setShowError] = useState(false);

    const scenarios = [
        { q: "Your friend dropped their ice cream. How do they feel?", options: [{ t: "Happy", c: false }, { t: "Sad", c: true }, { t: "Excited", c: false }] },
        { q: "You have a big test tomorrow. You might feel...", options: [{ t: "Nervous", c: true }, { t: "Sleepy", c: false }, { t: "Hungry", c: false }] }
    ];

    const handleAnswer = (correct: boolean) => {
        if (correct) {
            setShowError(false);
            if (step + 1 < scenarios.length) setStep(step + 1);
            else onWin('🤔');
        } else {
            setShowError(true);
            setTimeout(() => setShowError(false), 2500);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl text-center max-w-2xl mx-auto border-4 border-blue-100 relative"
        >
            <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-sm">Scenario #{step + 1} of {scenarios.length}</span>
                <div className="flex gap-2">
                    {scenarios.map((_, i) => (
                        <div key={i} className={`h-2 w-8 rounded-full transition-all ${i <= step ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    ))}
                </div>
            </div>

            <h3 className="text-3xl font-black mb-8 text-gray-800 leading-tight">{scenarios[step].q}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {scenarios[step].options.map((opt, i) => (
                    <motion.button 
                        key={i} 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAnswer(opt.c)} 
                        className="bg-blue-50 hover:bg-blue-100 p-6 rounded-2xl font-bold text-xl text-blue-800 transition-colors shadow-sm border-2 border-blue-200"
                    >
                        {opt.t}
                    </motion.button>
                ))}
            </div>

            <AnimatePresence>
                {showError && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, rotate: -2 }}
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute bottom-6 left-0 right-0 mx-auto w-fit bg-red-100 text-red-700 px-6 py-3 rounded-full font-bold shadow-md flex items-center gap-2 border border-red-200"
                    >
                        <span className="text-xl">🤔</span> Try again! Look closely at the situation.
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const EmotionAdventures: React.FC<GameProps> = ({ onWin, onBack }) => {
  const [activeGame, setActiveGame] = useState<'scenarios' | null>(null);

  if (activeGame === 'scenarios') return (
      <div className="animate-fade-in">
          <button onClick={() => setActiveGame(null)} className="mb-4 bg-gray-100 px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors">⬅ Back to Emotion Menu</button>
          <ScenarioGame onWin={onWin} />
      </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button onClick={onBack} className="mb-6 flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors">⬅ Back to Zones</button>
      <h2 className="text-3xl font-black mb-6 text-blue-800">🎭 Emotion Adventures</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveGame('scenarios')} 
            className="bg-white p-6 rounded-3xl shadow-lg transition-all text-left border-2 border-blue-100 group"
        >
            <div className="text-5xl mb-4 group-hover:rotate-12 transition-transform w-fit">🤔</div>
            <h3 className="text-xl font-bold text-gray-800">What would you do?</h3>
            <p className="text-gray-500 text-sm mt-2">Practice understanding feelings.</p>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default EmotionAdventures;