/**
 * ============================================
 * CREATIVE CORNER — KIDS CORNER / PLAY ZONE
 * ============================================
 * @version     3.0.0
 * @updated     2025-04-23
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FreeDrawCanvas from './CreativeCorner/FreeDrawCanvas';
import FeelingsJournal from './CreativeCorner/FeelingsJournal';
import ColoringBook from './CreativeCorner/ColoringBook';

interface GameProps {
  onWin: (icon?: string) => void;
  onBack: () => void;
}

type GameType = 'drawing' | 'journal' | 'coloring' | null;

const spring = { type: 'spring' as const, stiffness: 360, damping: 26 };

const GAMES = [
  { id: 'drawing'  as GameType, emoji: '🖌️', label: 'Free Draw',      tagline: 'Create anything you imagine',  color: '#7c5cbf', bg: '#f3eeff', sticker: '🖌️', badge: 'Most popular!' },
  { id: 'coloring' as GameType, emoji: '🖍️', label: 'Coloring Book',  tagline: 'Color beautiful pictures',     color: '#659ec3', bg: '#edf5fb', sticker: '🖍️' },
  { id: 'journal'  as GameType, emoji: '📔', label: 'My Journal',      tagline: 'Write how you feel today',     color: '#e9924b', bg: '#fff4ec', sticker: '📝' },
];

const GameCard: React.FC<{ game: typeof GAMES[0]; onClick: () => void; index: number }> = ({ game, onClick, index }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...spring, delay: index * 0.07 }}
    whileHover={{ y: -6, scale: 1.02 }}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className="text-left flex flex-col rounded-[2rem] p-7 relative overflow-hidden w-full"
    style={{ background: game.bg, border: `3px solid ${game.color}22`, minHeight: '200px', boxShadow: `0 8px 28px ${game.color}14` }}
    aria-label={`${game.label}: ${game.tagline}`}
  >
    {game.badge && (
      <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: game.color }}>
        {game.badge}
      </div>
    )}
    <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full opacity-15" style={{ background: game.color }} aria-hidden="true" />
    <div className="text-6xl mb-4 select-none" aria-hidden="true">{game.emoji}</div>
    <h3 className="font-black text-xl mb-1" style={{ fontFamily: "'Nunito', sans-serif", color: game.color }}>{game.label}</h3>
    <p className="text-sm font-bold mb-4" style={{ color: `${game.color}80` }}>{game.tagline}</p>
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black w-fit" style={{ background: `${game.color}18`, color: game.color }}>
      <span aria-hidden="true">{game.sticker}</span> Earn a sticker
    </div>
    <div className="absolute bottom-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-base" style={{ background: game.color }} aria-hidden="true">▶</div>
  </motion.button>
);

const CreativeCorner: React.FC<GameProps> = ({ onWin, onBack }) => {
  const [activeGame, setActiveGame] = useState<GameType>(null);

  const handleComplete = (icon?: string) => {
    onWin(icon);
    setTimeout(() => setActiveGame(null), 1800);
  };

  if (activeGame === 'drawing')  return <FreeDrawCanvas  onComplete={handleComplete} onBack={() => setActiveGame(null)} />;
  if (activeGame === 'journal')  return <FeelingsJournal onComplete={handleComplete} onBack={() => setActiveGame(null)} />;
  if (activeGame === 'coloring') return <ColoringBook    onComplete={handleComplete} onBack={() => setActiveGame(null)} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-7">
        <h2 className="font-black text-3xl md:text-4xl mb-1" style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}>
          Create & Draw 🎨
        </h2>
        <p className="font-bold text-base" style={{ color: '#1e3a6e60' }}>Express yourself — there's no wrong way to create!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {GAMES.map((g, i) => <GameCard key={String(g.id)} game={g} onClick={() => setActiveGame(g.id)} index={i} />)}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, ...spring }}
        className="mt-8 rounded-[2rem] p-6" style={{ background: '#ecfaf5', border: '3px solid #3a9e7e20' }}>
        <p className="font-black text-base mb-4" style={{ fontFamily: "'Nunito', sans-serif", color: '#3a9e7e' }}>Why creating feels so good 🌟</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { emoji: '🎨', text: 'Art helps you show feelings you might not have words for yet' },
            { emoji: '🧠', text: "Making something builds confidence — it's your unique creation" },
            { emoji: '✨', text: "Creating is calming. It's a little like magic for your mind" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-2xl select-none flex-shrink-0" aria-hidden="true">{item.emoji}</span>
              <p className="font-bold text-sm leading-relaxed" style={{ color: '#1e3a6e70' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreativeCorner;