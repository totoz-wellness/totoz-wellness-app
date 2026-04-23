import React from 'react';

const ArticleSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fbfbfb] flex flex-col animate-pulse">
      {/* Hero */}
      <div className="h-[480px] bg-[#1e3a6e]/10" />

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 w-full">
        {/* Share bar */}
        <div className="h-10 bg-[#1e3a6e]/6 rounded-xl mb-8" />

        {/* Excerpt */}
        <div className="h-20 bg-[#1e3a6e]/6 rounded-xl mb-10" />

        {/* Body lines */}
        <div className="space-y-3.5">
          {[100, 92, 100, 88, 100, 75, 100, 95, 83].map((w, i) => (
            <div key={i} className="h-3.5 bg-[#1e3a6e]/6 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>

        {/* Second paragraph */}
        <div className="mt-8 space-y-3.5">
          {[100, 88, 96, 70].map((w, i) => (
            <div key={i} className="h-3.5 bg-[#1e3a6e]/6 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-[#1e3a6e]/8">
          <div className="h-3 bg-[#1e3a6e]/6 rounded-full w-24 mb-4" />
          <div className="flex gap-2">
            {[16, 20, 16].map((w, i) => (
              <div key={i} className="h-7 bg-[#e9924b]/8 rounded-full" style={{ width: `${w * 4}px` }} />
            ))}
          </div>
        </div>

        {/* Author */}
        <div className="mt-10 pt-8 border-t border-[#1e3a6e]/8">
          <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-[#1e3a6e]/6">
            <div className="w-12 h-12 bg-[#1e3a6e]/10 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-[#1e3a6e]/8 rounded-full w-28" />
              <div className="h-3 bg-[#1e3a6e]/6 rounded-full w-40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleSkeleton;