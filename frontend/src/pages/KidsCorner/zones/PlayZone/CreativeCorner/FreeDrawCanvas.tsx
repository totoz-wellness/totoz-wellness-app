import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  IoArrowBack, 
  IoBrush, 
  IoColorPalette, 
  IoTrash, 
  IoSave, 
  IoCheckmarkCircle,
  IoSparkles
} from 'react-icons/io5';
import { 
  BsPencil, 
  BsPencilFill, 
  BsBrush, 
  BsBrushFill 
} from 'react-icons/bs';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

const COLORS = [
  { hex: '#3AAFA9', name: 'Teal' },
  { hex: '#FF6B6B', name: 'Coral' },
  { hex: '#4ECDC4', name: 'Turquoise' },
  { hex: '#FFE66D', name: 'Sunshine' },
  { hex: '#A8E6CF', name: 'Mint' },
  { hex: '#FF8B94', name: 'Pink' },
  { hex: '#C7CEEA', name: 'Lavender' },
  { hex: '#FFA07A', name: 'Orange' },
];

const BRUSH_SIZES = [
  { size: 3, label: 'Thin', icon: BsPencil },
  { size: 8, label: 'Medium', icon: BsPencilFill },
  { size: 15, label: 'Thick', icon: BsBrush },
  { size: 25, label: 'Bold', icon: BsBrushFill },
];

const FreeDrawCanvas: React.FC<Props> = ({ onComplete, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false);

  // Initialize canvas context
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = brushSize.size;
      ctx.strokeStyle = currentColor.hex;
    }
  }, [currentColor, brushSize]);

  // FIX: Proper coordinate calculation accounting for canvas scaling
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    
    // Get raw coordinates
    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Calculate position relative to canvas
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // FIX: Scale coordinates to match canvas internal resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: x * scaleX,
      y: y * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    const ctx = canvasRef.current?.getContext('2d');
    const coords = getCoordinates(e);
    if (!ctx || !coords) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const ctx = canvasRef.current?.getContext('2d');
    const coords = getCoordinates(e);
    if (!ctx || !coords) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const newCount = strokeCount + 1;
      setStrokeCount(newCount);
      
      if (newCount >= 15 && !hasCompletedOnce) {
        setHasCompletedOnce(true);
        toast.success('Amazing artwork! Sticker earned!', {
          duration: 3000,
          icon: '✨',
        });
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setStrokeCount(0);
      setHasCompletedOnce(false);
      toast('Canvas cleared! Start fresh!', { icon: '🗑️' });
    }
  };

  const progress = Math.min((strokeCount / 15) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-lg">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-all"
          >
            <IoArrowBack className="text-xl" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="flex items-center gap-3">
            <IoBrush className="text-3xl text-purple-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Free Draw Canvas
            </h1>
          </div>

          <div className="w-20"></div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar - Tools */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Progress Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-4">
                <IoSparkles className="text-3xl text-purple-600" />
                <div>
                  <h3 className="font-bold text-gray-800">Progress</h3>
                  <p className="text-sm text-gray-600">{strokeCount}/15 strokes</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {strokeCount >= 15 ? (
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <IoCheckmarkCircle className="text-xl" />
                  <span>Completed!</span>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  {15 - strokeCount} more strokes to earn a sticker!
                </p>
              )}
            </div>

            {/* Color Palette */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <IoColorPalette className="text-2xl text-gray-700" />
                <h3 className="font-bold text-gray-800">Colors</h3>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setCurrentColor(color)}
                    className={`group relative aspect-square rounded-xl transition-all transform hover:scale-110 ${
                      currentColor.hex === color.hex 
                        ? 'ring-4 ring-purple-500 scale-110' 
                        : 'ring-2 ring-gray-200 hover:ring-gray-300'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {currentColor.hex === color.hex && (
                      <IoCheckmarkCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl drop-shadow-lg" />
                    )}
                  </button>
                ))}
              </div>

              {currentColor && (
                <div className="mt-4 text-center">
                  <span className="text-sm font-semibold text-gray-700">{currentColor.name}</span>
                </div>
              )}
            </div>

            {/* Brush Size */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <IoBrush className="text-2xl text-gray-700" />
                <h3 className="font-bold text-gray-800">Brush Size</h3>
              </div>
              
              <div className="space-y-3">
                {BRUSH_SIZES.map((brush) => {
                  const Icon = brush.icon;
                  return (
                    <button
                      key={brush.size}
                      onClick={() => setBrushSize(brush)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        brushSize.size === brush.size
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="text-2xl text-gray-700" />
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-800">{brush.label}</div>
                        <div className="text-xs text-gray-500">{brush.size}px</div>
                      </div>
                      {brushSize.size === brush.size && (
                        <IoCheckmarkCircle className="text-xl text-purple-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Canvas Container */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div ref={containerRef} className="relative">
                <canvas 
                  ref={canvasRef} 
                  width={1200} 
                  height={700} 
                  className="w-full border-2 border-gray-200 rounded-xl cursor-crosshair touch-none bg-white shadow-inner"
                  style={{ 
                    touchAction: 'none', // Prevent default touch behavior
                    userSelect: 'none'   // Prevent text selection
                  }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button 
                  onClick={clearCanvas}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold transition-all border-2 border-red-200 hover:border-red-300"
                >
                  <IoTrash className="text-xl" />
                  Clear Canvas
                </button>
                <button 
                  onClick={() => toast.success('Drawing saved! (Feature coming soon)', { icon: '💾' })}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl font-semibold transition-all border-2 border-green-200 hover:border-green-300"
                >
                  <IoSave className="text-xl" />
                  Save Drawing
                </button>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <IoSparkles className="text-xl" />
                Drawing Tips
              </h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Experiment with different colors to create unique art</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Use thin brushes for details and thick brushes for filling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>There's no wrong way to draw - express yourself freely!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeDrawCanvas;