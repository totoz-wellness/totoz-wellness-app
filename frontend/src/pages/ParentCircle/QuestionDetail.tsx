/**
 * ============================================
 * QUESTION DETAIL — PARENTCIRCLE
 * ============================================
 * @version     7.0.0
 * @updated     2025-04-23
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, EyeIcon, ChatBubbleLeftIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useQuestion } from '../../hooks/useParentCircle';
import * as API from '../../services/parentcircle.service';
import CategoryBadge from '../../components/ParentCircle/Shared/CategoryBadge';
import TimeAgo from '../../components/ParentCircle/Shared/TimeAgo';
import UserAvatar from '../../components/ParentCircle/Shared/UserAvatar';
import VoteButtons from '../../components/ParentCircle/Shared/VoteButtons';
import AnswerCard from '../../components/ParentCircle/Detail/AnswerCard';
import LoadingSkeleton from '../../components/ParentCircle/Shared/LoadingSkeleton';
import EmptyState from '../../components/ParentCircle/Shared/EmptyState';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { question, answers, loading, error, refresh } = useQuestion(id || '');
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('best');
  const [showAnswerModal, setShowAnswerModal] = useState(false);

  const handleVote = async (isHelpful: boolean) => {
    if (!id) return;
    try {
      await API.voteQuestion(Number(id), isHelpful);
      toast.success(isHelpful ? 'Marked as helpful' : 'Feedback recorded');
      refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to vote');
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim() || !id) return;
    try {
      setSubmitting(true);
      await API.createAnswer(Number(id), newAnswer.trim());
      toast.success('Your answer has been submitted for review — thank you.');
      setNewAnswer('');
      setShowAnswerModal(false);
      refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (answerId: number) => {
    try {
      await API.markAnswerHelpful(answerId);
      toast.success('Marked as helpful');
      refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed');
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfbfb]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
          <LoadingSkeleton count={1} />
        </div>
        <Footer />
      </div>
    );
  }

  // Error
  if (error || !question) {
    return (
      <div className="min-h-screen bg-[#fbfbfb]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
          <EmptyState
            type="error"
            message="Question not found"
            submessage={error || "This question may have been removed."}
            actionLabel="Back to community"
            onAction={() => navigate('/parentcircle')}
          />
        </div>
        <Footer />
      </div>
    );
  }

  const sortedAnswers = [...answers].sort((a, b) => {
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

  return (
    <div className="min-h-screen bg-[#fbfbfb]">
      <Navbar />

      {/* Hero strip */}
      <div className="bg-[#1e3a6e] pt-28 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a6e] to-[#659ec3]/20 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <button
            onClick={() => navigate('/parentcircle')}
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to ParentCircle
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-[#e9924b]" />
            <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Question</span>
          </div>
          {question.title && (
            <h1 className="font-heading font-extrabold text-white text-2xl md:text-3xl leading-tight">
              {question.title}
            </h1>
          )}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-10">

        {/* Question body */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-7 mb-8"
        >
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            <CategoryBadge
              name={question.category?.name}
              color={question.category?.color}
              icon={question.category?.icon}
            />
            {question.isPinned && (
              <span className="px-2.5 py-1 bg-[#659ec3]/10 text-[#659ec3] text-[10px] font-bold uppercase tracking-widest rounded-full">
                Pinned
              </span>
            )}
            {question.isFeatured && (
              <span className="px-2.5 py-1 bg-[#e9924b]/10 text-[#e9924b] text-[10px] font-bold uppercase tracking-widest rounded-full">
                Featured
              </span>
            )}
          </div>

          {/* Content */}
          <p className="text-[#1e3a6e]/75 text-base leading-[1.85] whitespace-pre-wrap mb-6">
            {question.content}
          </p>

          {/* Tags */}
          {question.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {question.tags.map((tag: string, i: number) => (
                <span key={i} className="px-2.5 py-1 bg-[#1e3a6e]/5 text-[#1e3a6e]/55 rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author + stats */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-5 border-t border-[#1e3a6e]/8">
            <div className="flex items-center gap-3">
              <UserAvatar name={question.authorName} size="md" isAnonymous={!question.author} />
              <div>
                <p className="font-semibold text-[#1e3a6e] text-sm">{question.authorName}</p>
                <TimeAgo date={question.createdAt} className="text-xs text-[#1e3a6e]/40" />
              </div>
            </div>
            <div className="flex items-center gap-5 text-[#1e3a6e]/35 text-xs">
              <span className="flex items-center gap-1.5">
                <EyeIcon className="w-4 h-4" />
                {question.views ?? 0} views
              </span>
              <span className="flex items-center gap-1.5">
                <ChatBubbleLeftIcon className="w-4 h-4" />
                {answers.length} {answers.length === 1 ? 'answer' : 'answers'}
              </span>
            </div>
          </div>

          {/* Vote */}
          <div className="mt-5 pt-5 border-t border-[#1e3a6e]/8">
            <VoteButtons
              upvotes={question.helpfulCount ?? 0}
              onVoteUp={() => handleVote(true)}
              onVoteDown={() => handleVote(false)}
            />
          </div>
        </motion.div>

        {/* Answers section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-5">
            <p className="font-heading font-bold text-[#1e3a6e] text-lg">
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </p>
            {answers.length > 1 && (
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-2 bg-white border border-[#1e3a6e]/15 rounded-xl text-[#1e3a6e] text-xs font-semibold focus:outline-none focus:border-[#e9924b]/40 transition-all"
              >
                <option value="best">Most helpful</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            )}
          </div>

          {sortedAnswers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-10 text-center">
              <div className="w-10 h-10 rounded-2xl bg-[#e9924b]/8 flex items-center justify-center mx-auto mb-3">
                <ChatBubbleLeftIcon className="w-5 h-5 text-[#e9924b]" />
              </div>
              <p className="font-heading font-bold text-[#1e3a6e] text-sm mb-1">No answers yet</p>
              <p className="text-[#1e3a6e]/45 text-sm">If you have experience with this, your perspective could really help.</p>
              <button
                onClick={() => setShowAnswerModal(true)}
                className="mt-5 px-5 py-2.5 bg-[#e9924b] text-white text-sm font-semibold rounded-xl hover:bg-[#d4762a] transition-all"
              >
                Share what you know
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAnswers.map(answer => (
                <AnswerCard
                  key={answer.id}
                  answer={answer}
                  onMarkHelpful={() => handleMarkHelpful(answer.id)}
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <Footer />

      {/* Floating write-answer button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setShowAnswerModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#e9924b] hover:bg-[#d4762a] text-white rounded-full shadow-2xl shadow-[#e9924b]/30 flex items-center justify-center z-50 group transition-colors"
        aria-label="Write an answer"
      >
        <PencilSquareIcon className="w-6 h-6" />
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-[#1e3a6e] text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Write an answer
        </span>
      </motion.button>

      {/* Answer modal */}
      <AnimatePresence>
        {showAnswerModal && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAnswerModal(false)}
              className="absolute inset-0 bg-[#1e3a6e]/40 backdrop-blur-sm"
            />
            <div className="absolute inset-0 flex items-end md:items-center justify-center p-0 md:p-6">
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                className="bg-white w-full md:max-w-2xl rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                {/* Modal header */}
                <div className="sticky top-0 bg-white border-b border-[#1e3a6e]/8 px-6 py-4 flex items-center justify-between z-10">
                  <div>
                    <p className="font-heading font-extrabold text-[#1e3a6e] text-lg">Share your answer</p>
                    <p className="text-[#1e3a6e]/40 text-xs mt-0.5">Your experience and perspective matters here.</p>
                  </div>
                  <button
                    onClick={() => setShowAnswerModal(false)}
                    className="p-2 text-[#1e3a6e]/40 hover:text-[#1e3a6e] hover:bg-[#1e3a6e]/5 rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmitAnswer} className="p-6">
                  <textarea
                    value={newAnswer}
                    onChange={e => setNewAnswer(e.target.value)}
                    placeholder="Share what has worked for you, what you've learned, or simply what you wish someone had told you..."
                    className="w-full p-4 bg-[#fbfbfb] border border-[#1e3a6e]/12 rounded-xl text-[#1e3a6e] placeholder-[#1e3a6e]/30 text-sm leading-relaxed min-h-[200px] md:min-h-[260px] resize-none focus:outline-none focus:border-[#e9924b]/40 transition-all"
                    required
                    autoFocus
                  />

                  <p className="text-[#1e3a6e]/35 text-xs mt-3 mb-5 leading-relaxed">
                    Answers are reviewed before appearing publicly. Be specific, kind, and honest.
                  </p>

                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAnswerModal(false)}
                      className="px-5 py-2.5 border border-[#1e3a6e]/20 text-[#1e3a6e]/60 font-semibold rounded-xl hover:bg-[#1e3a6e]/5 transition-all text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !newAnswer.trim()}
                      className="px-6 py-2.5 bg-[#e9924b] hover:bg-[#d4762a] text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#e9924b]/20 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                    >
                      {submitting ? 'Submitting...' : 'Submit answer'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionDetail;