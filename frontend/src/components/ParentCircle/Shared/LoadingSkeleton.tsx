/**
 * ============================================
 * LOADING SKELETON COMPONENT
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 06:41:53 UTC
 * ============================================
 */

import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'detail';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = 'card',
  count = 3 
}) => {
  const CardSkeleton = () => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
        <div className="w-32 h-4 bg-gray-200 rounded"></div>
      </div>

      {/* Title */}
      <div className="w-3/4 h-6 bg-gray-200 rounded mb-3"></div>

      {/* Content */}
      <div className="space-y-2 mb-4">
        <div className="w-full h-4 bg-gray-200 rounded"></div>
        <div className="w-full h-4 bg-gray-200 rounded"></div>
        <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-4">
        <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
        <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex gap-4">
          <div className="w-12 h-5 bg-gray-200 rounded"></div>
          <div className="w-12 h-5 bg-gray-200 rounded"></div>
        </div>
        <div className="w-24 h-5 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
};

export default LoadingSkeleton;