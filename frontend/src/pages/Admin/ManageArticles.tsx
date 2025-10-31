import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Plus, 
  LogOut, 
  ChevronLeft, 
  Edit, 
  Send, 
  Check, 
  X, 
  Rocket, 
  Package, 
  Trash2, 
  RefreshCw, 
  Info, 
  User, 
  Clock, 
  Tag, 
  AlertCircle, 
  Hash, 
  ChevronRight,
  Shield
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../config/api';
import { getCurrentUser, getRolePermissions, hasRole, getRoleDisplayName } from '../../utils/roleUtils';

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

// Custom Modal Component for Confirmations
const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'info' }) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6 whitespace-pre-line">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white rounded-lg transition-all duration-200 font-medium ${getTypeStyles()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Input Modal for Rejection Feedback
const InputModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  message: string;
  placeholder?: string;
}> = ({ isOpen, onClose, onSubmit, title, message, placeholder = '' }) => {
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!value.trim()) {
      toast.error('Please provide feedback');
      return;
    }
    onSubmit(value.trim());
    setValue('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
          autoFocus
        />
        <div className="flex gap-3 justify-end mt-4">
          <button
            onClick={() => {
              setValue('');
              onClose();
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium"
          >
            Submit Rejection
          </button>
        </div>
      </div>
    </div>
  );
};

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

  // Get current user and permissions
  const currentUser = getCurrentUser();
  const permissions = currentUser ? getRolePermissions(currentUser.role) : null;
  const canReview = permissions?.canReviewArticles || false;
  const canPublish = permissions?.canPublishArticles || false;
  const canEditAll = permissions?.canEditAllArticles || false;
  const canDeleteAll = permissions?.canDeleteAllArticles || false;

  // Modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [inputModal, setInputModal] = useState<{
    isOpen: boolean;
    articleId: string | null;
  }>({
    isOpen: false,
    articleId: null,
  });

  const getCurrentDateTime = (): string => {
    return '2025-10-31 14:54:43';
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

      console.log(`🔍 [${getCurrentDateTime()}] ${currentUser?.name} fetching articles with params:`, params.toString());

      const response = await api.get(`/articles?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`📦 [${getCurrentDateTime()}] Articles response for ${currentUser?.name}:`, {
        success: response.data.success,
        articlesCount: response.data.data?.articles?.length || 0,
        articleStatuses: response.data.data?.articles?.map((a: Article) => ({ id: a.id.substring(0, 8), status: a.status })) || []
      });

      if (response.data.success) {
        setArticles(response.data.data.articles);
        setTotalPages(response.data.data.pagination.total);
        console.log(`✅ [${getCurrentDateTime()}] Loaded ${response.data.data.articles.length} articles for ${currentUser?.name}`);
        
        if (response.data.data.articles.length === 0 && !selectedStatus) {
          toast('No articles found. Create your first article!', {
            icon: '📝',
            duration: 3000,
          });
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch articles');
      }
    } catch (err: any) {
      console.error(`❌ [${getCurrentDateTime()}] Failed to fetch articles for ${currentUser?.name}:`, err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load articles';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if user can edit this article
  const canEditArticle = (article: Article): boolean => {
    if (!currentUser) return false;
    return canEditAll || article.author.id === currentUser.id;
  };

  // Check if user can delete this article
  const canDeleteArticle = (article: Article): boolean => {
    if (!currentUser) return false;
    if (canDeleteAll) return true; // Super admins can delete any
    // Writers can delete their own drafts only
    return article.author.id === currentUser.id && article.status === 'DRAFT';
  };

  const handleSubmitForReview = async (articleId: string): Promise<void> => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    // Check ownership for content writers
    if (!canEditAll && currentUser && article.author.id !== currentUser.id) {
      toast.error('You can only submit your own articles for review');
      return;
    }

    if (article.status !== 'DRAFT' && article.status !== 'REJECTED') {
      toast.error(
        `Cannot submit article for review.\nCurrent status: "${article.status}"\nOnly DRAFT or REJECTED articles can be submitted.`,
        { duration: 5000 }
      );
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Submit for Review',
      message: `Submit "${article.title}" for review?\n\nCurrent status: ${article.status}`,
      confirmText: 'Submit',
      type: 'info',
      onConfirm: async () => {
        const loadingToast = toast.loading('Submitting article for review...');
        
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No authentication token');

          console.log(`📝 [${getCurrentDateTime()}] ${currentUser?.name} submitting article for review:`, {
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
            console.log(`✅ [${getCurrentDateTime()}] Article submitted successfully by ${currentUser?.name}:`, {
              articleId: articleId.substring(0, 8),
              oldStatus: article.status,
              newStatus: updatedArticle.status
            });
            
            toast.success(
              `Article "${article.title}" submitted successfully!\nStatus: ${article.status} → ${updatedArticle.status}`,
              { id: loadingToast, duration: 4000 }
            );
            fetchArticles();
          } else {
            throw new Error(response.data.message || 'Failed to submit article');
          }
        } catch (err: any) {
          console.error(`❌ [${getCurrentDateTime()}] Failed to submit article for ${currentUser?.name}:`, err);
          toast.error(
            err.response?.data?.message || err.message || 'Failed to submit article for review',
            { id: loadingToast, duration: 5000 }
          );
        }
      }
    });
  };

  const handleReviewArticle = async (articleId: string, action: 'approve' | 'reject'): Promise<void> => {
    if (!canReview) {
      toast.error('You do not have permission to review articles');
      return;
    }

    if (action === 'reject') {
      setInputModal({ isOpen: true, articleId });
      return;
    }

    // Approve action
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    setConfirmModal({
      isOpen: true,
      title: 'Approve Article',
      message: `Approve "${article.title}"?\n\nThis article will be ready for publishing.`,
      confirmText: 'Approve',
      type: 'info',
      onConfirm: async () => {
        const loadingToast = toast.loading('Approving article...');
        
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No authentication token');

          console.log(`🔍 [${getCurrentDateTime()}] ${currentUser?.name} approving article:`, articleId.substring(0, 8));

          const response = await api.patch(`/articles/${articleId}/review`, 
            { action: 'approve' }, 
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );

          if (response.data.success) {
            console.log(`✅ [${getCurrentDateTime()}] Article approved successfully by ${currentUser?.name}`);
            toast.success(`Article "${article.title}" approved successfully!`, {
              id: loadingToast,
              duration: 4000,
              icon: '✅'
            });
            fetchArticles();
          }
        } catch (err: any) {
          console.error(`❌ [${getCurrentDateTime()}] Failed to approve article:`, err);
          toast.error(
            err.response?.data?.message || err.message || 'Failed to approve article',
            { id: loadingToast, duration: 5000 }
          );
        }
      }
    });
  };

  const handleRejectWithFeedback = async (feedback: string): Promise<void> => {
    const articleId = inputModal.articleId;
    if (!articleId) return;

    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    const loadingToast = toast.loading('Rejecting article...');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      console.log(`🔍 [${getCurrentDateTime()}] ${currentUser?.name} rejecting article:`, articleId.substring(0, 8));

      const response = await api.patch(`/articles/${articleId}/review`, 
        { action: 'reject', feedback }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        console.log(`✅ [${getCurrentDateTime()}] Article rejected successfully by ${currentUser?.name}`);
        toast.success(`Article "${article.title}" rejected with feedback`, {
          id: loadingToast,
          duration: 4000,
          icon: '❌'
        });
        fetchArticles();
      }
    } catch (err: any) {
      console.error(`❌ [${getCurrentDateTime()}] Failed to reject article:`, err);
      toast.error(
        err.response?.data?.message || err.message || 'Failed to reject article',
        { id: loadingToast, duration: 5000 }
      );
    }
  };

  const handlePublishArticle = async (articleId: string): Promise<void> => {
    if (!canPublish) {
      toast.error('You do not have permission to publish articles');
      return;
    }

    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    setConfirmModal({
      isOpen: true,
      title: 'Publish Article',
      message: `Publish "${article.title}"?\n\nIt will be visible to all users on the LearnWell page.`,
      confirmText: 'Publish',
      type: 'info',
      onConfirm: async () => {
        const loadingToast = toast.loading('Publishing article...');
        
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No authentication token');

          console.log(`🚀 [${getCurrentDateTime()}] ${currentUser?.name} publishing article:`, articleId.substring(0, 8));

          const response = await api.patch(`/articles/${articleId}/publish`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.data.success) {
            console.log(`📤 [${getCurrentDateTime()}] Article published successfully by ${currentUser?.name}`);
            toast.success(
              `"${article.title}" published successfully!\nNow visible on LearnWell page 🎉`,
              { id: loadingToast, duration: 4000, icon: '🚀' }
            );
            fetchArticles();
          }
        } catch (err: any) {
          console.error(`❌ [${getCurrentDateTime()}] Publish error for ${currentUser?.name}:`, err);
          toast.error(
            err.response?.data?.message || err.message || 'Failed to publish article',
            { id: loadingToast, duration: 5000 }
          );
        }
      }
    });
  };

  const handleUnpublishArticle = async (articleId: string): Promise<void> => {
    if (!canPublish) {
      toast.error('You do not have permission to unpublish articles');
      return;
    }

    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    setConfirmModal({
      isOpen: true,
      title: 'Unpublish Article',
      message: `Unpublish "${article.title}"?\n\nIt will no longer be visible to the public.`,
      confirmText: 'Unpublish',
      type: 'warning',
      onConfirm: async () => {
        const loadingToast = toast.loading('Unpublishing article...');
        
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No authentication token');

          console.log(`📤 [${getCurrentDateTime()}] ${currentUser?.name} unpublishing article:`, articleId.substring(0, 8));

          const response = await api.patch(`/articles/${articleId}/unpublish`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.data.success) {
            console.log(`✅ [${getCurrentDateTime()}] Article unpublished successfully by ${currentUser?.name}`);
            toast.success(`"${article.title}" unpublished successfully!`, {
              id: loadingToast,
              duration: 4000
            });
            fetchArticles();
          }
        } catch (err: any) {
          console.error(`❌ [${getCurrentDateTime()}] Unpublish error for ${currentUser?.name}:`, err);
          toast.error(
            err.response?.data?.message || err.message || 'Failed to unpublish article',
            { id: loadingToast, duration: 5000 }
          );
        }
      }
    });
  };

  const handleDeleteArticle = async (articleId: string): Promise<void> => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    if (!canDeleteArticle(article)) {
      toast.error('You do not have permission to delete this article');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Delete Article',
      message: `Are you sure you want to delete "${article.title}"?\n\nThis action cannot be undone.`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        const loadingToast = toast.loading('Deleting article...');
        
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No authentication token');

          console.log(`🗑️ [${getCurrentDateTime()}] ${currentUser?.name} deleting article:`, articleId.substring(0, 8));

          const response = await api.delete(`/articles/${articleId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.data.success) {
            console.log(`✅ [${getCurrentDateTime()}] Article deleted successfully by ${currentUser?.name}`);
            toast.success(`"${article.title}" deleted successfully!`, {
              id: loadingToast,
              duration: 4000,
              icon: '🗑️'
            });
            fetchArticles();
          }
        } catch (err: any) {
          console.error(`❌ [${getCurrentDateTime()}] Delete error for ${currentUser?.name}:`, err);
          toast.error(
            err.response?.data?.message || err.message || 'Failed to delete article',
            { id: loadingToast, duration: 5000 }
          );
        }
      }
    });
  };

  const handleEditArticle = (article: Article): void => {
    if (!canEditArticle(article)) {
      toast.error('You do not have permission to edit this article');
      return;
    }

    if (article.status === 'DRAFT' || article.status === 'REJECTED') {
      onNavigateToEdit(article.id);
      return;
    }

    // For published/approved/submitted articles, show confirmation
    setConfirmModal({
      isOpen: true,
      title: 'Edit Article',
      message: `This article is ${article.status.toLowerCase()}.\n\nEditing it will change its status to DRAFT and require re-approval.\n\nContinue editing "${article.title}"?`,
      confirmText: 'Continue Editing',
      type: 'warning',
      onConfirm: () => {
        toast.loading('Opening editor...', { duration: 1000 });
        onNavigateToEdit(article.id);
      }
    });
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
    const isOwner = currentUser && article.author.id === currentUser.id;

    // Edit button - show if user can edit
    if (canEditArticle(article)) {
      buttons.push(
        <button
          key="edit"
          onClick={() => handleEditArticle(article)}
          className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium shadow-sm flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      );
    }

    // Submit button - only for owners of DRAFT and REJECTED articles
    if (isOwner && (article.status === 'DRAFT' || article.status === 'REJECTED')) {
      buttons.push(
        <button
          key="submit"
          onClick={() => handleSubmitForReview(article.id)}
          className="px-3 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200 font-medium shadow-sm flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Submit for Review
        </button>
      );
    }

    // Review buttons - only for Content Leads on SUBMITTED articles
    if (canReview && article.status === 'SUBMITTED') {
      buttons.push(
        <button
          key="approve"
          onClick={() => handleReviewArticle(article.id, 'approve')}
          className="px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-medium shadow-sm flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Approve
        </button>
      );
      buttons.push(
        <button
          key="reject"
          onClick={() => handleReviewArticle(article.id, 'reject')}
          className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-sm flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Reject
        </button>
      );
    }

    // Publish button - only for Content Leads on APPROVED articles
    if (canPublish && article.status === 'APPROVED') {
      buttons.push(
        <button
          key="publish"
          onClick={() => handlePublishArticle(article.id)}
          className="px-3 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-200 font-bold shadow-sm flex items-center gap-2"
        >
          <Rocket className="w-4 h-4" />
          Publish
        </button>
      );
    }

    // Unpublish button - only for Content Leads on PUBLISHED articles
    if (canPublish && article.status === 'PUBLISHED') {
      buttons.push(
        <button
          key="unpublish"
          onClick={() => handleUnpublishArticle(article.id)}
          className="px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 font-medium shadow-sm flex items-center gap-2"
        >
          <Package className="w-4 h-4" />
          Unpublish
        </button>
      );
    }

    // Delete button - show if user can delete
    if (canDeleteArticle(article)) {
      buttons.push(
        <button
          key="delete"
          onClick={() => handleDeleteArticle(article.id)}
          className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-sm flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toast Container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            padding: '16px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxWidth: '500px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
      />

      {/* Rejection Input Modal */}
      <InputModal
        isOpen={inputModal.isOpen}
        onClose={() => setInputModal({ isOpen: false, articleId: null })}
        onSubmit={handleRejectWithFeedback}
        title="Reject Article"
        message="Please provide feedback explaining why this article is being rejected:"
        placeholder="Enter detailed feedback for the author..."
      />

      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
                <ClipboardList className="w-10 h-10 text-blue-600" />
                Manage Articles
              </h1>
              <p className="text-lg text-gray-600">
                View and manage all articles - Create, Edit, Review, Publish
              </p>
              <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                <span className="font-semibold text-blue-600">User:</span> {currentUser?.name || 'Unknown'} 
                {currentUser && (
                  <>
                    <span className="mx-1">|</span>
                    <Shield className="w-4 h-4" />
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      {getRoleDisplayName(currentUser.role)}
                    </span>
                  </>
                )}
                <span className="mx-1">|</span>
                <span className="font-semibold text-blue-600">Date:</span> {getCurrentDateTime()} UTC
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onNavigateBack}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Articles Hub
              </button>
              <button
                onClick={onNavigateToCreate}
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-200 font-medium shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Article
              </button>
              <button 
                onClick={onLogout} 
                className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-md"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role-based Info Banner */}
        {currentUser && currentUser.role === 'CONTENT_WRITER' && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center">
              <Info className="w-8 h-8 text-blue-600 mr-3 flex-shrink-0" />
              <div className="text-blue-800">
                <h4 className="font-bold mb-1">Content Writer View</h4>
                <p className="text-sm">You're viewing your own articles. You can create, edit, and submit your articles for review. Once approved by a Content Lead, they can be published.</p>
              </div>
            </div>
          </div>
        )}

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
                onClick={() => {
                  toast.loading('Refreshing articles...', { duration: 1000 });
                  fetchArticles();
                }}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && articles.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <h3 className="mt-4 text-xl font-semibold text-gray-700">Loading Articles...</h3>
            <p className="mt-2 text-gray-500">Fetching article data for {currentUser?.name}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
              <h3 className="text-lg font-bold text-red-800">Error Loading Articles</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchArticles}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-md flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Articles List */}
        {!loading && !error && (
          <>
            {articles.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Articles Found</h3>
                <p className="text-lg text-gray-500 mb-6">
                  {selectedStatus 
                    ? `No articles with status "${selectedStatus}" found.`
                    : 'Get started by creating your first article.'}
                </p>
                <button
                  onClick={onNavigateToCreate}
                  className="px-8 py-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-200 font-bold text-lg shadow-lg flex items-center gap-3 mx-auto"
                >
                  <Edit className="w-5 h-5" />
                  Create Your First Article
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {articles.map((article, index) => {
                  const isOwner = currentUser && article.author.id === currentUser.id;
                  const actionButtons = getActionButtons(article);
                  
                  return (
                    <div key={article.id} className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200">
                      <div className="p-8">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-6">
                            {/* Article Header */}
                            <div className="flex items-center gap-3 mb-4 flex-wrap">
                              <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                {index + 1 + (currentPage - 1) * 10}
                              </span>
                              <h3 className="text-2xl font-bold text-gray-900 flex-1">{article.title}</h3>
                              <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(article.status)}`}>
                                {article.status}
                              </span>
                              {isOwner && (
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                                  Your Article
                                </span>
                              )}
                            </div>

                            {/* Article Metadata */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="font-medium">By {article.author.name}</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Created {formatDate(article.createdAt)}</span>
                              </div>
                              {article.category && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
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
                            
                            {article.status === 'DRAFT' && isOwner && (
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                                <p className="text-gray-700 text-sm">
                                  <strong>Status:</strong> This article is in draft status and can be submitted for review.
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-3 min-w-[200px]">
                            {actionButtons.length > 0 ? (
                              actionButtons
                            ) : (
                              <div className="text-sm text-gray-500 italic text-center p-4">
                                No actions available
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                  <ChevronLeft className="w-4 h-4 mr-2" />
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
                  <ChevronRight className="w-4 h-4 ml-2" />
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