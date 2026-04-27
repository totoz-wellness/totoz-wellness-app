/**
 * ============================================
 * COMMENT CARD — PARENTCIRCLE
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Comment } from '../../../types/parentcircle.types';
import UserAvatar from '../Shared/UserAvatar';
import TimeAgo from '../Shared/TimeAgo';

interface CommentCardProps {
  comment: Comment;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment, canEdit = false, onEdit, onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="flex items-start gap-3 py-4 border-b border-[#1e3a6e]/6 last:border-0"
    >
      <UserAvatar name={comment.authorName} size="sm" isAnonymous={!comment.author} />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1e3a6e] text-sm">{comment.authorName}</span>
            <TimeAgo date={comment.createdAt} className="text-[#1e3a6e]/35 text-xs" />
          </div>

          {canEdit && showActions && (
            <div className="flex items-center gap-3">
              <button
                onClick={onEdit}
                className="text-xs text-[#659ec3] hover:text-[#1e3a6e] font-semibold transition-colors"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <p className="text-[#1e3a6e]/65 text-sm leading-[1.75]">
          {comment.content}
        </p>
      </div>
    </motion.div>
  );
};

export default CommentCard;