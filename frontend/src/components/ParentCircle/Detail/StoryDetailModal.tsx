/**
 * ============================================
 * STORY DETAIL MODAL (TWITTER-STYLE)
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 09:40:02 UTC
 * @description Hybrid modal: Side panel (desktop) + Full screen (mobile)
 * ============================================
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowLeftIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import { useStory } from '../../../hooks/useParentCircle';
import * as API from '../../../services/parentcircle.service';
import toast from 'react-hot-toast';

interface StoryDetailModalProps {
  storyId: number;
  onClose: () => void;
}

const StoryDetailModal: React.FC<StoryDetailModalProps> = ({ storyId, onClose }) => {
  const { story, comments, loading, error, refresh } = useStory(storyId);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch like status
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await API.getLikeStatus(storyId);
        if (response.success) {
          setLiked(response.data.liked);
        }
      } catch (err) {
        console.error('Failed to fetch like status:', err);
      }
    };
    fetchLikeStatus();
  }, [storyId]);

  useEffect(() => {
    if (story) {
      setLikeCount(story.likeCount || 0);
    }
  }, [story]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleLike = async () => {
    try {
      await API.likeStory(storyId);
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
      toast.success(liked ? '💔 Unliked' : '❤️ Liked!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to like story');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;

    try {
      setSubmitting(true);
      await API.createComment(storyId, { content: commentText.trim() });
      toast.success('✅ Comment submitted successfully!');
      setCommentText('');
      refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading story...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-8 max-w-md"
        >
          <h3 className="text-xl font-bold text-red-600 mb-4">Error Loading Story</h3>
          <p className="text-gray-600 mb-6">{error || 'Story not found'}</p>
          <button
            onClick={onClose}
            className="w-full bg-teal text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal/90"
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container - Responsive */}
        <motion.div
          ref={modalRef}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute right-0 top-0 h-full w-full lg:w-[600px] bg-white shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden lg:block"
            >
              <XMarkIcon className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 flex-1 mx-4">Story</h2>
            <div className="w-9"></div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Story Content */}
            <div className="p-6 border-b border-gray-200">
              {/* Author & Metadata */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal flex items-center justify-center text-white font-bold text-lg">
                    {story.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{story.authorName}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {story.category && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    {story.category.name}
                  </span>
                )}
              </div>

              {/* Title */}
              {story.title && (
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  {story.title}
                </h1>
              )}

              {/* Content */}
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
                {story.content}
              </div>

              {/* Tags */}
              {story.tags && story.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {story.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions Bar */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 transition-all ${
                    liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                  }`}
                >
                  {liked ? (
                    <HeartIconSolid className="w-6 h-6" />
                  ) : (
                    <HeartIcon className="w-6 h-6" />
                  )}
                  <span className="font-semibold">{likeCount}</span>
                </button>
                <span className="flex items-center gap-2 text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-semibold">{comments?.length || 0}</span>
                </span>
                <span className="flex items-center gap-2 text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="font-semibold">{story.viewCount || 0}</span>
                </span>
              </div>
            </div>

            {/* Comment Form */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">Share Your Thoughts</h3>
              <form onSubmit={handleSubmitComment}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a supportive comment..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-teal focus:outline-none resize-none"
                  rows={3}
                  disabled={submitting}
                />
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-gray-500">
                    {commentText.length}/500 characters
                  </p>
                  <button
                    type="submit"
                    disabled={!commentText.trim() || submitting}
                    className="bg-teal text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            </div>

            {/* Comments Section */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {comments?.length || 0} Comments
              </h3>

              {/* Comments List */}
              <div className="space-y-4">
                {comments && comments.length > 0 ? (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border-2 border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-all"
                    >
                      {/* Comment Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {comment.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-gray-900">{comment.authorName}</p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <p className="text-gray-700 leading-relaxed mt-2 whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No comments yet</h3>
                    <p className="text-gray-600">Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StoryDetailModal;