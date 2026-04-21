/**
 * ============================================
 * QUESTION CARD COMPONENT
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 06:41:53 UTC
 * ============================================
 */

import React from 'react';
import { ChatBubbleLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import type { Question } from '../../../types/parentcircle.types';
import CategoryBadge from '../Shared/CategoryBadge';
import TimeAgo from '../Shared/TimeAgo';
import UserAvatar from '../Shared/UserAvatar';
import VoteButtons from '../Shared/VoteButtons';
import VerifiedBadge from '../Shared/VerifiedBadge';

interface QuestionCardProps {
  question: Question;
  onClick: () => void;
  onVote: (isHelpful: boolean) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick, onVote }) => {
  const hasAnswers = question._count.answers > 0;
  const truncateContent = (text: string, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <CategoryBadge 
          name={question.category.name}
          color={question.category.color}
          icon={question.category.icon}
        />
        
        {question.isPinned && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">
            📌 Pinned
          </span>
        )}
        
        {question.isFeatured && (
          <VerifiedBadge type="featured" size="sm" />
        )}
        
        <div className="flex items-center gap-2 text-xs text-gray-400 ml-auto">
          <TimeAgo date={question.createdAt} />
          <span>•</span>
          <span>{question.authorName}</span>
        </div>
      </div>

      {/* Title */}
      {question.title && (
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal transition-colors">
          {question.title}
        </h3>
      )}

      {/* Content Preview */}
      <p className="text-gray-700 mb-4 leading-relaxed">
        {truncateContent(question.content)}
      </p>

      {/* Tags */}
      {question.tags && question.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {question.tags.slice(0, 4).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
            >
              #{tag}
            </span>
          ))}
          {question.tags.length > 4 && (
            <span className="px-2 py-1 text-gray-400 text-xs">
              +{question.tags.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        {/* Votes */}
        <div onClick={(e) => e.stopPropagation()}>
          <VoteButtons 
            upvotes={question.helpfulCount}
            onVoteUp={() => onVote(true)}
            onVoteDown={() => onVote(false)}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {/* Views */}
          <div className="flex items-center gap-1">
            <EyeIcon className="w-4 h-4" />
            <span>{question.views}</span>
          </div>

          {/* Answers */}
          <div className={`flex items-center gap-1 ${hasAnswers ? 'text-teal font-semibold' : ''}`}>
            <ChatBubbleLeftIcon className="w-4 h-4" />
            <span>{question._count.answers} {question._count.answers === 1 ? 'Answer' : 'Answers'}</span>
          </div>
        </div>
      </div>

      {/* Best Answer Indicator */}
      {hasAnswers && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-sm text-green-600 font-semibold flex items-center gap-1">
            <span>✓</span> Has answers
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default QuestionCard;