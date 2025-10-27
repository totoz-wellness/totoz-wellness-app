import React, { useState, useEffect } from 'react';
import api from '../../config/api';

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  submittedArticles: number;
  approvedArticles: number;
  rejectedArticles: number;
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
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onNavigateToArticles }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    submittedArticles: 0,
    approvedArticles: 0,
    rejectedArticles: 0,
  });
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const response = await api.get('/articles?publishedOnly=false&limit=1000', authHeaders);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch articles');
      }

      const articles = response.data.data?.articles || [];
      
      // Efficiently count articles by status using reduce
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

      // Get recent articles (latest 5)
      const sortedArticles = [...articles]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      setRecentArticles(sortedArticles);

    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      PUBLISHED: 'bg-green-100 text-green-800 border border-green-200',
      APPROVED: 'bg-blue-100 text-blue-800 border border-blue-200',
      SUBMITTED: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      DRAFT: 'bg-gray-100 text-gray-800 border border-gray-200',
      REJECTED: 'bg-red-100 text-red-800 border border-red-200',
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal-600 border-t-transparent"></div>
          <h3 className="mt-4 text-xl font-semibold text-gray-700">Loading Dashboard...</h3>
          <p className="mt-2 text-gray-500">Fetching latest data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 max-w-md shadow-lg">
          <div className="flex items-center mb-4">
            <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-bold text-red-800">Dashboard Error</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-md"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Articles',
      value: stats.totalArticles,
      description: 'All content',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      bgColor: 'bg-teal-100',
      textColor: 'text-teal-600',
      valueColor: 'text-gray-900'
    },
    {
      label: 'Published',
      value: stats.publishedArticles,
      description: 'Live on LearnWell',
      icon: 'M5 13l4 4L19 7',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      valueColor: 'text-green-600'
    },
    {
      label: 'Pending Review',
      value: stats.submittedArticles,
      description: stats.submittedArticles === 0 ? 'All caught up!' : 'Awaiting your review',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      valueColor: 'text-yellow-600'
    },
    {
      label: 'Drafts',
      value: stats.draftArticles,
      description: 'Work in progress',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-600',
      valueColor: 'text-gray-600'
    },
    {
      label: 'Approved',
      value: stats.approvedArticles,
      description: 'Ready to publish',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      valueColor: 'text-blue-600'
    },
    {
      label: 'Rejected',
      value: stats.rejectedArticles,
      description: 'Needs revision',
      icon: 'M6 18L18 6M6 6l12 12',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      valueColor: 'text-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-teal-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                📊 Admin Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Welcome back! Here's what's happening today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onNavigateToArticles}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Manage Articles
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{card.label}</p>
                  <p className={`text-4xl font-bold mt-2 ${card.valueColor}`}>{card.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{card.description}</p>
                </div>
                <div className={`${card.bgColor} p-4 rounded-full`}>
                  <svg className={`w-8 h-8 ${card.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Articles */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Articles
            </h2>
            <p className="text-gray-600 mt-1">Your latest content activity</p>
          </div>
          <div className="divide-y divide-gray-200">
            {recentArticles.length > 0 ? (
              recentArticles.map((article) => (
                <div key={article.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        By {article.author.name} • {formatDate(article.createdAt)}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(article.status)}`}>
                      {article.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No articles yet</h3>
                <p className="text-gray-500">Create your first article to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create New Article Card */}
        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-xl shadow-lg p-8 text-white hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mr-3">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Create New Article</h3>
            </div>
            <p className="mb-6 text-white/90 text-base leading-relaxed">
              Start writing a new wellness resource for the community. Share your expertise and insights with readers seeking guidance.
            </p>
            <button
              onClick={onNavigateToArticles}
              className="bg-white text-purple-700 px-6 py-3 rounded-lg font-semibold hover:bg-purple-900 hover:text-white transition-all duration-200 shadow-md hover:shadow-xl flex items-center gap-2"
            >
              <span>✍️</span>
              <span>Start Writing</span>
            </button>
          </div>
        </div>

        {/* Review Submissions Card */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-xl shadow-lg p-8 text-white hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/10 rounded-full -ml-14 -mb-14"></div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mr-3">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Review Submissions</h3>
            </div>
            <div className="mb-6">
              {stats.submittedArticles > 0 ? (
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">{stats.submittedArticles}</span>
                  <span className="text-lg text-white/90">
                    article{stats.submittedArticles > 1 ? 's' : ''} awaiting review
                  </span>
                </div>
              ) : (
                <p className="text-white/90 text-base leading-relaxed">
                  Excellent work! All submissions have been reviewed. Check back later for new content.
                </p>
              )}
            </div>
            <button
              onClick={onNavigateToArticles}
              disabled={stats.submittedArticles === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md flex items-center gap-2 ${
                stats.submittedArticles > 0 
                  ? 'bg-white text-teal-700 hover:bg-teal-900 hover:text-white hover:shadow-xl cursor-pointer' 
                  : 'bg-white/30 text-white/70 cursor-not-allowed'
              }`}
            >
              <span>{stats.submittedArticles > 0 ? '🔍' : '✅'}</span>
              <span>{stats.submittedArticles > 0 ? 'Review Now' : 'All Reviewed'}</span>
            </button>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
};

export default AdminDashboard;