/**
 * ============================================
 * VOTE BUTTONS — PARENTCIRCLE SHARED
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
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
  disabled = false,
}) => {
  const [bumping, setBumping] = useState(false);

  const handleVoteUp = () => {
    if (disabled) return;
    setBumping(true);
    onVoteUp();
    setTimeout(() => setBumping(false), 300);
  };

  return (
    <div className="flex items-center gap-4">
      {/* Upvote */}
      <motion.button
        onClick={handleVoteUp}
        disabled={disabled}
        animate={bumping ? { scale: [1, 1.25, 1] } : {}}
        transition={{ duration: 0.25 }}
        className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
          hasVotedUp
            ? 'text-[#e9924b]'
            : 'text-[#1e3a6e]/40 hover:text-[#e9924b]'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        {hasVotedUp
          ? <HandThumbUpIconSolid className="w-4 h-4" />
          : <HandThumbUpIcon className="w-4 h-4" />
        }
        <span>{upvotes}</span>
      </motion.button>

      {/* Downvote (optional) */}
      {onVoteDown && (
        <button
          onClick={disabled ? undefined : onVoteDown}
          disabled={disabled}
          className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
            hasVotedDown
              ? 'text-[#1e3a6e]'
              : 'text-[#1e3a6e]/30 hover:text-[#1e3a6e]/60'
          } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <HandThumbDownIcon className="w-4 h-4" />
          {downvotes !== undefined && downvotes > 0 && <span>{downvotes}</span>}
        </button>
      )}
    </div>
  );
};

export default VoteButtons;