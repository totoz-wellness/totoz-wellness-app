/**
 * ============================================
 * STORY DETAIL PAGE
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 06:57:02 UTC
 * ============================================
 */

import React, { useState } from 'react';
import { ArrowLeftIcon, EyeIcon, ChatBubbleLeftIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useStory } from '../../hooks/useParentCircle';
import * as API from '../../services/parentcircle.service';
import CategoryBadge from '../../components/ParentCircle/Shared/CategoryBadge';
import TimeAgo from '../../components/ParentCircle/Shared/TimeAgo';
import UserAvatar from '../../components/ParentCircle/Shared/UserAvatar';
import CommentCard from '../../components/ParentCircle/Detail/CommentCard';
import LoadingSkeleton from '../../components/ParentCircle/Shared/LoadingSkeleton';
import EmptyState from '../../components/ParentCircle/Shared/EmptyState';

interface StoryDetailProps {
  storyId: number | string;
  onBack: () => void;
}

const StoryDetail: React.FC<StoryDetailProps> = ({ storyId, onBack }) => {
  const { story, comments, loading, error, refresh } = useStory(storyId);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  React.useEffect(() => {
    if (story) {
      setLikeCount(story.likesCount);
    }
  }, [story]);

  const handleLike = async () => {
    try {
      await API.likeStory(Number(storyId));
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
      toast.success(liked ? '💔 Unliked' : '❤️ Liked!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to like story');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await API.createComment(Number(storyId), { content: newComment.trim() });
      toast.success('✅ Comment submitted! It will appear after moderation.');
      setNewComment('');
      refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <LoadingSkeleton count={1} />
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <EmptyState
            type="error"
            message="Story not found"
            submessage={error || "The story you're looking for doesn't exist or has been removed"}
            actionLabel="← Go Back"
            onAction={onBack}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-teal transition-colors font-semibold"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Feed
        </motion.button>

        {/* Story Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {story.category && (
              <CategoryBadge 
                name={story.category.name}
                color={story.category.color}
                icon={story.category.icon}
              />
            )}
            
            {story.isFeatured && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                ⭐ Featured Story
              </span>
            )}
          </div>

          {/* Title */}
          {story.title && (
            <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-start gap-3">
              {story.isFeatured && <span className="text-4xl">⭐</span>}
              <span>{story.title}</span>
            </h1>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-6">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
              {story.content}
            </p>
          </div>

          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {story.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author & Stats */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <UserAvatar 
                name={story.authorName}
                size="lg"
                isAnonymous={!story.author}
              />
              <div>
                <div className="font-semibold text-gray-900">{story.authorName}</div>
                <TimeAgo date={story.createdAt} className="text-sm" />
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <EyeIcon className="w-5 h-5" />
                <span>{story.views} views</span>
              </div>
              <div className="flex items-center gap-1">
                <ChatBubbleLeftIcon className="w-5 h-5" />
                <span>{comments.length} comments</span>
              </div>
            </div>
          </div>

          {/* Like Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold transition-all ${
                liked 
                  ? 'bg-red-50 text-red-600 border-2 border-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 border-2 border-gray-200'
              }`}
            >
              {liked ? (
                <HeartIconSolid className="w-6 h-6" />
              ) : (
                <HeartIcon className="w-6 h-6" />
              )}
              <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            💬 {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </h2>

          {comments.length === 0 ? (
            <EmptyState
              type="content"
              message="No comments yet"
              submessage="Be the first to share your thoughts on this story!"
            />
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Comment Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Leave a Comment
          </h3>
          
          <form onSubmit={handleSubmitComment}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts, support, or similar experiences..."
              className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none min-h-[100px] resize-none"
              required
            />
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                💚 <strong>Be kind:</strong> Support and uplift each other
              </p>
              
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-teal text-white font-bold py-3 px-8 rounded-full hover:bg-teal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default StoryDetail;