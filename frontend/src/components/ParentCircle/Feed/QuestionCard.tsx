/**
 * ============================================
 * QUESTION CARD — PARENTCIRCLE
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 */

import React from 'react';
import { ChatBubbleLeftIcon, EyeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import type { Question } from '../../../types/parentcircle.types';
import CategoryBadge from '../Shared/CategoryBadge';
import TimeAgo from '../Shared/TimeAgo';
import VoteButtons from '../Shared/VoteButtons';

interface QuestionCardProps {
  question: Question;
  onClick: () => void;
  onVote: (isHelpful: boolean) => void;
}

function truncate(text: string, max = 200): string {
  return text.length <= max ? text : text.substring(0, max).trimEnd() + '…';
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick, onVote }) => {
  const answerCount = question._count?.answers ?? 0;
  const hasAnswers = answerCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm hover:shadow-lg hover:border-[#e9924b]/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Answered indicator strip */}
      {hasAnswers && (
        <div className="h-0.5 bg-gradient-to-r from-[#659ec3] to-[#659ec3]/30" />
      )}

      <div className="p-6">
        {/* Top row — category + meta */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <CategoryBadge
            name={question.category?.name}
            color={question.category?.color}
            icon={question.category?.icon}
          />

          {question.isPinned && (
            <span className="px-2.5 py-1 bg-[#659ec3]/10 text-[#659ec3] text-[10px] font-bold uppercase tracking-widest rounded-full">
              Pinned
            </span>
          )}
          {question.isFeatured && (
            <span className="px-2.5 py-1 bg-[#e9924b]/10 text-[#e9924b] text-[10px] font-bold uppercase tracking-widest rounded-full">
              Featured
            </span>
          )}

          <div className="flex items-center gap-1.5 text-[#1e3a6e]/35 text-xs ml-auto">
            <span>{question.authorName}</span>
            <span className="text-[#1e3a6e]/20">·</span>
            <TimeAgo date={question.createdAt} />
          </div>
        </div>

        {/* Title */}
        {question.title && (
          <h3 className="font-heading font-bold text-[#1e3a6e] text-base md:text-lg leading-snug mb-2.5 group-hover:text-[#e9924b] transition-colors">
            {question.title}
          </h3>
        )}

        {/* Content preview */}
        <p className="text-[#1e3a6e]/60 text-sm leading-[1.75] mb-4">
          {truncate(question.content)}
        </p>

        {/* Tags */}
        {question.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {question.tags.slice(0, 4).map((tag: string, i: number) => (
              <span key={i} className="px-2 py-0.5 bg-[#1e3a6e]/5 text-[#1e3a6e]/45 rounded-full text-xs font-medium">
                {tag}
              </span>
            ))}
            {question.tags.length > 4 && (
              <span className="text-[#1e3a6e]/30 text-xs self-center">+{question.tags.length - 4}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#1e3a6e]/6 pt-4">
          {/* Vote — stop propagation so card click doesn't fire */}
          <div onClick={e => e.stopPropagation()}>
            <VoteButtons
              upvotes={question.helpfulCount ?? 0}
              onVoteUp={() => onVote(true)}
              onVoteDown={() => onVote(false)}
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-[#1e3a6e]/35">
            <span className="flex items-center gap-1">
              <EyeIcon className="w-3.5 h-3.5" />
              {question.views ?? 0}
            </span>
            <span className={`flex items-center gap-1.5 ${hasAnswers ? 'text-[#659ec3] font-semibold' : ''}`}>
              {hasAnswers
                ? <CheckCircleIcon className="w-3.5 h-3.5" />
                : <ChatBubbleLeftIcon className="w-3.5 h-3.5" />
              }
              {answerCount} {answerCount === 1 ? 'answer' : 'answers'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionCard;