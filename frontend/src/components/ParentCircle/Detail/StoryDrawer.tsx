/**
 * ============================================
 * STORY DRAWER — PARENTCIRCLE
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon, PencilSquareIcon, EyeIcon,
  ChatBubbleLeftIcon, HeartIcon, ShareIcon,
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
  storyId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const StoryDrawer: React.FC<StoryDrawerProps> = ({ storyId, isOpen, onClose }) => {
  const { story, comments, loading, error, refresh } = useStory(
    storyId ? storyId.toString() : ''
  );
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const commentFormRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (story) setLikeCount(story.likesCount ?? 0);
  }, [story]);

  useEffect(() => {
    if (!isOpen) { setNewComment(''); setSubmitting(false); setLiked(false); setShowStickyBar(false); }
  }, [isOpen]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isOpen) return;
    const onScroll = () => {
      const form = commentFormRef.current;
      if (!form) return;
      const { top, bottom } = form.getBoundingClientRect();
      setShowStickyBar(!(top < window.innerHeight && bottom > 0));
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [story, isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleLike = async () => {
    if (!storyId) return;
    try {
      await API.likeStory(storyId);
      setLiked(prev => !prev);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
    } catch (err: any) { toast.error(err.message || 'Failed to like story'); }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !storyId) return;
    try {
      setSubmitting(true);
      await API.createComment(storyId, { content: newComment.trim() });
      toast.success('Your comment has been submitted for review — thank you.');
      setNewComment('');
      refresh();
    } catch (err: any) { toast.error(err.message || 'Failed to submit comment'); }
    finally { setSubmitting(false); }
  };

  const handleShare = async () => {
    if (!story) return;
    const url = `${window.location.origin}/parentcircle/story/${storyId}`;
    if (navigator.share) {
      try { await navigator.share({ title: story.title || 'A story from ParentCircle', url }); }
      catch {}
    } else {
      try { await navigator.clipboard.writeText(url); toast.success('Link copied'); }
      catch { toast.error('Failed to copy link'); }
    }
  };

  const scrollToForm = () => commentFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (!storyId) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1e3a6e]/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[600px] lg:w-[680px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#1e3a6e]/8 bg-white">
              <div>
                <p className="font-heading font-extrabold text-[#1e3a6e] text-base">Story</p>
                <p className="text-[#1e3a6e]/35 text-xs mt-0.5">
                  {comments?.length ?? 0} {comments?.length === 1 ? 'comment' : 'comments'}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={handleShare} className="p-2 text-[#1e3a6e]/40 hover:text-[#1e3a6e] hover:bg-[#1e3a6e]/5 rounded-xl transition-all" aria-label="Share">
                  <ShareIcon className="w-4 h-4" />
                </button>
                <button onClick={onClose} className="p-2 text-[#1e3a6e]/40 hover:text-[#1e3a6e] hover:bg-[#1e3a6e]/5 rounded-xl transition-all">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6"><LoadingSkeleton count={1} /></div>
              ) : error || !story ? (
                <div className="p-8 text-center">
                  <p className="font-heading font-bold text-[#1e3a6e] text-sm mb-1">Story not found</p>
                  <p className="text-[#1e3a6e]/45 text-sm mb-5">{error || 'This story may have been removed.'}</p>
                  <button onClick={onClose} className="px-5 py-2.5 bg-[#e9924b] text-white text-sm font-semibold rounded-xl hover:bg-[#d4762a] transition-all">Close</button>
                </div>
              ) : (
                <div className="p-6 space-y-7">

                  {/* Story body */}
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {story.category && <CategoryBadge name={story.category?.name} color={story.category?.color} icon={story.category?.icon} size="sm" />}
                      {story.isFeatured && <span className="px-2.5 py-1 bg-[#e9924b]/10 text-[#e9924b] text-[10px] font-bold uppercase tracking-widest rounded-full">Featured</span>}
                    </div>

                    {story.title && (
                      <h1 className="font-heading font-extrabold text-[#1e3a6e] text-xl leading-snug mb-3">{story.title}</h1>
                    )}

                    <p className="text-[#1e3a6e]/70 text-sm leading-[1.9] whitespace-pre-wrap mb-4">{story.content}</p>

                    {story.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {story.tags.map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-[#1e3a6e]/5 text-[#1e3a6e]/45 rounded-full text-xs font-medium">{tag}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-[#1e3a6e]/8">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={story.authorName} size="sm" isAnonymous={!story.author} />
                        <div>
                          <p className="font-semibold text-[#1e3a6e] text-xs">{story.authorName}</p>
                          <TimeAgo date={story.createdAt} className="text-[10px] text-[#1e3a6e]/35" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[#1e3a6e]/30 text-xs">
                        <span className="flex items-center gap-1"><EyeIcon className="w-3.5 h-3.5" />{story.views ?? 0}</span>
                        <span className="flex items-center gap-1"><ChatBubbleLeftIcon className="w-3.5 h-3.5" />{comments?.length ?? 0}</span>
                      </div>
                    </div>

                    {/* Like + comment CTA row */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#1e3a6e]/8">
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={handleLike}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                          liked
                            ? 'bg-[#e9924b]/10 text-[#e9924b] border-[#e9924b]/25'
                            : 'bg-white text-[#1e3a6e]/45 border-[#1e3a6e]/15 hover:border-[#e9924b]/25 hover:text-[#e9924b]'
                        }`}
                      >
                        {liked ? <HeartIconSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                        <span>{likeCount}</span>
                      </motion.button>
                      <button
                        onClick={scrollToForm}
                        className="flex items-center gap-2 px-4 py-2 bg-[#e9924b] hover:bg-[#d4762a] text-white text-sm font-semibold rounded-xl transition-all flex-1 justify-center"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Leave a comment
                      </button>
                    </div>
                  </div>

                  {/* Comments */}
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

                  {/* Comment form */}
                  <div ref={commentFormRef} className="scroll-mt-6">
                    <p className="font-heading font-bold text-[#1e3a6e] text-sm mb-1">Leave a comment</p>
                    <p className="text-[#1e3a6e]/40 text-xs mb-4 leading-relaxed">Respond with kindness. Comments are reviewed before appearing.</p>
                    <form onSubmit={handleSubmitComment}>
                      <textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Share your thoughts, support, or a similar experience..."
                        className="w-full p-4 bg-[#fbfbfb] border border-[#1e3a6e]/12 rounded-xl text-[#1e3a6e] placeholder-[#1e3a6e]/30 text-sm leading-relaxed min-h-[110px] resize-none focus:outline-none focus:border-[#e9924b]/40 transition-all"
                        required
                      />
                      <div className="flex items-center justify-end mt-3">
                        <button
                          type="submit"
                          disabled={submitting || !newComment.trim()}
                          className="px-6 py-2.5 bg-[#e9924b] hover:bg-[#d4762a] text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#e9924b]/20 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Posting...' : 'Post comment'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky CTA */}
            <AnimatePresence>
              {showStickyBar && !loading && story && (
                <motion.div
                  initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                  className="flex-shrink-0 border-t border-[#1e3a6e]/8 bg-white px-6 py-4 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={scrollToForm}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#e9924b] hover:bg-[#d4762a] text-white text-sm font-semibold rounded-xl transition-all"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      Leave your comment
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={handleLike}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        liked
                          ? 'bg-[#e9924b]/10 text-[#e9924b] border-[#e9924b]/25'
                          : 'bg-white text-[#1e3a6e]/40 border-[#1e3a6e]/15 hover:border-[#e9924b]/25'
                      }`}
                    >
                      {liked ? <HeartIconSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                      <span>{likeCount}</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StoryDrawer;