/**
 * ============================================
 * VERIFIED BADGE COMPONENT
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 06:41:53 UTC
 * ============================================
 */

import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface VerifiedBadgeProps {
  type?: 'expert' | 'best-answer' | 'featured';
  size?: 'sm' | 'md';
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ 
  type = 'expert',
  size = 'md' 
}) => {
  const config = {
    expert: {
      icon: <CheckCircleIcon className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />,
      text: 'Verified Expert',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-600'
    },
    'best-answer': {
      icon: <CheckCircleIcon className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />,
      text: 'Best Answer',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      iconColor: 'text-green-600'
    },
    featured: {
      icon: '⭐',
      text: 'Featured',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      iconColor: ''
    }
  };

  const { icon, text, bgColor, textColor, iconColor } = config[type];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${bgColor} ${textColor} text-xs font-bold`}>
      <span className={iconColor}>{icon}</span>
      <span>{text}</span>
    </span>
  );
};

export default VerifiedBadge;