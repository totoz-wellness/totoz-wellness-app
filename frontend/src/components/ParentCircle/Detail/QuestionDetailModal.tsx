/**
 * ============================================
 * QUESTION DETAIL MODAL (TWITTER-STYLE)
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 09:38:24 UTC
 * @description Hybrid modal: Side panel (desktop) + Full screen (mobile)
 * ============================================
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { useQuestion } from '../../../hooks/useParentCircle';
import * as API from '../../../services/parentcircle.service';
import toast from 'react-hot-toast';
import type { Question, Answer } from '../../../types/parentcircle.types';

interface QuestionDetailModalProps {
  questionId: number;
  onClose: () => void;
}

const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({ questionId, onClose }) => {
  const { question, answers, loading, error, refresh } = useQuestion(questionId);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'best' | 'newest' | 'oldest'>('best');
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() || submitting) return;

    try {
      setSubmitting(true);
      await API.createAnswer(questionId, answerText.trim());
      toast.success('✅ Answer submitted successfully!');
      setAnswerText('');
      refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (answerId: number, isHelpful: boolean) => {
    try {
      await API.markAnswerHelpful(answerId);
      toast.success(isHelpful ? '👍 Marked as helpful!' : 'Thanks for feedback');
      refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to vote');
    }
  };

  const sortedAnswers = [...(answers || [])].sort((a, b) => {
    if (sortBy === 'best') {
      if (a.isAccepted && !b.isAccepted) return -1;
      if (!a.isAccepted && b.isAccepted) return 1;
      if (a.isVerified && !b.isVerified) return -1;
      if (!a.isVerified && b.isVerified) return 1;
      return b.helpfulCount - a.helpfulCount;
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading question...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-8 max-w-md"
        >
          <h3 className="text-xl font-bold text-red-600 mb-4">Error Loading Question</h3>
          <p className="text-gray-600 mb-6">{error || 'Question not found'}</p>
          <button
            onClick={onClose}
            className="w-full bg-teal text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal/90"
          >
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container - Responsive */}
        <motion.div
          ref={modalRef}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute right-0 top-0 h-full w-full lg:w-[600px] bg-white shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden lg:block"
            >
              <XMarkIcon className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 flex-1 mx-4">Question Details</h2>
            <div className="w-9"></div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Question Content */}
            <div className="p-6 border-b border-gray-200">
              {/* Author & Metadata */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {question.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{question.authorName}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {question.category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {question.category.name}
                  </span>
                )}
              </div>

              {/* Title */}
              {question.title && (
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  {question.title}
                </h1>
              )}

              {/* Content */}
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
                {question.content}
              </p>

              {/* Tags */}
              {question.tags && question.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {answers?.length || 0} answers
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {question.viewCount || 0} views
                </span>
              </div>
            </div>

            {/* Answer Form */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">Your Answer</h3>
              <form onSubmit={handleSubmitAnswer}>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Share your knowledge and experience..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-teal focus:outline-none resize-none"
                  rows={4}
                  disabled={submitting}
                />
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-gray-500">
                    {answerText.length}/1000 characters
                  </p>
                  <button
                    type="submit"
                    disabled={!answerText.trim() || submitting}
                    className="bg-teal text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {submitting ? 'Posting...' : 'Post Answer'}
                  </button>
                </div>
              </form>
            </div>

            {/* Answers Section */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {answers?.length || 0} Answers
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-semibold focus:border-teal focus:outline-none"
                >
                  <option value="best">Best Answers</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              {/* Answers List */}
              <div className="space-y-4">
                {sortedAnswers.length > 0 ? (
                  sortedAnswers.map((answer) => (
                    <div
                      key={answer.id}
                      className={`border-2 rounded-xl p-4 ${
                        answer.isAccepted
                          ? 'border-green-500 bg-green-50'
                          : answer.isVerified
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {/* Answer Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal to-blue-500 flex items-center justify-center text-white font-bold">
                            {answer.author.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 flex items-center gap-2">
                              {answer.author.name}
                              {answer.isVerified && (
                                <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs font-semibold">
                                  ✓ Verified
                                </span>
                              )}
                              {answer.isAccepted && (
                                <span className="px-2 py-0.5 bg-green-600 text-white rounded text-xs font-semibold">
                                  ✓ Best Answer
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Answer Content */}
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
                        {answer.content}
                      </p>

                      {/* Answer Actions */}
                      <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleVote(answer.id, true)}
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-teal transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          Helpful ({answer.helpfulCount})
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No answers yet</h3>
                    <p className="text-gray-600">Be the first to share your knowledge!</p>
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