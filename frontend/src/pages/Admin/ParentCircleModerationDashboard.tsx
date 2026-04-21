/**
 * ============================================
 * PARENTCIRCLE MODERATION DASHBOARD
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 09:03:59 UTC
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import * as ModerationAPI from '../../services/moderation.service';
import ModerationStatsWidget from '../../components/ParentCircle/Moderation/ModerationStats';
import ModerationQueue from '../../components/ParentCircle/Moderation/ModerationQueue';
import { getCurrentUser, getRoleDisplayName, getRoleColor } from '../../utils/roleUtils';
import type { PendingContent, ModerationStats, ContentType } from '../../types/parentcircle-moderation.types';

interface ParentCircleModerationDashboardProps {
  onBack: () => void;
}

const ParentCircleModerationDashboard: React.FC<ParentCircleModerationDashboardProps> = ({ onBack }) => {
  const [pendingItems, setPendingItems] = useState<PendingContent[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchPendingContent(), fetchStats()]);
  };

  const fetchPendingContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ModerationAPI.getPendingContent({
        page: 1,
        limit: 100,
        sortBy: 'oldest'
      });

      if (response.success) {
        setPendingItems(response.data.pendingItems);
      }
    } catch (err: any) {
      console.error('Failed to fetch pending content:', err);
      setError(err.message || 'Failed to load pending content');
      toast.error('Failed to load moderation queue');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await ModerationAPI.getModerationStats(30);

      if (response.success) {
        setStats(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleApprove = async (id: number, contentType: ContentType, notes?: string) => {
    try {
      const response = await ModerationAPI.approveContent({
        contentType,
        contentId: id,
        notes
      });

      if (response.success) {
        toast.success(`✅ ${contentType.toLowerCase()} approved!`);
        setPendingItems(prev => prev.filter(item => item.id !== id));
        fetchStats(); // Refresh stats
      }
    } catch (err: any) {
      console.error('Approve error:', err);
      toast.error(err.message || 'Failed to approve content');
      throw err;
    }
  };

  const handleReject = async (id: number, contentType: ContentType, reason: string, notes?: string) => {
    try {
      const response = await ModerationAPI.rejectContent({
        contentType,
        contentId: id,
        reason,
        notes
      });

      if (response.success) {
        toast.success(`❌ ${contentType.toLowerCase()} rejected`);
        setPendingItems(prev => prev.filter(item => item.id !== id));
        fetchStats();
      }
    } catch (err: any) {
      console.error('Reject error:', err);
      toast.error(err.message || 'Failed to reject content');
      throw err;
    }
  };

  const handleArchive = async (id: number, contentType: ContentType, reason?: string) => {
    try {
      const response = await ModerationAPI.archiveContent({
        contentType,
        contentId: id,
        reason
      });

      if (response.success) {
        toast.success(`🗄️ ${contentType.toLowerCase()} archived`);
        setPendingItems(prev => prev.filter(item => item.id !== id));
        fetchStats();
      }
    } catch (err: any) {
      console.error('Archive error:', err);
      toast.error(err.message || 'Failed to archive content');
      throw err;
    }
  };

  if (error && pendingItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md shadow-2xl border-2 border-red-200">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
              >
                Go Back
              </button>
              <button
                onClick={fetchData}
                className="flex-1 px-6 py-3 bg-teal text-white rounded-lg font-semibold hover:bg-teal/90"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-teal mb-3 flex items-center gap-2 font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Admin Dashboard
              </button>
              <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text mb-2 flex items-center gap-3">
                <span className="text-4xl">🛡️</span>
                ParentCircle Moderation
              </h1>
              <p className="text-lg text-dark-text/70">
                Review and approve community content
              </p>
              {currentUser && (
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${getRoleColor(currentUser.role)}-100 text-${getRoleColor(currentUser.role)}-800 border border-${getRoleColor(currentUser.role)}-200`}>
                    {getRoleDisplayName(currentUser.role)}
                  </span>
                  <span className="text-sm text-dark-text/60">{currentUser.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <ModerationStatsWidget stats={stats} loading={statsLoading} />

        {/* Moderation Queue */}
        <ModerationQueue
          pendingItems={pendingItems}
          loading={loading}
          onApprove={handleApprove}
          onReject={handleReject}
          onArchive={handleArchive}
          onRefresh={fetchPendingContent}
        />
      </main>
    </div>
  );
};

export default ParentCircleModerationDashboard;