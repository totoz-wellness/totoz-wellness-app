/**
 * ============================================
 * QUESTION DRAWER — PARENTCIRCLE
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PencilSquareIcon, EyeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { useQuestion } from '../../../hooks/useParentCircle';
import * as API from '../../../services/parentcircle.service';
import CategoryBadge from '../Shared/CategoryBadge';
import TimeAgo from '../Shared/TimeAgo';
import UserAvatar from '../Shared/UserAvatar';
import VoteButtons from '../Shared/VoteButtons';
import AnswerCard from './AnswerCard';
import LoadingSkeleton from '../Shared/LoadingSkeleton';
import toast from 'react-hot-toast';

interface QuestionDrawerProps {
  questionId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const selectClass =
  'px-3 py-1.5 text-xs bg-white border border-[#1e3a6e]/15 rounded-xl text-[#1e3a6e] font-semibold focus:outline-none focus:border-[#e9924b]/40 transition-all';

const QuestionDrawer: React.FC<QuestionDrawerProps> = ({ questionId, isOpen, onClose }) => {
  const { question, answers, loading, error, refresh } = useQuestion(
    questionId ? questionId.toString() : ''
  );
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('best');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const answerFormRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) { setNewAnswer(''); setSubmitting(false); setSortBy('best'); setShowStickyBar(false); }
  }, [isOpen]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isOpen) return;
    const onScroll = () => {
      const form = answerFormRef.current;
      if (!form) return;
      const { top, bottom } = form.getBoundingClientRect();
      setShowStickyBar(!(top < window.innerHeight && bottom > 0));
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [question, isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleVote = async (isHelpful: boolean) => {
    if (!questionId) return;
    try {
      await API.voteQuestion(questionId, isHelpful);
      toast.success(isHelpful ? 'Marked as helpful' : 'Feedback recorded');
      refresh();
    } catch (err: any) { toast.error(err.message || 'Failed to vote'); }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim() || !questionId) return;
    try {
      setSubmitting(true);
      await API.createAnswer(questionId, newAnswer.trim());
      toast.success('Your answer has been submitted for review — thank you.');
      setNewAnswer('');
      refresh();
    } catch (err: any) { toast.error(err.message || 'Failed to submit answer'); }
    finally { setSubmitting(false); }
  };

  const handleMarkHelpful = async (answerId: number) => {
    try { await API.markAnswerHelpful(answerId); toast.success('Marked as helpful'); refresh(); }
    catch (err: any) { toast.error(err.message || 'Failed'); }
  };

  const scrollToForm = () => answerFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const sortedAnswers = (answers ?? []).slice().sort((a, b) => {
    if (sortBy === 'best') {
      if (a.isAccepted) return -1;
      if (b.isAccepted) return 1;
      if (a.isVerified && !b.isVerified) return -1;
      if (b.isVerified && !a.isVerified) return 1;
      return b.helpfulCount - a.helpfulCount;
    }
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  if (!questionId) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1e3a6e]/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[600px] lg:w-[680px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#1e3a6e]/8 bg-white">
              <div>
                <p className="font-heading font-extrabold text-[#1e3a6e] text-base">Question</p>
                <p className="text-[#1e3a6e]/35 text-xs mt-0.5">
                  {answers?.length ?? 0} {answers?.length === 1 ? 'answer' : 'answers'}
                </p>
              </div>
              <button onClick={onClose} className="p-2 text-[#1e3a6e]/40 hover:text-[#1e3a6e] hover:bg-[#1e3a6e]/5 rounded-xl transition-all">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6"><LoadingSkeleton count={1} /></div>
              ) : error || !question ? (
                <div className="p-8 text-center">
                  <p className="font-heading font-bold text-[#1e3a6e] text-sm mb-1">Question not found</p>
                  <p className="text-[#1e3a6e]/45 text-sm mb-5">{error || 'This question may have been removed.'}</p>
                  <button onClick={onClose} className="px-5 py-2.5 bg-[#e9924b] text-white text-sm font-semibold rounded-xl hover:bg-[#d4762a] transition-all">Close</button>
                </div>
              ) : (
                <div className="p-6 space-y-7">

                  {/* Question body */}
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <CategoryBadge name={question.category?.name} color={question.category?.color} icon={question.category?.icon} size="sm" />
                      {question.isPinned && <span className="px-2.5 py-1 bg-[#659ec3]/10 text-[#659ec3] text-[10px] font-bold uppercase tracking-widest rounded-full">Pinned</span>}
                      {question.isFeatured && <span className="px-2.5 py-1 bg-[#e9924b]/10 text-[#e9924b] text-[10px] font-bold uppercase tracking-widest rounded-full">Featured</span>}
                    </div>

                    {question.title && (
                      <h1 className="font-heading font-extrabold text-[#1e3a6e] text-xl leading-snug mb-3">{question.title}</h1>
                    )}

                    <p className="text-[#1e3a6e]/70 text-sm leading-[1.85] whitespace-pre-wrap mb-4">{question.content}</p>

                    {question.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {question.tags.map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-[#1e3a6e]/5 text-[#1e3a6e]/45 rounded-full text-xs font-medium">{tag}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-[#1e3a6e]/8">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={question.authorName} size="sm" isAnonymous={!question.author} />
                        <div>
                          <p className="font-semibold text-[#1e3a6e] text-xs">{question.authorName}</p>
                          <TimeAgo date={question.createdAt} className="text-[10px] text-[#1e3a6e]/35" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[#1e3a6e]/30 text-xs">
                        <span className="flex items-center gap-1"><EyeIcon className="w-3.5 h-3.5" />{question.views ?? 0}</span>
                        <span className="flex items-center gap-1"><ChatBubbleLeftIcon className="w-3.5 h-3.5" />{answers?.length ?? 0}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#1e3a6e]/8">
                      <VoteButtons upvotes={question.helpfulCount ?? 0} onVoteUp={() => handleVote(true)} onVoteDown={() => handleVote(false)} />
                    </div>

                    <button
                      onClick={scrollToForm}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#e9924b] hover:bg-[#d4762a] text-white text-sm font-semibold rounded-xl transition-all"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      Share your answer
                    </button>
                  </div>

                  {/* Answers */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-heading font-bold text-[#1e3a6e] text-sm">
                        {sortedAnswers.length} {sortedAnswers.length === 1 ? 'Answer' : 'Answers'}
                      </p>
                      {sortedAnswers.length > 1 && (
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={selectClass}>
                          <option value="best">Most helpful</option>
                          <option value="newest">Newest</option>
                          <option value="oldest">Oldest</option>
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
                          <AnswerCard key={a.id} answer={a} onMarkHelpful={() => handleMarkHelpful(a.id)} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Answer form */}
                  <div ref={answerFormRef} className="scroll-mt-6">
                    <p className="font-heading font-bold text-[#1e3a6e] text-sm mb-1">Share your answer</p>
                    <p className="text-[#1e3a6e]/40 text-xs mb-4 leading-relaxed">Your experience and perspective matters here. Answers are reviewed before appearing.</p>
                    <form onSubmit={handleSubmitAnswer}>
                      <textarea
                        value={newAnswer}
                        onChange={e => setNewAnswer(e.target.value)}
                        placeholder="Share what has worked for you, what you've learned, or simply what you wish someone had told you..."
                        className="w-full p-4 bg-[#fbfbfb] border border-[#1e3a6e]/12 rounded-xl text-[#1e3a6e] placeholder-[#1e3a6e]/30 text-sm leading-relaxed min-h-[140px] resize-none focus:outline-none focus:border-[#e9924b]/40 transition-all"
                        required
                      />
                      <div className="flex items-center justify-end mt-3 gap-3">
                        <button
                          type="submit"
                          disabled={submitting || !newAnswer.trim()}
                          className="px-6 py-2.5 bg-[#e9924b] hover:bg-[#d4762a] text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#e9924b]/20 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Submitting...' : 'Submit answer'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky CTA */}
            <AnimatePresence>
              {showStickyBar && !loading && question && (
                <motion.div
                  initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                  className="flex-shrink-0 border-t border-[#1e3a6e]/8 bg-white px-6 py-4 shadow-lg"
                >
                  <button
                    onClick={scrollToForm}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#e9924b] hover:bg-[#d4762a] text-white text-sm font-semibold rounded-xl transition-all"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    Write your answer
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuestionDrawer;