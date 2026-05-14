/**
 * ============================================
 * STORY DETAIL — PARENTCIRCLE
 * ============================================
 * @version     6.0.0
 * @updated     2025-04-23
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon, EyeIcon, ChatBubbleLeftIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
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
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const StoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { story, comments, loading, error, refresh } = useStory(id || '');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (story) setLikeCount(story.likesCount ?? 0);
  }, [story]);

  const handleLike = async () => {
    if (!id) return;
    try {
      await API.likeStory(Number(id));
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to like story');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;
    try {
      setSubmitting(true);
      await API.createComment(Number(id), { content: newComment.trim() });
      toast.success('Your comment has been submitted for review — thank you.');
      setNewComment('');
      refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfbfb]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
          <LoadingSkeleton count={1} />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-[#fbfbfb]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
          <EmptyState
            type="error"
            message="Story not found"
            submessage={error || "This story may have been removed."}
            actionLabel="Back to community"
            onAction={() => navigate('/parentcircle')}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfb]">
      <Navbar />

      {/* Hero strip */}
      <div className="bg-[#1e3a6e] pt-28 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a6e] to-[#659ec3]/20 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <button
            onClick={() => navigate('/parentcircle')}
            className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to ParentCircle
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-[#e9924b]" />
            <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Story</span>
          </div>
          {story.title && (
            <h1 className="font-heading font-extrabold text-white text-2xl md:text-3xl leading-tight">
              {story.title}
            </h1>
          )}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-10">

        {/* Story body */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-7 mb-8"
        >
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-5">
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
          </div>

          {/* Content */}
          <p className="text-[#1e3a6e]/75 text-base leading-[1.9] whitespace-pre-wrap mb-6">
            {story.content}
          </p>

          {/* Tags */}
          {story.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {story.tags.map((tag: string, i: number) => (
                <span key={i} className="px-2.5 py-1 bg-[#1e3a6e]/5 text-[#1e3a6e]/55 rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author + stats */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-5 border-t border-[#1e3a6e]/8">
            <div className="flex items-center gap-3">
              <UserAvatar name={story.authorName} size="md" isAnonymous={!story.author} />
              <div>
                <p className="font-semibold text-[#1e3a6e] text-sm">{story.authorName}</p>
                <TimeAgo date={story.createdAt} className="text-xs text-[#1e3a6e]/40" />
              </div>
            </div>
            <div className="flex items-center gap-5 text-[#1e3a6e]/35 text-xs">
              <span className="flex items-center gap-1.5">
                <EyeIcon className="w-4 h-4" />
                {story.views ?? 0} views
              </span>
              <span className="flex items-center gap-1.5">
                <ChatBubbleLeftIcon className="w-4 h-4" />
                {comments.length} comments
              </span>
            </div>
          </div>

          {/* Like */}
          <div className="mt-5 pt-5 border-t border-[#1e3a6e]/8">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                liked
                  ? 'bg-[#e9924b]/10 text-[#e9924b] border-[#e9924b]/25'
                  : 'bg-white text-[#1e3a6e]/50 border-[#1e3a6e]/15 hover:border-[#e9924b]/25 hover:text-[#e9924b]'
              }`}
            >
              {liked
                ? <HeartIconSolid className="w-5 h-5" />
                : <HeartIcon className="w-5 h-5" />
              }
              <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Comments section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <p className="font-heading font-bold text-[#1e3a6e] text-lg mb-5">
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </p>

          {comments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-10 text-center">
              <div className="w-10 h-10 rounded-2xl bg-[#659ec3]/10 flex items-center justify-center mx-auto mb-3">
                <ChatBubbleLeftIcon className="w-5 h-5 text-[#659ec3]" />
              </div>
              <p className="font-heading font-bold text-[#1e3a6e] text-sm mb-1">No comments yet</p>
              <p className="text-[#1e3a6e]/45 text-sm">If this story resonates with you, let the author know.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map(comment => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Comment form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-7"
        >
          <p className="font-heading font-bold text-[#1e3a6e] text-base mb-1">Leave a comment</p>
          <p className="text-[#1e3a6e]/40 text-xs mb-5 leading-relaxed">
            Respond with kindness. Your words can genuinely make someone's day.
          </p>

          <form onSubmit={handleSubmitComment}>
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts, support, or a similar experience..."
              className="w-full p-4 bg-[#fbfbfb] border border-[#1e3a6e]/12 rounded-xl text-[#1e3a6e] placeholder-[#1e3a6e]/30 text-sm leading-relaxed min-h-[110px] resize-none focus:outline-none focus:border-[#e9924b]/40 transition-all"
              required
            />

            <div className="flex items-center justify-end mt-4">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-6 py-2.5 bg-[#e9924b] hover:bg-[#d4762a] text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#e9924b]/20 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                {submitting ? 'Posting...' : 'Post comment'}
              </button>
            </div>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default StoryDetail;