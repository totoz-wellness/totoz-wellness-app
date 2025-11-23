/**
 * ============================================
 * TIME AGO COMPONENT
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 06:41:53 UTC
 * ============================================
 */

import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface TimeAgoProps {
  date: string | Date;
  className?: string;
}

const TimeAgo: React.FC<TimeAgoProps> = ({ date, className = '' }) => {
  const timeAgo = formatDistanceToNow(new Date(date), { addSuffix: true });

  return (
    <time 
      dateTime={new Date(date).toISOString()} 
      className={`text-gray-500 ${className}`}
      title={new Date(date).toLocaleString()}
    >
      {timeAgo}
    </time>
  );
};

export default TimeAgo;