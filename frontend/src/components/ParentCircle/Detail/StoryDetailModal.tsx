/**
 * ============================================
 * STORY DETAIL MODAL — PARENTCIRCLE
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 * @description Slide-in panel: full-screen mobile, 600px side panel desktop
 * ============================================
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowLeftIcon, HeartIcon, ChatBubbleLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useStory } from '../../../hooks/useParentCircle';
import * as API from '../../../services/parentcircle.service';
import toast from 'react-hot-toast';
import UserAvatar from '../Shared/UserAvatar';
import TimeAgo from '../Shared/TimeAgo';
import CategoryBadge from '../Shared/CategoryBadge';
import CommentCard from '../Detail/CommentCard';

interface StoryDetailModalProps {
  storyId: number;
  onClose: () => void;
}

const StoryDetailModal: React.FC<StoryDetailModalProps> = ({ storyId, onClose }) => {
  const { story, comments, loading, error, refresh } = useStory(storyId.toString());
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Try to fetch like status
  useEffect(() => {
    API.getLikeStatus?.(storyId)
      .then(r => { if (r?.success) setLiked(r.data?.liked ?? false); })
      .catch(() => {});
  }, [storyId]);

  useEffect(() => {
    if (story) setLikeCount(story.likesCount ?? story.likeCount ?? 0);
  }, [story]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleLike = async () => {
    try {
      await API.likeStory(storyId);
      setLiked(prev => !prev);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
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
      toast.success('Your comment has been submitted for review — thank you.');
      setCommentText('');
      refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#1e3a6e]/40 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-3 shadow-xl">
          <div className="w-8 h-8 border-2 border-[#e9924b]/30 border-t-[#e9924b] rounded-full animate-spin" />
          <p className="text-[#1e3a6e]/55 text-sm">Loading story...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !story) {
    return (
      <div className="fixed inset-0 bg-[#1e3a6e]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl text-center"
        >
          <p className="font-heading font-bold text-[#1e3a6e] text-base mb-2">Story not found</p>
          <p className="text-[#1e3a6e]/50 text-sm mb-7">{error || 'This story may have been removed.'}</p>
          <button onClick={onClose} className="w-full px-6 py-2.5 bg-[#e9924b] text-white text-sm font-semibold rounded-xl hover:bg-[#d4762a] transition-all">
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
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#1e3a6e]/40 backdrop-blur-sm"
        />

        {/* Panel */}
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute right-0 top-0 h-full w-full lg:w-[600px] bg-white shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-[#1e3a6e]/8 bg-white">
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="lg:hidden p-1.5 text-[#1e3a6e]/40 hover:text-[#1e3a6e] rounded-xl transition-colors">
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <p className="font-heading font-extrabold text-[#1e3a6e] text-base">Story</p>
                <p className="text-[#1e3a6e]/35 text-xs">{comments?.length ?? 0} {comments?.length === 1 ? 'comment' : 'comments'}</p>
              </div>
            </div>
            <button onClick={onClose} className="hidden lg:flex p-1.5 text-[#1e3a6e]/40 hover:text-[#1e3a6e] hover:bg-[#1e3a6e]/5 rounded-xl transition-all">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-6">

              {/* Story body */}
              <div className="bg-[#fbfbfb] rounded-2xl border border-[#1e3a6e]/8 p-5">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {story.category && (
                    <CategoryBadge name={story.category?.name} color={story.category?.color} icon={story.category?.icon} size="sm" />
                  )}
                  {story.isFeatured && (
                    <span className="px-2.5 py-1 bg-[#e9924b]/10 text-[#e9924b] text-[10px] font-bold uppercase tracking-widest rounded-full">Featured</span>
                  )}
                </div>

                {story.title && (
                  <h1 className="font-heading font-extrabold text-[#1e3a6e] text-lg leading-snug mb-3">{story.title}</h1>
                )}

                <p className="text-[#1e3a6e]/70 text-sm leading-[1.9] whitespace-pre-wrap mb-4">{story.content}</p>

                {story.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {story.tags.map((tag: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-[#1e3a6e]/5 text-[#1e3a6e]/45 rounded-full text-xs">{tag}</span>
                    ))}
                  </div>
                )}

                {/* Author + stats */}
                <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-[#1e3a6e]/8">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={story.authorName} size="sm" isAnonymous={!story.author} />
                    <div>
                      <p className="font-semibold text-[#1e3a6e] text-xs">{story.authorName}</p>
                      <TimeAgo date={story.createdAt} className="text-[10px] text-[#1e3a6e]/35" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[#1e3a6e]/30 text-xs">
                    <span className="flex items-center gap-1"><EyeIcon className="w-3.5 h-3.5" />{story.views ?? story.viewCount ?? 0}</span>
                    <span className="flex items-center gap-1"><ChatBubbleLeftIcon className="w-3.5 h-3.5" />{comments?.length ?? 0}</span>
                  </div>
                </div>

                {/* Like button */}
                <div className="pt-4 border-t border-[#1e3a6e]/8 mt-4">
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      liked
                        ? 'bg-[#e9924b]/10 text-[#e9924b] border-[#e9924b]/25'
                        : 'bg-white text-[#1e3a6e]/40 border-[#1e3a6e]/15 hover:border-[#e9924b]/25 hover:text-[#e9924b]'
                    }`}
                  >
                    {liked ? <HeartIconSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                    <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
                  </motion.button>
                </div>
              </div>

              {/* Comment form */}
              <div>
                <p className="font-heading font-bold text-[#1e3a6e] text-sm mb-1">Leave a comment</p>
                <p className="text-[#1e3a6e]/40 text-xs mb-3 leading-relaxed">
                  Respond with kindness. Comments are reviewed before appearing.
                </p>
                <form onSubmit={handleSubmitComment}>
                  <textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Share your thoughts, support, or a similar experience..."
                    className="w-full p-4 bg-[#fbfbfb] border border-[#1e3a6e]/12 rounded-xl text-[#1e3a6e] placeholder-[#1e3a6e]/30 text-sm leading-relaxed min-h-[100px] resize-none focus:outline-none focus:border-[#e9924b]/40 transition-all"
                    disabled={submitting}
                    required
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[#1e3a6e]/25 text-xs">{commentText.length} / 500</span>
                    <button
                      type="submit"
                      disabled={!commentText.trim() || submitting}
                      className="px-5 py-2.5 bg-[#e9924b] hover:bg-[#d4762a] text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#e9924b]/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Posting...' : 'Post comment'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Comments list */}
              <div>
                <p className="font-heading font-bold text-[#1e3a6e] text-sm mb-4">
                  {comments?.length ?? 0} {comments?.length === 1 ? 'Comment' : 'Comments'}
                </p>

                {!comments?.length ? (
                  <div className="bg-[#fbfbfb] rounded-2xl border border-[#1e3a6e]/8 p-8 text-center">
                    <p className="text-[#1e3a6e]/45 text-sm">No comments yet. If this story resonates with you, let the author know.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 px-5 divide-y divide-[#1e3a6e]/6">
                    {comments.map(c => <CommentCard key={c.id} comment={c} />)}
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