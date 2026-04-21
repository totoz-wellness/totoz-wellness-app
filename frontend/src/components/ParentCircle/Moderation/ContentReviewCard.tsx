/**
 * ============================================
 * CONTENT REVIEW CARD
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 09:00:59 UTC
 * ============================================
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import type { PendingContent } from '../../../types/parentcircle-moderation.types';

interface ContentReviewCardProps {
  content: PendingContent;
  onApprove: (id: number, notes?: string) => void;
  onReject: (id: number, reason: string, notes?: string) => void;
  onArchive: (id: number, reason?: string) => void;
  isProcessing: boolean;
}

const ContentReviewCard: React.FC<ContentReviewCardProps> = ({
  content,
  onApprove,
  onReject,
  onArchive,
  isProcessing
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleApprove = () => {
    if (notes.trim()) {
      onApprove(content.id, notes.trim());
    } else {
      setShowNotesModal(true);
    }
  };

  const handleApproveWithoutNotes = () => {
    onApprove(content.id);
    setShowNotesModal(false);
    setNotes('');
  };

  const handleApproveWithNotes = () => {
    onApprove(content.id, notes.trim());
    setShowNotesModal(false);
    setNotes('');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    onReject(content.id, rejectReason.trim(), notes.trim() || undefined);
    setShowRejectModal(false);
    setRejectReason('');
    setNotes('');
  };

  const truncateText = (text: string, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getWaitingTimeBadge = () => {
    const hours = Math.floor(content.waitingTime / (1000 * 60 * 60));
    if (hours < 1) return { color: 'bg-green-100 text-green-700', text: '< 1h' };
    if (hours < 24) return { color: 'bg-yellow-100 text-yellow-700', text: `${hours}h` };
    const days = Math.floor(hours / 24);
    return { color: 'bg-red-100 text-red-700', text: `${days}d` };
  };

  const waitingBadge = getWaitingTimeBadge();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              content.contentType === 'QUESTION' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}>
              {content.contentType === 'QUESTION' ? '🙋 Question' : '📖 Story'}
            </span>
            
            {content.category && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-200">
                {content.category.name}
              </span>
            )}

            <span className={`px-2 py-1 rounded text-xs font-bold ${waitingBadge.color}`}>
              ⏱️ {waitingBadge.text}
            </span>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(content.createdAt), { addSuffix: true })}
            </p>
            <p className="text-xs text-gray-600 font-semibold mt-1">
              By: {content.authorName}
            </p>
          </div>
        </div>

        {/* Title (if exists) */}
        {content.title && (
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {content.title}
          </h3>
        )}

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {truncateText(content.content, 300)}
          </p>
        </div>

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {content.tags.slice(0, 5).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs border border-gray-200">
                #{tag}
              </span>
            ))}
            {content.tags.length > 5 && (
              <span className="text-xs text-gray-400">+{content.tags.length - 5} more</span>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
          {content._count?.answers !== undefined && (
            <span>💬 {content._count.answers} answers</span>
          )}
          {content._count?.reports !== undefined && content._count.reports > 0 && (
            <span className="text-red-600 font-semibold">
              ⚠️ {content._count.reports} reports
            </span>
          )}
          {content.author && (
            <span>
              👤 Role: <span className="font-semibold">{content.author.role}</span>
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg font-bold hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Approve
          </button>

          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isProcessing}
            className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg font-bold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject
          </button>

          <button
            onClick={() => onArchive(content.id)}
            disabled={isProcessing}
            className="bg-gray-500 text-white px-4 py-3 rounded-lg font-bold hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Approve with Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Moderation Notes?</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Optionally add internal notes about this approval (visible to moderators only)
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes (optional)..."
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal focus:outline-none mb-4 min-h-[100px]"
            />
            <div className="flex gap-3">
              <button
                onClick={handleApproveWithoutNotes}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
              >
                Skip Notes
              </button>
              <button
                onClick={handleApproveWithNotes}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600"
              >
                Approve with Notes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Content</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Please provide a reason for rejection (required)
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (required)..."
              className="w-full p-3 border-2 border-red-200 rounded-lg focus:border-red-500 focus:outline-none mb-3 min-h-[100px]"
              required
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional internal notes (optional)..."
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-teal focus:outline-none mb-4 min-h-[80px]"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setNotes('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ContentReviewCard;