import React, { useState, useEffect } from 'react';

interface GameProps {
  onWin: () => void;
  onBack: () => void;
}

// --- GAME 1: MAZE (Existing) ---
const MazeGame = ({ onWin }: { onWin: () => void }) => {
    const maze = [
        [2, 0, 1, 0, 0],
        [1, 0, 1, 0, 1],
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 1, 3]
    ];
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const move = (dx: number, dy: number) => {
        const newX = pos.x + dx;
        const newY = pos.y + dy;
        if (newX >= 0 && newX < 5 && newY >= 0 && newY < 5 && maze[newY][newX] !== 1) {
            setPos({ x: newX, y: newY });
            if (maze[newY][newX] === 3) onWin();
        }
    };

    return (
        <div className="flex flex-col items-center bg-white p-8 rounded-3xl shadow-xl max-w-lg mx-auto border-4 border-yellow-100">
            <h3 className="font-bold mb-4 text-xl text-yellow-800">Get the 😀 to the 🏁!</h3>
            <div className="grid grid-cols-5 gap-2 bg-gray-200 p-4 rounded-xl mb-6">
                {maze.map((row, y) => row.map((cell, x) => (
                    <div key={`${x}-${y}`} className={`w-12 h-12 rounded-md flex items-center justify-center font-bold text-xl shadow-sm ${x === pos.x && y === pos.y ? 'bg-teal text-white' : cell === 1 ? 'bg-gray-700' : cell === 3 ? 'bg-yellow-400' : 'bg-white'}`}>
                        {x === pos.x && y === pos.y ? '😀' : cell === 3 ? '🏁' : ''}
                    </div>
                )))}
            </div>
            <div className="grid grid-cols-3 gap-2 w-48">
                <div /><button onClick={() => move(0, -1)} className="bg-gray-100 p-4 rounded-xl font-bold hover:bg-gray-200 border-2 border-gray-300">⬆️</button><div />
                <button onClick={() => move(-1, 0)} className="bg-gray-100 p-4 rounded-xl font-bold hover:bg-gray-200 border-2 border-gray-300">⬅️</button>
                <button onClick={() => move(0, 1)} className="bg-gray-100 p-4 rounded-xl font-bold hover:bg-gray-200 border-2 border-gray-300">⬇️</button>
                <button onClick={() => move(1, 0)} className="bg-gray-100 p-4 rounded-xl font-bold hover:bg-gray-200 border-2 border-gray-300">➡️</button>
            </div>
        </div>
    );
};

// --- GAME 2: WORD PUZZLE (New!) ---
const WORD_LEVELS = [
    { word: "CALM", hint: "Feeling peaceful and relaxed 😌" },
    { word: "BRAVE", hint: "Being strong even when you are scared 🦁" },
    { word: "HAPPY", hint: "Smiling and feeling good ☀️" },
    { word: "KIND", hint: "Being nice and helpful to others 🤝" },
    { word: "FOCUS", hint: "Paying close attention to one thing 🧠" }
];

const WordPuzzleGame = ({ onWin }: { onWin: () => void }) => {
    const [levelIndex, setLevelIndex] = useState(0);
    const [currentScramble, setCurrentScramble] = useState<{char: string, id: number}[]>([]);
    const [userAnswer, setUserAnswer] = useState<{char: string, id: number}[]>([]);
    const [isCorrect, setIsCorrect] = useState(false);

    const currentLevel = WORD_LEVELS[levelIndex];

    // Shuffle word on mount or level change
    useEffect(() => {
        setupLevel();
    }, [levelIndex]);

    const setupLevel = () => {
        const letters = WORD_LEVELS[levelIndex].word.split('').map((char, i) => ({ char, id: i }));
        // Simple shuffle
        const shuffled = [...letters].sort(() => Math.random() - 0.5);
        setCurrentScramble(shuffled);
        setUserAnswer([]);
        setIsCorrect(false);
    };

    const handleSelectLetter = (item: {char: string, id: number}) => {
        // Remove from scramble pool, add to answer
        setCurrentScramble(prev => prev.filter(l => l.id !== item.id));
        setUserAnswer(prev => [...prev, item]);
    };

    const handleDeselectLetter = (item: {char: string, id: number}) => {
        // Remove from answer, return to pool
        setUserAnswer(prev => prev.filter(l => l.id !== item.id));
        setCurrentScramble(prev => [...prev, item]);
    };

    const checkAnswer = () => {
        const attempt = userAnswer.map(u => u.char).join('');
        if (attempt === currentLevel.word) {
            setIsCorrect(true);
            if (levelIndex < WORD_LEVELS.length - 1) {
                // Next level after delay
                setTimeout(() => {
                    setLevelIndex(prev => prev + 1);
                }, 1500);
            } else {
                // Win entire game
                onWin();
            }
        } else {
            // Shake effect logic could go here
            alert("Not quite! Try again.");
            setupLevel();
        }
    };

    return (
        <div className="flex flex-col items-center bg-white p-8 rounded-3xl shadow-xl max-w-lg mx-auto border-4 border-blue-100">
            <div className="flex justify-between w-full mb-4 text-gray-400 font-bold text-sm uppercase tracking-wider">
                <span>Level {levelIndex + 1} / {WORD_LEVELS.length}</span>
                <span>Word Whiz</span>
            </div>
            
            {isCorrect ? (
                <div className="py-10 text-center animate-bounce">
                    <div className="text-6xl mb-4">🌟</div>
                    <h3 className="text-2xl font-black text-teal">Correct!</h3>
                </div>
            ) : (
                <>
                    <h3 className="font-bold text-xl text-center mb-2 text-blue-800">Unscramble the Word</h3>
                    <p className="text-gray-500 text-sm italic mb-8 text-center bg-blue-50 px-4 py-2 rounded-xl">"{currentLevel.hint}"</p>

                    {/* Answer Slots */}
                    <div className="flex gap-2 mb-8 h-16">
                        {userAnswer.map((item) => (
                            <button 
                                key={item.id} 
                                onClick={() => handleDeselectLetter(item)}
                                className="w-12 h-12 bg-teal text-white rounded-xl font-black text-2xl shadow-md hover:bg-red-400 transition-colors"
                            >
                                {item.char}
                            </button>
                        ))}
                        {/* Empty placeholders */}
                        {[...Array(currentLevel.word.length - userAnswer.length)].map((_, i) => (
                            <div key={i} className="w-12 h-12 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300"></div>
                        ))}
                    </div>

                    {/* Letter Pool */}
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                        {currentScramble.map((item) => (
                            <button 
                                key={item.id} 
                                onClick={() => handleSelectLetter(item)}
                                className="w-14 h-14 bg-white border-b-4 border-blue-200 text-blue-600 rounded-2xl font-black text-2xl shadow-sm hover:-translate-y-1 transition-transform border-2"
                            >
                                {item.char}
                            </button>
                        ))}
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
                </>
            )}
        </div>
    );
};

// --- MAIN PUZZLE MENU ---
const Puzzle: React.FC<GameProps> = ({ onWin, onBack }) => {
  const [activeGame, setActiveGame] = useState<'maze' | 'words' | null>(null);

  // Render Maze
  if (activeGame === 'maze') return (
    <div className="animate-fade-in">
        <button onClick={() => setActiveGame(null)} className="mb-4 bg-gray-100 px-4 py-2 rounded-full font-bold hover:bg-gray-200">⬅ Back</button>
        <MazeGame onWin={onWin} />
    </div>
  );

  // Render Word Puzzle
  if (activeGame === 'words') return (
    <div className="animate-fade-in">
        <button onClick={() => setActiveGame(null)} className="mb-4 bg-gray-100 px-4 py-2 rounded-full font-bold hover:bg-gray-200">⬅ Back</button>
        <WordPuzzleGame onWin={onWin} />
    </div>
  );

  // Render Menu
  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full font-bold hover:bg-gray-200">⬅ Back to Zones</button>
      <h2 className="text-3xl font-black mb-6 text-yellow-800">🧩 Puzzles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Maze Button */}
        <button onClick={() => setActiveGame('maze')} className="bg-white p-6 rounded-3xl shadow-lg hover:scale-105 transition-all text-left border-2 border-yellow-100 group">
            <div className="text-5xl mb-4 group-hover:rotate-12 transition-transform w-fit">🏁</div>
            <h3 className="text-xl font-bold text-gray-800">Happy Maze</h3>
            <p className="text-gray-500 text-sm mt-2">Find the way out.</p>
        </button>

        {/* Word Puzzle Button */}
        <button onClick={() => setActiveGame('words')} className="bg-white p-6 rounded-3xl shadow-lg hover:scale-105 transition-all text-left border-2 border-blue-100 group">
            <div className="text-5xl mb-4 group-hover:rotate-12 transition-transform w-fit">🔤</div>
            <h3 className="text-xl font-bold text-gray-800">Word Whiz</h3>
            <p className="text-gray-500 text-sm mt-2">Unscramble feelings.</p>
        </button>

      </div>
    </div>
  );
};

export default Puzzle;