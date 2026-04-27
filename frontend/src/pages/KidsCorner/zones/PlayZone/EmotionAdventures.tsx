/**
 * ============================================
 * EMOTION ADVENTURES — KIDS CORNER / PLAY ZONE
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 * @description Scenario-based emotion recognition game.
 *              Large tap targets, warm feedback, brand colours.
 * ============================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameProps {
  onWin: (icon?: string) => void;
  onBack: () => void;
}

const spring = { type: 'spring' as const, stiffness: 360, damping: 26 };

const BackBtn: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <motion.button whileTap={{ scale: 0.93 }} onClick={onClick}
    className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-base mb-6"
    style={{ background: '#edf5fb', color: '#659ec3', border: '2.5px solid #659ec320', fontFamily: "'Nunito', sans-serif" }}>
    ← {label}
  </motion.button>
);

// ─── SCENARIO DATA ────────────────────────────────────────────────────────────

const SCENARIOS = [
  {
    emoji: '🍦',
    question: "Your friend dropped their ice cream on the ground. How do they feel?",
    options: [
      { text: 'Happy',   emoji: '😊', correct: false },
      { text: 'Sad',     emoji: '😢', correct: true  },
      { text: 'Excited', emoji: '🤩', correct: false },
    ],
    feedback: "Yes! Dropping ice cream is really disappointing. Feeling sad makes total sense.",
  },
  {
    emoji: '📝',
    question: "You have a big test tomorrow at school. You might feel…",
    options: [
      { text: 'Nervous', emoji: '😟', correct: true  },
      { text: 'Sleepy',  emoji: '😴', correct: false },
      { text: 'Hungry',  emoji: '😋', correct: false },
    ],
    feedback: "That's right! Tests can make us feel nervous. That's completely normal.",
  },
  {
    emoji: '🎂',
    question: "It's your birthday and all your friends come to celebrate!",
    options: [
      { text: 'Angry',  emoji: '😡', correct: false },
      { text: 'Scared', emoji: '😨', correct: false },
      { text: 'Happy',  emoji: '😊', correct: true  },
    ],
    feedback: "Exactly! Birthdays with friends make us feel happy and loved.",
  },
  {
    emoji: '🌙',
    question: "You hear a loud strange noise at night. You might feel…",
    options: [
      { text: 'Silly',   emoji: '🤪', correct: false },
      { text: 'Scared',  emoji: '😨', correct: true  },
      { text: 'Grateful',emoji: '🥰', correct: false },
    ],
    feedback: "That's right. Strange noises can feel scary. It's okay to feel that way.",
  },
  {
    emoji: '🏅',
    question: "You tried really hard at something and you finally did it! You feel…",
    options: [
      { text: 'Proud',  emoji: '🥹', correct: true  },
      { text: 'Bored',  emoji: '😑', correct: false },
      { text: 'Angry',  emoji: '😡', correct: false },
    ],
    feedback: "Yes! Working hard and succeeding feels amazing — you should be proud!",
  },
];

// ─── SCENARIO GAME ────────────────────────────────────────────────────────────

const ScenarioGame: React.FC<{ onWin: (icon?: string) => void }> = ({ onWin }) => {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [wrong, setWrong] = useState(false);

  const scenario = SCENARIOS[step];

  const handleAnswer = (idx: number) => {
    if (showFeedback) return;
    setSelected(idx);

    if (scenario.options[idx].correct) {
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        setSelected(null);
        setWrong(false);
        const next = step + 1;
        if (next < SCENARIOS.length) setStep(next);
        else onWin('🤔');
      }, 2200);
    } else {
      setWrong(true);
      setTimeout(() => { setSelected(null); setWrong(false); }, 1000);
    }
  };

  const progress = step / SCENARIOS.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring}
      className="max-w-lg mx-auto"
    >
      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 rounded-full overflow-hidden" style={{ background: '#659ec320', height: '10px' }}>
          <motion.div className="h-full rounded-full" animate={{ width: `${progress * 100}%` }}
            style={{ background: '#659ec3' }} transition={spring} />
        </div>
        <span className="font-black text-xs" style={{ color: '#659ec3' }}>
          {step + 1}/{SCENARIOS.length}
        </span>
      </div>

      {/* Card */}
      <div className="rounded-[2rem] p-7"
        style={{ background: '#edf5fb', border: '3px solid #659ec320', boxShadow: '0 12px 40px #659ec312' }}>

        {/* Scenario emoji */}
        <motion.div
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="text-6xl text-center mb-5 select-none"
          aria-hidden="true"
        >
          {scenario.emoji}
        </motion.div>

        {/* Question */}
        <p className="font-black text-xl text-center mb-7 leading-snug"
          style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}>
          {scenario.question}
        </p>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {scenario.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = opt.correct && isSelected && showFeedback;
            const isWrong = isSelected && wrong;

            return (
              <motion.button
                key={i}
                whileHover={!showFeedback ? { scale: 1.04, y: -3 } : {}}
                whileTap={!showFeedback ? { scale: 0.94 } : {}}
                animate={isWrong ? { x: [-8, 8, -6, 6, 0] } : {}}
                transition={isWrong ? { duration: 0.4 } : spring}
                onClick={() => handleAnswer(i)}
                className="flex flex-col items-center gap-2 py-5 px-4 rounded-2xl font-black text-base"
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  background: isCorrect ? '#3a9e7e' : isWrong ? '#e9924b' : '#fff',
                  color: isCorrect || isWrong ? '#fff' : '#659ec3',
                  border: `3px solid ${isCorrect ? '#3a9e7e' : isWrong ? '#e9924b' : '#659ec325'}`,
                  boxShadow: isCorrect ? '0 8px 24px #3a9e7e35' : isWrong ? '0 8px 24px #e9924b35' : '0 4px 14px rgba(0,0,0,0.06)',
                  cursor: showFeedback ? 'default' : 'pointer',
                }}
              >
                <span className="text-3xl select-none" aria-hidden="true">{opt.emoji}</span>
                {opt.text}
              </motion.button>
            );
          })}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={spring}
              className="px-5 py-4 rounded-2xl text-center"
              style={{ background: '#3a9e7e', color: '#fff' }}
            >
              <p className="font-black text-base" style={{ fontFamily: "'Nunito', sans-serif" }}>
                ✅ {scenario.feedback}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {wrong && !showFeedback && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center font-black text-base mt-3"
              style={{ color: '#e9924b', fontFamily: "'Nunito', sans-serif" }}
            >
              Hmm, try again! 💪
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ─── GAME CARD ────────────────────────────────────────────────────────────────

const GameCard: React.FC<{
  emoji: string; label: string; tagline: string;
  color: string; bg: string; onClick: () => void; index: number;
}> = ({ emoji, label, tagline, color, bg, onClick, index }) => (
  <motion.button
    initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
    transition={{ ...spring, delay: index * 0.07 }}
    whileHover={{ y: -5, scale: 1.02 }} whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className="text-left flex flex-col rounded-[2rem] p-7 relative overflow-hidden"
    style={{ background: bg, border: `3px solid ${color}22`, minHeight: '180px', boxShadow: `0 8px 28px ${color}14` }}
  >
    <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full opacity-15" style={{ background: color }} aria-hidden="true" />
    <div className="text-6xl mb-4 select-none" aria-hidden="true">{emoji}</div>
    <h3 className="font-black text-xl mb-1" style={{ fontFamily: "'Nunito', sans-serif", color }}>{label}</h3>
    <p className="text-sm font-bold" style={{ color: `${color}80` }}>{tagline}</p>
    <div className="absolute bottom-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-white text-base font-black"
      style={{ background: color }} aria-hidden="true">▶</div>
  </motion.button>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const EmotionAdventures: React.FC<GameProps> = ({ onWin, onBack }) => {
  const [activeGame, setActiveGame] = useState<'scenarios' | null>(null);

  if (activeGame === 'scenarios') return (
    <div>
      <BackBtn onClick={() => setActiveGame(null)} label="Back to feelings" />
      <ScenarioGame onWin={onWin} />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-7">
        <h2 className="font-black text-3xl mb-1" style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}>
          Feelings World 🎭
        </h2>
        <p className="font-bold text-base" style={{ color: '#1e3a6e60' }}>
          Learn about emotions
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <GameCard emoji="🤔" label="What would you do?" tagline="Guess how people feel"
          color="#659ec3" bg="#edf5fb" onClick={() => setActiveGame('scenarios')} index={0} />
      </div>
    </motion.div>
  );
};

export default EmotionAdventures;