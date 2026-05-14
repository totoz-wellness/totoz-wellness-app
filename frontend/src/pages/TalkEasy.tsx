/**
 * ============================================
 * TALKEASY — AI Mental Wellness Companion
 * ============================================
 * @version     4.0.0
 * @updated     2025-04-23
 * @description Premium, calm, trustworthy AI chat for caregivers
 * ============================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  ThumbsUp,
  ThumbsDown,
  RotateCw,
  Copy,
  ChevronDown,
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  sentiment?: string;
  timestamp?: string;
  crisis?: boolean;
  isTyping?: boolean;
}

// ─── SUGGESTED PROMPTS ───────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  "I'm feeling overwhelmed as a parent",
  "How do I talk to my child about emotions?",
  "I'm not sure how my child is feeling",
  "I need advice on handling stress at home",
];

// ─── FORMAT AI MESSAGE TEXT ──────────────────────────────────────────────────

const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const paragraphs = text.split('\n\n');

  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, pIdx) => {
        const lines = paragraph.split('\n');
        const hasBullets = lines.some(
          (l) => l.trim().startsWith('- ') || l.trim().startsWith('• ')
        );

        if (hasBullets) {
          return (
            <ul key={pIdx} className="space-y-1.5 pl-1">
              {lines.map((line, lIdx) => {
                const isBullet =
                  line.trim().startsWith('- ') || line.trim().startsWith('• ');
                if (!isBullet) return null;
                return (
                  <li key={lIdx} className="flex gap-2 text-sm leading-relaxed text-[#1e3a6e]/80">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#e9924b] flex-shrink-0" />
                    <span>{line.replace(/^[-•]\s*/, '')}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <div key={pIdx}>
            {lines.map((line, lIdx) => {
              // Bold heading line
              if (line.match(/^\*\*(.+)\*\*$/)) {
                return (
                  <p key={lIdx} className="font-semibold text-[#1e3a6e] text-sm mb-1">
                    {line.replace(/\*\*/g, '')}
                  </p>
                );
              }

              // Inline bold + regular
              const parts = line.split(/(\*\*.+?\*\*)/g);
              return (
                <p key={lIdx} className="text-sm leading-[1.75] text-[#1e3a6e]/80">
                  {parts.map((part, i) =>
                    part.match(/^\*\*.+\*\*$/) ? (
                      <strong key={i} className="font-semibold text-[#1e3a6e]">
                        {part.replace(/\*\*/g, '')}
                      </strong>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// ─── TYPING DOTS ─────────────────────────────────────────────────────────────

const TypingDots: React.FC = () => (
  <div className="flex items-center gap-1 py-1">
    {[0, 150, 300].map((delay) => (
      <span
        key={delay}
        className="w-1.5 h-1.5 rounded-full bg-[#659ec3]/60 animate-bounce"
        style={{ animationDelay: `${delay}ms` }}
      />
    ))}
  </div>
);

// ─── USER INITIAL ─────────────────────────────────────────────────────────────

function getUserInitial(): string {
  try {
    const raw = localStorage.getItem('user');
    if (raw) return JSON.parse(raw).name?.charAt(0).toUpperCase() || 'U';
  } catch {}
  return 'U';
}

// ─── WELCOME SCREEN ───────────────────────────────────────────────────────────

const WelcomeScreen: React.FC<{ onPrompt: (text: string) => void }> = ({ onPrompt }) => (
  <div className="flex flex-col items-center justify-center h-full px-4 py-16 text-center">
    {/* Icon */}
    <div className="w-14 h-14 rounded-2xl bg-[#e9924b]/10 flex items-center justify-center mb-6">
      <svg viewBox="0 0 24 24" fill="none" stroke="#e9924b" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h.01M12 10h.01M16 10h.01" />
      </svg>
    </div>

    <h2 className="font-heading font-extrabold text-[#1e3a6e] text-xl mb-2">
      TalkEasy
    </h2>
    <p className="text-[#1e3a6e]/55 text-sm leading-relaxed max-w-sm mb-10">
      A calm space to talk through what's on your mind — parenting challenges, your child's emotions, or simply how you're feeling today.
    </p>

    {/* Suggested prompts */}
    <div className="w-full max-w-md space-y-2.5">
      <p className="text-xs text-[#1e3a6e]/35 tracking-widest uppercase mb-4">Try asking</p>
      {SUGGESTED_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onPrompt(prompt)}
          className="w-full text-left px-5 py-3.5 bg-white border border-[#1e3a6e]/10 rounded-xl text-sm text-[#1e3a6e]/70 hover:border-[#e9924b]/40 hover:text-[#1e3a6e] hover:bg-[#e9924b]/4 transition-all shadow-sm"
        >
          {prompt}
        </button>
      ))}
    </div>

    {/* Disclaimer */}
    <p className="mt-10 text-xs text-[#1e3a6e]/30 max-w-sm leading-relaxed">
      TalkEasy provides guidance and support — not professional medical advice. For urgent mental health concerns, please contact a qualified professional.
    </p>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const TalkEasy: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [sessionId] = useState<string>(`session-${Date.now()}`);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasMessages = messages.length > 0;

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Show/hide scroll button
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setShowScrollBtn(!atBottom);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Type message char by char
  const typeMessage = (messageId: string, fullText: string, speed = 12) => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, text: fullText.substring(0, i), isTyping: true } : m
          )
        );
        i++;
      } else {
        clearInterval(interval);
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, text: fullText, isTyping: false } : m))
        );
      }
    }, speed);
  };

  // Send message
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const response = await api.post('/talkeasy/chat', { message: text, sessionId });

      if (response.data.success) {
        const msgId = `ai-${Date.now()}`;
        const fullResponse = response.data.data.response;

        const aiMsg: Message = {
          id: msgId,
          text: '',
          sender: 'ai',
          sentiment: response.data.data.sentiment,
          timestamp: response.data.data.timestamp,
          crisis: response.data.crisis || false,
          isTyping: true,
        };

        setMessages((prev) => [...prev, aiMsg]);
        setIsLoading(false);
        typeMessage(msgId, fullResponse);

        if (response.data.crisis) {
          toast('If you need immediate support, please call 0722 178 177', { icon: null, duration: 6000 });
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      let errorText = "I'm having trouble connecting. Please try again.";
      if (err.response?.status === 429) errorText = "Please slow down — you're sending messages too quickly.";
      if (err.response?.status === 401 || err.response?.status === 403)
        errorText = "Your session has expired. Please log in again.";

      toast.error(errorText);
      setMessages((prev) => [
        ...prev,
        { id: `error-${Date.now()}`, text: errorText, sender: 'ai' },
      ]);
    } finally {
      textareaRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  const handleRegenerate = () => {
    toast('Regenerate coming soon');
  };

  return (
    <div className="flex flex-col h-screen bg-[#fbfbfb]" style={{ fontFamily: 'inherit' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-white border-b border-[#1e3a6e]/8 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-[#1e3a6e]/5 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-[#1e3a6e]/60" />
            </button>
            <div>
              <h1 className="font-heading font-extrabold text-[#1e3a6e] text-base leading-none">TalkEasy</h1>
              <p className="text-[#1e3a6e]/40 text-xs mt-0.5">Your mental wellness companion</p>
            </div>
          </div>

          {/* Crisis badge — calm, not alarming */}
          <a
            href="tel:0722178177"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#659ec3] bg-[#659ec3]/8 border border-[#659ec3]/20 rounded-full hover:bg-[#659ec3]/14 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#659ec3] animate-pulse" />
            Crisis support: 0722 178 177
          </a>
        </div>
      </header>

      {/* ── Chat area ──────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          {!hasMessages ? (
            <WelcomeScreen onPrompt={(p) => { setInput(p); textareaRef.current?.focus(); sendMessage(p); }} />
          ) : (
            <div className="py-8 space-y-6">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onCopy={handleCopy}
                  onRegenerate={handleRegenerate}
                />
              ))}

              {/* Loading dots */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#e9924b]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#e9924b" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div className="bg-white border border-[#1e3a6e]/8 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1e3a6e] bg-white border border-[#1e3a6e]/15 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          Scroll to latest
        </button>
      )}

      {/* ── Input area ─────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-t border-[#1e3a6e]/8">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-4">
          <form onSubmit={handleSubmit}>
            <div className={`flex items-end gap-3 bg-[#fbfbfb] border rounded-2xl px-4 py-3 transition-all ${
              input ? 'border-[#e9924b]/40 shadow-sm' : 'border-[#1e3a6e]/12'
            }`}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                placeholder="Share what's on your mind..."
                className="flex-1 bg-transparent border-none outline-none resize-none max-h-[140px] text-sm text-[#1e3a6e] placeholder-[#1e3a6e]/30 leading-relaxed py-0.5"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 flex-shrink-0 bg-[#e9924b] hover:bg-[#d4762a] text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-md hover:shadow-[#e9924b]/25"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-[10px] text-[#1e3a6e]/25 mt-2.5 leading-relaxed">
              TalkEasy provides guidance, not professional medical advice. For crises, call 0722 178 177.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────

const MessageBubble: React.FC<{
  message: Message;
  onCopy: (text: string) => void;
  onRegenerate: () => void;
}> = ({ message, onCopy, onRegenerate }) => {
  const [showActions, setShowActions] = useState(false);
  const isUser = message.sender === 'user';

  return (
    <div
      className={`flex items-start gap-3 group ${isUser ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="w-8 h-8 rounded-xl bg-[#1e3a6e] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
          {getUserInitial()}
        </div>
      ) : (
        <div className="w-8 h-8 rounded-xl bg-[#e9924b]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="#e9924b" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
      )}

      <div className={`flex flex-col gap-1.5 max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-[#1e3a6e] text-white rounded-tr-sm'
              : `bg-white border rounded-tl-sm ${
                  message.crisis
                    ? 'border-[#659ec3]/40 border-l-2 border-l-[#659ec3]'
                    : 'border-[#1e3a6e]/8'
                }`
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-[1.7] text-white">{message.text}</p>
          ) : (
            <>
              {message.isTyping && message.text === '' ? (
                <TypingDots />
              ) : (
                <FormattedText text={message.text} />
              )}
              {/* Crisis notice */}
              {message.crisis && (
                <div className="mt-3 pt-3 border-t border-[#659ec3]/20">
                  <p className="text-xs text-[#659ec3] font-medium">
                    For immediate support, please call{' '}
                    <a href="tel:0722178177" className="underline">0722 178 177</a>
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* AI message actions */}
        {!isUser && !message.isTyping && (
          <div
            className={`flex items-center gap-0.5 transition-opacity duration-200 ${
              showActions ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {[
              { icon: <Copy className="w-3.5 h-3.5" />, label: 'Copy', action: () => onCopy(message.text) },
              { icon: <RotateCw className="w-3.5 h-3.5" />, label: 'Regenerate', action: onRegenerate },
              { icon: <ThumbsUp className="w-3.5 h-3.5" />, label: 'Helpful', action: () => {} },
              { icon: <ThumbsDown className="w-3.5 h-3.5" />, label: 'Not helpful', action: () => {} },
            ].map(({ icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                title={label}
                className="p-1.5 text-[#1e3a6e]/30 hover:text-[#1e3a6e]/70 hover:bg-[#1e3a6e]/5 rounded-lg transition-colors"
              >
                {icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TalkEasy;