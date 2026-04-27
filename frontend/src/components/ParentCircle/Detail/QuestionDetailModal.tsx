/**
 * ============================================
 * QUESTION DETAIL MODAL — PARENTCIRCLE
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 * @description Slide-in panel: full-screen mobile, 600px side panel desktop
 * ============================================
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpIconSolid } from '@heroicons/react/24/solid';
import { useQuestion } from '../../../hooks/useParentCircle';
import * as API from '../../../services/parentcircle.service';
import toast from 'react-hot-toast';
import UserAvatar from '../Shared/UserAvatar';
import TimeAgo from '../Shared/TimeAgo';
import CategoryBadge from '../Shared/CategoryBadge';
import type { Answer } from '../../../types/parentcircle.types';

interface QuestionDetailModalProps {
  questionId: number;
  onClose: () => void;
}

// ─── INLINE ANSWER ITEM ───────────────────────────────────────────────────────

const AnswerItem: React.FC<{
  answer: Answer;
  onVote: (id: number) => void;
}> = ({ answer, onVote }) => {
  const [voted, setVoted] = useState(false);
  const [count, setCount] = useState(answer.helpfulCount ?? 0);

  const handleVote = () => {
    setVoted(prev => !prev);
    setCount(prev => voted ? prev - 1 : prev + 1);
    onVote(answer.id);
  };

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${
        answer.isAccepted
          ? 'border-[#659ec3]/35'
          : answer.isVerified
          ? 'border-[#659ec3]/18'
          : 'border-[#1e3a6e]/8'
      }`}
    >
      {answer.isAccepted && (
        <div className="h-0.5 bg-gradient-to-r from-[#659ec3] to-[#659ec3]/30" />
      )}
      <div className="p-5 bg-white">
        {answer.isAccepted && (
          <p className="text-[#659ec3] text-[10px] font-bold uppercase tracking-widest mb-3">
            Best answer
          </p>
        )}
        <div className="flex items-center gap-3 mb-3">
          <UserAvatar name={answer.author?.name ?? answer.authorName} size="sm" isVerified={answer.isVerified} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#1e3a6e] text-sm">
                {answer.author?.name ?? answer.authorName}
              </span>
              {answer.isVerified && (
                <span className="px-2 py-0.5 bg-[#659ec3]/10 text-[#659ec3] text-[10px] font-bold uppercase tracking-widest rounded-full">
                  Verified
                </span>
              )}
            </div>
            <TimeAgo date={answer.createdAt} className="text-[10px] text-[#1e3a6e]/35" />
          </div>
        </div>
        <p className="text-[#1e3a6e]/70 text-sm leading-[1.85] whitespace-pre-wrap mb-4">
          {answer.content}
        </p>
        <div className="pt-3 border-t border-[#1e3a6e]/6">
          <button
            onClick={handleVote}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              voted
                ? 'bg-[#659ec3]/10 text-[#659ec3] border border-[#659ec3]/20'
                : 'text-[#1e3a6e]/40 hover:text-[#659ec3] hover:bg-[#659ec3]/8 border border-transparent'
            }`}
          >
            {voted ? <HandThumbUpIconSolid className="w-3.5 h-3.5" /> : <HandThumbUpIcon className="w-3.5 h-3.5" />}
            Helpful{count > 0 ? ` (${count})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({ questionId, onClose }) => {
  const { question, answers, loading, error, refresh } = useQuestion(questionId.toString());
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'best' | 'newest' | 'oldest'>('best');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() || submitting) return;
    try {
      setSubmitting(true);
      await API.createAnswer(questionId, answerText.trim());
      toast.success('Your answer has been submitted for review — thank you.');
      setAnswerText('');
      refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (answerId: number) => {
    try { await API.markAnswerHelpful(answerId); refresh(); }
    catch (err: any) { toast.error(err.message || 'Failed'); }
  };

  const sortedAnswers = [...(answers ?? [])].sort((a, b) => {
    if (sortBy === 'best') {
      if (a.isAccepted && !b.isAccepted) return -1;
      if (!a.isAccepted && b.isAccepted) return 1;
      if (a.isVerified && !b.isVerified) return -1;
      if (!a.isVerified && b.isVerified) return 1;
      return (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0);
    }
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // ── Loading ──
  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#1e3a6e]/40 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-3 shadow-xl">
          <div className="w-8 h-8 border-2 border-[#e9924b]/30 border-t-[#e9924b] rounded-full animate-spin" />
          <p className="text-[#1e3a6e]/55 text-sm">Loading question...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !question) {
    return (
      <div className="fixed inset-0 bg-[#1e3a6e]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl text-center"
        >
          <p className="font-heading font-bold text-[#1e3a6e] text-base mb-2">Question not found</p>
          <p className="text-[#1e3a6e]/50 text-sm mb-7">{error || 'This question may have been removed.'}</p>
          <button onClick={onClose} className="w-full px-6 py-2.5 bg-[#e9924b] text-white text-sm font-semibold rounded-xl hover:bg-[#d4762a] transition-all">
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#1e3a6e]/40 backdrop-blur-sm"
        />

        {/* Panel */}
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute right-0 top-0 h-full w-full lg:w-[600px] bg-white shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-[#1e3a6e]/8 bg-white">
            <div className="flex items-center gap-2">
              {/* mobile: back arrow */}
              <button onClick={onClose} className="lg:hidden p-1.5 text-[#1e3a6e]/40 hover:text-[#1e3a6e] rounded-xl transition-colors">
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <p className="font-heading font-extrabold text-[#1e3a6e] text-base">Question</p>
                <p className="text-[#1e3a6e]/35 text-xs">{sortedAnswers.length} {sortedAnswers.length === 1 ? 'answer' : 'answers'}</p>
              </div>
            </div>
            {/* desktop: X */}
            <button onClick={onClose} className="hidden lg:flex p-1.5 text-[#1e3a6e]/40 hover:text-[#1e3a6e] hover:bg-[#1e3a6e]/5 rounded-xl transition-all">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-6">

              {/* Question body */}
              <div className="bg-[#fbfbfb] rounded-2xl border border-[#1e3a6e]/8 p-5">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.category && (
                    <CategoryBadge name={question.category?.name} color={question.category?.color} icon={question.category?.icon} size="sm" />
                  )}
                  {question.isFeatured && (
                    <span className="px-2.5 py-1 bg-[#e9924b]/10 text-[#e9924b] text-[10px] font-bold uppercase tracking-widest rounded-full">Featured</span>
                  )}
                </div>

                {question.title && (
                  <h1 className="font-heading font-extrabold text-[#1e3a6e] text-lg leading-snug mb-3">{question.title}</h1>
                )}
                <p className="text-[#1e3a6e]/70 text-sm leading-[1.85] whitespace-pre-wrap mb-4">{question.content}</p>

                {question.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {question.tags.map((tag: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-[#1e3a6e]/5 text-[#1e3a6e]/45 rounded-full text-xs">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-[#1e3a6e]/8">
                  <UserAvatar name={question.authorName} size="sm" isAnonymous={!question.author} />
                  <div>
                    <p className="font-semibold text-[#1e3a6e] text-xs">{question.authorName}</p>
                    <TimeAgo date={question.createdAt} className="text-[10px] text-[#1e3a6e]/35" />
                  </div>
                  <div className="ml-auto flex items-center gap-3 text-[#1e3a6e]/30 text-xs">
                    <span>{answers?.length ?? 0} answers</span>
                    <span>{question.viewCount ?? question.views ?? 0} views</span>
                  </div>
                </div>
              </div>

              {/* Answer form */}
              <div>
                <p className="font-heading font-bold text-[#1e3a6e] text-sm mb-1">Share your answer</p>
                <p className="text-[#1e3a6e]/40 text-xs mb-3 leading-relaxed">
                  Your experience matters. Answers are reviewed before appearing.
                </p>
                <form onSubmit={handleSubmitAnswer}>
                  <textarea
                    value={answerText}
                    onChange={e => setAnswerText(e.target.value)}
                    placeholder="Share what has worked for you, or what you wish someone had told you..."
                    className="w-full p-4 bg-[#fbfbfb] border border-[#1e3a6e]/12 rounded-xl text-[#1e3a6e] placeholder-[#1e3a6e]/30 text-sm leading-relaxed min-h-[130px] resize-none focus:outline-none focus:border-[#e9924b]/40 transition-all"
                    disabled={submitting}
                    required
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[#1e3a6e]/25 text-xs">{answerText.length} characters</span>
                    <button
                      type="submit"
                      disabled={!answerText.trim() || submitting}
                      className="px-5 py-2.5 bg-[#e9924b] hover:bg-[#d4762a] text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#e9924b]/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit answer'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Answers list */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-heading font-bold text-[#1e3a6e] text-sm">
                    {sortedAnswers.length} {sortedAnswers.length === 1 ? 'Answer' : 'Answers'}
                  </p>
                  {sortedAnswers.length > 1 && (
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as any)}
                      className="px-3 py-1.5 text-xs bg-white border border-[#1e3a6e]/15 rounded-xl text-[#1e3a6e] font-semibold focus:outline-none focus:border-[#e9924b]/40 transition-all"
                    >
                      <option value="best">Most helpful</option>
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                    </select>
                  )}
                </div>

                {sortedAnswers.length === 0 ? (
                  <div className="bg-[#fbfbfb] rounded-2xl border border-[#1e3a6e]/8 p-8 text-center">
                    <p className="text-[#1e3a6e]/45 text-sm">No answers yet. If you have experience with this, your perspective could really help.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedAnswers.map(a => (
                      <AnswerItem key={a.id} answer={a} onVote={handleVote} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuestionDetailModal;