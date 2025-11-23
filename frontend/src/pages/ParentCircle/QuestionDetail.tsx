/**
 * ============================================
 * QUESTION DETAIL PAGE
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 06:57:02 UTC
 * ============================================
 */

import React, { useState } from 'react';
import { ArrowLeftIcon, EyeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
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

interface QuestionDetailProps {
  questionId: number | string;
  onBack: () => void;
}

const QuestionDetail: React.FC<QuestionDetailProps> = ({ questionId, onBack }) => {
  const { question, answers, loading, error, refresh } = useQuestion(questionId);
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('best');

  const handleVote = async (isHelpful: boolean) => {
    try {
      await API.voteQuestion(Number(questionId), isHelpful);
      toast.success(isHelpful ? '👍 Marked as helpful!' : '👎 Feedback recorded');
      refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to vote');
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    try {
      setSubmitting(true);
      await API.createAnswer(Number(questionId), newAnswer.trim());
      toast.success('✅ Answer submitted! It will appear after moderation.');
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
      toast.success('👍 Marked as helpful!');
      refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark as helpful');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <LoadingSkeleton count={1} />
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <EmptyState
            type="error"
            message="Question not found"
            submessage={error || "The question you're looking for doesn't exist or has been removed"}
            actionLabel="← Go Back"
            onAction={onBack}
          />
        </div>
      </div>
    );
  }

  // Sort answers
  const sortedAnswers = [...answers].sort((a, b) => {
    if (sortBy === 'best') {
      if (a.isAccepted) return -1;
      if (b.isAccepted) return 1;
      if (a.isVerified && !b.isVerified) return -1;
      if (b.isVerified && !a.isVerified) return 1;
      return b.helpfulCount - a.helpfulCount;
    } else if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-teal transition-colors font-semibold"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Feed
        </motion.button>

        {/* Question Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <CategoryBadge 
              name={question.category.name}
              color={question.category.color}
              icon={question.category.icon}
            />
            
            {question.isPinned && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                📌 Pinned
              </span>
            )}
            
            {question.isFeatured && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Title */}
          {question.title && (
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {question.title}
            </h1>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-6">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {question.content}
            </p>
          </div>

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {question.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author & Stats */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <UserAvatar 
                name={question.authorName}
                size="lg"
                isAnonymous={!question.author}
              />
              <div>
                <div className="font-semibold text-gray-900">{question.authorName}</div>
                <TimeAgo date={question.createdAt} className="text-sm" />
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <EyeIcon className="w-5 h-5" />
                <span>{question.views} views</span>
              </div>
              <div className="flex items-center gap-1">
                <ChatBubbleLeftIcon className="w-5 h-5" />
                <span>{answers.length} answers</span>
              </div>
            </div>
          </div>

          {/* Vote Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <VoteButtons 
              upvotes={question.helpfulCount}
              onVoteUp={() => handleVote(true)}
              onVoteDown={() => handleVote(false)}
            />
          </div>
        </motion.div>

        {/* Answers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          {/* Answers Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>
            
            {answers.length > 0 && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none text-sm font-semibold"
              >
                <option value="best">Best Answers</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            )}
          </div>

          {/* Answers List */}
          <div className="space-y-4">
            {sortedAnswers.length === 0 ? (
              <EmptyState
                type="content"
                message="No answers yet"
                submessage="Be the first to help answer this question!"
              />
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
        </motion.div>

        {/* Answer Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Your Answer
          </h3>
          
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Share your knowledge, experience, or advice..."
              className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none min-h-[150px] resize-none"
              required
            />
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                💡 <strong>Tip:</strong> Be specific and provide helpful details
              </p>
              
              <button
                type="submit"
                disabled={submitting || !newAnswer.trim()}
                className="bg-teal text-white font-bold py-3 px-8 rounded-full hover:bg-teal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {submitting ? 'Submitting...' : 'Post Answer'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default QuestionDetail;