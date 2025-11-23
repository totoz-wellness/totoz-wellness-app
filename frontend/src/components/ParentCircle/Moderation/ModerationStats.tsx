/**
 * ============================================
 * MODERATION STATISTICS WIDGET
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 09:03:59 UTC
 * ============================================
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { ModerationStats } from '../../../types/parentcircle-moderation.types';

interface ModerationStatsProps {
  stats: ModerationStats | null;
  loading: boolean;
}

const ModerationStatsWidget: React.FC<ModerationStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: 'Pending Review',
      value: stats.pending.total,
      breakdown: `${stats.pending.questions} Q · ${stats.pending.stories} S`,
      color: 'orange',
      icon: '⏳',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      label: 'Approved',
      value: stats.approved.total,
      breakdown: `${stats.approved.questions} Q · ${stats.approved.stories} S`,
      color: 'green',
      icon: '✅',
      gradient: 'from-green-500 to-teal'
    },
    {
      label: 'Rejected',
      value: stats.rejected.total,
      breakdown: `${stats.rejected.questions} Q · ${stats.rejected.stories} S`,
      color: 'red',
      icon: '❌',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      label: 'Approval Rate',
      value: `${Math.round((parseFloat(stats.approvalRate.questions) + parseFloat(stats.approvalRate.stories)) / 2)}%`,
      breakdown: `${stats.approvalRate.questions}% Q · ${stats.approvalRate.stories}% S`,
      color: 'blue',
      icon: '📊',
      gradient: 'from-blue-500 to-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100 hover:shadow-xl transition-all"
        >
          <div className={`bg-gradient-to-br ${card.gradient} p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{card.icon}</span>
              <span className="text-white/80 text-xs font-semibold bg-white/20 px-2 py-1 rounded">
                {stats.period}
              </span>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold mb-1">{card.value}</div>
              <div className="text-white/90 text-sm font-medium">{card.label}</div>
            </div>
          </div>
          <div className="p-3 bg-gray-50">
            <p className="text-xs text-gray-600 font-semibold text-center">
              {card.breakdown}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ModerationStatsWidget;