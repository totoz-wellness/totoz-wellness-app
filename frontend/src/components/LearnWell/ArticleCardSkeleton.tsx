/**
 * ============================================
 * ARTICLE CARD SKELETON — LEARNWELL
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 */

import React from 'react';

const ArticleCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#1e3a6e]/6 shadow-sm animate-pulse">
      {/* Image */}
      <div className="h-48 bg-[#1e3a6e]/6" />

      {/* Content */}
      <div className="p-5 space-y-3.5">
        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="h-3 bg-[#1e3a6e]/8 rounded-full w-20" />
          <div className="h-3 bg-[#1e3a6e]/8 rounded-full w-14" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-[#1e3a6e]/8 rounded-full w-full" />
          <div className="h-4 bg-[#1e3a6e]/8 rounded-full w-3/4" />
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <div className="h-3 bg-[#1e3a6e]/6 rounded-full w-full" />
          <div className="h-3 bg-[#1e3a6e]/6 rounded-full w-full" />
          <div className="h-3 bg-[#1e3a6e]/6 rounded-full w-2/3" />
        </div>

        {/* Tags */}
        <div className="flex gap-1.5">
          <div className="h-5 bg-[#e9924b]/8 rounded-full w-14" />
          <div className="h-5 bg-[#e9924b]/8 rounded-full w-18" />
          <div className="h-5 bg-[#e9924b]/8 rounded-full w-12" />
        </div>

        {/* Read more */}
        <div className="pt-4 border-t border-[#1e3a6e]/6">
          <div className="h-3 bg-[#1e3a6e]/8 rounded-full w-24" />
        </div>
      </div>
    </div>
  );
};

export default ArticleCardSkeleton;