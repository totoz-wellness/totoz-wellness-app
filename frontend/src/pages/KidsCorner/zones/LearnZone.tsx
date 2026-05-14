/**
 * ============================================
 * LEARN ZONE — KIDS CORNER
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 * @description Mood-matched story recommendations + full library.
 *              Large text, page-turn animation, sticker reward on completion.
 *              No typing required. Big tap targets throughout.
 * ============================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KidsData } from '../../../types/kidscorner.types';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Story {
  title: string;
  emoji: string;
  tag: string;
  moodMatch: string[];
  color: string;
  bg: string;
  pages: string[];
}

interface LearnZoneProps {
  kidsData: KidsData;
  onUpdateData?: (newData: Partial<KidsData>) => void;
}

// ─── STORY DATA ───────────────────────────────────────────────────────────────

const STORIES: Story[] = [
  {
    title: 'The Brave Little Bear',
    emoji: '🐻',
    tag: 'being brave',
    moodMatch: ['worried', 'sad'],
    color: '#e9924b',
    bg: '#fff4ec',
    pages: [
      'Benny the Bear was worried about crossing the wobbly log bridge with his friends.',
      "His tummy felt fluttery. He took a big, slow breath — in through his nose, out through his mouth.",
      'He took one step. Then another. His friends cheered every single step!',
      'Benny made it! Being brave just means trying, even when you feel a little scared. 🐾',
    ],
  },
  {
    title: 'The Angry Volcano',
    emoji: '🌋',
    tag: 'calming down',
    moodMatch: ['angry'],
    color: '#d4762a',
    bg: '#fff0e6',
    pages: [
      "Victor the Volcano felt the hot lava bubbling up. Someone took his favourite rock — without asking!",
      'He wanted to ROAR and explode. But he remembered his cooling trick.',
      'Victor counted slowly to ten: 1… 2… 3… and breathed out a big, breezy sigh.',
      'The lava cooled right down. Victor felt calm and proud. He kept his cool! 🌬️',
    ],
  },
  {
    title: 'The Happy Cloud',
    emoji: '☁️',
    tag: 'sharing joy',
    moodMatch: ['happy', 'calm', 'silly'],
    color: '#659ec3',
    bg: '#edf5fb',
    pages: [
      'Chloe the Cloud floated through a bright blue sky, feeling light and happy.',
      'Far below, she spotted a sad little flower drooping in the hot sun.',
      'Chloe floated over and sprinkled a gentle, cool rain shower — just a little one.',
      'The flower perked right up! Chloe learned that sharing happiness makes it grow even bigger. ☀️',
    ],
  },
  {
    title: 'Turtle Takes a Break',
    emoji: '🐢',
    tag: 'feeling overwhelmed',
    moodMatch: ['worried', 'calm'],
    color: '#3a9e7e',
    bg: '#ecfaf5',
    pages: [
      'The forest was SO noisy. Birds, squirrels, wind — Timmy the Turtle felt totally overwhelmed.',
      "Everything was too much! So Timmy did something smart — he pulled into his shell.",
      'Inside, it was quiet and cosy. He took three slow breaths. In… out. In… out. In… out.',
      "When Timmy popped back out, the world felt okay again. Taking a break is always allowed. 🌿",
    ],
  },
  {
    title: 'Super Snail',
    emoji: '🐌',
    tag: 'being patient',
    moodMatch: ['silly', 'angry'],
    color: '#7c5cbf',
    bg: '#f3eeff',
    pages: [
      'Sammy the Snail wanted to reach the juicy red strawberry, but everyone was zooming past him!',
      'The rabbit leaped by. The mouse scurried. Sammy felt frustrated.',
      'But Sammy kept gliding — slow and steady — and noticed the sparkly silver trail he was leaving behind.',
      'He reached the strawberry! Slow and steady wins every time, and the journey is beautiful. 🍓',
    ],
  },
];

// ─── MOOD LABEL MAP ───────────────────────────────────────────────────────────

const MOOD_LABELS: Record<string, string> = {
  happy: 'happy 😊',
  calm: 'calm 😌',
  sad: 'sad 😢',
  angry: 'angry 😡',
  silly: 'silly 🤪',
  worried: 'worried 😟',
};

// ─── SPRING ──────────────────────────────────────────────────────────────────

const spring = { type: 'spring' as const, stiffness: 340, damping: 26 };

// ─── STORY CARD ───────────────────────────────────────────────────────────────

const StoryCard: React.FC<{
  story: Story;
  onClick: () => void;
  index: number;
  isRecommended?: boolean;
}> = ({ story, onClick, index, isRecommended }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...spring, delay: index * 0.06 }}
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className="text-left flex flex-col items-center rounded-[2rem] p-7 relative overflow-hidden w-full"
    style={{
      background: story.bg,
      border: `3px solid ${story.color}22`,
      boxShadow: `0 8px 28px ${story.color}14`,
    }}
    aria-label={`Read "${story.title}" — about ${story.tag}`}
  >
    {isRecommended && (
      <div
        className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black text-white"
        style={{ background: story.color }}
      >
        For you ✨
      </div>
    )}

    {/* Decorative circle */}
    <div
      className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-15"
      style={{ background: story.color }}
      aria-hidden="true"
    />

    <div className="text-6xl mb-4 select-none" aria-hidden="true">{story.emoji}</div>
    <h3
      className="font-black text-xl text-center mb-1 leading-tight"
      style={{ fontFamily: "'Nunito', sans-serif", color: story.color }}
    >
      {story.title}
    </h3>
    <p className="text-sm font-bold text-center mb-5" style={{ color: `${story.color}80` }}>
      A story about {story.tag}
    </p>

    <div
      className="w-full py-3.5 rounded-2xl font-black text-base text-white text-center"
      style={{ background: story.color, boxShadow: `0 6px 18px ${story.color}35` }}
    >
      Read this story
    </div>
  </motion.button>
);

// ─── STORY READER ─────────────────────────────────────────────────────────────

const StoryReader: React.FC<{
  story: Story;
  onClose: () => void;
  onFinish: () => void;
}> = ({ story, onClose, onFinish }) => {
  const [page, setPage] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stickerShown, setStickerShown] = useState(false);

  const total = story.pages.length;
  const isLast = page === total - 1;

  const handleNext = () => {
    if (isLast) {
      setFinished(true);
      if (!stickerShown) {
        onFinish();
        setStickerShown(true);
      }
    } else {
      setPage(p => p + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(30,58,110,0.5)', backdropFilter: 'blur(10px)' }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={spring}
        className="w-full max-w-2xl rounded-[2.5rem] overflow-hidden flex flex-col"
        style={{
          background: '#fff',
          maxHeight: '90vh',
          boxShadow: '0 32px 80px rgba(30,58,110,0.22)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-7 py-5"
          style={{ background: story.bg, borderBottom: `3px solid ${story.color}18` }}
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl select-none" aria-hidden="true">{story.emoji}</span>
            <h2
              className="font-black text-xl leading-tight"
              style={{ fontFamily: "'Nunito', sans-serif", color: story.color }}
            >
              {story.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full flex items-center justify-center font-black text-xl transition-all hover:scale-110"
            style={{ background: `${story.color}18`, color: story.color }}
            aria-label="Close story"
          >
            ✕
          </button>
        </div>

        {/* Story content */}
        <div
          className="flex-1 flex items-center justify-center px-8 py-10 overflow-y-auto"
          style={{ background: `radial-gradient(ellipse at center, ${story.bg} 0%, #fff 100%)` }}
        >
          <AnimatePresence mode="wait">
            {!finished ? (
              <motion.p
                key={page}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ ...spring, stiffness: 300 }}
                className="font-bold text-center leading-relaxed"
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 'clamp(20px, 4vw, 28px)',
                  color: '#1e3a6e',
                  lineHeight: 1.65,
                }}
              >
                {story.pages[page]}
              </motion.p>
            ) : (
              <motion.div
                key="done"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...spring, bounce: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                  className="text-8xl mb-5 select-none"
                  aria-hidden="true"
                >
                  {story.emoji}
                </motion.div>
                <h3
                  className="font-black text-4xl mb-2"
                  style={{ fontFamily: "'Nunito', sans-serif", color: story.color }}
                >
                  The End!
                </h3>
                <p className="font-bold text-lg mb-6" style={{ color: '#1e3a6e80' }}>
                  You finished the whole story!
                </p>
                <div
                  className="flex items-center gap-3 px-6 py-3 rounded-2xl"
                  style={{ background: story.bg, border: `2px solid ${story.color}25` }}
                >
                  <span className="text-3xl" aria-hidden="true">{story.emoji}</span>
                  <span className="font-black text-base" style={{ color: story.color }}>
                    Sticker added to your book!
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer controls */}
        <div
          className="flex items-center justify-between px-7 py-5"
          style={{ borderTop: `2px solid ${story.color}15`, background: '#fff' }}
        >
          {/* Back page */}
          <div className="w-28">
            {page > 0 && !finished && (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-base"
                style={{ background: `${story.color}12`, color: story.color, border: `2px solid ${story.color}20` }}
              >
                ← Back
              </motion.button>
            )}
          </div>

          {/* Page dots */}
          {!finished && (
            <div className="flex items-center gap-2">
              {story.pages.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: i === page ? '28px' : '10px',
                    height: '10px',
                    background: i === page ? story.color : `${story.color}30`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Next / Done */}
          <div className="w-28 flex justify-end">
            {!finished ? (
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-base text-white"
                style={{ background: story.color, boxShadow: `0 6px 18px ${story.color}35` }}
              >
                {isLast ? 'Finish' : 'Next →'}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={onClose}
                className="px-5 py-3 rounded-2xl font-black text-base text-white"
                style={{ background: story.color, boxShadow: `0 6px 18px ${story.color}35` }}
              >
                Done! 🎉
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const LearnZone: React.FC<LearnZoneProps> = ({ kidsData, onUpdateData }) => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [awardedStories, setAwardedStories] = useState<Set<string>>(new Set());

  const handleFinish = (story: Story) => {
    if (awardedStories.has(story.title)) return;
    setAwardedStories(prev => new Set([...prev, story.title]));
    onUpdateData?.({
      stickers: [...(kidsData.stickers ?? []), story.emoji],
      hasReadBook: true,
    });
  };

  const recommended = kidsData.lastMood
    ? STORIES.filter(s => s.moodMatch.includes(kidsData.lastMood!))
    : [];

  const moodLabel = kidsData.lastMood ? MOOD_LABELS[kidsData.lastMood] ?? kidsData.lastMood : '';

  return (
    <div className="pt-3 space-y-10">
      {/* Zone heading */}
      <div>
        <h2
          className="font-black text-3xl md:text-4xl mb-1"
          style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}
        >
          Story Time 📖
        </h2>
        <p className="font-bold text-base" style={{ color: '#1e3a6e60' }}>
          Pick a story and earn a sticker!
        </p>
      </div>

      {/* Mood-matched recommendations */}
      {recommended.length > 0 && (
        <section>
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-5"
            style={{ background: '#fff9f0', border: '2.5px solid #e9924b22' }}
          >
            <span className="text-2xl" aria-hidden="true">💡</span>
            <p className="font-black text-lg" style={{ color: '#e9924b' }}>
              Because you're feeling {moodLabel}…
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {recommended.map((s, i) => (
              <StoryCard
                key={s.title}
                story={s}
                onClick={() => setSelectedStory(s)}
                index={i}
                isRecommended
              />
            ))}
          </div>
        </section>
      )}

      {/* Full library */}
      <section>
        <h3
          className="font-black text-xl mb-5"
          style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}
        >
          All Stories
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {STORIES.map((s, i) => (
            <StoryCard
              key={s.title}
              story={s}
              onClick={() => setSelectedStory(s)}
              index={i}
              isRecommended={false}
            />
          ))}
        </div>
      </section>

      {/* Story reader modal */}
      <AnimatePresence>
        {selectedStory && (
          <StoryReader
            story={selectedStory}
            onClose={() => setSelectedStory(null)}
            onFinish={() => handleFinish(selectedStory)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearnZone;