/**
 * ============================================
 * KIDS CORNER PAGE — TOTOZ WELLNESS
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 * @description A completely different world from the rest of the app.
 *              Warm, bouncy, child-first. No typing required anywhere.
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KidsData } from '../../types/kidscorner.types';

import HubZone from './zones/HubZone';
import PlayZone from './zones/PlayZone';
import LearnZone from './zones/LearnZone';
import HelpZone from './zones/HelpZone';

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Zone = 'hub' | 'play' | 'learn' | 'help';

const ZONES: { id: Zone; label: string; emoji: string; color: string; bg: string }[] = [
  { id: 'hub',   label: 'My Hub',      emoji: '🏡', color: '#e9924b', bg: '#fff4ec' },
  { id: 'play',  label: 'Play',        emoji: '🎮', color: '#7c5cbf', bg: '#f3eeff' },
  { id: 'learn', label: 'Stories',     emoji: '📖', color: '#3a9e7e', bg: '#ecfaf5' },
  { id: 'help',  label: 'Calm Down',   emoji: '🌈', color: '#659ec3', bg: '#edf5fb' },
];

// ─── FLOATING SHAPES (decorative, aria-hidden) ───────────────────────────────

const BG_SHAPES = [
  { cx: '8%',  cy: '12%', r: 90,  fill: '#e9924b', opacity: 0.07 },
  { cx: '92%', cy: '8%',  r: 70,  fill: '#7c5cbf', opacity: 0.07 },
  { cx: '85%', cy: '55%', r: 110, fill: '#3a9e7e', opacity: 0.06 },
  { cx: '5%',  cy: '80%', r: 80,  fill: '#659ec3', opacity: 0.07 },
  { cx: '50%', cy: '95%', r: 100, fill: '#e9924b', opacity: 0.05 },
];

// ─── SPRING CONFIG ────────────────────────────────────────────────────────────

const spring = { type: 'spring' as const, stiffness: 380, damping: 28 };

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const KidsCornerPage: React.FC = () => {
  const navigate = useNavigate();

  // Persist data in localStorage — no auth required for kids session
  const [kidsData, setKidsData] = useState<KidsData>(() => {
    try {
      const saved = localStorage.getItem('totoz_kids_data');
      return saved ? JSON.parse(saved) : { stickers: [], streak: 0, worries: [], lastMood: undefined };
    } catch {
      return { stickers: [], streak: 0, worries: [], lastMood: undefined };
    }
  });

  const [activeZone, setActiveZone] = useState<Zone>('hub');
  const [enterAnim, setEnterAnim] = useState(true);

  // Reset session flags on mount — fresh session every entry
  useEffect(() => {
    const reset = { ...kidsData, lastMood: undefined, hasReadBook: false, hasPlayedGame: false };
    setKidsData(reset);
    localStorage.setItem('totoz_kids_data', JSON.stringify(reset));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fade entrance once
  useEffect(() => {
    const t = setTimeout(() => setEnterAnim(false), 800);
    return () => clearTimeout(t);
  }, []);

  const handleUpdateData = (newData: Partial<KidsData>) => {
    setKidsData(prev => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('totoz_kids_data', JSON.stringify(updated));
      return updated;
    });
  };

  const handleZoneChange = (zone: Zone) => {
    setActiveZone(zone);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeZoneConfig = ZONES.find(z => z.id === activeZone)!;

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{ fontFamily: "'Nunito', 'Fredoka One', system-ui, sans-serif", background: '#fdf8f2' }}
    >
      {/* ── Decorative background blobs ─────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <svg width="100%" height="100%" className="absolute inset-0">
          {BG_SHAPES.map((s, i) => (
            <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} opacity={s.opacity} />
          ))}
        </svg>
      </div>

      {/* ── Topbar ──────────────────────────────────────────────────────── */}
      <nav
        className="relative z-20 flex items-center justify-between px-5 py-3 md:px-8"
        style={{ background: 'rgba(253,248,242,0.85)', backdropFilter: 'blur(12px)', borderBottom: '2px solid rgba(233,146,75,0.12)' }}
      >
        {/* Home button */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-sm"
          style={{ background: '#fff4ec', color: '#e9924b', border: '2px solid #e9924b22' }}
        >
          <span className="text-lg">🏠</span>
          <span className="hidden sm:inline">Go Home</span>
        </motion.button>

        {/* Page title */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <span className="font-black text-lg md:text-xl" style={{ color: '#1e3a6e' }}>
            Kids Corner
          </span>
        </div>

        {/* Stats pills */}
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-black"
            style={{ background: '#fff9e6', border: '2px solid #fbbf24', color: '#b45309' }}
          >
            <span>⭐</span>
            <span>{kidsData.streak ?? 0}</span>
          </motion.div>
          <div
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-black"
            style={{ background: '#e9924b', color: '#fff' }}
          >
            <span>🎒</span>
            <span>{kidsData.stickers?.length ?? 0}</span>
          </div>
        </div>
      </nav>

      {/* ── Zone tab bar ────────────────────────────────────────────────── */}
      <div
        className="relative z-20 flex gap-2 px-5 md:px-8 py-3 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {ZONES.map(zone => {
          const isActive = activeZone === zone.id;
          return (
            <motion.button
              key={zone.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94, rotate: -1 }}
              onClick={() => handleZoneChange(zone.id)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-base whitespace-nowrap flex-shrink-0 transition-all relative"
              style={{
                background: isActive ? zone.color : '#fff',
                color: isActive ? '#fff' : zone.color,
                border: `2.5px solid ${isActive ? zone.color : zone.color + '30'}`,
                boxShadow: isActive ? `0 6px 20px ${zone.color}35` : '0 2px 8px rgba(0,0,0,0.06)',
                fontSize: '15px',
              }}
            >
              <span className="text-xl leading-none">{zone.emoji}</span>
              <span>{zone.label}</span>
              {isActive && (
                <motion.div
                  layoutId="zone-indicator"
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: `${zone.color}18`, zIndex: -1 }}
                  transition={spring}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 px-5 md:px-8 pb-16 pt-2">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeZone}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ ...spring, stiffness: 280, damping: 24 }}
            >
              {activeZone === 'hub' && (
                <HubZone kidsData={kidsData} onUpdateData={handleUpdateData} onNavigate={handleZoneChange} />
              )}
              {activeZone === 'play' && (
                <PlayZone kidsData={kidsData} onUpdateData={handleUpdateData} />
              )}
              {activeZone === 'learn' && (
                <LearnZone kidsData={kidsData} onUpdateData={handleUpdateData} />
              )}
              {activeZone === 'help' && (
                <HelpZone kidsData={kidsData} onUpdateData={handleUpdateData} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Bottom safe area spacer for mobile ──────────────────────────── */}
      <div className="h-6" aria-hidden="true" />
    </div>
  );
};

export default KidsCornerPage;