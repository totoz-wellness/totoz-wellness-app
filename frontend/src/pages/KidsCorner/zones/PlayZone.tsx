/**
 * ============================================
 * PLAY ZONE — KIDS CORNER
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 * @description 4 activity categories with a spring-animated reward system.
 *              Large tap targets. No reading required to navigate.
 * ============================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KidsData } from '../../../types/kidscorner.types';

import MindfulGames from './PlayZone/MindfulGames';
import CreativeCorner from './PlayZone/CreativeCorner';
import EmotionAdventures from './PlayZone/EmotionAdventures';
import Puzzle from './PlayZone/Puzzle';

// ─── TYPES ───────────────────────────────────────────────────────────────────

type CategoryID = 'emotion' | 'mindful' | 'creative' | 'puzzle';

interface PlayZoneProps {
  kidsData: KidsData;
  onUpdateData: (newData: Partial<KidsData>) => void;
}

// ─── CATEGORY CONFIG ─────────────────────────────────────────────────────────

const CATEGORIES: {
  id: CategoryID;
  label: string;
  tagline: string;
  emoji: string;
  color: string;
  bg: string;
  border: string;
  sticker: string;
}[] = [
  {
    id: 'mindful',
    label: 'Calm Games',
    tagline: 'Breathe & relax',
    emoji: '🌿',
    color: '#3a9e7e',
    bg: '#ecfaf5',
    border: '#3a9e7e30',
    sticker: '🌿',
  },
  {
    id: 'creative',
    label: 'Create & Draw',
    tagline: 'Make something cool',
    emoji: '🎨',
    color: '#7c5cbf',
    bg: '#f3eeff',
    border: '#7c5cbf30',
    sticker: '🎨',
  },
  {
    id: 'emotion',
    label: 'Feelings World',
    tagline: 'Learn about emotions',
    emoji: '🎭',
    color: '#659ec3',
    bg: '#edf5fb',
    border: '#659ec330',
    sticker: '🎭',
  },
  {
    id: 'puzzle',
    label: 'Brain Teasers',
    tagline: 'Think & figure it out',
    emoji: '🧩',
    color: '#e9924b',
    bg: '#fff4ec',
    border: '#e9924b30',
    sticker: '🧩',
  },
];

// ─── SPRING ──────────────────────────────────────────────────────────────────

const spring = { type: 'spring' as const, stiffness: 360, damping: 26 };

// ─── REWARD MODAL ────────────────────────────────────────────────────────────

const RewardModal: React.FC<{
  sticker: string;
  onClose: () => void;
}> = ({ sticker, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-6"
    style={{ background: 'rgba(30,58,110,0.55)', backdropFilter: 'blur(10px)' }}
  >
    <motion.div
      initial={{ scale: 0.4, y: 60, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ ...spring, stiffness: 300, damping: 20 }}
      className="rounded-[2.5rem] p-10 flex flex-col items-center text-center max-w-sm w-full relative overflow-hidden"
      style={{ background: '#fff', boxShadow: '0 30px 80px rgba(30,58,110,0.18)' }}
    >
      {/* Confetti dots — pure CSS */}
      {['#e9924b','#7c5cbf','#3a9e7e','#659ec3','#fbbf24'].map((c, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{ background: c, top: `${10 + i * 14}%`, left: `${8 + i * 18}%` }}
          animate={{ y: [0, -20, 0], x: [0, (i % 2 === 0 ? 10 : -10), 0], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.4 + i * 0.2, ease: 'easeInOut' }}
        />
      ))}

      {/* Big sticker bounce */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        className="text-8xl mb-5 select-none"
        aria-hidden="true"
      >
        {sticker}
      </motion.div>

      <h2
        className="font-black text-4xl mb-2"
        style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}
      >
        Amazing!
      </h2>
      <p
        className="text-lg font-bold mb-2"
        style={{ color: '#1e3a6e80' }}
      >
        You finished the activity!
      </p>

      {/* Sticker awarded pill */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, ...spring }}
        className="flex items-center gap-3 px-6 py-3 rounded-2xl mb-8 mt-2"
        style={{ background: '#fff4ec', border: '2px solid #e9924b30' }}
      >
        <span className="text-3xl">{sticker}</span>
        <span className="font-black text-base" style={{ color: '#e9924b' }}>
          Sticker added to your book!
        </span>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94, rotate: -1 }}
        onClick={onClose}
        className="w-full py-4 rounded-2xl font-black text-xl text-white"
        style={{ background: '#e9924b', boxShadow: '0 8px 24px #e9924b35' }}
      >
        Play More! 🎉
      </motion.button>
    </motion.div>
  </motion.div>
);

// ─── CATEGORY CARD ────────────────────────────────────────────────────────────

const CategoryCard: React.FC<{
  cat: typeof CATEGORIES[0];
  onClick: () => void;
  index: number;
}> = ({ cat, onClick, index }) => (
  <motion.button
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...spring, delay: index * 0.07 }}
    whileHover={{ y: -6, scale: 1.02, rotate: index % 2 === 0 ? 0.5 : -0.5 }}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className="text-left flex flex-col justify-between rounded-[2rem] p-7 relative overflow-hidden"
    style={{
      background: cat.bg,
      border: `3px solid ${cat.border}`,
      minHeight: '200px',
      boxShadow: `0 8px 28px ${cat.color}15`,
    }}
    aria-label={`${cat.label}: ${cat.tagline}`}
  >
    {/* Decorative circle */}
    <div
      className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20"
      style={{ background: cat.color }}
      aria-hidden="true"
    />

    <div
      className="text-6xl leading-none select-none"
      aria-hidden="true"
    >
      {cat.emoji}
    </div>

    <div>
      <h3
        className="font-black text-2xl leading-tight mb-1"
        style={{ fontFamily: "'Nunito', sans-serif", color: cat.color }}
      >
        {cat.label}
      </h3>
      <p className="font-bold text-sm" style={{ color: `${cat.color}90` }}>
        {cat.tagline}
      </p>
    </div>

    {/* Tap indicator */}
    <div
      className="absolute bottom-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-lg font-black text-white"
      style={{ background: cat.color }}
      aria-hidden="true"
    >
      ▶
    </div>
  </motion.button>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const PlayZone: React.FC<PlayZoneProps> = ({ kidsData, onUpdateData }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryID | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [earnedSticker, setEarnedSticker] = useState('⭐');

  const handleWin = (icon?: string) => {
    const sticker = icon ?? '⭐';
    onUpdateData({
      stickers: [...(kidsData.stickers ?? []), sticker],
      hasPlayedGame: true,
    });
    setEarnedSticker(sticker);
    setShowReward(true);
  };

  const handleCloseReward = () => {
    setShowReward(false);
    setActiveCategory(null);
  };

  const renderActive = () => {
    const back = () => setActiveCategory(null);
    if (activeCategory === 'mindful')  return <MindfulGames onWin={handleWin} onBack={back} />;
    if (activeCategory === 'creative') return <CreativeCorner onWin={handleWin} onBack={back} />;
    if (activeCategory === 'emotion')  return <EmotionAdventures onWin={handleWin} onBack={back} />;
    if (activeCategory === 'puzzle')   return <Puzzle onWin={handleWin} onBack={back} />;
    return null;
  };

  return (
    <div className="relative pt-3">

      {/* ── Zone heading ── */}
      <AnimatePresence mode="wait">
        {!activeCategory && (
          <motion.div
            key="heading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-7"
          >
            <h2
              className="font-black text-3xl md:text-4xl mb-1"
              style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}
            >
              Play Zone 🎮
            </h2>
            <p className="font-bold text-base" style={{ color: '#1e3a6e60' }}>
              Pick something fun to do!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Back button when inside an activity ── */}
      <AnimatePresence>
        {activeCategory && (
          <motion.button
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setActiveCategory(null)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-base mb-5"
            style={{ background: '#fff', color: '#e9924b', border: '2.5px solid #e9924b25', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
          >
            <span>←</span> Back to games
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Category grid / Active activity ── */}
      <AnimatePresence mode="wait">
        {activeCategory ? (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={spring}
          >
            {renderActive()}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {CATEGORIES.map((cat, i) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                onClick={() => setActiveCategory(cat.id)}
                index={i}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reward modal ── */}
      <AnimatePresence>
        {showReward && (
          <RewardModal sticker={earnedSticker} onClose={handleCloseReward} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayZone;