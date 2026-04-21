import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameProps {
  onWin: (icon?: string) => void;
  onBack: () => void;
}

// --- GAME 1: MAZE ---
const MazeGame = ({ onWin }: { onWin: (icon?: string) => void }) => {
    const maze = [
        [2, 0, 1, 0, 0],
        [1, 0, 1, 0, 1],
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 1, 3]
    ];
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [shakeDir, setShakeDir] = useState<string | null>(null);

    const move = (dx: number, dy: number, dirStr: string) => {
        const newX = pos.x + dx;
        const newY = pos.y + dy;

        // Bonk mechanism
        if (newX < 0 || newX >= 5 || newY < 0 || newY >= 5 || maze[newY][newX] === 1) {
            setShakeDir(dirStr);
            setTimeout(() => setShakeDir(null), 300);
            return;
        }

        setPos({ x: newX, y: newY });
        if (maze[newY][newX] === 3) onWin('🏁');
    };

    // Derived animation variants based on direction bonked
    const getShakeAnim = () => {
        if (!shakeDir) return { x: 0, y: 0 };
        if (shakeDir === 'up') return { y: [-10, 10, -10, 0] };
        if (shakeDir === 'down') return { y: [10, -10, 10, 0] };
        if (shakeDir === 'left') return { x: [-10, 10, -10, 0] };
        if (shakeDir === 'right') return { x: [10, -10, 10, 0] };
        return { x: 0, y: 0 };
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center bg-white p-8 rounded-3xl shadow-xl max-w-lg mx-auto border-4 border-yellow-100"
        >
            <h3 className="font-bold mb-4 text-xl text-yellow-800">Get the 😀 to the 🏁!</h3>
            
            <motion.div 
                animate={getShakeAnim()}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-5 gap-2 bg-gray-200 p-4 rounded-xl mb-6 shadow-inner"
            >
                {maze.map((row, y) => row.map((cell, x) => (
                    <div key={`${x}-${y}`} className={`w-12 h-12 rounded-md flex items-center justify-center font-bold text-xl shadow-sm transition-colors ${x === pos.x && y === pos.y ? 'bg-teal text-white scale-110 z-10' : cell === 1 ? 'bg-gray-700' : cell === 3 ? 'bg-yellow-400 animate-pulse' : 'bg-white'}`}>
                        {x === pos.x && y === pos.y ? '😀' : cell === 3 ? '🏁' : ''}
                    </div>
                )))}
            </motion.div>

            <div className="grid grid-cols-3 gap-2 w-48">
                <div />
                <motion.button whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} onClick={() => move(0, -1, 'up')} className="bg-gray-100 p-4 rounded-xl font-bold hover:bg-gray-200 border-2 border-gray-300">⬆️</motion.button>
                <div />
                <motion.button whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} onClick={() => move(-1, 0, 'left')} className="bg-gray-100 p-4 rounded-xl font-bold hover:bg-gray-200 border-2 border-gray-300">⬅️</motion.button>
                <motion.button whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} onClick={() => move(0, 1, 'down')} className="bg-gray-100 p-4 rounded-xl font-bold hover:bg-gray-200 border-2 border-gray-300">⬇️</motion.button>
                <motion.button whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} onClick={() => move(1, 0, 'right')} className="bg-gray-100 p-4 rounded-xl font-bold hover:bg-gray-200 border-2 border-gray-300">➡️</motion.button>
            </div>
        </motion.div>
    );
};

// --- GAME 2: WORD PUZZLE ---
const WORD_LEVELS = [
    { word: "CALM", hint: "Feeling peaceful and relaxed 😌" },
    { word: "BRAVE", hint: "Being strong even when you are scared 🦁" },
    { word: "HAPPY", hint: "Smiling and feeling good ☀️" },
    { word: "KIND", hint: "Being nice and helpful to others 🤝" },
    { word: "FOCUS", hint: "Paying close attention to one thing 🧠" }
];

const WordPuzzleGame = ({ onWin }: { onWin: (icon?: string) => void }) => {
    const [levelIndex, setLevelIndex] = useState(0);
    const [currentScramble, setCurrentScramble] = useState<{char: string, id: number}[]>([]);
    const [userAnswer, setUserAnswer] = useState<{char: string, id: number}[]>([]);
    const [isCorrect, setIsCorrect] = useState(false);
    const [shake, setShake] = useState(false);

    const currentLevel = WORD_LEVELS[levelIndex];

    useEffect(() => {
        setupLevel();
    }, [levelIndex]);

    const setupLevel = () => {
        const letters = WORD_LEVELS[levelIndex].word.split('').map((char, i) => ({ char, id: i }));
        const shuffled = [...letters].sort(() => Math.random() - 0.5);
        setCurrentScramble(shuffled);
        setUserAnswer([]);
        setIsCorrect(false);
        setShake(false);
    };

    const handleSelectLetter = (item: {char: string, id: number}) => {
        setCurrentScramble(prev => prev.filter(l => l.id !== item.id));
        setUserAnswer(prev => [...prev, item]);
    };

    const handleDeselectLetter = (item: {char: string, id: number}) => {
        setUserAnswer(prev => prev.filter(l => l.id !== item.id));
        setCurrentScramble(prev => [...prev, item]);
    };

    const checkAnswer = () => {
        const attempt = userAnswer.map(u => u.char).join('');
        if (attempt === currentLevel.word) {
            setIsCorrect(true);
            if (levelIndex < WORD_LEVELS.length - 1) {
                setTimeout(() => setLevelIndex(prev => prev + 1), 1500);
            } else {
                setTimeout(() => onWin('🔤'), 1000); // Give it a second to show correct before modal triggers
            }
        } else {
            setShake(true);
            setTimeout(() => {
                setShake(false);
                setupLevel();
            }, 600);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center bg-white p-8 rounded-3xl shadow-xl max-w-lg mx-auto border-4 border-blue-100 relative"
        >
            <div className="flex justify-between w-full mb-4 text-gray-400 font-bold text-sm uppercase tracking-wider">
                <span>Level {levelIndex + 1} / {WORD_LEVELS.length}</span>
                <span>Word Whiz</span>
            </div>
            
            {isCorrect ? (
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-10 text-center animate-bounce"
                >
                    <div className="text-6xl mb-4">🌟</div>
                    <h3 className="text-3xl font-black text-teal">Correct!</h3>
                </motion.div>
            ) : (
                <>
                    <h3 className="font-bold text-xl text-center mb-2 text-blue-800">Unscramble the Word</h3>
                    <p className="text-gray-500 text-sm italic mb-8 text-center bg-blue-50 px-4 py-2 rounded-xl">"{currentLevel.hint}"</p>

                    {/* Answer Slots */}
                    <motion.div 
                        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className={`flex gap-2 mb-8 h-16 p-2 rounded-2xl ${shake ? 'bg-red-50 border-2 border-red-200' : ''}`}
                    >
                        {userAnswer.map((item) => (
                            <motion.button 
                                layoutId={`letter-${item.id}`}
                                key={item.id} 
                                onClick={() => handleDeselectLetter(item)}
                                className="w-12 h-12 bg-teal text-white rounded-xl font-black text-2xl shadow-md transition-colors"
                            >
                                {item.char}
                            </motion.button>
                        ))}
                        {[...Array(currentLevel.word.length - userAnswer.length)].map((_, i) => (
                            <div key={i} className="w-12 h-12 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300"></div>
                        ))}
                    </motion.div>

                    {/* Letter Pool */}
                    <div className="flex flex-wrap justify-center gap-3 mb-8 min-h-[4rem]">
                        <AnimatePresence>
                            {currentScramble.map((item) => (
                                <motion.button 
                                    layoutId={`letter-${item.id}`}
                                    key={item.id} 
                                    onClick={() => handleSelectLetter(item)}
                                    className="w-14 h-14 bg-white border-b-4 border-blue-200 text-blue-600 rounded-2xl font-black text-2xl shadow-sm hover:-translate-y-1 transition-transform border-2"
                                >
                                    {item.char}
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>

                    <button 
                        onClick={checkAnswer}
                        disabled={userAnswer.length !== currentLevel.word.length}
                        className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
                            userAnswer.length === currentLevel.word.length 
                            ? 'bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:shadow-xl cursor-pointer' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Check Answer
                    </button>
                    
                    <AnimatePresence>
                        {shake && (
                            <motion.p 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0 }} 
                                className="text-red-500 font-bold mt-4 absolute bottom-2"
                            >
                                Not quite! Try again.
                            </motion.p>
                        )}
                    </AnimatePresence>
                </>
            )}
        </motion.div>
    );
};

// --- MAIN PUZZLE MENU ---
const Puzzle: React.FC<GameProps> = ({ onWin, onBack }) => {
  const [activeGame, setActiveGame] = useState<'maze' | 'words' | null>(null);

  if (activeGame === 'maze') return (
    <div className="animate-fade-in">
        <button onClick={() => setActiveGame(null)} className="mb-4 bg-gray-100 px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors">⬅ Back to Puzzle Menu</button>
        <MazeGame onWin={onWin} />
    </div>
  );

  if (activeGame === 'words') return (
    <div className="animate-fade-in">
        <button onClick={() => setActiveGame(null)} className="mb-4 bg-gray-100 px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors">⬅ Back to Puzzle Menu</button>
        <WordPuzzleGame onWin={onWin} />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button onClick={onBack} className="mb-6 flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors">⬅ Back to Zones</button>
      <h2 className="text-3xl font-black mb-6 text-yellow-800">🧩 Puzzles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveGame('maze')} 
            className="bg-white p-6 rounded-3xl shadow-lg transition-all text-left border-2 border-yellow-100 group"
        >
            <div className="text-5xl mb-4 group-hover:rotate-12 transition-transform w-fit">🏁</div>
            <h3 className="text-xl font-bold text-gray-800">Happy Maze</h3>
            <p className="text-gray-500 text-sm mt-2">Find the way out.</p>
        </motion.button>

        <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveGame('words')} 
            className="bg-white p-6 rounded-3xl shadow-lg transition-all text-left border-2 border-blue-100 group"
        >
            <div className="text-5xl mb-4 group-hover:rotate-12 transition-transform w-fit">🔤</div>
            <h3 className="text-xl font-bold text-gray-800">Word Whiz</h3>
            <p className="text-gray-500 text-sm mt-2">Unscramble feelings.</p>
        </motion.button>

      </div>
    </motion.div>
  );
};

export default Puzzle;