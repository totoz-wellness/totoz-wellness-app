/**
 * ============================================
 * CATEGORY BADGE — PARENTCIRCLE SHARED
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 */

import React from 'react';

interface CategoryBadgeProps {
  name?: string;
  color?: string;
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE: Record<string, string> = {
  sm: 'px-2.5 py-1 text-[10px]',
  md: 'px-3 py-1.5 text-xs',
  lg: 'px-4 py-2 text-sm',
};

const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  name,
  color = '#659ec3',
  icon,
  size = 'md',
}) => {
  if (!name) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full tracking-wide ${SIZE[size] ?? SIZE.md}`}
      style={{ backgroundColor: `${color}18`, color }}
    >
      {icon && <span className="leading-none">{icon}</span>}
      <span>{name}</span>
    </span>
  );
};

export default CategoryBadge;