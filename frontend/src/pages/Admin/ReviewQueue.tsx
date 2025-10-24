import React, { useState, useEffect } from 'react';
import api from '../../config/api';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  coverImage?: string;
  videoUrl?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
  tags?: string[];
  readTime?: number;
  author: {
    id: string;
    name: string;
    email: string;
  };
  reviewer?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface ReviewQueueProps {
  onNavigateBack: () => void;
  onLogout: () => void;
}

const ReviewQueue: React.FC<ReviewQueueProps> = ({ onNavigateBack, onLogout }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewingArticleId, setReviewingArticleId] = useState<string | null>(null);

  // Current date/time context
  const getCurrentDateTime = (): string => {
    return '2025-10-24 14:38:01';
  };

  useEffect(() => {
    fetchArticles();
  }, [currentPage]);

  const fetchArticles = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log(`🔍 [${getCurrentDateTime()}] ArogoClin fetching review queue...`);

      // FIXED: Only fetch SUBMITTED articles (not approved ones)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        status: 'SUBMITTED', // This ensures we only get articles that need review
        publishedOnly: 'false'
      });

      const response = await api.get(`/articles?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`📦 [${getCurrentDateTime()}] Review queue response:`, {
        success: response.data.success,
        articlesCount: response.data.data?.articles?.length || 0,
        articlesStatuses: response.data.data?.articles?.map((a: Article) => ({ id: a.id, status: a.status })) || []
      });

      if (response.data.success) {
        const submittedArticles = response.data.data.articles.filter((article: Article) => 
          article.status === 'SUBMITTED'
        );
        
        console.log(`✅ [${getCurrentDateTime()}] Found ${submittedArticles.length} articles pending review for ArogoClin`);
        
        setArticles(submittedArticles);
        setTotalPages(response.data.data.pagination.total);
      } else {
        throw new Error(response.data.message || 'Failed to fetch articles');
      }
    } catch (err: any) {
      console.error(`❌ [${getCurrentDateTime()}] Failed to fetch review queue for ArogoClin:`, err);
      setError(err.response?.data?.message || err.message || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewArticle = async (articleId: string, action: 'approve' | 'reject'): Promise<void> => {
    // Prevent multiple simultaneous reviews
    if (reviewingArticleId) {
      alert('Please wait, another review is in progress...');
      return;
    }

    const feedback = action === 'reject' ? prompt('Please provide feedback for rejection:') : '';
    if (action === 'reject' && !feedback?.trim()) {
      alert('Feedback is required when rejecting an article.');
      return;
    }

    try {
      setReviewingArticleId(articleId);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      console.log(`🔍 [${getCurrentDateTime()}] ArogoClin ${action}ing article:`, articleId);

      const response = await api.patch(`/articles/${articleId}/review`, 
        { action, feedback: feedback?.trim() || undefined }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
        console.log(`✅ [${getCurrentDateTime()}] Article ${action}d successfully. New status: ${newStatus}`);
        
        // Remove the article from the current list immediately for better UX
        setArticles(prevArticles => 
          prevArticles.filter(article => article.id !== articleId)
        );

        // Show success message
        alert(`Article ${action === 'approve' ? 'approved' : 'rejected'} successfully! ${
          action === 'approve' 
            ? 'It can now be published from the Manage Articles page.' 
            : 'The author can revise and resubmit it.'
        }`);

        // Refresh the list to get updated data
        setTimeout(() => {
          fetchArticles();
        }, 1000);

      } else {
        throw new Error(response.data.message || `Failed to ${action} article`);
      }
    } catch (err: any) {
      console.error(`❌ [${getCurrentDateTime()}] Failed to ${action} article:`, err);
      alert(err.response?.data?.message || err.message || `Failed to ${action} article`);
    } finally {
      setReviewingArticleId(null);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'SUBMITTED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-purple-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                📋 Review Queue
              </h1>
              <p className="text-lg text-gray-600">
                Review articles submitted for approval and decide their publication status
              </p>
              <div className="mt-2 text-sm text-gray-500">
                <span className="font-semibold text-purple-600">Reviewer:</span> ArogoClin | 
                <span className="font-semibold text-purple-600 ml-2">Date:</span> {getCurrentDateTime()} UTC | 
                <span className="font-semibold text-purple-600 ml-2">Pending:</span> {articles.length}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onNavigateBack}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Articles Hub
              </button>
              <button 
                onClick={fetchArticles}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all duration-200 font-medium"
              >
                🔄 Refresh Queue
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
        {/* Review Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{articles.length}</p>
                <p className="text-sm text-gray-500 mt-1">Articles awaiting decision</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Current Page</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{currentPage}</p>
                <p className="text-sm text-gray-500 mt-1">of {totalPages} pages</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Reviewer</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">ArogoClin</p>
                <p className="text-sm text-gray-500 mt-1">Content Lead</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && articles.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
            <h3 className="mt-4 text-xl font-semibold text-gray-700">Loading Review Queue...</h3>
            <p className="mt-2 text-gray-500">Fetching articles pending review for ArogoClin</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-red-800">Error Loading Review Queue</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchArticles}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-md"
            >
              🔄 Try Again
            </button>
          </div>
        )}

        {/* Articles List */}
        {!loading && !error && (
          <>
            {articles.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">All Caught Up!</h3>
                <p className="text-lg text-gray-500 mb-6">
                  No articles are currently waiting for review. Great job, ArogoClin!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={fetchArticles}
                    className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-200 font-medium shadow-md"
                  >
                    🔄 Check for New Submissions
                  </button>
                  <button
                    onClick={onNavigateBack}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    ← Back to Articles Hub
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {articles.map((article, index) => (
                  <div key={article.id} className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200">
                    <div className="p-8">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-6">
                          {/* Article Header */}
                          <div className="flex items-center gap-3 mb-4">
                            <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
                              #{index + 1 + (currentPage - 1) * 10}
                            </span>
                            <h3 className="text-2xl font-bold text-gray-900">{article.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(article.status)}`}>
                              🔍 PENDING REVIEW
                            </span>
                          </div>

                          {/* Article Metadata */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="font-medium">By {article.author.name}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Submitted {formatDate(article.updatedAt)}</span>
                            </div>
                            {article.category && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                  <span className="text-purple-600 font-medium">{article.category}</span>
                                </div>
                              </>
                            )}
                            {article.readTime && (
                              <>
                                <span>•</span>
                                <span>{article.readTime} min read</span>
                              </>
                            )}
                          </div>

                          {/* Article Excerpt */}
                          {article.excerpt && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-gray-900 mb-2">Article Summary:</h4>
                              <p className="text-gray-600 italic bg-gray-50 p-3 rounded-lg">"{article.excerpt}"</p>
                            </div>
                          )}
                          
                          {/* Article Content Preview */}
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Content Preview:
                            </h4>
                            <div className="text-sm text-gray-600 line-clamp-4 leading-relaxed">
                              {article.content.substring(0, 500)}
                              {article.content.length > 500 && '...'}
                            </div>
                          </div>

                          {/* Tags */}
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              <span className="text-sm font-medium text-gray-700">Tags:</span>
                              {article.tags.map((tag, idx) => (
                                <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Review Actions */}
                        <div className="flex flex-col gap-3 ml-6 min-w-[180px]">
                          <button
                            onClick={() => handleReviewArticle(article.id, 'approve')}
                            disabled={reviewingArticleId === article.id}
                            className="flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {reviewingArticleId === article.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                ✅ Approve
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleReviewArticle(article.id, 'reject')}
                            disabled={reviewingArticleId === article.id}
                            className="flex items-center justify-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {reviewingArticleId === article.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                ❌ Reject
                              </>
                            )}
                          </button>
                          
                          {/* Article Stats */}
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Article Info</h5>
                            <div className="space-y-1 text-xs text-gray-500">
                              <div>ID: {article.id.substring(0, 8)}...</div>
                              <div>Words: ~{article.content.split(' ').length}</div>
                              <div>Created: {formatDate(article.createdAt)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                          currentPage === pageNum
                            ? 'bg-purple-500 text-white shadow-md'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  Next
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ReviewQueue;