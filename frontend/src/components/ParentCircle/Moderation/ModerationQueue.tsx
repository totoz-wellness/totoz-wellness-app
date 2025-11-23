/**
 * ============================================
 * MODERATION QUEUE
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 09:03:59 UTC
 * ============================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContentReviewCard from './ContentReviewCard';
import type { PendingContent, ContentType } from '../../../types/parentcircle-moderation.types';

interface ModerationQueueProps {
  pendingItems: PendingContent[];
  loading: boolean;
  onApprove: (id: number, contentType: ContentType, notes?: string) => Promise<void>;
  onReject: (id: number, contentType: ContentType, reason: string, notes?: string) => Promise<void>;
  onArchive: (id: number, contentType: ContentType, reason?: string) => Promise<void>;
  onRefresh: () => void;
}

const ModerationQueue: React.FC<ModerationQueueProps> = ({
  pendingItems,
  loading,
  onApprove,
  onReject,
  onArchive,
  onRefresh
}) => {
  const [filter, setFilter] = useState<'ALL' | 'QUESTION' | 'STORY'>('ALL');
  const [sortBy, setSortBy] = useState<'oldest' | 'newest'>('oldest');
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  const handleApprove = async (id: number, notes?: string) => {
    const item = pendingItems.find(i => i.id === id);
    if (!item) return;

    setProcessingIds(prev => new Set(prev).add(id));
    try {
      await onApprove(id, item.contentType, notes);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleReject = async (id: number, reason: string, notes?: string) => {
    const item = pendingItems.find(i => i.id === id);
    if (!item) return;

    setProcessingIds(prev => new Set(prev).add(id));
    try {
      await onReject(id, item.contentType, reason, notes);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleArchive = async (id: number, reason?: string) => {
    const item = pendingItems.find(i => i.id === id);
    if (!item) return;

    setProcessingIds(prev => new Set(prev).add(id));
    try {
      await onArchive(id, item.contentType, reason);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Filter and sort
  const filteredItems = pendingItems
    .filter(item => filter === 'ALL' || item.contentType === filter)
    .sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div>
      {/* Controls */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Filter:</span>
            <div className="flex gap-2">
              {['ALL', 'QUESTION', 'STORY'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filter === type
                      ? 'bg-teal text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type === 'ALL' ? 'All' : type === 'QUESTION' ? '🙋 Questions' : '📖 Stories'}
                  {type !== 'ALL' && (
                    <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">
                      {pendingItems.filter(i => i.contentType === type).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none text-sm font-semibold bg-white"
            >
              <option value="oldest">⏰ Oldest First (FIFO)</option>
              <option value="newest">🆕 Newest First</option>
            </select>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Count */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-bold text-teal">{filteredItems.length}</span> of{' '}
            <span className="font-bold">{pendingItems.length}</span> pending items
          </p>
        </div>
      </div>

      {/* Queue */}
      {loading && filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading moderation queue...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center shadow-md border-2 border-gray-200">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">All Clear!</h3>
          <p className="text-gray-600">
            No {filter !== 'ALL' ? filter.toLowerCase() + 's' : 'items'} pending moderation
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map(item => (
              <ContentReviewCard
                key={`${item.contentType}-${item.id}`}
                content={item}
                onApprove={handleApprove}
                onReject={handleReject}
                onArchive={handleArchive}
                isProcessing={processingIds.has(item.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ModerationQueue;