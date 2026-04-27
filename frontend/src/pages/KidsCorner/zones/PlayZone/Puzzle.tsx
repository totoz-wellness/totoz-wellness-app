/**
 * ============================================
 * PUZZLE — KIDS CORNER / PLAY ZONE
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 * @description Maze + Word Whiz. Brand colours, large tap targets,
 *              bouncy spring animations, warm child-friendly UI.
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameProps {
  onWin: (icon?: string) => void;
  onBack: () => void;
}

const spring = { type: 'spring' as const, stiffness: 360, damping: 26 };

// ─── SHARED: BACK BUTTON ─────────────────────────────────────────────────────

const BackBtn: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <motion.button
    whileTap={{ scale: 0.94 }}
    onClick={onClick}
    className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-base mb-6"
    style={{ background: '#fff4ec', color: '#e9924b', border: '2.5px solid #e9924b25', fontFamily: "'Nunito', sans-serif" }}
  >
    ← {label}
  </motion.button>
);

// ─── GAME 1: MAZE ─────────────────────────────────────────────────────────────

const MAZE = [
  [2, 0, 1, 0, 0],
  [1, 0, 1, 0, 1],
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 1, 3],
];

const MazeGame: React.FC<{ onWin: (icon?: string) => void }> = ({ onWin }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [shake, setShake] = useState<'x' | 'y' | null>(null);
  const [won, setWon] = useState(false);

  const move = (dx: number, dy: number, axis: 'x' | 'y') => {
    if (won) return;
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (nx < 0 || nx >= 5 || ny < 0 || ny >= 5 || MAZE[ny][nx] === 1) {
      setShake(axis);
      setTimeout(() => setShake(null), 350);
      return;
    }
    setPos({ x: nx, y: ny });
    if (MAZE[ny][nx] === 3) {
      setWon(true);
      setTimeout(() => onWin('🏁'), 700);
    }
  };

  const shakeAnim = shake === 'x'
    ? { x: [-10, 10, -8, 8, 0] }
    : shake === 'y'
    ? { y: [-10, 10, -8, 8, 0] }
    : {};

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring}
      className="flex flex-col items-center max-w-md mx-auto"
    >
      <div
        className="w-full rounded-[2rem] p-6 mb-6"
        style={{ background: '#fff9f0', border: '3px solid #e9924b20', boxShadow: '0 12px 40px #e9924b12' }}
      >
        <p
          className="font-black text-center text-xl mb-5"
          style={{ fontFamily: "'Nunito', sans-serif", color: '#e9924b' }}
        >
          Get 😀 to the 🏁!
        </p>

        <motion.div
          animate={shakeAnim}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-5 gap-2 p-3 rounded-2xl mx-auto"
          style={{ background: '#f0e8dc', width: 'fit-content' }}
        >
          {MAZE.map((row, y) =>
            row.map((cell, x) => {
              const isPlayer = x === pos.x && y === pos.y;
              const isWall = cell === 1;
              const isGoal = cell === 3;
              return (
                <motion.div
                  key={`${x}-${y}`}
                  animate={isPlayer ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black"
                  style={{
                    background: isPlayer ? '#e9924b' : isWall ? '#1e3a6e' : isGoal ? '#fbbf24' : '#fff',
                    boxShadow: isPlayer ? '0 4px 12px #e9924b40' : isWall ? 'none' : '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                >
                  {isPlayer ? '😀' : isGoal ? '🏁' : ''}
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>

      {/* D-pad */}
      <div className="grid grid-cols-3 gap-3" style={{ width: '180px' }}>
        <div />
        <motion.button whileTap={{ scale: 0.88, y: -2 }} onClick={() => move(0, -1, 'y')}
          className="w-16 h-16 rounded-2xl text-2xl font-black flex items-center justify-center"
          style={{ background: '#e9924b', color: '#fff', boxShadow: '0 6px 0 #d4762a' }}>↑</motion.button>
        <div />
        <motion.button whileTap={{ scale: 0.88 }} onClick={() => move(-1, 0, 'x')}
          className="w-16 h-16 rounded-2xl text-2xl font-black flex items-center justify-center"
          style={{ background: '#e9924b', color: '#fff', boxShadow: '0 6px 0 #d4762a' }}>←</motion.button>
        <motion.button whileTap={{ scale: 0.88 }} onClick={() => move(0, 1, 'y')}
          className="w-16 h-16 rounded-2xl text-2xl font-black flex items-center justify-center"
          style={{ background: '#e9924b', color: '#fff', boxShadow: '0 6px 0 #d4762a' }}>↓</motion.button>
        <motion.button whileTap={{ scale: 0.88 }} onClick={() => move(1, 0, 'x')}
          className="w-16 h-16 rounded-2xl text-2xl font-black flex items-center justify-center"
          style={{ background: '#e9924b', color: '#fff', boxShadow: '0 6px 0 #d4762a' }}>→</motion.button>
      </div>

      {won && (
        <motion.p
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring}
          className="font-black text-2xl mt-6"
          style={{ fontFamily: "'Nunito', sans-serif", color: '#e9924b' }}
        >
          You made it! 🎉
        </motion.p>
      )}
    </motion.div>
  );
};

// ─── GAME 2: WORD WHIZ ───────────────────────────────────────────────────────

const WORD_LEVELS = [
  { word: 'CALM',  hint: 'Feeling peaceful and relaxed 😌' },
  { word: 'BRAVE', hint: 'Being strong even when scared 🦁' },
  { word: 'HAPPY', hint: 'Smiling and feeling good ☀️' },
  { word: 'KIND',  hint: 'Being nice and helpful to others 🤝' },
  { word: 'FOCUS', hint: 'Paying attention to one thing 🧠' },
];

interface Letter { char: string; id: number }

const WordPuzzleGame: React.FC<{ onWin: (icon?: string) => void }> = ({ onWin }) => {
  const [levelIdx, setLevelIdx] = useState(0);
  const [pool, setPool] = useState<Letter[]>([]);
  const [answer, setAnswer] = useState<Letter[]>([]);
  const [correct, setCorrect] = useState(false);
  const [shake, setShake] = useState(false);

  const level = WORD_LEVELS[levelIdx];

  const setup = (idx: number) => {
    const letters = WORD_LEVELS[idx].word.split('').map((c, i) => ({ char: c, id: i }));
    setPool([...letters].sort(() => Math.random() - 0.5));
    setAnswer([]);
    setCorrect(false);
    setShake(false);
  };

  useEffect(() => { setup(0); }, []);

  const pick = (l: Letter) => {
    setPool(p => p.filter(x => x.id !== l.id));
    setAnswer(a => [...a, l]);
  };

  const unpick = (l: Letter) => {
    setAnswer(a => a.filter(x => x.id !== l.id));
    setPool(p => [...p, l]);
  };

  const check = () => {
    if (answer.map(l => l.char).join('') === level.word) {
      setCorrect(true);
      const next = levelIdx + 1;
      if (next < WORD_LEVELS.length) {
        setTimeout(() => { setLevelIdx(next); setup(next); }, 1400);
      } else {
        setTimeout(() => onWin('🔤'), 1000);
      }
    } else {
      setShake(true);
      setTimeout(() => { setShake(false); setup(levelIdx); }, 700);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring}
      className="max-w-md mx-auto rounded-[2rem] p-7"
      style={{ background: '#edf5fb', border: '3px solid #659ec320', boxShadow: '0 12px 40px #659ec312' }}
    >
      {/* Level indicator */}
      <div className="flex items-center justify-between mb-5">
        <span className="font-black text-sm uppercase tracking-wider" style={{ color: '#659ec3' }}>
          Word {levelIdx + 1} of {WORD_LEVELS.length}
        </span>
        <div className="flex gap-1.5">
          {WORD_LEVELS.map((_, i) => (
            <div key={i} className="h-2.5 w-7 rounded-full transition-all"
              style={{ background: i <= levelIdx ? '#659ec3' : '#659ec330' }} />
          ))}
        </div>
      </div>

      {correct ? (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring}
          className="flex flex-col items-center py-10 text-center"
        >
          <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }} className="text-7xl mb-3 select-none">🌟</motion.div>
          <p className="font-black text-2xl" style={{ fontFamily: "'Nunito', sans-serif", color: '#659ec3' }}>Correct!</p>
        </motion.div>
      ) : (
        <>
          <p className="font-black text-xl text-center mb-2" style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}>
            Unscramble the word!
          </p>
          <div className="px-4 py-3 rounded-2xl text-center text-sm font-bold mb-6"
            style={{ background: '#fff', color: '#659ec3', border: '2px solid #659ec320' }}>
            {level.hint}
          </div>

          {/* Answer slots */}
          <motion.div
            animate={shake ? { x: [-12, 12, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex justify-center gap-2 mb-5 min-h-[56px]"
          >
            {answer.map(l => (
              <motion.button
                layoutId={`letter-${l.id}`}
                key={l.id}
                whileTap={{ scale: 0.88 }}
                onClick={() => unpick(l)}
                className="w-12 h-12 rounded-xl font-black text-xl text-white flex items-center justify-center"
                style={{ background: '#659ec3', boxShadow: '0 4px 0 #4d87b2' }}
              >
                {l.char}
              </motion.button>
            ))}
            {Array.from({ length: level.word.length - answer.length }).map((_, i) => (
              <div key={i} className="w-12 h-12 rounded-xl border-2 border-dashed"
                style={{ borderColor: '#659ec340', background: '#fff' }} />
            ))}
          </motion.div>

          {/* Letter pool */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 min-h-[56px]">
            <AnimatePresence>
              {pool.map(l => (
                <motion.button
                  layoutId={`letter-${l.id}`}
                  key={l.id}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => pick(l)}
                  className="w-14 h-14 rounded-2xl font-black text-2xl flex items-center justify-center"
                  style={{
                    background: '#fff',
                    color: '#659ec3',
                    border: '2.5px solid #659ec325',
                    boxShadow: '0 5px 0 #659ec330',
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  {l.char}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={answer.length === level.word.length ? { scale: 1.04 } : {}}
            whileTap={answer.length === level.word.length ? { scale: 0.96 } : {}}
            onClick={check}
            disabled={answer.length !== level.word.length}
            className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all"
            style={{
              background: answer.length === level.word.length ? '#659ec3' : '#659ec340',
              boxShadow: answer.length === level.word.length ? '0 8px 24px #659ec330' : 'none',
              cursor: answer.length === level.word.length ? 'pointer' : 'not-allowed',
            }}
          >
            Check my answer!
          </motion.button>

          <AnimatePresence>
            {shake && (
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-center font-black text-base mt-3"
                style={{ color: '#e9924b', fontFamily: "'Nunito', sans-serif" }}>
                Almost! Try again 💪
              </motion.p>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

// ─── GAME CARD ────────────────────────────────────────────────────────────────

const GameCard: React.FC<{
  emoji: string; label: string; tagline: string;
  color: string; bg: string; onClick: () => void; index: number;
}> = ({ emoji, label, tagline, color, bg, onClick, index }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...spring, delay: index * 0.07 }}
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.96 }}
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

const Puzzle: React.FC<GameProps> = ({ onWin, onBack }) => {
  const [activeGame, setActiveGame] = useState<'maze' | 'words' | null>(null);

  if (activeGame === 'maze') return (
    <div>
      <BackBtn onClick={() => setActiveGame(null)} label="Back to puzzles" />
      <MazeGame onWin={onWin} />
    </div>
  );

  if (activeGame === 'words') return (
    <div>
      <BackBtn onClick={() => setActiveGame(null)} label="Back to puzzles" />
      <WordPuzzleGame onWin={onWin} />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-7">
        <h2 className="font-black text-3xl mb-1" style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}>
          Brain Teasers 🧩
        </h2>
        <p className="font-bold text-base" style={{ color: '#1e3a6e60' }}>Pick a puzzle to solve!</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <GameCard emoji="🏁" label="Happy Maze" tagline="Find the way out"
          color="#e9924b" bg="#fff4ec" onClick={() => setActiveGame('maze')} index={0} />
        <GameCard emoji="🔤" label="Word Whiz" tagline="Unscramble feelings"
          color="#659ec3" bg="#edf5fb" onClick={() => setActiveGame('words')} index={1} />
      </div>
    </motion.div>
  );
};

export default Puzzle;