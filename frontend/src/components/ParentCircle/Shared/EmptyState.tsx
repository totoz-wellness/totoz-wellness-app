/**
 * ============================================
 * EMPTY STATE COMPONENT
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 06:41:53 UTC
 * ============================================
 */

import React from 'react';
import { MagnifyingGlassIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  type?: 'search' | 'content' | 'error';
  message?: string;
  submessage?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  type = 'content',
  message,
  submessage,
  actionLabel,
  onAction
}) => {
  const config = {
    search: {
      icon: <MagnifyingGlassIcon className="w-16 h-16 text-gray-300" />,
      defaultMessage: 'No results found',
      defaultSubmessage: 'Try adjusting your search or filters'
    },
    content: {
      icon: <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300" />,
      defaultMessage: 'No posts yet',
      defaultSubmessage: 'Be the first to share!'
    },
    error: {
      icon: <span className="text-6xl">⚠️</span>,
      defaultMessage: 'Something went wrong',
      defaultSubmessage: 'Please try again later'
    }
  };

  const { icon, defaultMessage, defaultSubmessage } = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {message || defaultMessage}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md">
        {submessage || defaultSubmessage}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-teal text-white font-bold py-3 px-6 rounded-full hover:bg-teal/90 transition-all transform hover:scale-105 shadow-lg"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;