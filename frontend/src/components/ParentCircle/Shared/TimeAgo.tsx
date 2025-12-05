/**
 * TimeAgo - Displays relative time
 * @version 2.0.0
 */

import React from 'react';

interface TimeAgoProps {
  date: string | Date;
  className?: string;
  prefix?: string;
}

const TimeAgo: React.FC<TimeAgoProps> = ({ date, className = '', prefix = '' }) => {
  const getTimeAgo = (date: string | Date): string => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return `${diffYears}y ago`;
  };

  return (
    <span className={`text-gray-500 ${className}`}>
      {prefix}{getTimeAgo(date)}
    </span>
  );
};

export default TimeAgo;