import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { getCurrentUser, getRoleDisplayName, getRoleColor } from '../../utils/roleUtils';

interface Insights {
  period: string;
  topCategories: Array<{ category: string; count: number }>;
  topTopics: Array<{ topic: string; count: number }>;
  emotionalIntensity: Array<{ intensity: string; count: number }>;
  resources: {
    articlesRecommended: number;
    directoriesRecommended: number;
    requestsForResources: number;
  };
}

interface TalkEasyInsightsProps {
  onBack: () => void;
  onLogout: () => void;
}

const TalkEasyInsights: React.FC<TalkEasyInsightsProps> = ({ onBack, onLogout }) => {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30');
  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchInsights();
  }, [period]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/talkeasy/admin/insights?period=${period}`);
      
      if (response.data.success) {
        setInsights(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch insights');
      }
    } catch (err: any) {
      console.error('Failed to fetch TalkEasy insights:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (intensity: string): string => {
    const colors: Record<string, string> = {
      HIGH: 'bg-red-500',
      MEDIUM: 'bg-orange-500',
      LOW: 'bg-green-500',
      CRISIS: 'bg-red-700',
    };
    return colors[intensity] || 'bg-gray-400';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.JSX.Element> = {
      ANXIETY: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      DEPRESSION: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      STRESS: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      default: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    };
    return icons[category] || icons.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#347EAD]/10 via-white to-teal/10 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal border-t-transparent"></div>
          <h3 className="mt-4 text-xl font-semibold text-dark-text">Loading Insights...</h3>
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
            <h3 className="text-lg font-bold text-red-800">Error Loading Insights</h3>
          </div>
          <p className="text-red-700 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={fetchInsights}
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

  if (!insights) return null;

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
                    TalkEasy Insights
                  </h1>
                  <p className="text-lg text-dark-text/70 mt-1">
                    Mental Health Trends & Topics
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
        {/* Period Selector */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-dark-text">Time Period</h3>
            <div className="flex gap-2">
              {['7', '14', '30', '90'].map((days) => (
                <button
                  key={days}
                  onClick={() => setPeriod(days)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    period === days
                      ? 'bg-teal text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-bold text-dark-text mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2v-6z" />
            </svg>
            Top Mental Health Categories
          </h3>
          <div className="space-y-3">
            {insights.topCategories.slice(0, 10).map((category, index) => {
              const maxCount = insights.topCategories[0]?.count || 1;
              const percentage = (category.count / maxCount) * 100;
              return (
                <div key={category.category} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-teal/10 rounded-lg flex items-center justify-center text-teal font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="text-teal">{getCategoryIcon(category.category)}</div>
                        <span className="font-semibold text-dark-text">{category.category}</span>
                      </div>
                      <span className="text-sm text-dark-text/60">{category.count} messages</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-teal to-[#347EAD] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Top Topics */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-dark-text mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#347EAD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Most Discussed Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {insights.topTopics.slice(0, 15).map((topic, index) => {
                const maxCount = insights.topTopics[0]?.count || 1;
                const size = Math.max(12, Math.min(20, 12 + (topic.count / maxCount) * 8));
                return (
                  <div
                    key={topic.topic}
                    className="px-4 py-2 bg-[#347EAD]/10 text-[#347EAD] rounded-full font-medium border border-[#347EAD]/20 hover:bg-[#347EAD]/20 transition-colors cursor-default"
                    style={{ fontSize: `${size}px` }}
                    title={`${topic.count} mentions`}
                  >
                    {topic.topic} <span className="text-xs opacity-60">({topic.count})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Emotional Intensity */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-dark-text mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
              Emotional Intensity
            </h3>
            <div className="space-y-4">
              {insights.emotionalIntensity.map((intensity) => {
                const total = insights.emotionalIntensity.reduce((sum, i) => sum + i.count, 0);
                const percentage = total > 0 ? ((intensity.count / total) * 100).toFixed(1) : '0.0';
                return (
                  <div key={intensity.intensity} className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${getIntensityColor(intensity.intensity)} rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0`}>
                      {intensity.count}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-dark-text">{intensity.intensity}</span>
                        <span className="text-sm text-dark-text/60">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${getIntensityColor(intensity.intensity)} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-dark-text mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Resource Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-teal/5 rounded-lg p-6 border-2 border-teal/20">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-teal/10 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-teal mb-2">{insights.resources.articlesRecommended}</div>
              <div className="text-dark-text/60 text-sm">Articles Recommended</div>
            </div>

            <div className="bg-[#347EAD]/5 rounded-lg p-6 border-2 border-[#347EAD]/20">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[#347EAD]/10 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-[#347EAD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-[#347EAD] mb-2">{insights.resources.directoriesRecommended}</div>
              <div className="text-dark-text/60 text-sm">Directories Recommended</div>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">{insights.resources.requestsForResources}</div>
              <div className="text-dark-text/60 text-sm">Resource Requests</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TalkEasyInsights;