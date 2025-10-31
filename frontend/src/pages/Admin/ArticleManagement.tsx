import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { getCurrentUser, getRolePermissions, hasRole, getRoleDisplayName } from '../../utils/roleUtils';

interface Article {
  id: string;
  title: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  submittedArticles: number;
  approvedArticles: number;
  rejectedArticles: number;
}

interface ArticleManagementProps {
  onLogout: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToCreate: () => void;
  onNavigateToManage: () => void;
  onNavigateToReview: () => void;
}

const ArticleManagement: React.FC<ArticleManagementProps> = ({ 
  onLogout, 
  onNavigateToDashboard, 
  onNavigateToCreate, 
  onNavigateToManage, 
  onNavigateToReview 
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    submittedArticles: 0,
    approvedArticles: 0,
    rejectedArticles: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user and permissions
  const currentUser = getCurrentUser();
  const permissions = currentUser ? getRolePermissions(currentUser.role) : null;
  const canReview = permissions?.canReviewArticles || false;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get('/articles?publishedOnly=false&limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch articles');
      }

      const articles: Article[] = response.data.data?.articles || [];

      const publishedCount = articles.filter(a => a.status === 'PUBLISHED').length;
      const draftCount = articles.filter(a => a.status === 'DRAFT').length;
      const submittedCount = articles.filter(a => a.status === 'SUBMITTED').length;
      const approvedCount = articles.filter(a => a.status === 'APPROVED').length;
      const rejectedCount = articles.filter(a => a.status === 'REJECTED').length;
      const totalCount = articles.length;

      setStats({
        totalArticles: totalCount,
        publishedArticles: publishedCount,
        draftArticles: draftCount,
        submittedArticles: submittedCount,
        approvedArticles: approvedCount,
        rejectedArticles: rejectedCount,
      });

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-[#3AAFA9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                Article Management Hub
              </h1>
              <p className="text-lg text-gray-600">
                Manage all your wellness articles from one centralized location
              </p>
              {currentUser && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Logged in as: <strong>{currentUser.name}</strong>
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                    {getRoleDisplayName(currentUser.role)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onNavigateToDashboard}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </button>
              <button 
                onClick={onLogout} 
                className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#3AAFA9] border-t-transparent"></div>
            <h3 className="mt-4 text-xl font-semibold text-gray-700">Loading Statistics...</h3>
            <p className="mt-2 text-gray-500">Fetching your article data</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-red-800">Error Loading Data</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchStats}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-md"
            >
              🔄 Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Total Articles Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#3AAFA9] transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Articles</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalArticles}</p>
                    <p className="text-sm text-gray-500 mt-1">All content</p>
                  </div>
                  <div className="bg-[#3AAFA9] bg-opacity-20 p-4 rounded-full">
                    <svg className="w-8 h-8 text-[#3AAFA9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Published Articles Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Published</p>
                    <p className="text-4xl font-bold text-green-600 mt-2">{stats.publishedArticles}</p>
                    <p className="text-sm text-gray-500 mt-1">Live on LearnWell</p>
                  </div>
                  <div className="bg-green-100 p-4 rounded-full">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Pending Review Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Pending Review</p>
                    <p className="text-4xl font-bold text-yellow-600 mt-2">{stats.submittedArticles}</p>
                    <p className="text-sm text-gray-500 mt-1">Awaiting approval</p>
                  </div>
                  <div className="bg-yellow-100 p-4 rounded-full">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div className={`grid grid-cols-1 ${canReview ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-8 mb-10`}>
              {/* Create Article Card */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#3AAFA9] to-[#2D8B87] rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
                <div className="relative bg-gradient-to-br from-[#3AAFA9] to-[#2D8B87] rounded-xl shadow-xl p-8 transform hover:scale-105 transition-all duration-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Create Article</h3>
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-white text-opacity-90 mb-6 text-lg">
                    {stats.draftArticles > 0 
                      ? `You have ${stats.draftArticles} draft${stats.draftArticles !== 1 ? 's' : ''} in progress.`
                      : 'Start writing a new wellness article for the community.'}
                  </p>
                  <button
                    onClick={onNavigateToCreate}
                    className="w-full bg-white text-[#3AAFA9] px-6 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg transform hover:scale-105"
                  >
                    🖊️ Start Writing Now
                  </button>
                </div>
              </div>

              {/* Manage Articles Card */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-xl p-8 transform hover:scale-105 transition-all duration-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Manage Articles</h3>
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-white text-opacity-90 mb-6 text-lg">
                    {stats.totalArticles > 0 
                      ? `Manage all ${stats.totalArticles} of your articles in one place.`
                      : 'View, edit, and organize all your articles.'}
                  </p>
                  <button
                    onClick={onNavigateToManage}
                    className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg transform hover:scale-105"
                  >
                    📋 Manage All Articles
                  </button>
                </div>
              </div>

              {/* Review Queue Card - Only for Content Lead and above */}
              {canReview && (
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
                  <div className="relative bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-xl p-8 transform hover:scale-105 transition-all duration-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-white">Review Queue</h3>
                      <div className="bg-white bg-opacity-20 p-3 rounded-full">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-white text-opacity-90 mb-6 text-lg">
                      {stats.submittedArticles > 0 
                        ? `${stats.submittedArticles} article${stats.submittedArticles !== 1 ? 's' : ''} waiting for your review.`
                        : 'No articles currently pending review.'}
                    </p>
                    <button
                      onClick={onNavigateToReview}
                      className="w-full bg-white text-purple-600 px-6 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg transform hover:scale-105"
                    >
                      🔍 Review Articles
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Status Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                📊 Detailed Article Status Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200">
                  <div className="text-3xl font-bold text-gray-600 mb-2">{stats.draftArticles}</div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Drafts</div>
                  <div className="text-xs text-gray-400 mt-1">Work in progress</div>
                </div>
                <div className="text-center p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200 hover:border-yellow-300 transition-all duration-200">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.submittedArticles}</div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Submitted</div>
                  <div className="text-xs text-gray-400 mt-1">Awaiting review</div>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stats.approvedArticles}</div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Approved</div>
                  <div className="text-xs text-gray-400 mt-1">Ready to publish</div>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all duration-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">{stats.publishedArticles}</div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Published</div>
                  <div className="text-xs text-gray-400 mt-1">Live on site</div>
                </div>
                <div className="text-center p-6 bg-red-50 rounded-xl border-2 border-red-200 hover:border-red-300 transition-all duration-200">
                  <div className="text-3xl font-bold text-red-600 mb-2">{stats.rejectedArticles}</div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Rejected</div>
                  <div className="text-xs text-gray-400 mt-1">Needs revision</div>
                </div>
              </div>
              
              {/* Action Alert for Content Leads */}
              {canReview && stats.approvedArticles > 0 && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold text-blue-800 mb-2">
                        🎉 Ready to Publish!
                      </h4>
                      <p className="text-blue-700 mb-4">
                        You have <strong>{stats.approvedArticles}</strong> approved article{stats.approvedArticles !== 1 ? 's' : ''} 
                        waiting to be published. Once published, {stats.approvedArticles !== 1 ? 'they' : 'it'} will be visible 
                        to all users on the LearnWell page.
                      </p>
                      <button
                        onClick={onNavigateToManage}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md"
                      >
                        📤 Go to Manage Articles
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* No Content State */}
              {stats.totalArticles === 0 && (
                <div className="mt-8 text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h4 className="text-xl font-bold text-gray-700 mb-2">No Articles Yet</h4>
                  <p className="text-gray-500 mb-6">Start your wellness content journey by creating your first article.</p>
                  <button
                    onClick={onNavigateToCreate}
                    className="px-8 py-4 bg-[#3AAFA9] text-white rounded-lg hover:bg-[#2D8B87] transition-all duration-200 font-bold text-lg shadow-lg"
                  >
                    🖊️ Create Your First Article
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ArticleManagement;