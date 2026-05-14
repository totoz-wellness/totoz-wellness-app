/**
 * ============================================
 * FEELINGS JOURNAL — CREATIVE CORNER
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 * @description Mood pick → prompt → write → save.
 *              No scary red error messages. Warm brand colours.
 *              10 words minimum to save. Sticker earned on save.
 * ============================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: (icon?: string) => void;
  onBack: () => void;
}

type Mood = 'happy' | 'excited' | 'calm' | 'sad' | 'worried' | 'angry';

const spring = { type: 'spring' as const, stiffness: 360, damping: 26 };

const MOODS: { type: Mood; emoji: string; label: string; color: string; bg: string }[] = [
  { type: 'happy',   emoji: '😊', label: 'Happy',   color: '#e9924b', bg: '#fff4ec' },
  { type: 'excited', emoji: '🤩', label: 'Excited',  color: '#fbbf24', bg: '#fffbeb' },
  { type: 'calm',    emoji: '😌', label: 'Calm',    color: '#3a9e7e', bg: '#ecfaf5' },
  { type: 'sad',     emoji: '😢', label: 'Sad',     color: '#659ec3', bg: '#edf5fb' },
  { type: 'worried', emoji: '😟', label: 'Worried', color: '#7c5cbf', bg: '#f3eeff' },
  { type: 'angry',   emoji: '😠', label: 'Angry',   color: '#d4762a', bg: '#fff0e6' },
];

const PROMPTS = [
  'Today I felt… because…',
  'Something that made me smile today was…',
  "If I could tell my future self one thing, it would be…",
  "I'm grateful for…",
  "A challenge I faced today was…",
  "My favourite moment today was…",
  "Something I learned about myself is…",
  "Tomorrow I want to…",
];

const NEEDED_WORDS = 10;

const FeelingsJournal: React.FC<Props> = ({ onComplete, onBack }) => {
  const [entry, setEntry]             = useState('');
  const [mood, setMood]               = useState<Mood | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);
  const [saved, setSaved]             = useState(false);

  const wordCount = entry.trim().split(/\s+/).filter(w => w.length > 0).length;
  const progress  = Math.min((wordCount / NEEDED_WORDS) * 100, 100);
  const canSave   = wordCount >= NEEDED_WORDS && mood !== null && !saved;

  const moodConfig = MOODS.find(m => m.type === mood);

  const handleSave = () => {
    if (!canSave) return;
    setSaved(true);
    setTimeout(() => onComplete('📝'), 2000);
  };

  const usePrompt = (p: string) => {
    setEntry(p + ' ');
    setShowPrompts(false);
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Back */}
      <motion.button whileTap={{ scale: 0.93 }} onClick={onBack}
        className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-base"
        style={{ background: '#fff4ec', color: '#e9924b', border: '2.5px solid #e9924b20', fontFamily: "'Nunito', sans-serif" }}>
        ← Back to create
      </motion.button>

      {/* Title */}
      <h3 className="font-black text-2xl" style={{ fontFamily: "'Nunito', sans-serif", color: '#e9924b' }}>
        My Secret Journal 📔
      </h3>

      {/* Step 1: Mood */}
      <div className="rounded-[2rem] p-6" style={{ background: '#fff', border: '3px solid #1e3a6e08', boxShadow: '0 8px 28px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-black text-base" style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}>
            Step 1 — How are you feeling?
          </p>
          {mood && <span className="text-xl" aria-label="Done">✅</span>}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {MOODS.map(m => (
            <motion.button
              key={m.type}
              whileHover={{ scale: 1.08, y: -3 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMood(m.type)}
              className="flex flex-col items-center gap-2 py-4 rounded-2xl"
              style={{
                background: mood === m.type ? m.bg : '#f8f8f8',
                border: `2.5px solid ${mood === m.type ? m.color + '40' : 'transparent'}`,
                boxShadow: mood === m.type ? `0 6px 18px ${m.color}25` : 'none',
              }}
              aria-label={`I'm feeling ${m.label}`}
            >
              <span className="text-4xl select-none leading-none" aria-hidden="true">{m.emoji}</span>
              <span className="font-black text-xs" style={{ color: mood === m.type ? m.color : '#1e3a6e60', fontFamily: "'Nunito', sans-serif" }}>
                {m.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Step 2: Prompt */}
      <div className="rounded-[2rem] p-6" style={{ background: '#fff', border: '3px solid #1e3a6e08', boxShadow: '0 8px 28px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="font-black text-base" style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}>
            Step 2 — Need a starting idea?
          </p>
          <motion.button whileTap={{ scale: 0.94 }} onClick={() => setShowPrompts(p => !p)}
            className="px-4 py-2 rounded-2xl font-black text-sm"
            style={{ background: '#7c5cbf18', color: '#7c5cbf' }}>
            {showPrompts ? 'Hide' : 'Show ideas'}
          </motion.button>
        </div>

        <AnimatePresence>
          {showPrompts && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-hidden"
            >
              {PROMPTS.map((p, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => usePrompt(p)}
                  className="text-left px-4 py-3 rounded-2xl font-bold text-sm"
                  style={{ background: '#7c5cbf08', color: '#7c5cbf', border: '2px solid #7c5cbf15', fontFamily: "'Nunito', sans-serif" }}
                >
                  "{p}"
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step 3: Write */}
      <div className="rounded-[2rem] p-6" style={{ background: '#fff', border: '3px solid #1e3a6e08', boxShadow: '0 8px 28px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-black text-base" style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}>
            Step 3 — Start writing!
          </p>
          {wordCount >= NEEDED_WORDS && <span className="text-xl" aria-label="Done">✅</span>}
        </div>

        {/* Progress bar */}
        <div className="rounded-2xl p-4 mb-4"
          style={{ background: moodConfig ? moodConfig.bg : '#fff9f0', border: `2px solid ${moodConfig?.color ?? '#e9924b'}20` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-sm" style={{ color: moodConfig?.color ?? '#e9924b', fontFamily: "'Nunito', sans-serif" }}>
              Writing progress
            </span>
            <span className="font-black text-xs" style={{ color: moodConfig?.color ?? '#e9924b' }}>
              {wordCount}/{NEEDED_WORDS} words
            </span>
          </div>
          <div className="rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.6)', height: '10px' }}>
            <motion.div className="h-full rounded-full" animate={{ width: `${progress}%` }}
              style={{ background: moodConfig?.color ?? '#e9924b' }} transition={spring} />
          </div>
          <p className="font-bold text-xs mt-2" style={{ color: moodConfig?.color ?? '#e9924b' }}>
            {wordCount < NEEDED_WORDS
              ? `Write ${NEEDED_WORDS - wordCount} more word${NEEDED_WORDS - wordCount !== 1 ? 's' : ''} to save`
              : 'Ready to save! 🎉'}
          </p>
        </div>

        <textarea
          value={entry}
          onChange={e => setEntry(e.target.value)}
          placeholder={"Start writing here…\n\nYou can write about:\n• How you're feeling right now\n• Something fun that happened\n• A dream you had\n• Anything on your mind!"}
          rows={8}
          className="w-full px-5 py-4 rounded-2xl font-bold text-base resize-none focus:outline-none"
          style={{
            fontFamily: "'Nunito', sans-serif",
            background: '#fffdf8',
            border: `2.5px solid ${moodConfig?.color ?? '#e9924b'}20`,
            color: '#1e3a6e',
            lineHeight: 1.7,
          }}
        />

        {/* Saved confirmation */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring}
              className="mt-4 px-5 py-4 rounded-2xl text-center font-black text-base"
              style={{ background: '#3a9e7e', color: '#fff' }}
            >
              Saved! Well done for sharing your feelings 🌟 Sticker earned!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 mt-4">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEntry('')}
            className="px-5 py-3 rounded-2xl font-black text-sm"
            style={{ background: '#f8f8f8', color: '#1e3a6e60', border: '2px solid #1e3a6e10' }}>
            Clear
          </motion.button>
          <motion.button
            whileHover={canSave ? { scale: 1.03 } : {}}
            whileTap={canSave ? { scale: 0.96 } : {}}
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 py-3 rounded-2xl font-black text-base text-white"
            style={{
              background: canSave ? (moodConfig?.color ?? '#e9924b') : '#1e3a6e15',
              color: canSave ? '#fff' : '#1e3a6e40',
              boxShadow: canSave ? `0 8px 24px ${moodConfig?.color ?? '#e9924b'}35` : 'none',
              cursor: canSave ? 'pointer' : 'not-allowed',
              fontFamily: "'Nunito', sans-serif",
            }}>
            {saved ? '📔 Saved!' : canSave ? 'Save & earn sticker 📝' : 'Save my entry'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default FeelingsJournal;