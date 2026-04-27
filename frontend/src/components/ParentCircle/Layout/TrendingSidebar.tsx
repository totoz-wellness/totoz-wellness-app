/**
 * ============================================
 * TRENDING SIDEBAR — PARENTCIRCLE
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as API from '../../../services/parentcircle.service';

const TrendingSidebar: React.FC = () => {
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.getTrendingStories(5, 7)
      .then(r => { if (r.success) setTrending(r.data.stories); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">

      {/* Trending */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-6 bg-[#e9924b]" />
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#e9924b]">Trending this week</p>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-5 h-5 bg-[#1e3a6e]/8 rounded flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-[#1e3a6e]/8 rounded-full w-full" />
                  <div className="h-3 bg-[#1e3a6e]/6 rounded-full w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : trending.length === 0 ? (
          <p className="text-[#1e3a6e]/40 text-sm italic">Nothing trending yet — be the first to share.</p>
        ) : (
          <div className="space-y-4">
            {trending.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 group cursor-pointer"
              >
                <span className="font-heading font-extrabold text-[#e9924b]/40 text-sm w-5 flex-shrink-0 leading-snug">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1e3a6e]/75 text-sm font-medium leading-snug line-clamp-2 group-hover:text-[#1e3a6e] transition-colors">
                    {story.title || story.content?.substring(0, 60) + '...'}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[#1e3a6e]/30 text-xs">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                      </svg>
                      {story.likesCount ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {story.views ?? 0}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Community stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-[#1e3a6e] rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-6 bg-[#e9924b]" />
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#e9924b]">Community</p>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Questions asked', value: '1,234' },
            { label: 'Stories shared',  value: '2,456' },
            { label: 'Answers given',   value: '8,901' },
            { label: 'Members',         value: '10,234' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-white/45 text-xs">{label}</span>
              <span className="font-heading font-extrabold text-[#e9924b] text-sm">{value}</span>
            </div>
          ))}
        </div>

        <p className="text-white/20 text-xs mt-5 leading-relaxed">
          Every post matters. This community grows because of people like you.
        </p>
      </motion.div>

      {/* Daily reflection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-[#659ec3]/8 border border-[#659ec3]/15 rounded-2xl p-5"
      >
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#659ec3] mb-3">Reflection</p>
        <p className="text-[#1e3a6e]/65 text-sm leading-relaxed italic">
          "Every parent has moments of doubt. Sharing them is not weakness — it's how we grow together."
        </p>
      </motion.div>

    </div>
  );
};

export default TrendingSidebar;