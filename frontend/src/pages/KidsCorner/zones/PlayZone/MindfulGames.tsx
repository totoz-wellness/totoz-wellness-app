/**
 * ============================================
 * MINDFUL GAMES — KIDS CORNER / PLAY ZONE
 * ============================================
 * @version     3.0.0
 * @updated     2025-04-23
 *
 * DESIGN PHILOSOPHY:
 * These are not games. They are emotion regulation experiences
 * disguised as gentle interactions. Every animation, every color
 * transition, every piece of copy is intentional.
 *
 * Three experiences:
 *   🌿 Guided Breathing  → press-hold inhale / release exhale
 *   💧 Calm Space        → ambient environment, no win condition
 *   🎨 How I Feel        → emotion → full-screen colour flood
 * ============================================
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameProps {
  onWin: (icon?: string) => void;
  onBack: () => void;
}

// ─── EASING ──────────────────────────────────────────────────────────────────

const SLOW = { ease: [0.4, 0, 0.2, 1] as const };
const BREATH = { ease: 'easeInOut' as const };

// ─── BACK BUTTON ─────────────────────────────────────────────────────────────

const BackBtn: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <motion.button
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm mb-8 w-fit"
    style={{ background: '#ecfaf5', color: '#3a9e7e', border: '2px solid #3a9e7e18', fontFamily: "'Nunito', sans-serif" }}
    aria-label="Go back"
  >
    ← Back
  </motion.button>
);

// ─── EXPERIENCE 1: GUIDED BREATHING ──────────────────────────────────────────
//
// Press and hold  → inhale  (circle expands, colour shifts)
// Release         → hold briefly → exhale (contracts back)
//
// No tapping. No score. No visible win counter.
// onWin fires after 5 full cycles but this is NOT the point —
// the breathing itself is the entire value.

const INHALE_DUR = 4.5;
const HOLD_DUR   = 1.5;
const EXHALE_DUR = 5.0;

type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

const PHASE_COPY: Record<BreathPhase, string> = {
  idle:   'Press and hold to breathe in',
  inhale: 'Breathe in slowly…',
  hold:   'Hold gently…',
  exhale: 'Let it all go…',
};

const PHASE_COLOR: Record<BreathPhase, string> = {
  idle:   '#3a9e7e',
  inhale: '#659ec3',
  hold:   '#7c5cbf',
  exhale: '#3a9e7e',
};

const PHASE_SCALE: Record<BreathPhase, number> = {
  idle:   0.55,
  inhale: 1.0,
  hold:   1.0,
  exhale: 0.55,
};

const GuidedBreathing: React.FC<{ onWin: (icon?: string) => void }> = ({ onWin }) => {
  const [phase, setPhase]    = useState<BreathPhase>('idle');
  const [cycles, setCycles]  = useState(0);
  const [holding, setHolding] = useState(false);
  const holdTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exhaleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleRef   = useRef(0);
  const winFired   = useRef(false);
  const CYCLES_NEEDED = 5;
  const PRAISE_AT     = 3;

  const clear = () => {
    if (holdTimer.current)  clearTimeout(holdTimer.current);
    if (exhaleTimer.current) clearTimeout(exhaleTimer.current);
  };

  useEffect(() => () => clear(), []);

  const startInhale = useCallback(() => {
    if (phase === 'inhale' || phase === 'hold') return;
    clear();
    setPhase('inhale');
    setHolding(true);
  }, [phase]);

  const startExhale = useCallback(() => {
    if (!holding) return;
    setHolding(false);
    clear();
    setPhase('hold');

    holdTimer.current = setTimeout(() => {
      setPhase('exhale');
      exhaleTimer.current = setTimeout(() => {
        setPhase('idle');
        cycleRef.current += 1;
        setCycles(cycleRef.current);
        if (cycleRef.current >= CYCLES_NEEDED && !winFired.current) {
          winFired.current = true;
          setTimeout(() => onWin('🎈'), 600);
        }
      }, EXHALE_DUR * 1000);
    }, HOLD_DUR * 1000);
  }, [holding, onWin]);

  const color = PHASE_COLOR[phase];
  const scale = PHASE_SCALE[phase];
  const copy  = PHASE_COPY[phase];
  const dur   = phase === 'inhale' ? INHALE_DUR : phase === 'exhale' ? EXHALE_DUR : HOLD_DUR;
  const done  = cycles >= CYCLES_NEEDED;

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto select-none pb-6">

      {/* Concentric ambient rings */}
      <div className="relative flex items-center justify-center mb-10" style={{ width: 280, height: 280 }}>

        <motion.div className="absolute rounded-full"
          animate={{ scale: phase === 'inhale' ? 1.35 : 0.85, opacity: phase === 'idle' ? 0.04 : 0.08 }}
          transition={{ duration: dur * 1.15, ...BREATH }}
          style={{ width: 260, height: 260, background: color, borderRadius: '50%' }}
          aria-hidden="true" />

        <motion.div className="absolute rounded-full"
          animate={{ scale: phase === 'inhale' ? 1.18 : 0.9, opacity: phase === 'idle' ? 0.08 : 0.15 }}
          transition={{ duration: dur * 1.05, ...BREATH }}
          style={{ width: 220, height: 220, background: color, borderRadius: '50%' }}
          aria-hidden="true" />

        {/* Main interactive circle */}
        <motion.button
          onPointerDown={startInhale}
          onPointerUp={startExhale}
          onPointerLeave={startExhale}
          animate={{ scale, backgroundColor: color }}
          transition={{ duration: dur, ...BREATH }}
          className="absolute rounded-full z-10"
          style={{
            width: 160, height: 160,
            boxShadow: `0 0 60px ${color}50, 0 0 20px ${color}30`,
            border: '3px solid rgba(255,255,255,0.25)',
            cursor: 'pointer',
          }}
          aria-label="Press and hold to breathe in, release to breathe out"
          disabled={done}
        >
          <div className="absolute top-5 left-7 w-6 h-6 rounded-full bg-white opacity-25" aria-hidden="true" />
        </motion.button>
      </div>

      {/* Phase copy */}
      <motion.p
        key={phase}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ...SLOW }}
        className="font-black text-xl text-center mb-4"
        style={{ fontFamily: "'Nunito', sans-serif", color }}
      >
        {done ? 'Beautiful. Well done.' : copy}
      </motion.p>

      {/* Cycle dots — shown subtly, not as a score */}
      <div className="flex items-center gap-2 mt-1">
        {Array.from({ length: CYCLES_NEEDED }).map((_, i) => (
          <motion.div key={i}
            animate={{ scale: i < cycles ? 1 : 0.65, opacity: i < cycles ? 1 : 0.25 }}
            transition={{ duration: 0.4, ...SLOW }}
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: i < cycles ? color : '#1e3a6e' }}
          />
        ))}
      </div>

      <AnimatePresence>
        {cycles >= PRAISE_AT && !done && (
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ...SLOW }}
            className="font-bold text-sm text-center mt-5"
            style={{ color: '#3a9e7e', fontFamily: "'Nunito', sans-serif" }}>
            You're doing really well. Keep going.
          </motion.p>
        )}
      </AnimatePresence>

      <p className="font-bold text-xs text-center mt-8 px-4" style={{ color: '#1e3a6e25', fontFamily: "'Nunito', sans-serif" }}>
        Press and hold to breathe in · Release to breathe out
      </p>
    </div>
  );
};

// ─── EXPERIENCE 2: CALM SPACE ─────────────────────────────────────────────────
//
// A place, not an activity. One slow fish. Wide slow ripples.
// One centred affirmation at a time — never positional spam.
// No win counter shown. onWin fires after 60s of presence.

const AFFIRMATIONS = [
  'You are safe here.',
  'Take your time.',
  'Breathe slowly.',
  'This moment is yours.',
  'You are enough.',
  'Peace is always close.',
  'Let your thoughts float by.',
];

interface Ripple { id: number; x: number; y: number }

const CalmSpace: React.FC<{ onWin: (icon?: string) => void }> = ({ onWin }) => {
  const spaceRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const nextId    = useRef(0);
  const affIdx    = useRef(0);
  const lastAff   = useRef(0);
  const winFired  = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!winFired.current) { winFired.current = true; onWin('🌸'); }
    }, 60_000);
    return () => clearTimeout(t);
  }, [onWin]);

  const handleTouch = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const el = spaceRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const cy = 'touches' in e ? e.touches[0].clientY - rect.top  : (e as React.MouseEvent).clientY - rect.top;

    const id = nextId.current++;
    // Max 2 ripples at once — calm, not chaotic
    setRipples(r => [...r.slice(-1), { id, x: cx, y: cy }]);
    setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 4000);

    const now = Date.now();
    if (now - lastAff.current > 5000) {
      lastAff.current = now;
      const text = AFFIRMATIONS[affIdx.current % AFFIRMATIONS.length];
      affIdx.current++;
      setAffirmation(text);
      setTimeout(() => setAffirmation(null), 3500);
    }
  }, []);

  return (
    <div className="max-w-lg mx-auto">
      <div
        ref={spaceRef}
        onClick={handleTouch}
        onTouchStart={handleTouch}
        className="relative rounded-[2.5rem] overflow-hidden select-none"
        style={{
          height: '360px',
          background: 'linear-gradient(160deg, #0e4d42 0%, #0a3530 60%, #071e1a 100%)',
          cursor: 'default',
          boxShadow: '0 20px 60px rgba(10,53,48,0.4)',
        }}
        role="img"
        aria-label="A calm space — touch gently to create ripples"
      >
        {/* Ambient shimmer */}
        <motion.div className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.06, 0.13, 0.06] }}
          transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(ellipse at 40% 35%, #4ec9b8 0%, transparent 65%)' }}
          aria-hidden="true" />

        {/* Single fish — very slow */}
        <motion.div className="absolute text-2xl select-none pointer-events-none" style={{ top: '44%' }}
          animate={{ x: ['4%', '74%', '4%'] }}
          transition={{ repeat: Infinity, duration: 24, ease: 'easeInOut' }}
          aria-hidden="true">🐠</motion.div>

        {/* Wide, slow ripples */}
        <AnimatePresence>
          {ripples.map(r => (
            <motion.div key={r.id}
              className="absolute rounded-full pointer-events-none"
              style={{ left: r.x, top: r.y, border: '1.5px solid rgba(255,255,255,0.16)' }}
              initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.55 }}
              animate={{ width: 280, height: 280, x: -140, y: -140, opacity: 0 }}
              exit={{}}
              transition={{ duration: 4.2, ease: 'easeOut' }} />
          ))}
        </AnimatePresence>

        {/* Single centred affirmation */}
        <AnimatePresence>
          {affirmation && (
            <motion.div key={affirmation}
              className="absolute inset-0 flex items-center justify-center pointer-events-none px-8"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}>
              <p className="text-center font-black text-lg"
                style={{ fontFamily: "'Nunito', sans-serif", color: 'rgba(255,255,255,0.82)', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                {affirmation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Initial nudge — disappears after first touch */}
        {ripples.length === 0 && (
          <motion.p
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            className="absolute bottom-7 left-0 right-0 text-center text-xs font-bold pointer-events-none"
            style={{ color: 'rgba(255,255,255,0.38)', fontFamily: "'Nunito', sans-serif", letterSpacing: '0.05em' }}>
            Touch gently
          </motion.p>
        )}
      </div>

      <p className="text-center font-bold text-xs mt-4" style={{ color: '#1e3a6e28', fontFamily: "'Nunito', sans-serif" }}>
        Stay as long as you like. There is no rush.
      </p>
    </div>
  );
};

// ─── EXPERIENCE 3: EMOTION COLOR ─────────────────────────────────────────────
//
// Child picks a feeling. The screen slowly floods with that feeling's colour.
// A gentle sentence acknowledges it — no judgement, no advice.
// No right answer. No score. onWin fires to reward naming a feeling.

const EMOTIONS = [
  { emoji: '😊', label: 'Happy',   color: '#fbbf24', gradient: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 60%, #f59e0b 100%)', message: "Happiness feels warm and bright. That's wonderful." },
  { emoji: '😌', label: 'Calm',    color: '#3a9e7e', gradient: 'linear-gradient(135deg, #a7f3d0 0%, #3a9e7e 60%, #065f46 100%)', message: "Calm is a superpower. You carry it inside you." },
  { emoji: '😢', label: 'Sad',     color: '#659ec3', gradient: 'linear-gradient(135deg, #bae6fd 0%, #659ec3 60%, #1e3a6e 100%)', message: "Feeling sad is okay. All feelings are allowed here." },
  { emoji: '😟', label: 'Worried', color: '#7c5cbf', gradient: 'linear-gradient(135deg, #ddd6fe 0%, #7c5cbf 60%, #4c1d95 100%)', message: "Worries feel heavy. You don't have to carry them alone." },
  { emoji: '😡', label: 'Angry',   color: '#e9924b', gradient: 'linear-gradient(135deg, #fed7aa 0%, #e9924b 60%, #c2410c 100%)', message: "Anger is energy. It's okay to feel it. Let it move through you." },
  { emoji: '🤩', label: 'Excited', color: '#ec4899', gradient: 'linear-gradient(135deg, #fbcfe8 0%, #ec4899 60%, #9d174d 100%)', message: "Excitement is electric! Something good is coming." },
];

const EmotionColor: React.FC<{ onWin: (icon?: string) => void }> = ({ onWin }) => {
  const [chosen, setChosen]   = useState<typeof EMOTIONS[0] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const winFired = useRef(false);

  const handlePick = (e: typeof EMOTIONS[0]) => {
    setChosen(e);
    setTimeout(() => {
      setRevealed(true);
      if (!winFired.current) {
        winFired.current = true;
        setTimeout(() => onWin('🎨'), 3000);
      }
    }, 1500);
  };

  const reset = () => { setChosen(null); setRevealed(false); winFired.current = false; };

  return (
    <div className="max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {!chosen ? (
          <motion.div key="picker"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ...SLOW }}>
            <p className="font-black text-xl text-center mb-8"
              style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}>
              How are you feeling right now?
            </p>
            <div className="grid grid-cols-3 gap-4">
              {EMOTIONS.map((e, i) => (
                <motion.button key={e.label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.07, ...SLOW }}
                  whileHover={{ scale: 1.06, y: -3 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handlePick(e)}
                  className="flex flex-col items-center gap-2 py-6 rounded-[1.75rem]"
                  style={{ background: `${e.color}12`, border: `2px solid ${e.color}25`, boxShadow: `0 4px 16px ${e.color}10` }}
                  aria-label={`I'm feeling ${e.label}`}>
                  <span className="text-4xl leading-none select-none" aria-hidden="true">{e.emoji}</span>
                  <span className="font-black text-xs" style={{ color: e.color, fontFamily: "'Nunito', sans-serif" }}>{e.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="fill"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center"
            style={{ minHeight: '380px' }}>

            {/* Colour flood — rises from bottom */}
            <motion.div className="absolute inset-0 rounded-[2.5rem]"
              initial={{ scaleY: 0, originY: 1 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: chosen.gradient }}
              aria-hidden="true" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-6 px-8 py-10 text-center">
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6, type: 'spring', stiffness: 200, damping: 18 }}
                className="text-7xl select-none" aria-hidden="true">
                {chosen.emoji}
              </motion.div>

              <AnimatePresence>
                {revealed && (
                  <motion.p
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ...SLOW }}
                    className="font-black text-lg leading-relaxed"
                    style={{ fontFamily: "'Nunito', sans-serif", color: 'rgba(255,255,255,0.92)', textShadow: '0 2px 12px rgba(0,0,0,0.25)', maxWidth: '280px' }}>
                    {chosen.message}
                  </motion.p>
                )}
              </AnimatePresence>

              {revealed && (
                <motion.button
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 2.5, duration: 0.6 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={reset}
                  className="px-6 py-2.5 rounded-2xl font-black text-sm"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.28)', fontFamily: "'Nunito', sans-serif", backdropFilter: 'blur(4px)' }}>
                  Choose another feeling
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── SECTION CARD ─────────────────────────────────────────────────────────────

const SectionCard: React.FC<{
  icon: string; label: string; description: string;
  color: string; bg: string; onClick: () => void; index: number;
}> = ({ icon, label, description, color, bg, onClick, index }) => (
  <motion.button
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.08, ...SLOW }}
    whileHover={{ y: -3, scale: 1.01 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="text-left flex items-center gap-5 rounded-[2rem] p-6 relative overflow-hidden w-full"
    style={{ background: bg, border: `2px solid ${color}18`, boxShadow: `0 6px 24px ${color}10` }}
    aria-label={`${label}: ${description}`}
  >
    <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-10" style={{ background: color }} aria-hidden="true" />
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: `${color}15` }} aria-hidden="true">{icon}</div>
    <div className="flex-1 min-w-0">
      <h3 className="font-black text-lg leading-tight mb-1" style={{ fontFamily: "'Nunito', sans-serif", color }}>{label}</h3>
      <p className="font-bold text-sm leading-relaxed" style={{ color: `${color}70` }}>{description}</p>
    </div>
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0" style={{ background: color }} aria-hidden="true">→</div>
  </motion.button>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────

type Experience = 'breathing' | 'calmspace' | 'emotioncolor' | null;

const MindfulGames: React.FC<GameProps> = ({ onWin, onBack }) => {
  const [active, setActive] = useState<Experience>(null);
  const back = () => setActive(null);

  if (active === 'breathing') return (
    <div>
      <BackBtn onClick={back} />
      <div className="mb-8">
        <h2 className="font-black text-2xl mb-1" style={{ fontFamily: "'Nunito', sans-serif", color: '#3a9e7e' }}>🌿 Guided Breathing</h2>
        <p className="font-bold text-sm" style={{ color: '#1e3a6e45' }}>Press and hold to breathe in. Release to breathe out.</p>
      </div>
      <GuidedBreathing onWin={onWin} />
    </div>
  );

  if (active === 'calmspace') return (
    <div>
      <BackBtn onClick={back} />
      <div className="mb-8">
        <h2 className="font-black text-2xl mb-1" style={{ fontFamily: "'Nunito', sans-serif", color: '#659ec3' }}>💧 Calm Space</h2>
        <p className="font-bold text-sm" style={{ color: '#1e3a6e45' }}>A quiet place just for you. Touch gently if you like.</p>
      </div>
      <CalmSpace onWin={onWin} />
    </div>
  );

  if (active === 'emotioncolor') return (
    <div>
      <BackBtn onClick={back} />
      <div className="mb-8">
        <h2 className="font-black text-2xl mb-1" style={{ fontFamily: "'Nunito', sans-serif", color: '#e9924b' }}>🎨 How I Feel</h2>
        <p className="font-bold text-sm" style={{ color: '#1e3a6e45' }}>Pick a feeling. Watch it colour your world.</p>
      </div>
      <EmotionColor onWin={onWin} />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h2 className="font-black text-3xl md:text-4xl mb-1" style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}>
          Calm Down 🌿
        </h2>
        <p className="font-bold text-base" style={{ color: '#1e3a6e45' }}>
          These aren't games. They're quiet places for you.
        </p>
      </div>

      <div className="space-y-4">
        <SectionCard icon="🫁" label="Guided Breathing" description="Press and hold to breathe in. Release to breathe out. Stay as long as you need."
          color="#3a9e7e" bg="#ecfaf5" onClick={() => setActive('breathing')} index={0} />
        <SectionCard icon="💧" label="Calm Space" description="A quiet place with gentle ripples and soft words. There's nothing to do here but rest."
          color="#659ec3" bg="#edf5fb" onClick={() => setActive('calmspace')} index={1} />
        <SectionCard icon="🎨" label="How I Feel" description="Pick a feeling and watch your whole world fill with its colour. All feelings are welcome."
          color="#e9924b" bg="#fff4ec" onClick={() => setActive('emotioncolor')} index={2} />
      </div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
        className="text-center font-bold text-xs mt-10" style={{ color: '#1e3a6e20', fontFamily: "'Nunito', sans-serif" }}>
        Take your time. There is no rush here.
      </motion.p>
    </motion.div>
  );
};

export default MindfulGames;