/**
 * ============================================
 * TRENDING SIDEBAR
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 06:47:13 UTC
 * ============================================
 */

import React, { useEffect, useState } from 'react';
import { FireIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import * as API from '../../../services/parentcircle.service';

const TrendingSidebar: React.FC = () => {
  const [trendingStories, setTrendingStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const response = await API.getTrendingStories(5, 7);
        if (response.success) {
          setTrendingStories(response.data.stories);
        }
      } catch (error) {
        console.error('Failed to load trending:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrending();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trending This Week */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl shadow-sm border border-orange-100"
      >
        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <FireIcon className="w-5 h-5 text-orange-500" />
          Trending This Week
        </h3>
        
        {trendingStories.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No trending stories yet</p>
        ) : (
          <div className="space-y-3">
            {trendingStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-3 rounded-lg hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold text-lg">#{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-teal transition-colors line-clamp-2">
                      {story.title || story.content.substring(0, 60) + '...'}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>❤️ {story.likesCount}</span>
                      <span>•</span>
                      <span>👁️ {story.views}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Community Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
      >
        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <TrophyIcon className="w-5 h-5 text-teal" />
          Community Stats
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">🙋 Questions</span>
            <span className="text-lg font-bold text-teal">1,234</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">📖 Stories</span>
            <span className="text-lg font-bold text-teal">2,456</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">💬 Answers</span>
            <span className="text-lg font-bold text-teal">8,901</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">👥 Members</span>
            <span className="text-lg font-bold text-teal">10,234</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Growing stronger together! 💚
          </p>
        </div>
      </motion.div>

      {/* Quick Tips */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-teal/10 to-blue-500/10 p-6 rounded-2xl shadow-sm border border-teal/20"
      >
        <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
          💡 Daily Tip
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          "<em>Take time to read other parents' experiences. You're not alone in your journey!</em>"
        </p>
      </motion.div>
    </div>
  );
};

export default TrendingSidebar;