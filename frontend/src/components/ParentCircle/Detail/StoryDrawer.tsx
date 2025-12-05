/**
 * StoryDrawer - Twitter-style slide-in story detail view
 * @version 1.1.0
 * @description Complete story drawer with comments and like functionality
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  PencilSquareIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useStory } from '../../../hooks/useParentCircle';
import * as API from '../../../services/parentcircle.service';
import CategoryBadge from '../Shared/CategoryBadge';
import TimeAgo from '../Shared/TimeAgo';
import UserAvatar from '../Shared/UserAvatar';
import CommentCard from './CommentCard';
import LoadingSkeleton from '../Shared/LoadingSkeleton';
import toast from 'react-hot-toast';

interface StoryDrawerProps {
  storyId: number | null;  // ✅ Allow null
  isOpen: boolean;
  onClose: () => void;
}

const StoryDrawer: React.FC<StoryDrawerProps> = ({ 
  storyId, 
  isOpen, 
  onClose 
}) => {
  // ✅ Only fetch if storyId exists
  const { story, comments, loading, error, refresh } = useStory(
    storyId ?  storyId.toString() : ''
  );
  
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const commentFormRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize like state
  useEffect(() => {
    if (story) {
      setLikeCount(story.likesCount);
      setLiked(false); // TODO: Check if user already liked from API
    }
  }, [story]);

  // Reset state when drawer closes
  useEffect(() => {
    if (! isOpen) {
      setNewComment('');
      setSubmitting(false);
      setLiked(false);
      setShowStickyBar(false);
    }
  }, [isOpen]);

  // Detect scroll for sticky bar
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (! container || !isOpen) return;

    const handleScroll = () => {
      const commentForm = commentFormRef.current;
      if (!commentForm) return;

      const rect = commentForm.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      setShowStickyBar(! isVisible);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [story, isOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style. overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLike = async () => {
    if (!storyId) return;

    try {
      await API.likeStory(storyId);
      setLiked(! liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
      toast.success(liked ? 'Unliked' : 'Story liked!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to like story');
    }
  };

  const handleSubmitComment = async (e: React. FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || ! storyId) return;

    try {
      setSubmitting(true);
      await API.createComment(storyId, { content: newComment. trim() });
      toast.success('Comment submitted!  It will appear after moderation.');
      setNewComment('');
      refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (!story) return;

    const shareUrl = `${window.location.origin}/parentcircle/story/${storyId}`;
    const shareText = `${story.title || 'Check out this story'} - ParentCircle Community`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          url: shareUrl
        });
        toast.success('Shared successfully!');
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const scrollToCommentForm = () => {
    commentFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ✅ Don't render if no storyId
  if (!storyId) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[600px] lg:w-[700px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-900">Story Details</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Share story"
                  title="Share story"
                >
                  <ShareIcon className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto"
            >
              {loading ?  (
                <div className="p-6">
                  <LoadingSkeleton count={1} />
                </div>
              ) : error || !story ? (
                <div className="p-6 text-center">
                  <p className="text-red-600 font-semibold mb-2">Story not found</p>
                  <p className="text-gray-600 text-sm">{error || 'This story may have been removed'}</p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2 bg-teal text-white rounded-lg hover:bg-teal/90 transition-all"
                  >
                    Go Back
                  </button>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Story Card */}
                  <div>
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {story.category && (
                        <CategoryBadge 
                          name={story.category. name}
                          color={story.category.color}
                          icon={story.category.icon}
                          size="sm"
                        />
                      )}
                      {story.isFeatured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                          Featured Story
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    {story.title && (
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        {story.title}
                      </h1>
                    )}

                    {/* Content */}
                    <div className="prose prose-base max-w-none mb-4">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {story.content}
                      </p>
                    </div>

                    {/* Tags */}
                    {story.tags && story.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {story.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Author & Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <UserAvatar 
                          name={story.authorName}
                          size="md"
                          isAnonymous={! story.author}
                        />
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {story.authorName}
                          </div>
                          <TimeAgo date={story.createdAt} className="text-xs" />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{story.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ChatBubbleLeftIcon className="w-4 h-4" />
                          <span>{comments.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Like Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLike}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                          liked 
                            ? 'bg-red-50 text-red-600 border-2 border-red-300 shadow-sm' 
                            : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 border-2 border-gray-200'
                        }`}
                      >
                        {liked ? (
                          <HeartIconSolid className="w-5 h-5" />
                        ) : (
                          <HeartIcon className="w-5 h-5" />
                        )}
                        <span>{likeCount} {likeCount === 1 ?  'Like' : 'Likes'}</span>
                      </motion. button>
                    </div>

                    {/* Top Comment Button */}
                    <button
                      onClick={scrollToCommentForm}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal text-white rounded-xl hover:bg-teal/90 transition-all font-semibold"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                      Leave a Comment
                    </button>
                  </div>

                  {/* Comments Section */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {comments.length} {comments.length === 1 ?  'Comment' : 'Comments'}
                    </h3>

                    <div className="space-y-3">
                      {comments.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                          <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600 font-medium">No comments yet</p>
                          <p className="text-sm text-gray-500 mt-1">Be the first to share your thoughts!</p>
                        </div>
                      ) : (
                        comments.map((comment) => (
                          <CommentCard key={comment.id} comment={comment} />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Comment Form */}
                  <div ref={commentFormRef} className="scroll-mt-20">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Leave a Comment
                    </h3>
                    
                    <form onSubmit={handleSubmitComment}>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target. value)}
                        placeholder="Share your thoughts, support, or similar experiences..."
                        className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none min-h-[120px] resize-none"
                        required
                      />
                      
                      <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
                        <p className="text-xs text-gray-500">
                          Be kind and supportive
                        </p>
                        
                        <button
                          type="submit"
                          disabled={submitting || !newComment. trim()}
                          className="bg-teal text-white font-bold py-2. 5 px-6 rounded-xl hover:bg-teal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {submitting ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Bottom Bar (appears on scroll) */}
            <AnimatePresence>
              {showStickyBar && !loading && story && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="flex-shrink-0 border-t-2 border-gray-200 bg-white p-4 shadow-2xl"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={scrollToCommentForm}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                      <span className="hidden sm:inline">Leave your comment</span>
                      <span className="sm:hidden">Comment</span>
                    </button>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLike}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                        liked 
                          ? 'bg-red-50 text-red-600 border-2 border-red-300' 
                          : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 border-2 border-gray-200'
                      }`}
                    >
                      {liked ? (
                        <HeartIconSolid className="w-5 h-5" />
                      ) : (
                        <HeartIcon className="w-5 h-5" />
                      )}
                      <span className="hidden sm:inline">{likeCount}</span>
                    </motion.button>
                  </div>
                </motion. div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StoryDrawer;