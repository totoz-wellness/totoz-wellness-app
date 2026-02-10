import React, { useState, useRef, useEffect } from 'react';

interface GameProps {
  onWin: () => void;
  onBack: () => void;
}

// --- GAME 1: CANVAS ---
const CreativeCanvas = () => {
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

    return (
        <div className="bg-white p-4 rounded-3xl shadow-xl border-4 border-dashed border-gray-200">
            <canvas ref={canvasRef} width={800} height={450} className="w-full cursor-crosshair touch-none"
                onMouseDown={start} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)} onMouseLeave={() => setIsDrawing(false)} />
             <button onClick={() => canvasRef.current?.getContext('2d')?.clearRect(0,0,800,450)} className="mt-2 bg-red-100 text-red-500 px-4 py-2 rounded-xl font-bold">Clear Paper</button>
        </div>
    );
};

// --- GAME 2: JOURNAL ---
const JournalGame = ({ onSave }: { onSave: () => void }) => {
    const [entry, setEntry] = useState('');
    return (
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl mx-auto">
            <h3 className="font-black text-2xl mb-4 text-purple-600">My Secret Journal 📔</h3>
            <textarea value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Today I felt..." className="w-full h-64 p-4 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none resize-none text-lg" />
            <button onClick={() => { onSave(); setEntry(''); }} className="w-full mt-4 bg-purple-500 text-white py-3 rounded-xl font-bold hover:bg-purple-600">Save Entry</button>
        </div>
    );
};

// --- MAIN MENU ---
const CreativeCorner: React.FC<GameProps> = ({ onWin, onBack }) => {
  const [activeGame, setActiveGame] = useState<'drawing' | 'journal' | null>(null);

  if (activeGame === 'drawing') return <div className="animate-fade-in"><button onClick={() => setActiveGame(null)} className="mb-4 bg-gray-100 px-4 py-2 rounded-full font-bold">⬅ Back</button><CreativeCanvas /></div>;
  if (activeGame === 'journal') return <div className="animate-fade-in"><button onClick={() => setActiveGame(null)} className="mb-4 bg-gray-100 px-4 py-2 rounded-full font-bold">⬅ Back</button><JournalGame onSave={() => { onWin(); alert('Saved!'); }} /></div>;

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full font-bold hover:bg-gray-200">⬅ Back to Zones</button>
      <h2 className="text-3xl font-black mb-6 text-purple-800">🎨 Creative Corner</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button onClick={() => setActiveGame('drawing')} className="bg-white p-6 rounded-3xl shadow-lg hover:scale-105 transition-all text-left border-2 border-purple-100"><div className="text-5xl mb-4">🖌️</div><h3 className="text-xl font-bold">Free Draw</h3></button>
        <button onClick={() => setActiveGame('journal')} className="bg-white p-6 rounded-3xl shadow-lg hover:scale-105 transition-all text-left border-2 border-purple-100"><div className="text-5xl mb-4">📔</div><h3 className="text-xl font-bold">My Journal</h3></button>
      </div>
    </div>
  );
};

export default CreativeCorner;