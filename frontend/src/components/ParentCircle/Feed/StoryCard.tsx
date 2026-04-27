/**
 * ============================================
 * STORY CARD — PARENTCIRCLE
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 */

import React, { useState } from 'react';
import { HeartIcon, ChatBubbleLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import type { Story } from '../../../types/parentcircle.types';
import CategoryBadge from '../Shared/CategoryBadge';
import TimeAgo from '../Shared/TimeAgo';

interface StoryCardProps {
  story: Story;
  onClick: () => void;
  onLike: () => void;
  isLiked?: boolean;
}

function truncate(text: string, max = 240): string {
  return text.length <= max ? text : text.substring(0, max).trimEnd() + '…';
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onClick, onLike, isLiked = false }) => {
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(story.likesCount ?? 0);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(prev => !prev);
    setLikes(prev => liked ? prev - 1 : prev + 1);
    onLike();
  };

  const commentCount = story._count?.comments ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm hover:shadow-lg hover:border-[#e9924b]/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Featured strip */}
      {story.isFeatured && (
        <div className="h-0.5 bg-gradient-to-r from-[#e9924b] to-[#e9924b]/30" />
      )}

      <div className="p-6">
        {/* Top row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {story.category && (
            <CategoryBadge
              name={story.category?.name}
              color={story.category?.color}
              icon={story.category?.icon}
            />
          )}
          {story.isFeatured && (
            <span className="px-2.5 py-1 bg-[#e9924b]/10 text-[#e9924b] text-[10px] font-bold uppercase tracking-widest rounded-full">
              Featured
            </span>
          )}
          <div className="flex items-center gap-1.5 text-[#1e3a6e]/35 text-xs ml-auto">
            <span>{story.authorName}</span>
            <span className="text-[#1e3a6e]/20">·</span>
            <TimeAgo date={story.createdAt} />
          </div>
        </div>

        {/* Title */}
        {story.title && (
          <h3 className="font-heading font-bold text-[#1e3a6e] text-base md:text-lg leading-snug mb-2.5 group-hover:text-[#e9924b] transition-colors">
            {story.title}
          </h3>
        )}

        {/* Content preview */}
        <p className="text-[#1e3a6e]/60 text-sm leading-[1.8] mb-4">
          {truncate(story.content)}
        </p>

        {/* Tags */}
        {story.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {story.tags.slice(0, 4).map((tag: string, i: number) => (
              <span key={i} className="px-2 py-0.5 bg-[#1e3a6e]/5 text-[#1e3a6e]/45 rounded-full text-xs font-medium">
                {tag}
              </span>
            ))}
            {story.tags.length > 4 && (
              <span className="text-[#1e3a6e]/30 text-xs self-center">+{story.tags.length - 4}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#1e3a6e]/6 pt-4">
          {/* Like button */}
          <motion.button
            onClick={handleLike}
            whileTap={{ scale: 0.85 }}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
              liked
                ? 'text-[#e9924b]'
                : 'text-[#1e3a6e]/35 hover:text-[#e9924b]'
            }`}
          >
            {liked
              ? <HeartIconSolid className="w-4 h-4" />
              : <HeartIcon className="w-4 h-4" />
            }
            <span>{likes}</span>
          </motion.button>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-[#1e3a6e]/35">
            <span className="flex items-center gap-1">
              <EyeIcon className="w-3.5 h-3.5" />
              {story.views ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <ChatBubbleLeftIcon className="w-3.5 h-3.5" />
              {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StoryCard;