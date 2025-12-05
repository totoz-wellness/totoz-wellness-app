/**
 * AnswerCard - Displays individual answer with actions
 * @version 2. 0. 0
 * @description Clean, reusable answer display component
 */

import React, { useState } from 'react';
import { HandThumbUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpIconSolid, CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import UserAvatar from '../Shared/UserAvatar';
import TimeAgo from '../Shared/TimeAgo';

interface Answer {
  id: number;
  content: string;
  authorName: string;
  authorRole?: string;
  isVerified: boolean;
  isAccepted: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt?: string;
}

interface AnswerCardProps {
  answer: Answer;
  onMarkHelpful: () => void;
  canAccept?: boolean;
  onAccept?: () => void;
}

const AnswerCard: React.FC<AnswerCardProps> = ({ 
  answer, 
  onMarkHelpful,
  canAccept = false,
  onAccept
}) => {
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(answer.helpfulCount);

  const handleMarkHelpful = () => {
    setIsHelpful(!isHelpful);
    setHelpfulCount(isHelpful ? helpfulCount - 1 : helpfulCount + 1);
    onMarkHelpful();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white p-6 rounded-xl border-2 transition-all ${
        answer.isAccepted 
          ? 'border-green-300 bg-green-50/50' 
          : answer.isVerified
          ? 'border-blue-200 bg-blue-50/30'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Accepted Badge */}
      {answer.isAccepted && (
        <div className="flex items-center gap-2 mb-4 text-green-700 font-bold">
          <CheckCircleIconSolid className="w-6 h-6" />
          <span>Best Answer</span>
        </div>
      )}

      {/* Author Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <UserAvatar 
            name={answer.authorName}
            size="md"
            isVerified={answer.isVerified}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">{answer.authorName}</span>
              {answer.isVerified && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  ✓ Verified Expert
                </span>
              )}
            </div>
            {answer.authorRole && (
              <p className="text-sm text-gray-600">{answer.authorRole}</p>
            )}
            <TimeAgo date={answer.createdAt} className="text-xs" />
          </div>
        </div>

        {/* Accept Answer Button (for question author) */}
        {canAccept && ! answer.isAccepted && onAccept && (
          <button
            onClick={onAccept}
            className="flex items-center gap-1 px-3 py-1. 5 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-all border border-green-200"
          >
            <CheckCircleIcon className="w-4 h-4" />
            Accept
          </button>
        )}
      </div>

      {/* Answer Content */}
      <div className="prose prose-sm max-w-none mb-4">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {answer.content}
        </p>
      </div>

      {/* Updated Badge */}
      {answer.updatedAt && answer.updatedAt !== answer.createdAt && (
        <p className="text-xs text-gray-500 mb-3">
          Last edited <TimeAgo date={answer.updatedAt} />
        </p>
      )}

      {/* Action Bar */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
        <button
          onClick={handleMarkHelpful}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            isHelpful
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200'
          }`}
        >
          {isHelpful ? (
            <HandThumbUpIconSolid className="w-5 h-5" />
          ) : (
            <HandThumbUpIcon className="w-5 h-5" />
          )}
          <span>Helpful ({helpfulCount})</span>
        </button>

        {/* Additional actions can go here */}
      </div>
    </motion.div>
  );
};

export default AnswerCard;