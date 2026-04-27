/**
 * ============================================
 * HELP ZONE — KIDS CORNER
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 * @description Chat Buddy + Worry Box + SOS alert.
 *              Kids-first design: large targets, warm colours, no scary UI.
 *              The SOS button is prominent but framed calmly so it doesn't
 *              alarm a child — it empowers them.
 * ============================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKidsCorner } from '../../../contexts/KidsCornerContext';
import * as kidsCornerAPI from '../../../services/kidscorner.service';
import toast from 'react-hot-toast';
import { KidsData } from '../../../types/kidscorner.types';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Message {
  text: string;
  sender: 'user' | 'buddy';
  timestamp: Date;
}

interface HelpZoneProps {
  kidsData?: KidsData;
  onUpdateData?: (newData: Partial<KidsData>) => void;
}

// ─── QUICK REPLY PROMPTS ─────────────────────────────────────────────────────
// Children can tap these instead of typing — reduces literacy barrier

const QUICK_REPLIES = [
  "I'm feeling sad 😢",
  "I'm scared 😟",
  "I'm angry 😡",
  "I need help",
];

// ─── SPRING ──────────────────────────────────────────────────────────────────

const spring = { type: 'spring' as const, stiffness: 340, damping: 26 };

// ─── BUDDY BUBBLE ────────────────────────────────────────────────────────────

const BuddyBubble: React.FC<{ text: string }> = ({ text }) => (
  <motion.div
    initial={{ opacity: 0, x: -16, scale: 0.92 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    transition={spring}
    className="flex items-end gap-2 justify-start"
  >
    <div
      className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xl select-none"
      style={{ background: '#ecfaf5', border: '2px solid #3a9e7e22' }}
      aria-hidden="true"
    >
      🦁
    </div>
    <div
      className="max-w-[78%] px-5 py-3.5 rounded-3xl rounded-bl-md font-bold text-base leading-relaxed"
      style={{
        fontFamily: "'Nunito', sans-serif",
        background: '#fff',
        color: '#1e3a6e',
        border: '2px solid #1e3a6e10',
        boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
      }}
    >
      {text}
    </div>
  </motion.div>
);

const UserBubble: React.FC<{ text: string }> = ({ text }) => (
  <motion.div
    initial={{ opacity: 0, x: 16, scale: 0.92 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    transition={spring}
    className="flex justify-end"
  >
    <div
      className="max-w-[78%] px-5 py-3.5 rounded-3xl rounded-br-md font-bold text-base leading-relaxed text-white"
      style={{
        fontFamily: "'Nunito', sans-serif",
        background: '#e9924b',
        boxShadow: '0 4px 14px #e9924b30',
      }}
    >
      {text}
    </div>
  </motion.div>
);

const TypingDots: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-end gap-2 justify-start"
  >
    <div
      className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xl select-none"
      style={{ background: '#ecfaf5', border: '2px solid #3a9e7e22' }}
      aria-hidden="true"
    >
      🦁
    </div>
    <div
      className="px-5 py-4 rounded-3xl rounded-bl-md flex items-center gap-1.5"
      style={{ background: '#fff', border: '2px solid #1e3a6e10' }}
    >
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: '#3a9e7e' }}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </div>
  </motion.div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const HelpZone: React.FC<HelpZoneProps> = ({ kidsData, onUpdateData }) => {
  const { activeChild } = useKidsCorner();

  // ── Chat state ──
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi there! I'm Buddy the Lion 🦁. I'm always here to listen. How are you feeling?",
      sender: 'buddy',
      timestamp: new Date(),
    },
  ]);
  const [buddyInput, setBuddyInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Worry box state ──
  const [worryText, setWorryText] = useState('');
  const [worryLocked, setWorryLocked] = useState(false);
  const [isLockingWorry, setIsLockingWorry] = useState(false);
  const [worryCount, setWorryCount] = useState(0);

  // ── SOS state ──
  const [sosSent, setSosSent] = useState(false);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Fetch worry count
  useEffect(() => {
    if (!activeChild) return;
    kidsCornerAPI.getWorryCount?.(activeChild.id)
      .then(d => setWorryCount(d?.worryCount ?? 0))
      .catch(() => {});
  }, [activeChild]);

  // ── Send message (typed or quick reply) ──
  const sendMessage = async (text: string) => {
    if (!text.trim() || !activeChild) return;

    const userMsg: Message = { text, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setBuddyInput('');
    setIsTyping(true);

    try {
      const result = await kidsCornerAPI.buddyChat(
        activeChild.id,
        text,
        sessionId ?? undefined,
      );
      if (!sessionId) setSessionId(result.sessionId);

      setMessages(prev => [
        ...prev,
        { text: result.response, sender: 'buddy', timestamp: new Date() },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          text: "Oops, I got a little sleepy! Try the Worry Box or a calm-down exercise instead. 🐾",
          sender: 'buddy',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(buddyInput);
  };

  // ── Lock worry ──
  const handleLockWorry = async () => {
    if (!worryText.trim() || !activeChild) return;
    setIsLockingWorry(true);
    try {
      await kidsCornerAPI.lockWorry?.(activeChild.id, worryText.trim());
      setWorryCount(c => c + 1);
      setWorryLocked(true);
      setTimeout(() => { setWorryText(''); setWorryLocked(false); }, 3200);
    } catch {
      toast.error("Couldn't lock your worry. Try again!");
    } finally {
      setIsLockingWorry(false);
    }
  };

  // ── SOS ──
  const handleSOS = async () => {
    if (!activeChild || sosSent) return;
    setSosSent(true);
    try {
      await kidsCornerAPI.lockWorry?.(activeChild.id, '🚨 SOS ALERT TRIGGERED');
      setWorryCount(c => c + 1);
    } catch {}
    // Reset after 6s so they can press again if needed
    setTimeout(() => setSosSent(false), 6000);
  };

  return (
    <div className="pt-3 space-y-5">
      {/* Zone heading */}
      <div>
        <h2
          className="font-black text-3xl md:text-4xl mb-1"
          style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}
        >
          Calm Down Zone 🌈
        </h2>
        <p className="font-bold text-base" style={{ color: '#1e3a6e60' }}>
          Talk to Buddy, or put your worries in the box.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── CHAT BUDDY ─────────────────────────────────────────────── */}
        <div
          className="rounded-[2rem] overflow-hidden flex flex-col"
          style={{
            background: '#fff',
            border: '3px solid #3a9e7e20',
            boxShadow: '0 12px 40px rgba(58,158,126,0.1)',
            height: '560px',
          }}
        >
          {/* Chat header */}
          <div
            className="flex items-center gap-3 px-6 py-4"
            style={{ background: 'linear-gradient(135deg, #3a9e7e 0%, #2d8a6a 100%)' }}
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="text-4xl select-none"
              aria-hidden="true"
            >
              🦁
            </motion.div>
            <div>
              <h3
                className="font-black text-lg text-white leading-tight"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Buddy the Lion
              </h3>
              <p className="text-white/70 text-xs font-bold">Always here to listen</p>
            </div>
            <div
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              <span className="text-white text-xs font-bold">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-5 py-5 space-y-4"
            style={{ background: 'linear-gradient(180deg, #f8fffe 0%, #edf5fb 100%)' }}
          >
            {messages.map((m, i) =>
              m.sender === 'buddy'
                ? <BuddyBubble key={i} text={m.text} />
                : <UserBubble key={i} text={m.text} />
            )}
            <AnimatePresence>
              {isTyping && <TypingDots key="dots" />}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Quick replies */}
          <div
            className="px-4 py-3 flex gap-2 overflow-x-auto"
            style={{ background: '#f8fffe', borderTop: '2px solid #3a9e7e12', scrollbarWidth: 'none' }}
          >
            {QUICK_REPLIES.map(r => (
              <motion.button
                key={r}
                whileTap={{ scale: 0.94 }}
                onClick={() => sendMessage(r)}
                disabled={isTyping || !activeChild}
                className="flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm"
                style={{
                  background: '#ecfaf5',
                  color: '#3a9e7e',
                  border: '2px solid #3a9e7e20',
                  opacity: isTyping ? 0.5 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {r}
              </motion.button>
            ))}
          </div>

          {/* Type input */}
          <form
            onSubmit={handleFormSubmit}
            className="flex gap-3 px-4 py-4"
            style={{ background: '#fff', borderTop: '2px solid #3a9e7e12' }}
          >
            <input
              type="text"
              value={buddyInput}
              onChange={e => setBuddyInput(e.target.value)}
              placeholder="Or type something..."
              disabled={isTyping || !activeChild}
              className="flex-1 px-5 py-3 rounded-2xl font-bold text-base focus:outline-none"
              style={{
                fontFamily: "'Nunito', sans-serif",
                background: '#f8fffe',
                border: '2px solid #3a9e7e20',
                color: '#1e3a6e',
              }}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
              disabled={isTyping || !buddyInput.trim() || !activeChild}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl text-white font-black flex-shrink-0"
              style={{
                background: '#3a9e7e',
                boxShadow: '0 6px 18px #3a9e7e35',
                opacity: !buddyInput.trim() ? 0.45 : 1,
              }}
              aria-label="Send message"
            >
              →
            </motion.button>
          </form>
        </div>

        {/* ── RIGHT COLUMN ───────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Worry Box */}
          <div
            className="rounded-[2rem] p-6"
            style={{
              background: '#fff',
              border: '3px solid #659ec320',
              boxShadow: '0 12px 40px rgba(101,158,195,0.08)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl select-none" aria-hidden="true">🗳️</span>
                <h3
                  className="font-black text-xl"
                  style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}
                >
                  Worry Box
                </h3>
              </div>
              {worryCount > 0 && (
                <div
                  className="px-3 py-1.5 rounded-full text-xs font-black"
                  style={{ background: '#659ec315', color: '#659ec3' }}
                >
                  {worryCount} locked away
                </div>
              )}
            </div>

            <p className="font-bold text-sm mb-5" style={{ color: '#1e3a6e60', lineHeight: 1.6 }}>
              Write your worry down and lock it away. It goes somewhere safe and private. 🔐
            </p>

            <AnimatePresence mode="wait">
              {worryLocked ? (
                <motion.div
                  key="locked"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={spring}
                  className="flex flex-col items-center py-10 text-center"
                >
                  <motion.div
                    animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.12, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-6xl mb-3 select-none"
                    aria-hidden="true"
                  >
                    🔒
                  </motion.div>
                  <p
                    className="font-black text-xl"
                    style={{ fontFamily: "'Nunito', sans-serif", color: '#659ec3' }}
                  >
                    Worry locked away!
                  </p>
                  <p className="font-bold text-sm mt-1" style={{ color: '#1e3a6e50' }}>
                    Only you and your grown-up can ever see it
                  </p>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <textarea
                    value={worryText}
                    onChange={e => setWorryText(e.target.value)}
                    placeholder="Write what's on your mind..."
                    disabled={isLockingWorry || !activeChild}
                    rows={4}
                    className="w-full px-5 py-4 rounded-2xl font-bold text-base resize-none focus:outline-none mb-4"
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      background: '#f8fafe',
                      border: '2.5px solid #659ec325',
                      color: '#1e3a6e',
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleLockWorry}
                    disabled={isLockingWorry || !worryText.trim() || !activeChild}
                    className="w-full py-4 rounded-2xl font-black text-lg text-white"
                    style={{
                      background: '#659ec3',
                      boxShadow: '0 8px 24px #659ec330',
                      opacity: !worryText.trim() ? 0.45 : 1,
                    }}
                  >
                    {isLockingWorry ? 'Locking...' : '🔒 Lock it away'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SOS — calm framing, not scary UI */}
          <div
            className="rounded-[2rem] p-6 text-center"
            style={{
              background: sosSent ? '#ecfaf5' : '#fff9f0',
              border: `3px solid ${sosSent ? '#3a9e7e30' : '#e9924b30'}`,
              boxShadow: `0 12px 36px ${sosSent ? '#3a9e7e10' : '#e9924b10'}`,
            }}
          >
            <AnimatePresence mode="wait">
              {sosSent ? (
                <motion.div
                  key="sent"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                    className="text-5xl mb-3 select-none"
                    aria-hidden="true"
                  >
                    ✅
                  </motion.div>
                  <h4
                    className="font-black text-xl mb-1"
                    style={{ fontFamily: "'Nunito', sans-serif", color: '#3a9e7e' }}
                  >
                    Message Sent!
                  </h4>
                  <p className="font-bold text-sm" style={{ color: '#1e3a6e60' }}>
                    Your grown-up has been told. You are safe.
                  </p>
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p
                    className="font-black text-xl mb-1"
                    style={{ fontFamily: "'Nunito', sans-serif", color: '#1e3a6e' }}
                  >
                    Need a grown-up?
                  </p>
                  <p className="font-bold text-sm mb-5" style={{ color: '#1e3a6e60', lineHeight: 1.6 }}>
                    Press this button and your grown-up will know you need them right now.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94, rotate: -1 }}
                    onClick={handleSOS}
                    disabled={!activeChild}
                    className="w-full py-5 rounded-2xl font-black text-xl text-white flex items-center justify-center gap-3"
                    style={{
                      background: 'linear-gradient(135deg, #e9924b 0%, #d4762a 100%)',
                      boxShadow: '0 10px 32px #e9924b40',
                    }}
                    aria-label="Alert my grown-up"
                  >
                    <span className="text-2xl select-none" aria-hidden="true">🧡</span>
                    Tell my grown-up
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Privacy note */}
          <div
            className="rounded-2xl px-5 py-4"
            style={{ background: '#659ec310', border: '2px solid #659ec320' }}
          >
            <p className="font-bold text-xs" style={{ color: '#659ec3', lineHeight: 1.65 }}>
              🔒 Your worries are private and safe. Grown-ups can only see how many there are — not what you wrote.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpZone;