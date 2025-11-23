/**
 * ============================================
 * COMMENT CARD COMPONENT
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 06:57:02 UTC
 * ============================================
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
  comment,
  canEdit = false,
  onEdit,
  onDelete
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-all"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        <UserAvatar 
          name={comment.authorName}
          size="sm"
          isAnonymous={!comment.author}
        />
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900">
                {comment.authorName}
              </span>
              <TimeAgo date={comment.createdAt} className="text-xs" />
            </div>

            {/* Actions */}
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

          {/* Content */}
          <p className="text-sm text-gray-700 leading-relaxed">
            {comment.content}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentCard;