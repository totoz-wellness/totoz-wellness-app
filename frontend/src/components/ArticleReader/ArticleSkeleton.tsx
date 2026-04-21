import React from 'react';

const ArticleSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-light-bg flex flex-col animate-pulse">
      {/* Hero Skeleton */}
      <div className="relative h-96 bg-gray-300" />
      
      {/* Content Skeleton */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Excerpt */}
          <div className="h-24 bg-gray-200 rounded-lg mb-8" />
          
          {/* Content Lines */}
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-11/12" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-10/12" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-9/12" />
          </div>
          
          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
            <div className="flex gap-3">
              <div className="h-8 bg-gray-200 rounded-full w-20" />
              <div className="h-8 bg-gray-200 rounded-full w-24" />
              <div className="h-8 bg-gray-200 rounded-full w-20" />
            </div>
          </div>
          
          {/* Author */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-48" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleSkeleton;