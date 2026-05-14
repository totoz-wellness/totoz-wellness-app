/**
 * ============================================
 * EMPTY STATE — PARENTCIRCLE SHARED
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 */

import React from 'react';
import { MagnifyingGlassIcon, ChatBubbleLeftRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  type?: 'search' | 'content' | 'error';
  message?: string;
  submessage?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const CONFIG = {
  search: {
    Icon: MagnifyingGlassIcon,
    accent: '#659ec3',
    defaultMessage: 'No results found',
    defaultSubmessage: 'Try adjusting your search or filters',
  },
  content: {
    Icon: ChatBubbleLeftRightIcon,
    accent: '#e9924b',
    defaultMessage: 'Nothing here yet',
    defaultSubmessage: 'Be the first to contribute.',
  },
  error: {
    Icon: ExclamationTriangleIcon,
    accent: '#e9924b',
    defaultMessage: 'Something went wrong',
    defaultSubmessage: 'Please try again later.',
  },
};

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'content',
  message,
  submessage,
  actionLabel,
  onAction,
}) => {
  const { Icon, accent, defaultMessage, defaultSubmessage } = CONFIG[type] ?? CONFIG.content;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ backgroundColor: `${accent}12` }}
      >
        <Icon className="w-7 h-7" style={{ color: accent }} />
      </div>

      <p className="font-heading font-bold text-[#1e3a6e] text-base mb-1.5">
        {message || defaultMessage}
      </p>
      <p className="text-[#1e3a6e]/45 text-sm max-w-xs leading-relaxed">
        {submessage || defaultSubmessage}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-7 px-6 py-2.5 bg-[#e9924b] hover:bg-[#d4762a] text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#e9924b]/20"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;