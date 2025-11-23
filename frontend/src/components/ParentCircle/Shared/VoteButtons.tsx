/**
 * ============================================
 * VOTE BUTTONS COMPONENT
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 06:41:53 UTC
 * ============================================
 */

import React, { useState } from 'react';
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpIconSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface VoteButtonsProps {
  upvotes: number;
  downvotes?: number;
  onVoteUp: () => void;
  onVoteDown?: () => void;
  hasVotedUp?: boolean;
  hasVotedDown?: boolean;
  disabled?: boolean;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({ 
  upvotes,
  downvotes,
  onVoteUp,
  onVoteDown,
  hasVotedUp = false,
  hasVotedDown = false,
  disabled = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleVoteUp = () => {
    if (disabled) return;
    setIsAnimating(true);
    onVoteUp();
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleVoteDown = () => {
    if (disabled || !onVoteDown) return;
    onVoteDown();
  };

  return (
    <div className="flex items-center gap-3">
      {/* Upvote Button */}
      <motion.button
        onClick={handleVoteUp}
        disabled={disabled}
        className={`flex items-center gap-1.5 transition-all ${
          hasVotedUp 
            ? 'text-teal' 
            : 'text-gray-500 hover:text-teal'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        whileTap={{ scale: 0.9 }}
        animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
      >
        {hasVotedUp ? (
          <HandThumbUpIconSolid className="w-5 h-5" />
        ) : (
          <HandThumbUpIcon className="w-5 h-5" />
        )}
        <span className="text-sm font-semibold">{upvotes}</span>
      </motion.button>

      {/* Downvote Button (optional) */}
      {onVoteDown && (
        <button
          onClick={handleVoteDown}
          disabled={disabled}
          className={`flex items-center gap-1.5 transition-all ${
            hasVotedDown 
              ? 'text-red-500' 
              : 'text-gray-500 hover:text-red-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <HandThumbDownIcon className="w-5 h-5" />
          {downvotes !== undefined && downvotes > 0 && (
            <span className="text-sm font-semibold">{downvotes}</span>
          )}
        </button>
      )}
    </div>
  );
};

export default VoteButtons;