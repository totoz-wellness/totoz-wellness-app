/**
 * ============================================
 * USER AVATAR COMPONENT
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 06:41:53 UTC
 * ============================================
 */

import React from 'react';

interface UserAvatarProps {
  name: string;
  isAnonymous?: boolean;
  size?: 'sm' | 'md' | 'lg';
  role?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  name, 
  isAnonymous = false,
  size = 'md',
  role
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const getInitials = (name: string) => {
    if (isAnonymous) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBgColor = (name: string) => {
    if (isAnonymous) return 'bg-gray-400';
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className={`${sizeClasses[size]} ${getBgColor(name)} rounded-full flex items-center justify-center text-white font-bold shadow-md`}
      >
        {getInitials(name)}
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-gray-800 text-sm">
          {isAnonymous ? 'Anonymous' : name}
        </span>
        {role && role !== 'USER' && (
          <span className="text-xs text-gray-500">
            {role.replace('_', ' ')}
          </span>
        )}
      </div>
    </div>
  );
};

export default UserAvatar;