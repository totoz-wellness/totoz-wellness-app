/**
 * ============================================
 * TIME AGO — PARENTCIRCLE SHARED
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 */

import React from 'react';

interface TimeAgoProps {
  date: string | Date;
  className?: string;
  prefix?: string;
}

function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins   = Math.floor(diff / 60_000);
  const hours  = Math.floor(mins / 60);
  const days   = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years  = Math.floor(days / 365);

  if (mins  <  1) return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 30) return `${days}d ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}

const TimeAgo: React.FC<TimeAgoProps> = ({ date, className = '', prefix = '' }) => (
  <span className={`text-[#1e3a6e]/40 ${className}`}>
    {prefix}{timeAgo(date)}
  </span>
);

export default TimeAgo;