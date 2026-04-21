/**
 * ============================================
 * STORY CARD COMPONENT
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 06:41:53 UTC
 * ============================================
 */

import React, { useState } from 'react';
import { HeartIcon, ChatBubbleLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import type { Story } from '../../../types/parentcircle.types';
import CategoryBadge from '../Shared/CategoryBadge';
import TimeAgo from '../Shared/TimeAgo';
import VerifiedBadge from '../Shared/VerifiedBadge';

interface StoryCardProps {
  story: Story;
  onClick: () => void;
  onLike: () => void;
  isLiked?: boolean;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onClick, onLike, isLiked = false }) => {
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(story.likesCount);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    onLike();
  };

  const truncateContent = (text: string, maxLength = 250) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        {story.category && (
          <CategoryBadge 
            name={story.category.name}
            color={story.category.color}
            icon={story.category.icon}
          />
        )}
        
        {story.isFeatured && (
          <VerifiedBadge type="featured" size="sm" />
        )}
        
        <div className="flex items-center gap-2 text-xs text-gray-400 ml-auto">
          <TimeAgo date={story.createdAt} />
          <span>•</span>
          <span>{story.authorName}</span>
        </div>
      </div>

      {/* Title */}
      {story.title && (
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal transition-colors flex items-start gap-2">
          {story.isFeatured && <span className="text-2xl">⭐</span>}
          <span>{story.title}</span>
        </h3>
      )}

      {/* Content Preview */}
      <p className="text-gray-700 mb-4 leading-relaxed">
        {truncateContent(story.content)}
      </p>

      {/* Tags */}
      {story.tags && story.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {story.tags.slice(0, 4).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
            >
              #{tag}
            </span>
          ))}
          {story.tags.length > 4 && (
            <span className="px-2 py-1 text-gray-400 text-xs">
              +{story.tags.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        {/* Like Button */}
        <motion.button
          onClick={handleLike}
          whileTap={{ scale: 0.9 }}
          className={`flex items-center gap-2 transition-colors ${
            liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          {liked ? (
            <HeartIconSolid className="w-5 h-5" />
          ) : (
            <HeartIcon className="w-5 h-5" />
          )}
          <span className="text-sm font-semibold">{likes}</span>
        </motion.button>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {/* Views */}
          <div className="flex items-center gap-1">
            <EyeIcon className="w-4 h-4" />
            <span>{story.views}</span>
          </div>

          {/* Comments */}
          <div className="flex items-center gap-1">
            <ChatBubbleLeftIcon className="w-4 h-4" />
            <span>{story._count.comments} {story._count.comments === 1 ? 'Comment' : 'Comments'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StoryCard;