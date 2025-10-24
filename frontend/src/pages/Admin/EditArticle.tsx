import React, { useState, useEffect, useRef } from 'react';
import api from '../../config/api';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  coverImage?: string;
  videoUrl?: string;
  tags?: string[];
  status: string;
  readTime?: number;
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface EditArticleProps {
  articleId: string;
  onNavigateBack: () => void;
  onLogout: () => void;
}

const EditArticle: React.FC<EditArticleProps> = ({ articleId, onNavigateBack, onLogout }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    coverImage: '',
    videoUrl: '',
    tags: [] as string[],
  });
  const [originalFormData, setOriginalFormData] = useState(formData);
  const [tagInput, setTagInput] = useState('');

  // Current date/time context - Updated to provided timestamp
  const getCurrentDateTime = (): string => {
    return '2025-10-24 14:43:25';
  };

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  // Track form changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalFormData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalFormData]);

  const fetchArticle = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log(`📖 [${getCurrentDateTime()}] ArogoClin fetching article for edit:`, articleId);

      const response = await api.get(`/articles/${articleId}/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const fetchedArticle = response.data.data.article;
        setArticle(fetchedArticle);
        
        const articleData = {
          title: fetchedArticle.title || '',
          content: fetchedArticle.content || '',
          excerpt: fetchedArticle.excerpt || '',
          category: fetchedArticle.category || '',
          coverImage: fetchedArticle.coverImage || '',
          videoUrl: fetchedArticle.videoUrl || '',
          tags: fetchedArticle.tags || [],
        };

        setFormData(articleData);
        setOriginalFormData(articleData);
        
        console.log(`✅ [${getCurrentDateTime()}] Article loaded for ArogoClin:`, {
          id: fetchedArticle.id,
          title: fetchedArticle.title,
          status: fetchedArticle.status,
          tagsCount: fetchedArticle.tags?.length || 0
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch article');
      }
    } catch (err: any) {
      console.error(`❌ [${getCurrentDateTime()}] Failed to fetch article for ArogoClin:`, err);
      setError(err.response?.data?.message || err.message || 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!hasUnsavedChanges) {
      alert('No changes detected to save.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      console.log(`💾 [${getCurrentDateTime()}] ArogoClin saving article updates:`, {
        articleId,
        changes: {
          title: formData.title !== originalFormData.title,
          content: formData.content !== originalFormData.content,
          excerpt: formData.excerpt !== originalFormData.excerpt,
          category: formData.category !== originalFormData.category,
          coverImage: formData.coverImage !== originalFormData.coverImage,
          videoUrl: formData.videoUrl !== originalFormData.videoUrl,
          tags: JSON.stringify(formData.tags) !== JSON.stringify(originalFormData.tags),
        }
      });

      const response = await api.put(`/articles/${articleId}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const updatedArticle = response.data.data.article;
        setArticle(updatedArticle);
        
        // Update both form data and original data to mark as saved
        const savedData = {
          title: updatedArticle.title || '',
          content: updatedArticle.content || '',
          excerpt: updatedArticle.excerpt || '',
          category: updatedArticle.category || '',
          coverImage: updatedArticle.coverImage || '',
          videoUrl: updatedArticle.videoUrl || '',
          tags: updatedArticle.tags || [],
        };
        
        setFormData(savedData);
        setOriginalFormData(savedData);
        setHasUnsavedChanges(false);

        console.log(`✅ [${getCurrentDateTime()}] Article updated successfully by ArogoClin:`, {
          title: updatedArticle.title,
          status: updatedArticle.status,
          tagsCount: updatedArticle.tags?.length || 0
        });

        // Show success modal
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      console.error(`❌ [${getCurrentDateTime()}] Failed to update article for ArogoClin:`, err);
      setError(err.response?.data?.message || err.message || 'Failed to update article');
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (field: string, value: any): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = (): void => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      const newTags = [...formData.tags, trimmedTag];
      handleFormChange('tags', newTags);
      setTagInput('');
      console.log(`🏷️ [${getCurrentDateTime()}] ArogoClin added tag:`, trimmedTag);
    } else if (formData.tags.includes(trimmedTag)) {
      alert('Tag already exists!');
    }
  };

  const removeTag = (tagToRemove: string): void => {
    const newTags = formData.tags.filter(tag => tag !== tagToRemove);
    handleFormChange('tags', newTags);
    console.log(`🗑️ [${getCurrentDateTime()}] ArogoClin removed tag:`, tagToRemove);
  };

  const insertFormatting = (before: string, after: string = ''): void => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const newText = before + selectedText + after;
    const newContent = 
      textarea.value.substring(0, start) + 
      newText + 
      textarea.value.substring(end);
    
    handleFormChange('content', newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length, 
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const formatButtons = [
    { label: 'H1', action: () => insertFormatting('# '), tooltip: 'Large Heading' },
    { label: 'H2', action: () => insertFormatting('## '), tooltip: 'Medium Heading' },
    { label: 'H3', action: () => insertFormatting('### '), tooltip: 'Small Heading' },
    { label: 'B', action: () => insertFormatting('**', '**'), tooltip: 'Bold', style: 'font-bold' },
    { label: 'I', action: () => insertFormatting('*', '*'), tooltip: 'Italic', style: 'italic' },
    { label: '•', action: () => insertFormatting('- '), tooltip: 'Bullet Point' },
  ];

  const handleBackNavigation = (): void => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave? All changes will be lost.'
      );
      if (!confirmLeave) return;
    }
    onNavigateBack();
  };

  // Success Modal Component
  const SuccessModal: React.FC = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Article Updated Successfully!
          </h3>
          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <p><strong>Title:</strong> {article?.title}</p>
            <p><strong>Status:</strong> {article?.status}</p>
            <p><strong>Tags:</strong> {formData.tags.length}</p>
            <p><strong>Updated by:</strong> ArogoClin</p>
            <p><strong>Time:</strong> {getCurrentDateTime()}</p>
          </div>
          {(article?.status === 'PUBLISHED' || article?.status === 'APPROVED') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> This article's status has been reset to DRAFT and will need re-approval before publishing.
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowSuccessModal(false);
                onNavigateBack();
              }}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              ← Back to Manage Articles
            </button>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Continue Editing
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <header className="bg-white shadow-lg border-b-4 border-blue-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900">✏️ Edit Article</h1>
                <p className="text-lg text-gray-600 mt-1">Loading article: {articleId}</p>
                <p className="text-sm text-gray-500 mt-1">
                  User: <span className="font-medium text-blue-600">ArogoClin</span> | 
                  Date: <span className="font-medium">2025-10-24 14:43:25</span>
                </p>
              </div>
              <button
                onClick={onNavigateBack}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                ← Back to Manage Articles
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <h3 className="mt-4 text-xl font-semibold text-gray-700">Loading Article for Editing...</h3>
            <p className="mt-2 text-gray-500">Fetching article data for ArogoClin</p>
            <p className="mt-1 text-sm text-gray-400">Article ID: {articleId}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                ✏️ Edit Article
              </h1>
              <p className="text-lg text-gray-600">
                {article ? `Editing: ${article.title}` : `Loading Article ID: ${articleId}`}
              </p>
              <div className="mt-2 text-sm text-gray-500 space-y-1">
                <div>
                  <span className="font-semibold text-blue-600">Editor:</span> ArogoClin | 
                  <span className="font-semibold text-blue-600 ml-2">Date:</span> 2025-10-24 14:43:25
                </div>
                {article && (
                  <div>
                    <span className="font-semibold text-blue-600">Status:</span> {article.status} | 
                    <span className="font-semibold text-blue-600 ml-2">Author:</span> {article.author.name} | 
                    <span className="font-semibold text-blue-600 ml-2">Tags:</span> {formData.tags.length} |
                    <span className={`ml-2 font-semibold ${hasUnsavedChanges ? 'text-orange-600' : 'text-green-600'}`}>
                      {hasUnsavedChanges ? '⚠️ Unsaved Changes' : '✅ All Changes Saved'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackNavigation}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Manage Articles
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {success && (
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-semibold">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-red-800">Error Updating Article</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchArticle}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              🔄 Retry
            </button>
          </div>
        )}

        {/* Warning for published/approved articles */}
        {article && (article.status === 'PUBLISHED' || article.status === 'APPROVED') && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-yellow-800">
                <h4 className="font-bold mb-1">⚠️ Important Notice</h4>
                <p>This article is currently <strong>{article.status.toLowerCase()}</strong>. Editing it will reset the status to <strong>DRAFT</strong> and require re-approval before it can be published again.</p>
              </div>
            </div>
          </div>
        )}

        {/* Article Edit Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Article Editor
            </h2>
            <p className="text-gray-600 mt-1">Make your changes below and click "Save Changes" when ready.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Article Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                required
                disabled={saving}
                placeholder="Enter an engaging title for your article"
              />
            </div>

            {/* Category and Cover Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={saving}
                >
                  <option value="">Select a category</option>
                  <option value="Anxiety">Anxiety</option>
                  <option value="Self-Care">Self-Care</option>
                  <option value="Parenting">Parenting</option>
                  <option value="Mental Health">Mental Health</option>
                  <option value="Communication">Communication</option>
                  <option value="Stress Management">Stress Management</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => handleFormChange('coverImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Article Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleFormChange('excerpt', e.target.value)}
                rows={3}
                placeholder="Write a compelling summary that will appear in article previews"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={saving}
              />
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Article Content *</label>
              
              {/* Formatting Toolbar */}
              <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-4 flex flex-wrap gap-2 border-b-0">
                {formatButtons.map((button, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={button.action}
                    className={`px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium ${button.style || ''}`}
                    title={button.tooltip}
                    disabled={saving}
                  >
                    {button.label}
                  </button>
                ))}
                <div className="text-xs text-gray-500 ml-4 self-center">
                  💡 Select text and click formatting buttons, or use markdown syntax
                </div>
              </div>

              <textarea
                ref={contentRef}
                value={formData.content}
                onChange={(e) => handleFormChange('content', e.target.value)}
                rows={20}
                className="w-full px-4 py-4 border border-gray-300 border-t-0 rounded-b-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm leading-6"
                required
                disabled={saving}
                placeholder="Write your article content here. You can use markdown formatting."
              />
              
              <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
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
                onChange={(e) => handleFormChange('videoUrl', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={saving}
              />
            </div>

            {/* Enhanced Tags Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags ({formData.tags.length} {formData.tags.length === 1 ? 'tag' : 'tags'})
              </label>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium disabled:opacity-50"
                    disabled={saving || !tagInput.trim()}
                  >
                    Add Tag
                  </button>
                </div>

                {/* Quick Add Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500 mr-2">Quick add:</span>
                  {['stress relief', 'mental health', 'self-care', 'mindfulness', 'wellness', 'anxiety', 'healthy habits'].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        if (!formData.tags.includes(suggestion)) {
                          handleFormChange('tags', [...formData.tags, suggestion]);
                        }
                      }}
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                      disabled={saving || formData.tags.includes(suggestion)}
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>

                {/* Current Tags */}
                {formData.tags.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-blue-800">Current Tags:</span>
                      <span className="text-xs text-blue-600">{formData.tags.length} tag{formData.tags.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium border border-blue-200"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-blue-600 hover:text-blue-800 font-bold text-base leading-none"
                            disabled={saving}
                            title={`Remove "${tag}" tag`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={saving || !article || !hasUnsavedChanges}
                  className={`flex-1 flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg ${
                    hasUnsavedChanges && !saving
                      ? 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      Saving Changes...
                    </>
                  ) : hasUnsavedChanges ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      💾 Save Changes
                    </>
                  ) : (
                    <>
                      ✅ All Changes Saved
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleBackNavigation}
                  className="sm:w-auto px-8 py-4 bg-gray-100 text-gray-700 rounded-lg font-bold text-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
                  disabled={saving}
                >
                  Cancel & Go Back
                </button>
              </div>
              
              {hasUnsavedChanges && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-800 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <strong>Reminder:</strong> You have unsaved changes. Don't forget to save before leaving!
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && <SuccessModal />}
    </div>
  );
};

export default EditArticle;