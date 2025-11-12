import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { getCurrentUser, getRoleDisplayName, getRoleColor } from '../../utils/roleUtils';

interface TalkEasyStats {
  overview: {
    totalMessages: number;
    totalUsers: number;
    averageMessagesPerUser: string;
  };
  activity: {
    last7Days: number;
    last30Days: number;
  };
  sentiment: {
    POSITIVE?: number;
    NEGATIVE?: number;
    NEUTRAL?: number;
    CRISIS?: number;
  };
  crisis: {
    last7Days: number;
    total: number;
  };
  generatedAt: string;
}

interface TalkEasyStatsProps {
  onBack: () => void;
  onLogout: () => void;
}

const TalkEasyStats: React.FC<TalkEasyStatsProps> = ({ onBack, onLogout }) => {
  const [stats, setStats] = useState<TalkEasyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/talkeasy/admin/stats');
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch stats');
      }
    } catch (err: any) {
      console.error('Failed to fetch TalkEasy stats:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string): string => {
    const colors: Record<string, string> = {
      POSITIVE: 'bg-green-500',
      NEUTRAL: 'bg-blue-500',
      NEGATIVE: 'bg-orange-500',
      CRISIS: 'bg-red-600',
    };
    return colors[sentiment] || 'bg-gray-400';
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'NEGATIVE':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'CRISIS':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.856-1.333-2.626 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#347EAD]/10 via-white to-teal/10 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal border-t-transparent"></div>
          <h3 className="mt-4 text-xl font-semibold text-dark-text">Loading Statistics...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#347EAD]/10 via-white to-teal/10 flex items-center justify-center">
        <div className="bg-white border-2 border-red-300 rounded-xl p-8 max-w-md shadow-lg">
          <div className="flex items-center mb-4">
            <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-bold text-red-800">Error Loading Stats</h3>
          </div>
          <p className="text-red-700 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={fetchStats}
              className="flex-1 px-6 py-3 bg-teal text-white rounded-lg hover:bg-teal/90 transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const totalSentiment = Object.values(stats.sentiment).reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#347EAD]/10 via-white to-teal/10">
      {/* Header */}
      <header className="bg-white shadow-md border-b-2 border-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text">
                    TalkEasy Statistics
                  </h1>
                  <p className="text-lg text-dark-text/70 mt-1">
                    Mental Health Chatbot Analytics
                  </p>
                </div>
              </div>
              {currentUser && (
                <div className="ml-14 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${getRoleColor(currentUser.role)}-100 text-${getRoleColor(currentUser.role)}-800 border border-${getRoleColor(currentUser.role)}-200`}>
                    {getRoleDisplayName(currentUser.role)}
                  </span>
                  <span className="text-sm text-dark-text/60">{currentUser.name}</span>
                </div>
              )}
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center px-6 py-3 bg-teal text-white rounded-full hover:bg-teal/90 transition-all font-medium shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border-2 border-teal/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-teal/10 p-3 rounded-lg">
                <svg className="w-8 h-8 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <div className="text-4xl font-bold text-dark-text mb-2">{stats.overview.totalMessages.toLocaleString()}</div>
            <div className="text-dark-text/60 text-sm">Total Conversations</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-2 border-[#347EAD]/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-[#347EAD]/10 p-3 rounded-lg">
                <svg className="w-8 h-8 text-[#347EAD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="text-4xl font-bold text-dark-text mb-2">{stats.overview.totalUsers.toLocaleString()}</div>
            <div className="text-dark-text/60 text-sm">Total Users</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-2 border-purple-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/10 p-3 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2v-6z" />
                </svg>
              </div>
            </div>
            <div className="text-4xl font-bold text-dark-text mb-2">{stats.overview.averageMessagesPerUser}</div>
            <div className="text-dark-text/60 text-sm">Avg Messages/User</div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-dark-text mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-teal/5 rounded-lg">
                <div>
                  <div className="text-sm text-dark-text/60">Last 7 Days</div>
                  <div className="text-3xl font-bold text-teal mt-1">{stats.activity.last7Days.toLocaleString()}</div>
                </div>
                <div className="bg-teal/10 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#347EAD]/5 rounded-lg">
                <div>
                  <div className="text-sm text-dark-text/60">Last 30 Days</div>
                  <div className="text-3xl font-bold text-[#347EAD] mt-1">{stats.activity.last30Days.toLocaleString()}</div>
                </div>
                <div className="bg-[#347EAD]/10 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-[#347EAD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-dark-text mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.856-1.333-2.626 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Crisis Alerts
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-2 border-red-200">
                <div>
                  <div className="text-sm text-red-600">Last 7 Days</div>
                  <div className="text-3xl font-bold text-red-700 mt-1">{stats.crisis.last7Days}</div>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.856-1.333-2.626 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <div className="text-sm text-orange-600">Total Crisis Messages</div>
                  <div className="text-3xl font-bold text-orange-700 mt-1">{stats.crisis.total}</div>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-dark-text mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Sentiment Analysis
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.sentiment).map(([sentiment, count]) => {
              const percentage = totalSentiment > 0 ? ((count / totalSentiment) * 100).toFixed(1) : '0.0';
              return (
                <div key={sentiment} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className={`${getSentimentColor(sentiment)} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-3`}>
                    {getSentimentIcon(sentiment)}
                  </div>
                  <div className="text-2xl font-bold text-dark-text">{count.toLocaleString()}</div>
                  <div className="text-sm text-dark-text/60 mt-1">{sentiment}</div>
                  <div className="text-xs text-dark-text/40 mt-1">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-6 text-center text-sm text-dark-text/60">
          Last updated: {new Date(stats.generatedAt).toLocaleString()}
        </div>
      </main>
    </div>
  );
};

export default TalkEasyStats;