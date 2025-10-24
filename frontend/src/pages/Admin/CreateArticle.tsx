import React, { useState, useRef } from 'react';
import api from '../../config/api';

interface CreateArticleProps {
  onNavigateBack: () => void;
  onLogout: () => void;
}

const CreateArticle: React.FC<CreateArticleProps> = ({ onNavigateBack, onLogout }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      // Debug: Log form data before sending
      console.log('📝 Creating article with data:', {
        title: formData.title,
        hasContent: !!formData.content,
        contentLength: formData.content.length,
        category: formData.category,
        tags: formData.tags,
        tagsType: typeof formData.tags,
        tagsLength: formData.tags.length,
        excerpt: formData.excerpt,
        coverImage: formData.coverImage,
        videoUrl: formData.videoUrl
      });

      const response = await api.post('/articles', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Article creation response:', response.data);

      if (response.data.success) {
        const createdArticle = response.data.data.article;
        console.log('🎉 Article created successfully:', {
          id: createdArticle.id,
          title: createdArticle.title,
          tags: createdArticle.tags,
          tagsInResponse: typeof createdArticle.tags,
          category: createdArticle.category
        });

        setSuccess(`Article created successfully! Title: "${createdArticle.title}" | Tags: ${createdArticle.tags?.length || 0} | You can now submit it for review or continue editing.`);
        
        // Reset form
        setFormData({
          title: '',
          content: '',
          excerpt: '',
          category: '',
          coverImage: '',
          videoUrl: '',
          tags: [],
        });
        setTagInput('');
      }
    } catch (err: any) {
      console.error('❌ Article creation failed:', err);
      console.error('❌ Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      const newTags = [...formData.tags, trimmedTag];
      console.log('🏷️ Adding tag:', { 
        newTag: trimmedTag, 
        currentTags: formData.tags, 
        newTagsArray: newTags 
      });
      setFormData({ ...formData, tags: newTags });
      setTagInput('');
    } else if (formData.tags.includes(trimmedTag)) {
      alert('Tag already exists!');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = formData.tags.filter(tag => tag !== tagToRemove);
    console.log('🗑️ Removing tag:', { 
      removedTag: tagToRemove, 
      oldTags: formData.tags, 
      newTags 
    });
    setFormData({ ...formData, tags: newTags });
  };

  // Formatting functions
  const insertFormatting = (before: string, after: string = '') => {
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
    
    setFormData({ ...formData, content: newContent });
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length, 
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const formatButtons = [
    { label: 'H1', action: () => insertFormatting('# ', ''), tooltip: 'Large Heading' },
    { label: 'H2', action: () => insertFormatting('## ', ''), tooltip: 'Medium Heading' },
    { label: 'H3', action: () => insertFormatting('### ', ''), tooltip: 'Small Heading' },
    { label: 'B', action: () => insertFormatting('**', '**'), tooltip: 'Bold', style: 'font-bold' },
    { label: 'I', action: () => insertFormatting('*', '*'), tooltip: 'Italic', style: 'italic' },
    { label: '•', action: () => insertFormatting('- ', ''), tooltip: 'Bullet Point' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Article</h1>
              <p className="text-gray-600 mt-1">Write a new wellness article with rich formatting</p>
              <p className="text-sm text-gray-500 mt-1">
                User: <span className="font-medium">ArogoClin</span> | 
                Date: <span className="font-medium">2025-10-24</span> | 
                Time: <span className="font-medium">13:17:01 UTC</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onNavigateBack}
                className="px-4 py-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
              >
                ← Back to Articles
              </button>
              <button onClick={onLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Current Tags */}
        {formData.tags.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-blue-800 font-semibold mb-2">🐛 Debug - Current Tags in Form:</h4>
            <div className="text-blue-700 text-sm">
              <p><strong>Tags Array:</strong> [{formData.tags.map(tag => `"${tag}"`).join(', ')}]</p>
              <p><strong>Count:</strong> {formData.tags.length}</p>
              <p><strong>Type:</strong> {typeof formData.tags}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
                disabled={loading}
                placeholder="Enter an engaging title for your article"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={loading}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                placeholder="Write a compelling summary that will appear in article previews"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
              
              {/* Formatting Toolbar */}
              <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-3 flex flex-wrap gap-2">
                {formatButtons.map((button, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={button.action}
                    className={`px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-200 transition-colors ${button.style || ''}`}
                    title={button.tooltip}
                    disabled={loading}
                  >
                    {button.label}
                  </button>
                ))}
                <div className="text-xs text-gray-500 ml-4 self-center">
                  Select text and click formatting buttons, or use markdown syntax
                </div>
              </div>

              <textarea
                ref={contentRef}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={16}
                className="w-full px-4 py-3 border border-gray-300 border-t-0 rounded-b-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono text-sm"
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
              
              <div className="mt-2 text-xs text-gray-500">
                💡 <strong>Formatting Tips:</strong> Use # for headings, **text** for bold, *text* for italic, - for bullet points
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video URL (Optional)</label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags ({formData.tags.length})
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
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
                    placeholder="Add a tag and press Enter or click Add"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors font-medium"
                    disabled={loading || !tagInput.trim()}
                  >
                    Add Tag
                  </button>
                </div>

                {/* Common Tags Suggestions */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500 mr-2">Quick add:</span>
                  {['stress relief', 'mental health', 'self-care', 'mindfulness', 'wellness', 'anxiety', 'healthy habits'].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        if (!formData.tags.includes(suggestion)) {
                          setFormData({ ...formData, tags: [...formData.tags, suggestion] });
                        }
                      }}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                      disabled={loading || formData.tags.includes(suggestion)}
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>

                {/* Current Tags Display */}
                {formData.tags.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Current Tags:</span>
                      <span className="text-xs text-gray-500">{formData.tags.length} tag{formData.tags.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-teal-600 hover:text-teal-800 ml-1 font-bold"
                            disabled={loading}
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

            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : '📝 Create Article'}
              </button>
              <button
                type="button"
                onClick={onNavigateBack}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateArticle;