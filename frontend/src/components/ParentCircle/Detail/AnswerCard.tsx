/**
 * ============================================
 * ANSWER CARD — PARENTCIRCLE
 * ============================================
 * @version     3.0.0
 * @updated     2025-04-23
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
  answer, onMarkHelpful, canAccept = false, onAccept,
}) => {
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(answer.helpfulCount ?? 0);

  const handleMarkHelpful = () => {
    setIsHelpful(prev => !prev);
    setHelpfulCount(prev => isHelpful ? prev - 1 : prev + 1);
    onMarkHelpful();
  };

  const isEdited = answer.updatedAt && answer.updatedAt !== answer.createdAt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border overflow-hidden transition-all ${
        answer.isAccepted
          ? 'border-[#659ec3]/40'
          : answer.isVerified
          ? 'border-[#659ec3]/20'
          : 'border-[#1e3a6e]/8'
      }`}
    >
      {/* Accepted strip */}
      {answer.isAccepted && (
        <div className="h-0.5 bg-gradient-to-r from-[#659ec3] to-[#659ec3]/30" />
      )}

      <div className="p-5">
        {/* Accepted badge */}
        {answer.isAccepted && (
          <div className="flex items-center gap-2 mb-4">
            <CheckCircleIconSolid className="w-4 h-4 text-[#659ec3]" />
            <span className="text-[#659ec3] text-xs font-bold uppercase tracking-widest">Best answer</span>
          </div>
        )}

        {/* Author row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <UserAvatar name={answer.authorName} size="md" isVerified={answer.isVerified} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-[#1e3a6e] text-sm">{answer.authorName}</span>
                {answer.isVerified && (
                  <span className="px-2 py-0.5 bg-[#659ec3]/10 text-[#659ec3] text-[10px] font-bold uppercase tracking-widest rounded-full">
                    Verified expert
                  </span>
                )}
              </div>
              {answer.authorRole && (
                <p className="text-[#1e3a6e]/45 text-xs mt-0.5">{answer.authorRole}</p>
              )}
              <TimeAgo date={answer.createdAt} className="text-xs text-[#1e3a6e]/35 mt-0.5" />
            </div>
          </div>

          {/* Accept button */}
          {canAccept && !answer.isAccepted && onAccept && (
            <button
              onClick={onAccept}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#659ec3] bg-[#659ec3]/8 hover:bg-[#659ec3]/15 rounded-xl transition-all border border-[#659ec3]/20 flex-shrink-0"
            >
              <CheckCircleIcon className="w-3.5 h-3.5" />
              Mark as best
            </button>
          )}
        </div>

        {/* Content */}
        <p className="text-[#1e3a6e]/70 text-sm leading-[1.85] whitespace-pre-wrap mb-4">
          {answer.content}
        </p>

        {/* Edited note */}
        {isEdited && (
          <p className="text-[#1e3a6e]/30 text-xs mb-3">
            Edited <TimeAgo date={answer.updatedAt!} />
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-[#1e3a6e]/6">
          <button
            onClick={handleMarkHelpful}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isHelpful
                ? 'bg-[#659ec3]/10 text-[#659ec3] border border-[#659ec3]/20'
                : 'bg-[#1e3a6e]/5 text-[#1e3a6e]/50 hover:bg-[#659ec3]/8 hover:text-[#659ec3] border border-transparent'
            }`}
          >
            {isHelpful
              ? <HandThumbUpIconSolid className="w-4 h-4" />
              : <HandThumbUpIcon className="w-4 h-4" />
            }
            <span>Helpful{helpfulCount > 0 ? ` (${helpfulCount})` : ''}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AnswerCard;