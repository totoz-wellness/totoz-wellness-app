import React, { useState, useEffect } from 'react';
import api from '../../config/api';

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
  const [debugMode, setDebugMode] = useState(false);
  const [allArticles, setAllArticles] = useState<Article[]>([]);

  // Current date/time for consistency
  const getCurrentDateTime = (): string => {
    return '2025-10-24 14:33:38';
  };

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

      console.log(`📊 [${getCurrentDateTime()}] Fetching article statistics for ArogoClin...`);

      // FIXED: Fetch ALL articles by the current user and filter by status on frontend
      // This ensures we get accurate counts per status for this specific user
      const response = await api.get('/articles?publishedOnly=false&limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log(`📦 [${getCurrentDateTime()}] Raw API response for ArogoClin:`, response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch articles');
      }

      const articles: Article[] = response.data.data?.articles || [];
      setAllArticles(articles); // Store for debugging

      console.log(`📋 [${getCurrentDateTime()}] All articles fetched:`, articles.length);
      console.log(`📝 [${getCurrentDateTime()}] Article details:`, articles.map(a => ({
        id: a.id,
        title: a.title.substring(0, 30) + '...',
        status: a.status,
        author: a.author.name
      })));

      // FIXED: Count articles by status from the actual returned data with type safety
      const publishedCount: number = articles.filter(a => a.status === 'PUBLISHED').length;
      const draftCount: number = articles.filter(a => a.status === 'DRAFT').length;
      const submittedCount: number = articles.filter(a => a.status === 'SUBMITTED').length;
      const approvedCount: number = articles.filter(a => a.status === 'APPROVED').length;
      const rejectedCount: number = articles.filter(a => a.status === 'REJECTED').length;
      const totalCount: number = articles.length;

      console.log(`📈 [${getCurrentDateTime()}] Article counts for ArogoClin:`, {
        total: totalCount,
        published: publishedCount,
        draft: draftCount,
        submitted: submittedCount,
        approved: approvedCount,
        rejected: rejectedCount,
        verification: publishedCount + draftCount + submittedCount + approvedCount + rejectedCount
      });

      // Verify counts add up
      const calculatedTotal = publishedCount + draftCount + submittedCount + approvedCount + rejectedCount;
      if (calculatedTotal !== totalCount) {
        console.warn(`⚠️ Count mismatch: calculated ${calculatedTotal} vs actual ${totalCount}`);
      }

      setStats({
        totalArticles: totalCount,
        publishedArticles: publishedCount,
        draftArticles: draftCount,
        submittedArticles: submittedCount,
        approvedArticles: approvedCount,
        rejectedArticles: rejectedCount,
      });

    } catch (err: any) {
      console.error(`❌ [${getCurrentDateTime()}] Failed to fetch stats for ArogoClin:`, err);
      setError(err.response?.data?.message || err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = (): void => {
    console.log(`🖊️ [${getCurrentDateTime()}] Create Article button clicked by ArogoClin`);
    onNavigateToCreate();
  };

  const handleManageClick = (): void => {
    console.log(`📋 [${getCurrentDateTime()}] Manage Articles button clicked by ArogoClin`);
    onNavigateToManage();
  };

  const handleReviewClick = (): void => {
    console.log(`🔍 [${getCurrentDateTime()}] Review Queue button clicked by ArogoClin`);
    onNavigateToReview();
  };

  // Get status breakdown for debug with proper typing
  const getStatusBreakdown = (): Record<string, number> => {
    const breakdown: Record<string, number> = {};
    allArticles.forEach((article: Article) => {
      breakdown[article.status] = (breakdown[article.status] || 0) + 1;
    });
    return breakdown;
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
              <div className="mt-2 text-sm text-gray-500">
                <span className="font-semibold text-[#3AAFA9]">User:</span> ArogoClin | 
                <span className="font-semibold text-[#3AAFA9] ml-2">Date:</span> {getCurrentDateTime()} UTC
              </div>
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
                onClick={() => setDebugMode(!debugMode)}
                className="px-3 py-2 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all duration-200 font-medium"
              >
                {debugMode ? 'Hide Debug' : 'Show Debug'}
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
        {/* Debug Panel */}
        {debugMode && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-yellow-800 flex items-center">
                🐛 Debug Information Panel
              </h3>
              <button
                onClick={() => setDebugMode(false)}
                className="text-yellow-600 hover:text-yellow-800 font-medium"
              >
                ✕ Close
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="bg-yellow-100 p-4 rounded-lg">
                <h4 className="font-bold text-yellow-800 mb-3">📊 Current Statistics</h4>
                <ul className="space-y-2 text-yellow-700">
                  <li className="flex justify-between">
                    <span>📝 Total Articles:</span>
                    <span className="font-bold">{stats.totalArticles}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>✅ Published:</span>
                    <span className="font-bold text-green-600">{stats.publishedArticles}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>🔵 Approved:</span>
                    <span className="font-bold text-blue-600">{stats.approvedArticles}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>🟡 Submitted:</span>
                    <span className="font-bold text-yellow-600">{stats.submittedArticles}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>⚪ Draft:</span>
                    <span className="font-bold text-gray-600">{stats.draftArticles}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>🔴 Rejected:</span>
                    <span className="font-bold text-red-600">{stats.rejectedArticles}</span>
                  </li>
                </ul>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg">
                <h4 className="font-bold text-yellow-800 mb-3">⚙️ System Information</h4>
                <ul className="space-y-2 text-yellow-700">
                  <li><strong>🕐 Last Updated:</strong> {new Date().toLocaleTimeString()}</li>
                  <li><strong>👤 Current User:</strong> ArogoClin</li>
                  <li><strong>🗓️ Session Date:</strong> 2025-10-24</li>
                  <li><strong>🔄 Fetch Method:</strong> Single API call + frontend filtering</li>
                  <li><strong>📡 API Status:</strong> {error ? 'Error' : 'Connected'}</li>
                  <li><strong>🎯 Total Articles Found:</strong> {allArticles.length}</li>
                </ul>
              </div>
            </div>

            {/* Article Breakdown */}
            {allArticles.length > 0 && (
              <div className="mt-4 bg-yellow-100 p-4 rounded-lg">
                <h4 className="font-bold text-yellow-800 mb-3">📋 Your Articles by Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {Object.entries(getStatusBreakdown()).map(([status, count]: [string, number]) => (
                    <div key={status} className="flex justify-between">
                      <span className="text-yellow-700">{status}:</span>
                      <span className="font-bold text-yellow-800">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={fetchStats}
                className="px-4 py-2 bg-yellow-200 text-yellow-800 rounded-lg hover:bg-yellow-300 transition-all duration-200 font-medium"
              >
                🔄 Refresh Statistics
              </button>
              <button
                onClick={() => {
                  console.log('📊 Current stats:', stats);
                  console.log('📋 All articles:', allArticles);
                  console.log('🔍 Status breakdown:', getStatusBreakdown());
                }}
                className="px-4 py-2 bg-yellow-200 text-yellow-800 rounded-lg hover:bg-yellow-300 transition-all duration-200 font-medium"
              >
                📋 Log to Console
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#3AAFA9] border-t-transparent"></div>
            <h3 className="mt-4 text-xl font-semibold text-gray-700">Loading Statistics...</h3>
            <p className="mt-2 text-gray-500">Fetching your article data for ArogoClin</p>
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
                    <p className="text-sm text-gray-500 mt-1">All content by ArogoClin</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
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
                    onClick={handleCreateClick}
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
                    onClick={handleManageClick}
                    className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg transform hover:scale-105"
                  >
                    📋 Manage All Articles
                  </button>
                </div>
              </div>

              {/* Review Queue Card */}
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
                    onClick={handleReviewClick}
                    className="w-full bg-white text-purple-600 px-6 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg transform hover:scale-105"
                  >
                    🔍 Review Articles
                  </button>
                </div>
              </div>
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
              
              {/* Action Alert */}
              {stats.approvedArticles > 0 && (
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
                        onClick={handleManageClick}
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
                    onClick={handleCreateClick}
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