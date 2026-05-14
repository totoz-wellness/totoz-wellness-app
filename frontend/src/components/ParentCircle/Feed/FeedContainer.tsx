/**
 * ============================================
 * FEED CONTAINER — PARENTCIRCLE
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 */

import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { motion } from 'framer-motion';
import QuestionCard from './QuestionCard';
import StoryCard from './StoryCard';
import LoadingSkeleton from '../Shared/LoadingSkeleton';
import type { Question, Story } from '../../../types/parentcircle.types';

interface FeedContainerProps {
  type: 'question' | 'story';
  items: Question[] | Story[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onItemClick: (id: number) => void;
  onVote?: (id: number, isHelpful: boolean) => void;
  onLike?: (id: number) => void;
  onCreateNew: () => void;
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────

const FeedEmpty: React.FC<{ type: 'question' | 'story'; onCreateNew: () => void }> = ({
  type, onCreateNew,
}) => (
  <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-14 text-center">
    <div className="w-12 h-12 rounded-2xl bg-[#e9924b]/8 flex items-center justify-center mx-auto mb-4">
      {type === 'question' ? (
        <svg className="w-6 h-6 text-[#e9924b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-[#e9924b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )}
    </div>
    <p className="font-heading font-bold text-[#1e3a6e] text-base mb-1">
      {type === 'question' ? 'No questions yet' : 'No stories yet'}
    </p>
    <p className="text-[#1e3a6e]/45 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
      {type === 'question'
        ? "This is a safe space. There's no question too small or too personal."
        : "Your story might be exactly what another parent needs to hear today."}
    </p>
    <button
      onClick={onCreateNew}
      className="px-6 py-2.5 bg-[#e9924b] hover:bg-[#d4762a] text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#e9924b]/20"
    >
      {type === 'question' ? 'Ask the first question' : 'Share the first story'}
    </button>
  </div>
);

// ─── LOAD MORE SPINNER ────────────────────────────────────────────────────────

const LoadMore: React.FC = () => (
  <div className="flex items-center justify-center gap-2 py-8 text-[#1e3a6e]/40 text-sm">
    <div className="w-4 h-4 border-2 border-[#e9924b]/30 border-t-[#e9924b] rounded-full animate-spin" />
    Loading more…
  </div>
);

// ─── END MESSAGE ─────────────────────────────────────────────────────────────

const EndMessage: React.FC<{ type: 'question' | 'story' }> = ({ type }) => (
  <div className="py-10 text-center">
    <div className="h-px bg-[#1e3a6e]/8 mb-6" />
    <p className="text-[#1e3a6e]/35 text-xs leading-relaxed">
      {type === 'question'
        ? "You've read through all the questions. Something here might have already answered yours."
        : "You've reached the end. Thank you for taking the time to read others' stories."}
    </p>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const FeedContainer: React.FC<FeedContainerProps> = ({
  type, items, loading, hasMore, onLoadMore,
  onItemClick, onVote, onLike, onCreateNew,
}) => {
  if (loading && items.length === 0) {
    return <LoadingSkeleton count={4} />;
  }

  if (!loading && items.length === 0) {
    return <FeedEmpty type={type} onCreateNew={onCreateNew} />;
  }

  return (
    <InfiniteScroll
      dataLength={items.length}
      next={onLoadMore}
      hasMore={hasMore}
      loader={<LoadMore />}
      endMessage={<EndMessage type={type} />}
      className="space-y-4"
    >
      {type === 'question'
        ? (items as Question[]).map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
            >
              <QuestionCard
                question={q}
                onClick={() => onItemClick(q.id)}
                onVote={isHelpful => onVote?.(q.id, isHelpful)}
              />
            </motion.div>
          ))
        : (items as Story[]).map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
            >
              <StoryCard
                story={s}
                onClick={() => onItemClick(s.id)}
                onLike={() => onLike?.(s.id)}
              />
            </motion.div>
          ))
      }
    </InfiniteScroll>
  );
};

export default FeedContainer;