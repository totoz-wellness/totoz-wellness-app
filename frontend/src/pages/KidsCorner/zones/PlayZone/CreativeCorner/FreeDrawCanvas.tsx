/**
 * ============================================
 * FREE DRAW CANVAS — CREATIVE CORNER
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 * @description Touch + mouse canvas drawing. Brand colours.
 *              Large colour swatches and brush buttons for small fingers.
 *              15 strokes → sticker earned.
 * ============================================
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: (icon?: string) => void;
  onBack: () => void;
}

const spring = { type: 'spring' as const, stiffness: 360, damping: 26 };

// ─── PALETTE ─────────────────────────────────────────────────────────────────

const COLOURS = [
  { hex: '#e9924b', name: 'Orange'    },
  { hex: '#7c5cbf', name: 'Purple'    },
  { hex: '#659ec3', name: 'Blue'      },
  { hex: '#3a9e7e', name: 'Green'     },
  { hex: '#fbbf24', name: 'Yellow'    },
  { hex: '#ef4444', name: 'Red'       },
  { hex: '#ec4899', name: 'Pink'      },
  { hex: '#1e3a6e', name: 'Navy'      },
  { hex: '#a3a3a3', name: 'Grey'      },
  { hex: '#ffffff', name: 'White'     },
];

const SIZES = [
  { px: 4,  label: 'Tiny'   },
  { px: 9,  label: 'Small'  },
  { px: 16, label: 'Medium' },
  { px: 28, label: 'Big'    },
];

const NEEDED = 15;

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const FreeDrawCanvas: React.FC<Props> = ({ onComplete, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing]       = useState(false);
  const [colour, setColour]         = useState(COLOURS[0]);
  const [size, setSize]             = useState(SIZES[2]);
  const [strokes, setStrokes]       = useState(0);
  const [done, setDone]             = useState(false);

  // Set canvas background once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fffdf8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width  / rect.width;
    const sy = canvas.height / rect.height;
    if ('touches' in e) {
      return { x: (e.touches[0].clientX - rect.left) * sx, y: (e.touches[0].clientY - rect.top) * sy };
    }
    return { x: ((e as React.MouseEvent).clientX - rect.left) * sx, y: ((e as React.MouseEvent).clientY - rect.top) * sy };
  }, []);

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || done) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.strokeStyle  = colour.hex;
    ctx.lineWidth    = size.px;
    ctx.lineCap      = 'round';
    ctx.lineJoin     = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  }, [colour, size, done, getPos]);

  const doDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  }, [drawing, getPos]);

  const stopDraw = useCallback(() => {
    if (!drawing || done) return;
    setDrawing(false);
    setStrokes(prev => {
      const next = prev + 1;
      if (next >= NEEDED) {
        setDone(true);
        setTimeout(() => onComplete('🖌️'), 600);
      }
      return next;
    });
  }, [drawing, done, onComplete]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fffdf8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setStrokes(0);
    setDone(false);
  };

  const progress = Math.min((strokes / NEEDED) * 100, 100);

  return (
    <div className="space-y-5">
      {/* Back */}
      <motion.button whileTap={{ scale: 0.93 }} onClick={onBack}
        className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-base"
        style={{ background: '#f3eeff', color: '#7c5cbf', border: '2.5px solid #7c5cbf20', fontFamily: "'Nunito', sans-serif" }}>
        ← Back to create
      </motion.button>

      {/* Title + progress */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-black text-2xl" style={{ fontFamily: "'Nunito', sans-serif", color: '#7c5cbf' }}>
          Free Draw 🖌️
        </h3>
        <div className="flex items-center gap-3">
          <div className="rounded-full overflow-hidden" style={{ background: '#7c5cbf18', height: '10px', width: '160px' }}>
            <motion.div className="h-full rounded-full" animate={{ width: `${progress}%` }} style={{ background: '#7c5cbf' }} transition={spring} />
          </div>
          <span className="font-black text-xs" style={{ color: '#7c5cbf' }}>{strokes}/{NEEDED} strokes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* Tools sidebar */}
        <div className="lg:col-span-1 space-y-4">

          {/* Colour picker */}
          <div className="rounded-[2rem] p-5" style={{ background: '#f3eeff', border: '3px solid #7c5cbf15' }}>
            <p className="font-black text-sm mb-3" style={{ color: '#7c5cbf', fontFamily: "'Nunito', sans-serif" }}>Colour</p>
            <div className="grid grid-cols-5 gap-2">
              {COLOURS.map(c => (
                <motion.button key={c.hex} whileTap={{ scale: 0.82 }} onClick={() => setColour(c)}
                  className="aspect-square rounded-xl"
                  style={{
                    background: c.hex,
                    border: colour.hex === c.hex ? '3px solid #7c5cbf' : '2px solid rgba(0,0,0,0.1)',
                    boxShadow: colour.hex === c.hex ? '0 0 0 2px #fff, 0 0 0 4px #7c5cbf' : 'none',
                  }}
                  aria-label={c.name}
                />
              ))}
            </div>
            <p className="font-bold text-xs mt-2 text-center" style={{ color: '#7c5cbf80' }}>{colour.name}</p>
          </div>

          {/* Brush size */}
          <div className="rounded-[2rem] p-5" style={{ background: '#f3eeff', border: '3px solid #7c5cbf15' }}>
            <p className="font-black text-sm mb-3" style={{ color: '#7c5cbf', fontFamily: "'Nunito', sans-serif" }}>Brush size</p>
            <div className="space-y-2">
              {SIZES.map(s => (
                <motion.button key={s.px} whileTap={{ scale: 0.95 }} onClick={() => setSize(s)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm"
                  style={{
                    background: size.px === s.px ? '#7c5cbf' : '#fff',
                    color: size.px === s.px ? '#fff' : '#7c5cbf',
                    border: `2px solid ${size.px === s.px ? '#7c5cbf' : '#7c5cbf20'}`,
                  }}>
                  <div className="rounded-full flex-shrink-0"
                    style={{ width: Math.min(s.px, 22), height: Math.min(s.px, 22), background: size.px === s.px ? '#fff' : '#7c5cbf', minWidth: 8, minHeight: 8 }} />
                  {s.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3">
          <div className="rounded-[2rem] overflow-hidden" style={{ background: '#fff', border: '3px solid #7c5cbf15', boxShadow: '0 12px 40px #7c5cbf12' }}>
            <canvas
              ref={canvasRef}
              width={1000} height={580}
              className="w-full touch-none block"
              style={{ cursor: done ? 'default' : 'crosshair', touchAction: 'none', userSelect: 'none', display: 'block' }}
              onMouseDown={startDraw} onMouseMove={doDraw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
              onTouchStart={startDraw} onTouchMove={doDraw} onTouchEnd={stopDraw}
              aria-label="Drawing canvas"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <motion.button whileTap={{ scale: 0.95 }} onClick={clearCanvas}
              className="flex-1 py-4 rounded-2xl font-black text-base"
              style={{ background: '#fff', color: '#7c5cbf', border: '2.5px solid #7c5cbf20' }}>
              Clear
            </motion.button>
            <AnimatePresence>
              {done && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring}
                  className="flex-1 py-4 rounded-2xl font-black text-base text-white text-center flex items-center justify-center gap-2"
                  style={{ background: '#3a9e7e', boxShadow: '0 8px 24px #3a9e7e30' }}>
                  🌟 Sticker earned!
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!done && (
            <p className="text-center font-bold text-sm mt-3" style={{ color: '#7c5cbf60' }}>
              Draw {NEEDED - strokes} more stroke{NEEDED - strokes !== 1 ? 's' : ''} to earn your sticker!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreeDrawCanvas;