/**
 * ============================================
 * HUB ZONE — KIDS CORNER
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 * @description Mood check-in → personalised dashboard.
 *              Large tap targets, no typing, bouncy spring animations.
 *              Mood selection silently feeds into GrowTrack via onUpdateData.
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KidsData, Mood } from '../../../types/kidscorner.types';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface HubZoneProps {
  kidsData: KidsData;
  onUpdateData: (newData: Partial<KidsData>) => void;
  onNavigate?: (zone: 'hub' | 'play' | 'learn' | 'help') => void;
}

type View = 'selector' | 'dashboard';

// ─── MOOD CONFIG ─────────────────────────────────────────────────────────────

const MOODS: {
  type: Mood;
  emoji: string;
  label: string;
  color: string;
  bg: string;
  message: string;
}[] = [
  { type: 'happy',   emoji: '😊', label: 'Happy',   color: '#e9924b', bg: '#fff4ec', message: "That's wonderful! Keep smiling." },
  { type: 'calm',    emoji: '😌', label: 'Calm',    color: '#3a9e7e', bg: '#ecfaf5', message: 'So peaceful. You\'re doing great.' },
  { type: 'sad',     emoji: '😢', label: 'Sad',     color: '#659ec3', bg: '#edf5fb', message: "It's okay to feel sad. You're not alone." },
  { type: 'angry',   emoji: '😡', label: 'Angry',   color: '#d4762a', bg: '#fff0e6', message: 'Big feelings are okay. Let\'s find calm.' },
  { type: 'silly',   emoji: '🤪', label: 'Silly',   color: '#7c5cbf', bg: '#f3eeff', message: 'Hehe! Silly is great. Have fun today!' },
  { type: 'worried', emoji: '😟', label: 'Worried', color: '#659ec3', bg: '#edf5fb', message: "You're safe here. We'll figure it out." },
];

// Which zone to suggest per mood
const MOOD_ROUTE: Record<Mood, 'play' | 'learn' | 'help'> = {
  happy:   'play',
  calm:    'learn',
  silly:   'play',
  sad:     'help',
  angry:   'help',
  worried: 'help',
};

const MOOD_SUGGEST_LABEL: Record<Mood, string> = {
  happy:   'Play a fun game',
  calm:    'Read a story',
  silly:   'Play some games',
  sad:     'Talk to Buddy',
  angry:   'Try a calm-down exercise',
  worried: 'Talk to Buddy',
};

// ─── DAILY FACTS ─────────────────────────────────────────────────────────────

const DAILY_FACTS = [
  'Taking deep breaths can tell your brain to feel calm!',
  'Your brain is like a muscle — the more you use it to be kind, the stronger it gets!',
  'Stretching your body helps your mind feel more awake and happy.',
  'Drinking water is like giving your brain a big, refreshing hug!',
  'Smiling can actually trick your brain into feeling a little bit happier!',
  'Being kind to others gives your brain a little happiness boost too!',
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const [dailyFact] = [DAILY_FACTS[Math.floor(Math.random() * DAILY_FACTS.length)]];

const spring = { type: 'spring' as const, stiffness: 360, damping: 26 };

// ─── MOOD FACE BUTTON ─────────────────────────────────────────────────────────

const MoodFace: React.FC<{
  mood: typeof MOODS[0];
  onSelect: (m: Mood) => void;
  index: number;
}> = ({ mood, onSelect, index }) => (
  <motion.button
    initial={{ opacity: 0, y: 28, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ ...spring, delay: index * 0.06 }}
    whileHover={{ scale: 1.12, y: -4, rotate: index % 2 === 0 ? 2 : -2 }}
    whileTap={{ scale: 0.92 }}
    onClick={() => onSelect(mood.type)}
    className="flex flex-col items-center justify-center gap-3 rounded-[2rem] p-6 relative overflow-hidden"
    style={{
      background: mood.bg,
      border: `3px solid ${mood.color}22`,
      minHeight: '140px',
      boxShadow: `0 8px 24px ${mood.color}14`,
    }}
    aria-label={`I'm feeling ${mood.label}`}
  >
    {/* Soft circle behind emoji */}
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="w-24 h-24 rounded-full opacity-15"
        style={{ background: mood.color }}
      />
    </div>

    <span className="text-5xl leading-none select-none relative z-10" aria-hidden="true">
      {mood.emoji}
    </span>
    <span
      className="font-black text-base relative z-10"
      style={{ fontFamily: "'Nunito', sans-serif", color: mood.color }}
    >
      {mood.label}
    </span>
  </motion.button>
);

// ─── PROGRESS ROW ────────────────────────────────────────────────────────────

const ProgressRow: React.FC<{
  label: string;
  done: boolean;
  onClick?: () => void;
  color: string;
}> = ({ label, done, onClick, color }) => (
  <motion.div
    whileHover={onClick ? { x: 4 } : {}}
    whileTap={onClick ? { scale: 0.98 } : {}}
    onClick={onClick}
    className="flex items-center justify-between px-5 py-4 rounded-2xl"
    style={{
      background: done ? `${color}10` : '#f8f8f8',
      border: `2px solid ${done ? color + '25' : '#f0f0f0'}`,
      cursor: onClick ? 'pointer' : 'default',
    }}
  >
    <span
      className="font-black text-base"
      style={{ fontFamily: "'Nunito', sans-serif", color: done ? color : '#1e3a6e80' }}
    >
      {label}
    </span>
    {done ? (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ ...spring, stiffness: 400 }}
        className="text-2xl"
        aria-label="Done"
      >
        ✅
      </motion.span>
    ) : (
      <span className="text-sm font-bold" style={{ color: '#1e3a6e35' }}>
        {onClick ? 'Tap to go →' : 'Not yet'}
      </span>
    )}
  </motion.div>
);

// ─── STICKER CELL ────────────────────────────────────────────────────────────

const StickerCell: React.FC<{ sticker?: string; index: number }> = ({ sticker, index }) => (
  <motion.div
    initial={{ scale: 0.7, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ ...spring, delay: index * 0.03 }}
    whileHover={sticker ? { scale: 1.18, rotate: 5 } : {}}
    className="aspect-square rounded-2xl flex items-center justify-center text-3xl select-none"
    style={{
      background: sticker ? '#fff4ec' : '#f5f5f5',
      border: sticker ? '2.5px solid #e9924b25' : '2.5px solid #f0f0f0',
      opacity: sticker ? 1 : 0.35,
    }}
    aria-label={sticker ? `Sticker: ${sticker}` : 'Empty sticker slot'}
  >
    {sticker ?? '?'}
  </motion.div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const HubZone: React.FC<HubZoneProps> = ({ kidsData, onUpdateData, onNavigate }) => {
  const [view, setView] = useState<View>(kidsData.lastMood ? 'dashboard' : 'selector');
  const [selectedMood, setSelectedMood] = useState<typeof MOODS[0] | null>(
    kidsData.lastMood ? (MOODS.find(m => m.type === kidsData.lastMood) ?? null) : null
  );

  const handleMoodSelect = (mood: Mood) => {
    const moodConfig = MOODS.find(m => m.type === mood)!;
    setSelectedMood(moodConfig);
    onUpdateData({ lastMood: mood, streak: (kidsData.streak ?? 0) + 1 });
    setView('dashboard');
  };

  // Sticker grid — always show at least 12 slots
  const stickerList = kidsData.stickers ?? [];
  const stickerSlots = Math.max(12, stickerList.length + (4 - (stickerList.length % 4 || 4)));

  return (
    <div className="pt-3">
      <AnimatePresence mode="wait">

        {/* ── VIEW 1: MOOD SELECTOR ─────────────────────────────────────── */}
        {view === 'selector' && (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={spring}
            className="max-w-2xl mx-auto"
          >
            {/* Back button if a mood was already set */}
            {kidsData.lastMood && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setView('dashboard')}
                className="mb-6 flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-base"
                style={{ background: '#fff', color: '#e9924b', border: '2.5px solid #e9924b25' }}
              >
                ← My Dashboard
              </motion.button>
            )}

            {/* Heading */}
            <div className="text-center mb-10">
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, ...spring }}
                className="font-black mb-3"
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 'clamp(28px, 6vw, 44px)',
                  color: '#1e3a6e',
                  lineHeight: 1.2,
                }}
              >
                {getGreeting()}, Explorer! 👋
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12, ...spring }}
                className="font-bold text-xl"
                style={{ color: '#1e3a6e60' }}
              >
                How are you feeling right now?
              </motion.p>
            </div>

            {/* Mood grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {MOODS.map((m, i) => (
                <MoodFace key={m.type} mood={m} onSelect={handleMoodSelect} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── VIEW 2: DASHBOARD ─────────────────────────────────────────── */}
        {view === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={spring}
            className="space-y-6"
          >
            {/* Welcome banner */}
            <div
              className="relative overflow-hidden rounded-[2rem] p-8"
              style={{
                background: selectedMood
                  ? `linear-gradient(135deg, ${selectedMood.color} 0%, ${selectedMood.color}bb 100%)`
                  : 'linear-gradient(135deg, #e9924b 0%, #d4762a 100%)',
                boxShadow: `0 12px 40px ${selectedMood?.color ?? '#e9924b'}35`,
              }}
            >
              {/* Large decorative emoji */}
              <div
                className="absolute -top-4 -right-4 text-[120px] leading-none select-none opacity-20 rotate-12"
                aria-hidden="true"
              >
                {selectedMood?.emoji ?? '🌟'}
              </div>

              <div className="relative z-10">
                {selectedMood && (
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 mb-3"
                  >
                    <span className="text-4xl select-none" aria-hidden="true">{selectedMood.emoji}</span>
                    <div>
                      <p className="font-black text-white text-sm uppercase tracking-wider opacity-80">
                        You're feeling
                      </p>
                      <p className="font-black text-white text-2xl leading-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {selectedMood.label}
                      </p>
                    </div>
                  </motion.div>
                )}

                <p
                  className="font-bold text-base mb-5 text-white/85 leading-relaxed"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  {selectedMood?.message ?? 'Welcome back, Explorer!'}
                </p>

                {/* Daily fact */}
                <div
                  className="px-4 py-3 rounded-2xl mb-5 text-sm font-bold text-white/90"
                  style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.25)' }}
                >
                  💡 {dailyFact}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Change mood */}
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setView('selector')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm"
                    style={{ background: 'rgba(255,255,255,0.22)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)' }}
                  >
                    🔄 Change mood
                  </motion.button>

                  {/* Suggested activity */}
                  {selectedMood && onNavigate && (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => onNavigate(MOOD_ROUTE[selectedMood.type])}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm text-white"
                      style={{ background: 'rgba(0,0,0,0.18)', border: '1.5px solid rgba(255,255,255,0.15)' }}
                    >
                      ✨ {MOOD_SUGGEST_LABEL[selectedMood.type]}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Sticker book */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, ...spring }}
                className="rounded-[2rem] p-6 flex flex-col"
                style={{
                  background: '#fff',
                  border: '3px dashed #e9924b30',
                  boxShadow: '0 8px 28px rgba(0,0,0,0.05)',
                }}
              >
                <h3
                  className="font-black text-xl mb-1"
                  style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}
                >
                  Sticker Book
                </h3>
                <p className="text-sm font-bold mb-5" style={{ color: '#1e3a6e45' }}>
                  {stickerList.length} sticker{stickerList.length !== 1 ? 's' : ''} collected
                </p>

                <div className="grid grid-cols-4 gap-3 flex-1 overflow-y-auto max-h-64">
                  {Array.from({ length: stickerSlots }).map((_, i) => (
                    <StickerCell key={i} sticker={stickerList[i]} index={i} />
                  ))}
                </div>

                <p className="mt-4 text-xs font-bold text-center" style={{ color: '#1e3a6e40' }}>
                  Complete activities to earn more!
                </p>
              </motion.div>

              {/* Daily progress */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, ...spring }}
                className="rounded-[2rem] p-6"
                style={{
                  background: '#fff',
                  border: '3px solid #1e3a6e08',
                  boxShadow: '0 8px 28px rgba(0,0,0,0.05)',
                }}
              >
                <h3
                  className="font-black text-xl mb-1"
                  style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}
                >
                  Today's Journey
                </h3>
                <p className="text-sm font-bold mb-5" style={{ color: '#1e3a6e45' }}>
                  What have you done today?
                </p>

                <div className="space-y-3">
                  <ProgressRow
                    label="Mood check-in"
                    done={!!kidsData.lastMood}
                    color="#e9924b"
                  />
                  <ProgressRow
                    label="Play a game"
                    done={!!kidsData.hasPlayedGame}
                    onClick={onNavigate ? () => onNavigate('play') : undefined}
                    color="#7c5cbf"
                  />
                  <ProgressRow
                    label="Read a story"
                    done={!!kidsData.hasReadBook}
                    onClick={onNavigate ? () => onNavigate('learn') : undefined}
                    color="#3a9e7e"
                  />
                </div>

                {/* Streak pill */}
                <div
                  className="mt-6 flex items-center gap-3 px-5 py-3 rounded-2xl"
                  style={{ background: '#fff9e6', border: '2px solid #fbbf2430' }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="text-2xl"
                    aria-hidden="true"
                  >
                    ⭐
                  </motion.span>
                  <div>
                    <p className="font-black text-base" style={{ color: '#b45309' }}>
                      {kidsData.streak ?? 0} day streak!
                    </p>
                    <p className="text-xs font-bold" style={{ color: '#b4530980' }}>
                      Keep coming back every day
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HubZone;