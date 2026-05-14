/**
 * ============================================
 * COLORING BOOK — CREATIVE CORNER
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 * @description SVG tap-to-color book. Removed react-icons dependency.
 *              Brand colour palette. Large tap targets for small fingers.
 *              Color 5 areas → sticker earned.
 * ============================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: (icon?: string) => void;
  onBack: () => void;
}

const spring = { type: 'spring' as const, stiffness: 360, damping: 26 };

// ─── COLOUR PALETTE ───────────────────────────────────────────────────────────

const COLOURS = [
  { hex: '#e9924b', name: 'Orange'   },
  { hex: '#fbbf24', name: 'Yellow'   },
  { hex: '#3a9e7e', name: 'Green'    },
  { hex: '#659ec3', name: 'Blue'     },
  { hex: '#7c5cbf', name: 'Purple'   },
  { hex: '#ef4444', name: 'Red'      },
  { hex: '#ec4899', name: 'Pink'     },
  { hex: '#a3e635', name: 'Lime'     },
  { hex: '#d4762a', name: 'Brown'    },
  { hex: '#87ceeb', name: 'Sky blue' },
];

// ─── SVG PAGES ────────────────────────────────────────────────────────────────

const PAGES = [
  {
    id: 'butterfly',
    name: 'Butterfly',
    emoji: '🦋',
    color: '#7c5cbf',
    bg: '#f3eeff',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="100" rx="5" ry="30" fill="white" stroke="#1e3a6e" stroke-width="2" class="colorable" data-id="body"/>
  <path d="M 100 70 Q 90 50 85 45" fill="none" stroke="#1e3a6e" stroke-width="1.5"/>
  <path d="M 100 70 Q 110 50 115 45" fill="none" stroke="#1e3a6e" stroke-width="1.5"/>
  <circle cx="85" cy="45" r="3" fill="#1e3a6e"/>
  <circle cx="115" cy="45" r="3" fill="#1e3a6e"/>
  <ellipse cx="70" cy="85" rx="30" ry="25" fill="white" stroke="#1e3a6e" stroke-width="2" class="colorable" data-id="left-top-wing"/>
  <ellipse cx="75" cy="115" rx="25" ry="30" fill="white" stroke="#1e3a6e" stroke-width="2" class="colorable" data-id="left-bottom-wing"/>
  <ellipse cx="130" cy="85" rx="30" ry="25" fill="white" stroke="#1e3a6e" stroke-width="2" class="colorable" data-id="right-top-wing"/>
  <ellipse cx="125" cy="115" rx="25" ry="30" fill="white" stroke="#1e3a6e" stroke-width="2" class="colorable" data-id="right-bottom-wing"/>
  <circle cx="70" cy="85" r="8" fill="white" stroke="#1e3a6e" stroke-width="1.5" class="colorable" data-id="left-spot"/>
  <circle cx="130" cy="85" r="8" fill="white" stroke="#1e3a6e" stroke-width="1.5" class="colorable" data-id="right-spot"/>
</svg>`,
  },
  {
    id: 'flower',
    name: 'Flower',
    emoji: '🌸',
    color: '#e9924b',
    bg: '#fff4ec',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <line x1="100" y1="110" x2="100" y2="185" stroke="#1e3a6e" stroke-width="3"/>
  <ellipse cx="85" cy="145" rx="15" ry="8" fill="white" stroke="#1e3a6e" stroke-width="2" class="colorable" data-id="leaf-1" transform="rotate(-30 85 145)"/>
  <ellipse cx="115" cy="165" rx="15" ry="8" fill="white" stroke="#1e3a6e" stroke-width="2" class="colorable" data-id="leaf-2" transform="rotate(30 115 165)"/>
  <circle cx="100" cy="100" r="15" fill="white" stroke="#1e3a6e" stroke-width="2" class="colorable" data-id="center"/>
  <circle cx="100" cy="70" r="18" fill="white" stroke="#1e3a6e" stroke-width="2" class="colorable" data-id="petal-top"/>
  <circle cx="130" cy="100" r="18" fill="white" stroke="#1e3a6e" stroke-width="2" class="colorable" data-id="petal-right"/>
  <circle cx="100" cy="130" r="18" fill="white" stroke="#1e3a6e" stroke-width="2" class="colorable" data-id="petal-bottom"/>
  <circle cx="70" cy="100" r="18" fill="white" stroke="#1e3a6e" stroke-width="2" class="colorable" data-id="petal-left"/>
  <circle cx="122" cy="78" r="14" fill="white" stroke="#1e3a6e" stroke-width="2" class="colorable" data-id="petal-tr"/>
  <circle cx="78" cy="78" r="14" fill="white" stroke="#1e3a6e" stroke-width="2" class="colorable" data-id="petal-tl"/>
</svg>`,
  },
  {
    id: 'heart',
    name: 'Heart',
    emoji: '❤️',
    color: '#ef4444',
    bg: '#fff0f0',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M100 160 C100 160,55 118,55 88 C55 68,66 57,82 57 C91 57,100 65,100 65 C100 65,109 57,118 57 C134 57,145 68,145 88 C145 118,100 160,100 160Z"
    fill="white" stroke="#1e3a6e" stroke-width="3" class="colorable" data-id="main-heart"/>
  <circle cx="78" cy="84" r="6" fill="white" stroke="#1e3a6e" stroke-width="2" class="colorable" data-id="left-shine"/>
  <circle cx="120" cy="84" r="6" fill="white" stroke="#1e3a6e" stroke-width="2" class="colorable" data-id="right-shine"/>
  <path d="M 88 115 Q 100 125 112 115" fill="none" stroke="#1e3a6e" stroke-width="2"/>
</svg>`,
  },
  {
    id: 'sun',
    name: 'Sun',
    emoji: '☀️',
    color: '#fbbf24',
    bg: '#fffbeb',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="35" fill="white" stroke="#1e3a6e" stroke-width="3" class="colorable" data-id="sun-core"/>
  ${[0,45,90,135,180,225,270,315].map(a => {
    const r = a * Math.PI / 180;
    return `<line x1="${100+45*Math.cos(r)}" y1="${100+45*Math.sin(r)}" x2="${100+68*Math.cos(r)}" y2="${100+68*Math.sin(r)}" stroke="#1e3a6e" stroke-width="3" stroke-linecap="round"/>`;
  }).join('')}
  <circle cx="88" cy="94" r="4" fill="#1e3a6e"/>
  <circle cx="112" cy="94" r="4" fill="#1e3a6e"/>
  <path d="M 86 110 Q 100 120 114 110" fill="none" stroke="#1e3a6e" stroke-width="2" stroke-linecap="round"/>
</svg>`,
  },
];

const NEEDED = 5;

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const ColoringBook: React.FC<Props> = ({ onComplete, onBack }) => {
  const [page, setPage]         = useState(PAGES[0]);
  const [colour, setColour]     = useState(COLOURS[0]);
  const [coloured, setColoured] = useState<Set<string>>(new Set());
  const [done, setDone]         = useState(false);
  const svgRef                  = useRef<HTMLDivElement>(null);

  // Reset coloured areas when page changes
  useEffect(() => {
    setColoured(new Set());
    setDone(false);
    if (svgRef.current) {
      svgRef.current.querySelectorAll('.colorable').forEach(el => el.setAttribute('fill', 'white'));
    }
  }, [page]);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as SVGElement;
    if (!target.classList.contains('colorable')) return;
    const id = target.dataset.id;
    if (!id) return;

    target.setAttribute('fill', colour.hex);

    setColoured(prev => {
      if (prev.has(id)) return prev;          // already coloured this shape
      const next = new Set(prev);
      next.add(id);
      if (next.size >= NEEDED && !done) {
        setDone(true);
        setTimeout(() => onComplete('🖍️'), 600);
      }
      return next;
    });
  };

  const reset = () => {
    if (svgRef.current) {
      svgRef.current.querySelectorAll('.colorable').forEach(el => el.setAttribute('fill', 'white'));
    }
    setColoured(new Set());
    setDone(false);
  };

  const progress = Math.min((coloured.size / NEEDED) * 100, 100);

  return (
    <div className="space-y-5">
      {/* Back */}
      <motion.button whileTap={{ scale: 0.93 }} onClick={onBack}
        className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-base"
        style={{ background: '#edf5fb', color: '#659ec3', border: '2.5px solid #659ec320', fontFamily: "'Nunito', sans-serif" }}>
        ← Back to create
      </motion.button>

      {/* Title + progress */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-black text-2xl" style={{ fontFamily: "'Nunito', sans-serif", color: '#659ec3' }}>
          Coloring Book 🖍️
        </h3>
        <div className="flex items-center gap-3">
          <div className="rounded-full overflow-hidden" style={{ background: '#659ec318', height: '10px', width: '160px' }}>
            <motion.div className="h-full rounded-full" animate={{ width: `${progress}%` }} style={{ background: '#659ec3' }} transition={spring} />
          </div>
          <span className="font-black text-xs" style={{ color: '#659ec3' }}>{coloured.size}/{NEEDED} areas</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">

          {/* Page picker */}
          <div className="rounded-[2rem] p-5" style={{ background: '#edf5fb', border: '3px solid #659ec315' }}>
            <p className="font-black text-sm mb-3" style={{ color: '#659ec3', fontFamily: "'Nunito', sans-serif" }}>Choose picture</p>
            <div className="space-y-2">
              {PAGES.map(p => (
                <motion.button key={p.id} whileTap={{ scale: 0.96 }} onClick={() => setPage(p)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm"
                  style={{
                    background: page.id === p.id ? p.color : '#fff',
                    color: page.id === p.id ? '#fff' : p.color,
                    border: `2px solid ${page.id === p.id ? p.color : p.color + '20'}`,
                  }}>
                  <span className="text-xl select-none" aria-hidden="true">{p.emoji}</span>
                  {p.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Colour picker */}
          <div className="rounded-[2rem] p-5" style={{ background: '#edf5fb', border: '3px solid #659ec315' }}>
            <p className="font-black text-sm mb-3" style={{ color: '#659ec3', fontFamily: "'Nunito', sans-serif" }}>Pick a colour</p>
            <div className="grid grid-cols-5 gap-2">
              {COLOURS.map(c => (
                <motion.button key={c.hex} whileTap={{ scale: 0.82 }} onClick={() => setColour(c)}
                  className="aspect-square rounded-xl"
                  style={{
                    background: c.hex,
                    border: colour.hex === c.hex ? '3px solid #659ec3' : '2px solid rgba(0,0,0,0.1)',
                    boxShadow: colour.hex === c.hex ? '0 0 0 2px #fff, 0 0 0 4px #659ec3' : 'none',
                  }}
                  aria-label={c.name}
                />
              ))}
            </div>
            <p className="font-bold text-xs mt-2 text-center" style={{ color: '#659ec380' }}>{colour.name}</p>
          </div>
        </div>

        {/* SVG canvas */}
        <div className="lg:col-span-3">
          <div className="rounded-[2rem] p-6" style={{ background: page.bg, border: `3px solid ${page.color}15`, boxShadow: `0 12px 40px ${page.color}12` }}>
            <div
              ref={svgRef}
              onClick={handleClick}
              className="max-w-xs mx-auto select-none"
              style={{ cursor: done ? 'default' : 'pointer' }}
              dangerouslySetInnerHTML={{ __html: page.svg }}
            />
          </div>

          <div className="flex gap-3 mt-4">
            <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
              className="flex-1 py-4 rounded-2xl font-black text-base"
              style={{ background: '#fff', color: '#659ec3', border: '2.5px solid #659ec320' }}>
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
            <p className="text-center font-bold text-sm mt-3" style={{ color: '#659ec360' }}>
              Tap areas to colour them — {NEEDED - coloured.size} more to earn your sticker!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColoringBook;