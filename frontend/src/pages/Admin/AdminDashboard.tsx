import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { getCurrentUser, getRolePermissions, hasRole, getRoleDisplayName, getRoleColor } from '../../utils/roleUtils';

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  submittedArticles: number;
  approvedArticles: number;
  rejectedArticles: number;
}

interface DirectoryStats {
  total: number;
  verified: number;
  featured: number;
  byType: Record<string, number>;
}

interface RecentArticle {
  id: string;
  title: string;
  status: string;
  author: {
    name: string;
  };
  createdAt: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigateToArticles: () => void;
  onNavigateToConnectCare: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onLogout, 
  onNavigateToArticles,
  onNavigateToConnectCare 
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    submittedArticles: 0,
    approvedArticles: 0,
    rejectedArticles: 0,
  });
  const [directoryStats, setDirectoryStats] = useState<DirectoryStats>({
    total: 0,
    verified: 0,
    featured: 0,
    byType: {}
  });
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user and permissions
  const currentUser = getCurrentUser();
  const permissions = currentUser ? getRolePermissions(currentUser.role) : null;
  const isContentWriter = currentUser && currentUser.role === 'CONTENT_WRITER';
  const isContentLeadOrAbove = currentUser && hasRole(currentUser.role, 'CONTENT_LEAD');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const authHeaders = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      // Fetch articles - CONTENT_WRITER sees only their own, others see all
      const articlesResponse = await api.get('/articles?publishedOnly=false&limit=1000', authHeaders);

      if (!articlesResponse.data.success) {
        throw new Error(articlesResponse.data.message || 'Failed to fetch articles');
      }

      const articles = articlesResponse.data.data?.articles || [];
      
      const statusCounts = articles.reduce((acc: any, article: any) => {
        acc[article.status] = (acc[article.status] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalArticles: articles.length,
        publishedArticles: statusCounts.PUBLISHED || 0,
        draftArticles: statusCounts.DRAFT || 0,
        submittedArticles: statusCounts.SUBMITTED || 0,
        approvedArticles: statusCounts.APPROVED || 0,
        rejectedArticles: statusCounts.REJECTED || 0,
      });

      const sortedArticles = [...articles]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      setRecentArticles(sortedArticles);

      // Fetch directory stats only for CONTENT_LEAD and above
      if (isContentLeadOrAbove) {
        try {
          const directoryResponse = await api.get('/directory/stats', authHeaders);
          if (directoryResponse.data.success) {
            setDirectoryStats(directoryResponse.data.data);
          }
        } catch (dirError) {
          console.error('Failed to fetch directory stats:', dirError);
        }
      }

    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      PUBLISHED: 'bg-teal/10 text-teal border border-teal/20',
      APPROVED: 'bg-[#347EAD]/10 text-[#347EAD] border border-[#347EAD]/20',
      SUBMITTED: 'bg-[#F09232]/10 text-[#F09232] border border-[#F09232]/20',
      DRAFT: 'bg-gray-100 text-gray-700 border border-gray-200',
      REJECTED: 'bg-red-100 text-red-700 border border-red-200',
    };
    return colors[status] || colors.DRAFT;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#347EAD]/10 via-white to-teal/10 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal border-t-transparent"></div>
          <h3 className="mt-4 text-xl font-semibold text-dark-text">Loading Dashboard...</h3>
          <p className="mt-2 text-dark-text/60">Fetching latest data</p>
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
            <h3 className="text-lg font-bold text-red-800">Dashboard Error</h3>
          </div>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="w-full px-6 py-3 bg-teal text-white rounded-lg hover:bg-teal/90 transition-colors font-medium shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#347EAD]/10 via-white to-teal/10">
      {/* Header */}
      <header className="bg-white shadow-md border-b-2 border-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-dark-text mb-2">
                Admin Dashboard
              </h1>
              <p className="text-lg text-dark-text/70">
                Totoz Wellness Content Management
              </p>
              {/* User Role Badge */}
              {currentUser && (
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${getRoleColor(currentUser.role)}-100 text-${getRoleColor(currentUser.role)}-800 border border-${getRoleColor(currentUser.role)}-200`}>
                    {getRoleDisplayName(currentUser.role)}
                  </span>
                  <span className="text-sm text-dark-text/60">
                    {currentUser.name}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center px-6 py-3 bg-teal text-white rounded-full hover:bg-teal/90 transition-all font-medium shadow-md hover:shadow-lg"
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
        {/* Role-based info message for Content Writers */}
        {isContentWriter && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-blue-900 font-bold mb-1">👋 Welcome, Content Writer!</h4>
                <p className="text-blue-800 text-sm">
                  You're viewing your personal articles dashboard. You can create, edit, and submit articles for review. 
                  Once approved by a Content Lead, your articles will be published to the site.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Management Cards */}
        <div className={`grid grid-cols-1 ${isContentLeadOrAbove ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6 mb-8`}>
          {/* LearnWell Articles Card */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-teal/20 hover:border-teal hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-br from-teal to-[#347EAD] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg mr-3">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {isContentWriter ? 'My Articles' : 'LearnWell Articles'}
                  </h3>
                </div>
                {stats.submittedArticles > 0 && isContentLeadOrAbove && (
                  <span className="bg-[#F09232] text-white px-3 py-1 rounded-full text-sm font-bold">
                    {stats.submittedArticles} Pending
                  </span>
                )}
              </div>
              <div className="text-4xl font-bold text-white mb-2">{stats.totalArticles}</div>
              <div className="text-white/90 text-sm">
                {isContentWriter ? 'Your Total Articles' : 'Total Articles'}
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center p-3 bg-teal/5 rounded-lg">
                  <div className="font-bold text-2xl text-teal">{stats.publishedArticles}</div>
                  <div className="text-xs text-dark-text/70 mt-1">Published</div>
                </div>
                <div className="text-center p-3 bg-[#347EAD]/5 rounded-lg">
                  <div className="font-bold text-2xl text-[#347EAD]">
                    {isContentWriter ? stats.submittedArticles : stats.approvedArticles}
                  </div>
                  <div className="text-xs text-dark-text/70 mt-1">
                    {isContentWriter ? 'Submitted' : 'Approved'}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-100 rounded-lg">
                  <div className="font-bold text-2xl text-gray-700">{stats.draftArticles}</div>
                  <div className="text-xs text-dark-text/70 mt-1">Drafts</div>
                </div>
              </div>
              
              <button
                onClick={onNavigateToArticles}
                className="w-full bg-teal text-white px-6 py-3 rounded-full font-semibold hover:bg-teal/90 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Manage Articles</span>
              </button>
            </div>
          </div>

          {/* ConnectCare Directory Card - Only for Content Lead and above */}
          {isContentLeadOrAbove && (
            <div className="bg-white rounded-xl shadow-lg border-2 border-[#347EAD]/20 hover:border-[#347EAD] hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-br from-[#347EAD] to-teal p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg mr-3">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">ConnectCare Directory</h3>
                  </div>
                  {directoryStats.featured > 0 && (
                    <span className="bg-[#F09232] text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {directoryStats.featured}
                    </span>
                  )}
                </div>
                <div className="text-4xl font-bold text-white mb-2">{directoryStats.total}</div>
                <div className="text-white/90 text-sm">Total Entries</div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="text-center p-3 bg-teal/5 rounded-lg">
                    <div className="font-bold text-2xl text-teal flex items-center justify-center gap-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {directoryStats.verified}
                    </div>
                    <div className="text-xs text-dark-text/70 mt-1">Verified</div>
                  </div>
                  <div className="text-center p-3 bg-[#347EAD]/5 rounded-lg">
                    <div className="font-bold text-2xl text-[#347EAD]">
                      {Object.keys(directoryStats.byType).length}
                    </div>
                    <div className="text-xs text-dark-text/70 mt-1">Categories</div>
                  </div>
                </div>
                
                <button
                  onClick={onNavigateToConnectCare}
                  className="w-full bg-[#347EAD] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#347EAD]/90 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Manage Directory</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Articles */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h2 className="text-2xl font-bold text-dark-text">
                  {isContentWriter ? 'My Recent Articles' : 'Recent Articles'}
                </h2>
                <p className="text-dark-text/60 text-sm mt-1">Latest content activity</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentArticles.length > 0 ? (
              recentArticles.map((article) => (
                <div key={article.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-dark-text truncate">{article.title}</h3>
                      <p className="text-sm text-dark-text/60 mt-1">
                        <span className="font-medium">{article.author.name}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(article.createdAt)}</span>
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${getStatusColor(article.status)}`}>
                      {article.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-16 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-dark-text mb-2">No Articles Yet</h3>
                <p className="text-dark-text/60">Create your first article to get started</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;