import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, LogOut, ChevronLeft, AlertCircle, Tag, Info, Shield } from 'lucide-react';
import api from '../../config/api';
import { getCurrentUser, getRolePermissions, getRoleDisplayName, getRoleColor } from '../../utils/roleUtils';
import { clearAuth } from '../../utils/auth';


interface ArticleFormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  coverImage: string;
  videoUrl: string;
  tags: string[];
}

const INITIAL_FORM_DATA: ArticleFormData = {
  title: '',
  content: '',
  excerpt: '',
  category: '',
  coverImage: '',
  videoUrl: '',
  tags: [],
};

const CATEGORIES = [
  'Anxiety',
  'Self-Care',
  'Parenting',
  'Mental Health',
  'Communication',
  'Stress Management',
];

const QUICK_TAGS = [
  'stress relief',
  'mental health',
  'self-care',
  'mindfulness',
  'wellness',
  'anxiety',
  'healthy habits',
];

const FORMAT_BUTTONS = [
  { label: 'H1', before: '# ', tooltip: 'Large Heading' },
  { label: 'H2', before: '## ', tooltip: 'Medium Heading' },
  { label: 'H3', before: '### ', tooltip: 'Small Heading' },
  { label: 'B', before: '**', after: '**', tooltip: 'Bold', style: 'font-bold' },
  { label: 'I', before: '*', after: '*', tooltip: 'Italic', style: 'italic' },
  { label: '•', before: '- ', tooltip: 'Bullet Point' },
];

const CreateArticle: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ArticleFormData>(INITIAL_FORM_DATA);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdArticle, setCreatedArticle] = useState<any>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Get current user and permissions
  const currentUser = getCurrentUser();
  const permissions = currentUser ? getRolePermissions(currentUser.role) : null;

  const handleLogout = () => {
      clearAuth();
      sessionStorage.removeItem('isAdminAuthenticated');
      navigate('/');
    };

    const handleNavigateBack = () => {
      navigate('/admin/articles');
    };

  const getCurrentDateTime = (): string => {
    return '2025-10-31 15:03:56';
  };

  const isFormValid = formData.title.trim() && formData.content.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      console.log(`✍️ [${getCurrentDateTime()}] ${currentUser?.name} creating new article:`, {
        title: formData.title.substring(0, 50) + '...',
        contentLength: formData.content.length,
        category: formData.category,
        tagsCount: formData.tags.length
      });

      const response = await api.post('/articles', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setCreatedArticle(response.data.data.article);
        console.log(`✅ [${getCurrentDateTime()}] Article created successfully by ${currentUser?.name}:`, {
          id: response.data.data.article.id.substring(0, 8),
          title: response.data.data.article.title,
          status: response.data.data.article.status
        });
        setShowSuccessModal(true);
        setFormData(INITIAL_FORM_DATA);
        setTagInput('');
      }
    } catch (err: any) {
      console.error(`❌ [${getCurrentDateTime()}] Failed to create article for ${currentUser?.name}:`, err);
      setError(err.response?.data?.message || err.message || 'Failed to create article');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) return;
    
    if (formData.tags.includes(trimmedTag)) {
      alert('Tag already exists!');
      return;
    }

    setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
    setTagInput('');
    console.log(`🏷️ [${getCurrentDateTime()}] ${currentUser?.name} added tag:`, trimmedTag);
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
    console.log(`🗑️ [${getCurrentDateTime()}] ${currentUser?.name} removed tag:`, tagToRemove);
  };

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const newContent = 
      textarea.value.substring(0, start) + 
      before + selectedText + after +
      textarea.value.substring(end);
    
    setFormData(prev => ({ ...prev, content: newContent }));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length, 
        start + before.length + selectedText.length
      );
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-teal-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
                <Edit className="w-10 h-10 text-teal-600" />
                Create New Article
              </h1>
              <p className="text-lg text-gray-600">
                Write a new wellness article with rich formatting and interactive features
              </p>
              <div className="mt-2 text-sm text-gray-500 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-teal-600">Author:</span> {currentUser?.name || 'Unknown'}
                {currentUser && (
                  <>
                    <span className="mx-1">|</span>
                    <Shield className="w-4 h-4" />
                    <span className={`px-2 py-0.5 bg-${getRoleColor(currentUser.role)}-100 text-${getRoleColor(currentUser.role)}-800 text-xs font-semibold rounded`}>
                      {getRoleDisplayName(currentUser.role)}
                    </span>
                  </>
                )}
                <span className="mx-1">|</span>
                <span className="font-semibold text-teal-600">Date:</span> {getCurrentDateTime()} UTC
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleNavigateBack}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Articles
              </button>
              <button 
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-md"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role Info Banner */}
        <div className="bg-teal-50 border-2 border-teal-300 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <Info className="w-6 h-6 text-teal-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-teal-900 font-bold mb-1">✍️ Create Article</h4>
              <p className="text-teal-800 text-sm">
                You're creating a new article as <strong>{currentUser?.name}</strong> ({currentUser ? getRoleDisplayName(currentUser.role) : 'Unknown'}). 
                Your article will be saved as a <strong>DRAFT</strong> and can be edited or submitted for review later.
                {currentUser?.role === 'CONTENT_WRITER' && ' Once submitted, a Content Lead will review it before it can be published.'}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-start">
              <AlertCircle className="w-8 h-8 text-red-600 mr-3 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800 mb-2">Error Creating Article</h3>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Article Editor
            </h2>
            <p className="text-gray-600 mt-1">Fill out the form below to create your wellness article.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg transition-all duration-200"
                required
                disabled={loading}
                placeholder="Enter an engaging title for your article"
              />
            </div>

            {/* Category and Cover Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Article Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                placeholder="Write a compelling summary that will appear in article previews"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-vertical"
                disabled={loading}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Article Content <span className="text-red-500">*</span>
              </label>
              
              {/* Formatting Toolbar */}
              <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-4 flex flex-wrap gap-2 border-b-0">
                {FORMAT_BUTTONS.map((button, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => insertFormatting(button.before, button.after)}
                    className={`px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-teal-50 hover:border-teal-400 transition-all duration-200 font-medium ${button.style || ''}`}
                    title={button.tooltip}
                    disabled={loading}
                  >
                    {button.label}
                  </button>
                ))}
                <div className="text-xs text-gray-500 ml-4 self-center">
                  💡 Select text and click formatting buttons
                </div>
              </div>

              <textarea
                ref={contentRef}
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={18}
                className="w-full px-4 py-4 border border-gray-300 border-t-0 rounded-b-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 font-mono text-sm leading-6 resize-vertical"
                required
                disabled={loading}
                placeholder="Write your article content here. You can use markdown formatting:

# Large Heading
## Medium Heading
### Small Heading

**Bold text**
*Italic text*

- Bullet point 1
- Bullet point 2

Regular paragraph text..."
              />
              
              <div className="mt-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <strong>Formatting Guide:</strong> 
                <span className="ml-2">Use # for headings, **text** for bold, *text* for italic, - for bullet points</span>
              </div>
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Video URL (Optional)</label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                disabled={loading}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags ({formData.tags.length})
              </label>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-6 py-3 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-all duration-200 font-medium border border-teal-200 disabled:opacity-50"
                    disabled={loading || !tagInput.trim()}
                  >
                    Add Tag
                  </button>
                </div>

                {/* Quick Add Tags */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-600">Quick add:</span>
                  {QUICK_TAGS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        if (!formData.tags.includes(suggestion)) {
                          setFormData(prev => ({ ...prev, tags: [...prev.tags, suggestion] }));
                        }
                      }}
                      className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-teal-100 hover:text-teal-700 transition-all duration-200 font-medium disabled:opacity-50"
                      disabled={loading || formData.tags.includes(suggestion)}
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>

                {/* Current Tags */}
                {formData.tags.length > 0 && (
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-teal-900">Current Tags:</span>
                      <span className="text-xs text-teal-700 bg-teal-100 px-2 py-1 rounded-full font-medium">
                        {formData.tags.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center gap-2 bg-white text-teal-800 px-3 py-2 rounded-lg text-sm font-medium shadow-sm border border-teal-200"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-teal-600 hover:text-red-600 hover:bg-red-50 rounded-full p-0.5 transition-all duration-200"
                            disabled={loading}
                            title={`Remove "${tag}" tag`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Section */}
            <div className="border-t border-gray-200 pt-8">
              <div className="bg-gradient-to-r from-teal-50 via-blue-50 to-green-50 rounded-2xl border-2 border-teal-300 p-8 shadow-lg">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Create Your Article?</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Your article will be saved as a <strong>DRAFT</strong>. You can edit it later or submit it for review when ready.
                    {currentUser?.role === 'CONTENT_WRITER' && ' After submission, it will be reviewed by a Content Lead before publishing.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <button
                    type="submit"
                    disabled={!isFormValid || loading}
                    className="flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg shadow-lg bg-teal-600 text-white hover:bg-teal-700 hover:shadow-xl hover:scale-105 active:scale-95 transform transition-all duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Create Article</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleNavigateBack}
                    className="sm:w-auto px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-md disabled:opacity-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                  <p>
                    💡 <strong>Tip:</strong> Fill in the title and content to enable the Create button
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Article Created Successfully!
              </h3>
              <div className="space-y-2 text-sm text-gray-600 mb-6 bg-gray-50 p-4 rounded-lg">
                <p><strong>Title:</strong> {createdArticle?.title}</p>
                <p><strong>Status:</strong> <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs font-semibold">{createdArticle?.status}</span></p>
                <p><strong>Tags:</strong> {createdArticle?.tags?.length || 0}</p>
                <p><strong>Author:</strong> {currentUser?.name}</p>
                <p><strong>Created:</strong> {getCurrentDateTime()}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-blue-800 text-sm">
                  <strong>Next Steps:</strong> Your article is saved as a DRAFT. You can now edit it further or submit it for review from the Manage Articles page.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    handleNavigateBack();
                  }}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  ← Back to Articles
                </button>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Create Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateArticle;