/**
 * ============================================
 * ANSWER CARD COMPONENT
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 06:57:02 UTC
 * ============================================
 */

import React, { useState } from 'react';
import { HandThumbUpIcon, ChatBubbleLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpIconSolid, CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import type { Answer } from '../../../types/parentcircle.types';
import UserAvatar from '../Shared/UserAvatar';
import TimeAgo from '../Shared/TimeAgo';
import VerifiedBadge from '../Shared/VerifiedBadge';

interface AnswerCardProps {
  answer: Answer;
  onMarkHelpful: () => void;
  onReply?: () => void;
  isHelpful?: boolean;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const AnswerCard: React.FC<AnswerCardProps> = ({
  answer,
  onMarkHelpful,
  onReply,
  isHelpful = false,
  canEdit = false,
  onEdit,
  onDelete
}) => {
  const [showActions, setShowActions] = useState(false);
  const [localHelpful, setLocalHelpful] = useState(isHelpful);
  const [localCount, setLocalCount] = useState(answer.helpfulCount);

  const handleMarkHelpful = () => {
    setLocalHelpful(!localHelpful);
    setLocalCount(localHelpful ? localCount - 1 : localCount + 1);
    onMarkHelpful();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border-2 ${
        answer.isAccepted 
          ? 'border-green-200 bg-green-50/30' 
          : answer.isVerified
          ? 'border-blue-200 bg-blue-50/30'
          : 'border-gray-100'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <UserAvatar 
            name={answer.author.name}
            size="md"
            role={answer.author.role}
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-900">{answer.author.name}</span>
              {answer.isVerified && <VerifiedBadge type="expert" size="sm" />}
              {answer.isAccepted && <VerifiedBadge type="best-answer" size="sm" />}
            </div>
            <TimeAgo date={answer.createdAt} className="text-xs" />
          </div>
        </div>

        {/* Action Menu */}
        {canEdit && showActions && (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="text-xs text-red-600 hover:text-red-700 font-semibold"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Best Answer Banner */}
      {answer.isAccepted && (
        <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 rounded">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircleIconSolid className="w-5 h-5" />
            <span className="font-bold text-sm">Best Answer - Verified Solution</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-sm max-w-none mb-6">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {answer.content}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4">
          {/* Helpful Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleMarkHelpful}
            className={`flex items-center gap-2 transition-colors ${
              localHelpful ? 'text-teal' : 'text-gray-500 hover:text-teal'
            }`}
          >
            {localHelpful ? (
              <HandThumbUpIconSolid className="w-5 h-5" />
            ) : (
              <HandThumbUpIcon className="w-5 h-5" />
            )}
            <span className="text-sm font-semibold">
              {localCount} {localCount === 1 ? 'person' : 'people'} found this helpful
            </span>
          </motion.button>

          {/* Reply Button */}
          {onReply && (
            <button
              onClick={onReply}
              className="flex items-center gap-1 text-gray-500 hover:text-teal transition-colors text-sm"
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span>Reply</span>
            </button>
          )}
        </div>

        {/* Share Button */}
        <button className="text-gray-400 hover:text-gray-600 text-xs font-semibold">
          🔗 Share
        </button>
      </div>
    </motion.div>
  );
};

export default AnswerCard;