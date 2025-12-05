/**
 * CategoryBadge - Displays category with icon and color
 * @version 2.0.0
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
  color = '#3AAFA9', 
  icon,
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span 
      className={`inline-flex items-center gap-1. 5 rounded-full font-bold ${sizeClasses[size]}`}
      style={{ 
        backgroundColor: `${color}15`, 
        color: color 
      }}
    >
      {icon && <span>{icon}</span>}
      <span>{name}</span>
    </span>
  );
};

export default CategoryBadge;