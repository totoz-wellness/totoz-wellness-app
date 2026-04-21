/**
 * QuestionDrawer - Twitter-style slide-in detail view
 * @version 1.1.0
 * @description Fixed null safety issue
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  PencilSquareIcon,
  EyeIcon,
  ChatBubbleLeftIcon 
} from '@heroicons/react/24/outline';
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
  questionId: number | null;  // ✅ Changed to allow null
  isOpen: boolean;
  onClose: () => void;
}

const QuestionDrawer: React.FC<QuestionDrawerProps> = ({ 
  questionId, 
  isOpen, 
  onClose 
}) => {
  // ✅ Only fetch if questionId exists
  const { question, answers, loading, error, refresh } = useQuestion(
    questionId ?   questionId. toString() : ''
  );
  
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('best');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const answerFormRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset state when drawer closes
  useEffect(() => {
    if (!  isOpen) {
      setNewAnswer('');
      setSubmitting(false);
      setSortBy('best');
      setShowStickyBar(false);
    }
  }, [isOpen]);

  // Detect scroll for sticky bar
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (! container || !isOpen) return;

    const handleScroll = () => {
      const answerForm = answerFormRef.current;
      if (!  answerForm) return;

      const rect = answerForm.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      setShowStickyBar(!  isVisible);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [question, isOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document. body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style. overflow = 'unset';
    };
  }, [isOpen]);

  const handleVote = async (isHelpful: boolean) => {
    if (!  questionId) return;
    
    try {
      await API.voteQuestion(questionId, isHelpful);
      toast.success(isHelpful ? 'Marked as helpful!' : 'Feedback recorded');
      refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to vote');
    }
  };

  const handleSubmitAnswer = async (e: React. FormEvent) => {
    e.preventDefault();
    if (!  newAnswer.trim() || ! questionId) return;

    try {
      setSubmitting(true);
      await API.createAnswer(questionId, newAnswer. trim());
      toast.success('Answer submitted!   It will appear after moderation.');
      setNewAnswer('');
      refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAnswerHelpful = async (answerId: number) => {
    try {
      await API.markAnswerHelpful(answerId);
      toast.success('Marked as helpful!');
      refresh();
    } catch (error: any) {
      toast. error(error.message || 'Failed to mark as helpful');
    }
  };

  const scrollToAnswerForm = () => {
    answerFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Sort answers
  const sortedAnswers = answers ?  [...answers].sort((a, b) => {
    if (sortBy === 'best') {
      if (a.isAccepted) return -1;
      if (b.isAccepted) return 1;
      if (a.isVerified && !  b.isVerified) return -1;
      if (b. isVerified && ! a.isVerified) return 1;
      return b.helpfulCount - a.helpfulCount;
    } else if (sortBy === 'newest') {
      return new Date(b.createdAt). getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(a.createdAt). getTime() - new Date(b.createdAt).getTime();
    }
  }) : [];

  // ✅ Don't render if no questionId
  if (! questionId) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[600px] lg:w-[700px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-900">Question Details</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto"
            >
              {loading ?   (
                <div className="p-6">
                  <LoadingSkeleton count={1} />
                </div>
              ) : error || !question ? (
                <div className="p-6 text-center">
                  <p className="text-red-600 font-semibold mb-2">Question not found</p>
                  <p className="text-gray-600 text-sm">{error || 'This question may have been removed'}</p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2 bg-teal text-white rounded-lg hover:bg-teal/90 transition-all"
                  >
                    Go Back
                  </button>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Question Card */}
                  <div>
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <CategoryBadge 
                        name={question.category. name}
                        color={question.category.color}
                        icon={question.category.icon}
                        size="sm"
                      />
                      {question.isPinned && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                          Pinned
                        </span>
                      )}
                      {question.isFeatured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                          Featured
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
                    <p className="text-gray-800 leading-relaxed mb-4 whitespace-pre-wrap">
                      {question.content}
                    </p>

                    {/* Tags */}
                    {question.tags && question.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {question.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Author & Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <UserAvatar 
                          name={question.authorName}
                          size="md"
                          isAnonymous={!  question.author}
                        />
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {question.authorName}
                          </div>
                          <TimeAgo date={question.createdAt} className="text-xs" />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{question.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ChatBubbleLeftIcon className="w-4 h-4" />
                          <span>{answers. length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vote Buttons */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <VoteButtons 
                        upvotes={question.helpfulCount}
                        onVoteUp={() => handleVote(true)}
                        onVoteDown={() => handleVote(false)}
                      />
                    </div>

                    {/* Top Write Answer Button */}
                    <button
                      onClick={scrollToAnswerForm}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal text-white rounded-xl hover:bg-teal/90 transition-all font-semibold"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                      Write Answer
                    </button>
                  </div>

                  {/* Answers Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                      </h3>
                      
                      {answers.length > 0 && (
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="px-3 py-1. 5 text-xs rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none font-semibold"
                        >
                          <option value="best">Best</option>
                          <option value="newest">Newest</option>
                          <option value="oldest">Oldest</option>
                        </select>
                      )}
                    </div>

                    <div className="space-y-3">
                      {sortedAnswers.length === 0 ?   (
                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                          <p className="text-gray-600">No answers yet</p>
                          <p className="text-sm text-gray-500 mt-1">Be the first to help!</p>
                        </div>
                      ) : (
                        sortedAnswers.map((answer) => (
                          <AnswerCard
                            key={answer.id}
                            answer={answer}
                            onMarkHelpful={() => handleMarkAnswerHelpful(answer.id)}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Answer Form */}
                  <div ref={answerFormRef} className="scroll-mt-20">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Your Answer
                    </h3>
                    
                    <form onSubmit={handleSubmitAnswer}>
                      <textarea
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target. value)}
                        placeholder="Share your knowledge, experience, or advice..."
                        className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none min-h-[150px] resize-none"
                        required
                      />
                      
                      <div className="flex items-center justify-between mt-3 gap-3">
                        <p className="text-xs text-gray-500">
                          Be specific and helpful
                        </p>
                        
                        <button
                          type="submit"
                          disabled={submitting || !newAnswer.trim()}
                          className="bg-teal text-white font-bold py-2. 5 px-6 rounded-xl hover:bg-teal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {submitting ? 'Posting...' : 'Post Answer'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Bottom Bar */}
            <AnimatePresence>
              {showStickyBar && !  loading && question && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="flex-shrink-0 border-t-2 border-gray-200 bg-white p-4 shadow-2xl"
                >
                  <button
                    onClick={scrollToAnswerForm}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
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