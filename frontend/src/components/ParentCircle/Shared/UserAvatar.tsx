/**
 * ============================================
 * USER AVATAR COMPONENT
 * ============================================
 * @version     2.0.0
 * @author      ArogoClin
 * @updated     2025-12-05
 * @description Fixed with null safety and better structure
 * ============================================
 */

import React from 'react';

interface UserAvatarProps {
  name?: string;  // ✅ Made optional
  imageUrl?: string;
  isAnonymous?: boolean;
  isVerified?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;  // ✅ New prop to control name display
  role?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  name = 'Anonymous',  // ✅ Default value
  imageUrl,
  isAnonymous = false,
  isVerified = false,
  size = 'md',
  showName = false,
  role
}) => {
  // Size classes for avatar circle
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  /**
   * Get user initials for avatar
   */
  const getInitials = (name: string): string => {
    if (!  name || isAnonymous) return 'A';  // ✅ Safety check
    
    const trimmedName = name.trim();
    if (!  trimmedName) return 'A';  // ✅ Handle empty strings
    
    return trimmedName
      .split(' ')
      .filter(word => word. length > 0)  // ✅ Filter empty words
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Get background color based on name
   */
  const getBgColor = (name: string): string => {
    if (! name || isAnonymous) return 'bg-gray-400';  // ✅ Safety check
    
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal'
    ];
    
    const trimmedName = name.trim();
    if (! trimmedName) return 'bg-gray-400';  // ✅ Handle empty strings
    
    const index = trimmedName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  /**
   * Display name with fallback
   */
  const displayName = isAnonymous ?  'Anonymous' : (name || 'Anonymous');

  return (
    <div className="flex items-center gap-2">
      {/* Avatar Circle */}
      <div className="relative inline-block">
        {imageUrl ?  (
          <img 
            src={imageUrl} 
            alt={displayName}
            className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-md`}
          />
        ) : (
          <div 
            className={`${sizeClasses[size]} ${getBgColor(name)} rounded-full flex items-center justify-center text-white font-bold shadow-md`}
          >
            {getInitials(name)}
          </div>
        )}
        
        {/* Verified Badge */}
        {isVerified && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Name & Role (Optional) */}
      {showName && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1. 5">
            <span className="font-semibold text-gray-900 text-sm truncate">
              {displayName}
            </span>
            {isVerified && (
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          {role && role !== 'USER' && (
            <span className="text-xs text-gray-500 truncate">
              {role. replace(/_/g, ' ').toLowerCase(). replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;