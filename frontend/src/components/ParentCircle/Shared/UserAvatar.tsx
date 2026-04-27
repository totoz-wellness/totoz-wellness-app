/**
 * ============================================
 * USER AVATAR — PARENTCIRCLE SHARED
 * ============================================
 * @version     3.0.0
 * @updated     2025-04-23
 */

import React from 'react';

interface UserAvatarProps {
  name?: string;
  imageUrl?: string;
  isAnonymous?: boolean;
  isVerified?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  role?: string;
}

// Deterministic colour from name — brand palette only
const COLORS = [
  { bg: '#e9924b18', text: '#e9924b' }, // orange
  { bg: '#659ec318', text: '#659ec3' }, // steel blue
  { bg: '#1e3a6e18', text: '#1e3a6e' }, // navy
  { bg: '#e9924b28', text: '#d4762a' }, // dark orange
  { bg: '#659ec328', text: '#4d87b2' }, // dark blue
];

function pickColor(name: string) {
  if (!name) return COLORS[2];
  return COLORS[name.charCodeAt(0) % COLORS.length];
}

function initials(name: string, isAnonymous: boolean): string {
  if (isAnonymous || !name?.trim()) return 'A';
  return name.trim()
    .split(' ')
    .filter(w => w.length > 0)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const SIZE: Record<string, string> = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-11 h-11 text-sm',
  xl: 'w-14 h-14 text-base',
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'Anonymous',
  imageUrl,
  isAnonymous = false,
  isVerified = false,
  size = 'md',
  showName = false,
  role,
}) => {
  const displayName = isAnonymous ? 'Anonymous' : (name || 'Anonymous');
  const color = pickColor(displayName);
  const sizeClass = SIZE[size] ?? SIZE.md;

  return (
    <div className="flex items-center gap-2">
      {/* Circle */}
      <div className="relative inline-flex flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={displayName}
            className={`${sizeClass} rounded-xl object-cover border border-[#1e3a6e]/10`}
          />
        ) : (
          <div
            className={`${sizeClass} rounded-xl flex items-center justify-center font-bold`}
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {initials(displayName, isAnonymous)}
          </div>
        )}

        {/* Verified tick */}
        {isVerified && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#659ec3] rounded-full flex items-center justify-center border-2 border-white">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Name + role */}
      {showName && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-[#1e3a6e] text-sm truncate">{displayName}</span>
            {isVerified && (
              <svg className="w-3.5 h-3.5 text-[#659ec3] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          {role && role !== 'USER' && (
            <span className="text-[#1e3a6e]/40 text-xs truncate">
              {role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;