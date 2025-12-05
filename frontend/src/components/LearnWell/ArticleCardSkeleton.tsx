/**
 * ============================================
 * ARTICLE CARD SKELETON LOADER
 * ============================================
 */

import React from 'react';

const ArticleCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="h-56 bg-gray-200" />
      
      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        {/* Author & Read Time */}
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
        
        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-full" />
          <div className="h-6 bg-gray-200 rounded w-3/4" />
        </div>
        
        {/* Content */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        
        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-md w-16" />
          <div className="h-6 bg-gray-200 rounded-md w-20" />
          <div className="h-6 bg-gray-200 rounded-md w-16" />
        </div>
        
        {/* Read More */}
        <div className="pt-4 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>
    </div>
  );
};

export default ArticleCardSkeleton;