/**
 * ============================================
 * FEED CONTAINER
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 06:47:13 UTC
 * ============================================
 */

import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import QuestionCard from './QuestionCard';
import StoryCard from './StoryCard';
import LoadingSkeleton from '../Shared/LoadingSkeleton';
import EmptyState from '../Shared/EmptyState';
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

const FeedContainer: React.FC<FeedContainerProps> = ({
  type,
  items,
  loading,
  hasMore,
  onLoadMore,
  onItemClick,
  onVote,
  onLike,
  onCreateNew
}) => {
  // Initial loading state
  if (loading && items.length === 0) {
    return <LoadingSkeleton count={5} />;
  }

  // Empty state
  if (!loading && items.length === 0) {
    return (
      <EmptyState
        type="content"
        message={`No ${type === 'question' ? 'questions' : 'stories'} found`}
        submessage={`Be the first to ${type === 'question' ? 'ask a question' : 'share a story'}!`}
        actionLabel={type === 'question' ? 'Ask Question' : 'Share Story'}
        onAction={onCreateNew}
      />
    );
  }

  return (
    <InfiniteScroll
      dataLength={items.length}
      next={onLoadMore}
      hasMore={hasMore}
      loader={
        <div className="py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal"></div>
          <p className="text-gray-500 mt-2">Loading more...</p>
        </div>
      }
      endMessage={
        <div className="py-8 text-center">
          <p className="text-gray-500 font-semibold">🎉 You've seen it all!</p>
          <p className="text-sm text-gray-400 mt-1">Check back later for new content</p>
        </div>
      }
      className="space-y-6"
    >
      {type === 'question' ? (
        // Render Questions
        (items as Question[]).map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onClick={() => onItemClick(question.id)}
            onVote={(isHelpful) => onVote?.(question.id, isHelpful)}
          />
        ))
      ) : (
        // Render Stories
        (items as Story[]).map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            onClick={() => onItemClick(story.id)}
            onLike={() => onLike?.(story.id)}
          />
        ))
      )}
    </InfiniteScroll>
  );
};

export default FeedContainer;