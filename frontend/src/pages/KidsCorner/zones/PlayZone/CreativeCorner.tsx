import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameProps {
  onWin: (icon?: string) => void;
  onBack: () => void;
}

// --- GAME 1: CANVAS ---
const CreativeCanvas = ({ onWin }: { onWin: (icon?: string) => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) { ctx.lineCap = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = '#3AAFA9'; }
    }, []);

    const start = (e: React.MouseEvent) => {
        const ctx = canvasRef.current?.getContext('2d');
        if(ctx) { ctx.beginPath(); ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); setIsDrawing(true); }
    };
    const draw = (e: React.MouseEvent) => {
        if(!isDrawing) return;
        const ctx = canvasRef.current?.getContext('2d');
        if(ctx) { ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); ctx.stroke(); }
    };

    const clearCanvas = () => {
        canvasRef.current?.getContext('2d')?.clearRect(0,0,800,450);
    };

    const handleSave = () => {
        onWin('🖌️');
        clearCanvas();
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-dashed border-purple-200">
            <h3 className="font-black text-2xl mb-4 text-purple-600 text-center">My Masterpiece 🎨</h3>
            <canvas ref={canvasRef} width={800} height={450} className="w-full cursor-crosshair touch-none bg-gray-50 rounded-xl mb-4"
                onMouseDown={start} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)} onMouseLeave={() => setIsDrawing(false)} />
             
             <div className="flex gap-4">
                 <button onClick={clearCanvas} className="flex-1 bg-red-100 text-red-500 px-4 py-3 rounded-xl font-bold hover:bg-red-200 transition-colors">Clear Paper</button>
                 <button onClick={handleSave} className="flex-1 bg-purple-500 text-white px-4 py-3 rounded-xl font-bold hover:bg-purple-600 transition-colors shadow-md">Save Masterpiece</button>
             </div>
        </div>
    );
};

// --- GAME 2: JOURNAL ---
const JournalGame = ({ onWin }: { onWin: (icon?: string) => void }) => {
    const [entry, setEntry] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = () => {
        if (!entry.trim()) return;
        onWin('📔');
        setEntry('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl mx-auto border-4 border-purple-100">
            <h3 className="font-black text-2xl mb-4 text-purple-600">My Secret Journal 📔</h3>
            <textarea 
                value={entry} 
                onChange={(e) => setEntry(e.target.value)} 
                placeholder="Today I felt..." 
                className="w-full h-64 p-4 border-2 border-purple-100 rounded-xl focus:ring-4 focus:ring-purple-200 outline-none resize-none text-lg mb-4 bg-purple-50/30" 
            />
            
            <AnimatePresence>
                {showSuccess && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-green-100 text-green-700 p-3 rounded-xl mb-4 font-bold text-center border border-green-200"
                    >
                        🎊 Entry saved successfully! 
                    </motion.div>
                )}
            </AnimatePresence>

            <button 
                onClick={handleSave} 
                disabled={!entry.trim()}
                className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-md ${entry.trim() ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
                Save Entry
            </button>
        </div>
    );
};

// --- MAIN MENU ---
const CreativeCorner: React.FC<GameProps> = ({ onWin, onBack }) => {
  const [activeGame, setActiveGame] = useState<'drawing' | 'journal' | null>(null);

  if (activeGame === 'drawing') return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => setActiveGame(null)} className="mb-4 bg-gray-100 px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors">⬅ Back to Creative Menu</button>
          <CreativeCanvas onWin={onWin} />
      </motion.div>
  );
  
  if (activeGame === 'journal') return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => setActiveGame(null)} className="mb-4 bg-gray-100 px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors">⬅ Back to Creative Menu</button>
          <JournalGame onWin={onWin} />
      </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button onClick={onBack} className="mb-6 flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors">⬅ Back to Zones</button>
      <h2 className="text-3xl font-black mb-6 text-purple-800">🎨 Creative Corner</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveGame('drawing')} 
            className="bg-white p-6 rounded-3xl shadow-lg transition-all text-left border-2 border-purple-100 group"
        >
            <div className="text-5xl mb-4 group-hover:rotate-12 transition-transform w-fit">🖌️</div>
            <h3 className="text-xl font-bold text-gray-800">Free Draw</h3>
            <p className="text-sm text-gray-500 mt-2">Paint a masterpiece.</p>
        </motion.button>
        
        <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveGame('journal')} 
            className="bg-white p-6 rounded-3xl shadow-lg transition-all text-left border-2 border-purple-100 group"
        >
            <div className="text-5xl mb-4 group-hover:rotate-12 transition-transform w-fit">📔</div>
            <h3 className="text-xl font-bold text-gray-800">My Journal</h3>
            <p className="text-sm text-gray-500 mt-2">Write about your day.</p>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CreativeCorner;