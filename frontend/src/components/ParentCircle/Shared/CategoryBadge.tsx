/**
 * ============================================
 * CATEGORY BADGE COMPONENT
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 06:41:53 UTC
 * ============================================
 */

import React from 'react';

interface CategoryBadgeProps {
  name: string;
  color?: string;
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  name, 
  color = '#6B7280', 
  icon,
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span 
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${sizeClasses[size]}`}
      style={{ 
        backgroundColor: `${color}15`, 
        color: color,
        border: `1.5px solid ${color}30`
      }}
    >
      {icon && <span>{icon}</span>}
      <span>{name}</span>
    </span>
  );
};

export default CategoryBadge;