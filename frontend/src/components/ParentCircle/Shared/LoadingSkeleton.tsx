/**
 * ============================================
 * LOADING SKELETON — PARENTCIRCLE SHARED
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 */

import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'detail';
  count?: number;
}

const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-6 animate-pulse">
    {/* Category + meta row */}
    <div className="flex items-center gap-3 mb-5">
      <div className="h-5 bg-[#1e3a6e]/8 rounded-full w-20" />
      <div className="h-3 bg-[#1e3a6e]/6 rounded-full w-28 ml-auto" />
    </div>
    {/* Title */}
    <div className="h-5 bg-[#1e3a6e]/8 rounded-full w-3/4 mb-2.5" />
    <div className="h-5 bg-[#1e3a6e]/6 rounded-full w-1/2 mb-4" />
    {/* Body lines */}
    <div className="space-y-2 mb-4">
      <div className="h-3.5 bg-[#1e3a6e]/6 rounded-full w-full" />
      <div className="h-3.5 bg-[#1e3a6e]/6 rounded-full w-full" />
      <div className="h-3.5 bg-[#1e3a6e]/6 rounded-full w-2/3" />
    </div>
    {/* Tags */}
    <div className="flex gap-2 mb-5">
      <div className="h-5 bg-[#1e3a6e]/6 rounded-full w-14" />
      <div className="h-5 bg-[#1e3a6e]/6 rounded-full w-18" />
    </div>
    {/* Footer */}
    <div className="flex items-center justify-between pt-4 border-t border-[#1e3a6e]/6">
      <div className="flex gap-3">
        <div className="h-4 bg-[#1e3a6e]/8 rounded-full w-12" />
        <div className="h-4 bg-[#1e3a6e]/8 rounded-full w-12" />
      </div>
      <div className="h-4 bg-[#1e3a6e]/6 rounded-full w-20" />
    </div>
  </div>
);

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
  </div>
);

export default LoadingSkeleton;