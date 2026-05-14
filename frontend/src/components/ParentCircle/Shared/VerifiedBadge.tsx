/**
 * ============================================
 * VERIFIED BADGE — PARENTCIRCLE SHARED
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 */

import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface VerifiedBadgeProps {
  type?: 'expert' | 'best-answer' | 'featured';
  size?: 'sm' | 'md';
}

const CONFIG = {
  'expert': {
    label: 'Verified expert',
    bg: 'bg-[#659ec3]/10',
    text: 'text-[#659ec3]',
    useCheck: true,
  },
  'best-answer': {
    label: 'Best answer',
    bg: 'bg-[#659ec3]/10',
    text: 'text-[#659ec3]',
    useCheck: true,
  },
  'featured': {
    label: 'Featured',
    bg: 'bg-[#e9924b]/10',
    text: 'text-[#e9924b]',
    useCheck: false,
  },
};

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ type = 'expert', size = 'md' }) => {
  const { label, bg, text, useCheck } = CONFIG[type] ?? CONFIG.expert;
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${bg} ${text}`}>
      {useCheck && <CheckCircleIcon className={iconSize} />}
      {label}
    </span>
  );
};

export default VerifiedBadge;