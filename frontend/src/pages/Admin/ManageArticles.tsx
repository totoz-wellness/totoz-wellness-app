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

interface ManageArticlesProps {
  onNavigateBack: () => void;
  onNavigateToCreate: () => void;
  onNavigateToEdit: (articleId: string) => void;
  onLogout: () => void;
}

const ManageArticles: React.FC<ManageArticlesProps> = ({ 
  onNavigateBack, 
  onNavigateToCreate, 
  onNavigateToEdit, 
  onLogout 
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Current date/time context
  const getCurrentDateTime = (): string => {
    return '2025-10-24 14:48:33';
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedStatus, currentPage]);

  const fetchArticles = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        publishedOnly: 'false'
      });

      if (selectedStatus) {
        params.append('status', selectedStatus);
      }

      console.log(`🔍 [${getCurrentDateTime()}] ArogoClin fetching articles with params:`, params.toString());

      const response = await api.get(`/articles?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`📦 [${getCurrentDateTime()}] Articles response for ArogoClin:`, {
        success: response.data.success,
        articlesCount: response.data.data?.articles?.length || 0,
        articleStatuses: response.data.data?.articles?.map((a: Article) => ({ id: a.id.substring(0, 8), status: a.status })) || []
      });

      if (response.data.success) {
        setArticles(response.data.data.articles);
        setTotalPages(response.data.data.pagination.total);
        console.log(`✅ [${getCurrentDateTime()}] Loaded ${response.data.data.articles.length} articles for ArogoClin`);
      } else {
        throw new Error(response.data.message || 'Failed to fetch articles');
      }
    } catch (err: any) {
      console.error(`❌ [${getCurrentDateTime()}] Failed to fetch articles for ArogoClin:`, err);
      setError(err.response?.data?.message || err.message || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async (articleId: string): Promise<void> => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    // FIXED: Check current status before submitting
    if (article.status !== 'DRAFT' && article.status !== 'REJECTED') {
      alert(`Cannot submit article for review. Current status is "${article.status}". Only DRAFT or REJECTED articles can be submitted.`);
      return;
    }

    if (!confirm(`Submit "${article.title}" for review?\n\nCurrent status: ${article.status}`)) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      console.log(`📝 [${getCurrentDateTime()}] ArogoClin submitting article for review:`, {
        articleId: articleId.substring(0, 8),
        currentStatus: article.status,
        title: article.title.substring(0, 30) + '...'
      });

      const response = await api.patch(`/articles/${articleId}/submit`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const updatedArticle = response.data.data.article;
        console.log(`✅ [${getCurrentDateTime()}] Article submitted successfully by ArogoClin:`, {
          articleId: articleId.substring(0, 8),
          oldStatus: article.status,
          newStatus: updatedArticle.status
        });
        
        alert(`Article "${article.title}" submitted for review successfully!\n\nStatus changed from "${article.status}" to "${updatedArticle.status}"`);
        fetchArticles(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to submit article');
      }
    } catch (err: any) {
      console.error(`❌ [${getCurrentDateTime()}] Failed to submit article for ArogoClin:`, err);
      alert(err.response?.data?.message || err.message || 'Failed to submit article for review');
    }
  };

  const handleReviewArticle = async (articleId: string, action: 'approve' | 'reject'): Promise<void> => {
    const feedback = action === 'reject' ? prompt('Please provide feedback for rejection:') : '';
    if (action === 'reject' && !feedback?.trim()) {
      alert('Feedback is required when rejecting an article.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      console.log(`🔍 [${getCurrentDateTime()}] ArogoClin ${action}ing article:`, articleId.substring(0, 8));

      const response = await api.patch(`/articles/${articleId}/review`, 
        { action, feedback: feedback?.trim() || undefined }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        console.log(`✅ [${getCurrentDateTime()}] Article ${action}d successfully by ArogoClin`);
        alert(`Article ${action}d successfully!`);
        fetchArticles();
      }
    } catch (err: any) {
      console.error(`❌ [${getCurrentDateTime()}] Failed to ${action} article:`, err);
      alert(err.response?.data?.message || err.message || `Failed to ${action} article`);
    }
  };

  const handlePublishArticle = async (articleId: string): Promise<void> => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    if (!confirm(`Publish "${article.title}"?\n\nIt will be visible to all users on the LearnWell page.`)) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      console.log(`🚀 [${getCurrentDateTime()}] ArogoClin publishing article:`, articleId.substring(0, 8));

      const response = await api.patch(`/articles/${articleId}/publish`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        console.log(`📤 [${getCurrentDateTime()}] Article published successfully by ArogoClin`);
        alert(`"${article.title}" published successfully! It is now visible on the LearnWell page.`);
        fetchArticles();
      }
    } catch (err: any) {
      console.error(`❌ [${getCurrentDateTime()}] Publish error for ArogoClin:`, err);
      alert(err.response?.data?.message || err.message || 'Failed to publish article');
    }
  };

  const handleUnpublishArticle = async (articleId: string): Promise<void> => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    if (!confirm(`Unpublish "${article.title}"?\n\nIt will no longer be visible to the public.`)) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      console.log(`📤 [${getCurrentDateTime()}] ArogoClin unpublishing article:`, articleId.substring(0, 8));

      const response = await api.patch(`/articles/${articleId}/unpublish`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        console.log(`✅ [${getCurrentDateTime()}] Article unpublished successfully by ArogoClin`);
        alert(`"${article.title}" unpublished successfully!`);
        fetchArticles();
      }
    } catch (err: any) {
      console.error(`❌ [${getCurrentDateTime()}] Unpublish error for ArogoClin:`, err);
      alert(err.response?.data?.message || err.message || 'Failed to unpublish article');
    }
  };

  const handleDeleteArticle = async (articleId: string): Promise<void> => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    if (!confirm(`Are you sure you want to delete "${article.title}"?\n\nThis action cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      console.log(`🗑️ [${getCurrentDateTime()}] ArogoClin deleting article:`, articleId.substring(0, 8));

      const response = await api.delete(`/articles/${articleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        console.log(`✅ [${getCurrentDateTime()}] Article deleted successfully by ArogoClin`);
        alert(`"${article.title}" deleted successfully!`);
        fetchArticles();
      }
    } catch (err: any) {
      console.error(`❌ [${getCurrentDateTime()}] Delete error for ArogoClin:`, err);
      alert(err.response?.data?.message || err.message || 'Failed to delete article');
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800 border border-green-200';
      case 'APPROVED': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'SUBMITTED': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'DRAFT': return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
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

  const getActionButtons = (article: Article) => {
    const buttons = [];

    // Edit button - Allow editing for ALL articles
    if (article.status === 'DRAFT' || article.status === 'REJECTED') {
      buttons.push(
        <button
          key="edit"
          onClick={() => onNavigateToEdit(article.id)}
          className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium shadow-sm"
        >
          ✏️ Edit
        </button>
      );
    } else if (article.status === 'PUBLISHED' || article.status === 'APPROVED' || article.status === 'SUBMITTED') {
      buttons.push(
        <button
          key="edit"
          onClick={() => {
            const confirmEdit = confirm(
              `This article is ${article.status.toLowerCase()}.\n\nEditing it will change its status to DRAFT and require re-approval.\n\nContinue editing "${article.title}"?`
            );
            if (confirmEdit) {
              onNavigateToEdit(article.id);
            }
          }}
          className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium shadow-sm"
        >
          ✏️ Edit
        </button>
      );
    }

    // Submit button for DRAFT and REJECTED articles
    if (article.status === 'DRAFT' || article.status === 'REJECTED') {
      buttons.push(
        <button
          key="submit"
          onClick={() => handleSubmitForReview(article.id)}
          className="px-3 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200 font-medium shadow-sm"
        >
          📝 Submit for Review
        </button>
      );
    }

    // Review buttons for SUBMITTED articles (if user is content lead)
    if (article.status === 'SUBMITTED') {
      buttons.push(
        <button
          key="approve"
          onClick={() => handleReviewArticle(article.id, 'approve')}
          className="px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-medium shadow-sm"
        >
          ✅ Approve
        </button>
      );
      buttons.push(
        <button
          key="reject"
          onClick={() => handleReviewArticle(article.id, 'reject')}
          className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-sm"
        >
          ❌ Reject
        </button>
      );
    }

    // Publish button for APPROVED articles
    if (article.status === 'APPROVED') {
      buttons.push(
        <button
          key="publish"
          onClick={() => handlePublishArticle(article.id)}
          className="px-3 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-200 font-bold shadow-sm"
        >
          🚀 Publish
        </button>
      );
    }

    // Unpublish button for PUBLISHED articles
    if (article.status === 'PUBLISHED') {
      buttons.push(
        <button
          key="unpublish"
          onClick={() => handleUnpublishArticle(article.id)}
          className="px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 font-medium shadow-sm"
        >
          📤 Unpublish
        </button>
      );
    }

    // Delete button for all articles
    buttons.push(
      <button
        key="delete"
        onClick={() => handleDeleteArticle(article.id)}
        className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-sm"
      >
        🗑️ Delete
      </button>
    );

    return buttons;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                📋 Manage Articles
              </h1>
              <p className="text-lg text-gray-600">
                View and manage all articles - Create, Edit, Review, Publish
              </p>
              <div className="mt-2 text-sm text-gray-500">
                <span className="font-semibold text-blue-600">User:</span> ArogoClin | 
                <span className="font-semibold text-blue-600 ml-2">Date:</span> {getCurrentDateTime()} UTC
              </div>
            </div>
            <div className="flex items-center gap-3">
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
                onClick={onNavigateToCreate}
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-200 font-medium shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Article
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
        {/* Info Banner */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-blue-800">
              <h4 className="font-bold mb-1">📝 Article Management Guide</h4>
              <p>You can edit any article. Editing published/approved articles will reset them to DRAFT status and require re-approval. REJECTED articles will become DRAFT when edited.</p>
            </div>
          </div>
        </div>

        {/* Filters and Stats */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-gray-700">Filter by Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="PUBLISHED">Published</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            
            <div className="flex items-center gap-4 ml-auto">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{articles.length}</span> article{articles.length !== 1 ? 's' : ''} found
              </div>
              <button
                onClick={fetchArticles}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 font-medium"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && articles.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <h3 className="mt-4 text-xl font-semibold text-gray-700">Loading Articles...</h3>
            <p className="mt-2 text-gray-500">Fetching article data for ArogoClin</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-red-800">Error Loading Articles</h3>
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
                <div className="text-6xl mb-6">📝</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Articles Found</h3>
                <p className="text-lg text-gray-500 mb-6">
                  {selectedStatus 
                    ? `No articles with status "${selectedStatus}" found.`
                    : 'Get started by creating your first article.'}
                </p>
                <button
                  onClick={onNavigateToCreate}
                  className="px-8 py-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-200 font-bold text-lg shadow-lg"
                >
                  🖊️ Create Your First Article
                </button>
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
                            <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                              #{index + 1 + (currentPage - 1) * 10}
                            </span>
                            <h3 className="text-2xl font-bold text-gray-900 flex-1">{article.title}</h3>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(article.status)}`}>
                              {article.status}
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
                              <span>Created {formatDate(article.createdAt)}</span>
                            </div>
                            {article.category && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                  <span className="text-blue-600 font-medium">{article.category}</span>
                                </div>
                              </>
                            )}
                            {article.readTime && (
                              <>
                                <span>•</span>
                                <span>{article.readTime} min read</span>
                              </>
                            )}
                            {article.publishedAt && (
                              <>
                                <span>•</span>
                                <span className="text-green-600 font-medium">Published {formatDate(article.publishedAt)}</span>
                              </>
                            )}
                          </div>

                          {/* Article Excerpt */}
                          <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                            {article.excerpt || article.content.substring(0, 200)}...
                          </p>

                          {/* Tags */}
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="text-sm font-medium text-gray-700">Tags:</span>
                              {article.tags.slice(0, 5).map((tag, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium border">
                                  #{tag}
                                </span>
                              ))}
                              {article.tags.length > 5 && (
                                <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                                  +{article.tags.length - 5} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Status-specific Information */}
                          {article.status === 'REJECTED' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                              <p className="text-red-800 text-sm">
                                <strong>Note:</strong> This article was rejected and needs revision. Edit it to address feedback, and it will become a DRAFT ready for resubmission.
                              </p>
                            </div>
                          )}
                          
                          {article.status === 'DRAFT' && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                              <p className="text-gray-700 text-sm">
                                <strong>Status:</strong> This article is in draft status and can be submitted for review.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 min-w-[200px]">
                          {getActionButtons(article)}
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
                            ? 'bg-blue-500 text-white shadow-md'
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

export default ManageArticles;