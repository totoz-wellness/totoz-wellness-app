import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../config/api';
import Header from '../components/common/Navbar';
import Footer from '../components/common/Footer';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  coverImage?: string;
  videoUrl?: string;
  readTime?: number;
  author: {
    id: string;
    name: string;
    email: string;
  };
  publishedAt: string;
  tags?: string[];
}

const ArticleReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchArticle(id);
    }
  }, [id]);

  const fetchArticle = async (articleId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📖 Fetching article:', articleId);
      
      const response = await api.get(`/articles/${articleId}`);
      
      if (response.data.success) {
        setArticle(response.data.data. article);
        console.log('✅ Article loaded:', response.data.data.article. title);
      } else {
        throw new Error(response.data.message || 'Article not found');
      }
    } catch (err: any) {
      console.error('❌ Failed to fetch article:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateBack = () => {
    navigate('/learnwell');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Convert simple markdown-like formatting to HTML
  const formatContent = (content: string) => {
    let formatted = content
      // Headers
      .replace(/^# (. +$)/gm, '<h1 class="text-3xl font-bold mb-6 mt-8 text-gray-900">$1</h1>')
      .replace(/^## (.+$)/gm, '<h2 class="text-2xl font-bold mb-4 mt-8 text-gray-900">$1</h2>')
      . replace(/^### (.+$)/gm, '<h3 class="text-xl font-semibold mb-3 mt-6 text-gray-900">$1</h3>')
      
      // Bold and Italic
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic">$1</em>')
      
      // Line breaks and paragraphs
      .split('\n\n')
      .map(paragraph => {
        const trimmed = paragraph.trim();
        if (! trimmed) return '';
        
        // Check if it's already a header
        if (trimmed.includes('<h1') || trimmed.includes('<h2') || trimmed.includes('<h3')) {
          return trimmed;
        }
        
        // Handle bullet points
        if (trimmed. includes('- ')) {
          const listItems = trimmed
            .split('\n')
            .filter(line => line.trim(). startsWith('- '))
            .map(line => `<li class="mb-2">${line.trim().substring(2)}</li>`)
            . join('');
          return `<ul class="list-disc list-inside mb-6 ml-4 space-y-2">${listItems}</ul>`;
        }
        
        // Regular paragraph
        return `<p class="mb-6 leading-relaxed text-gray-700 text-lg">${trimmed}</p>`;
      })
      . filter(p => p)
      .join('\n');
    
    return formatted;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="mt-4 text-gray-600">Loading article...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-light-bg flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h. 01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-. 833-1.864-. 833-2.634 0L3.732 16. 5c-.77.833. 192 2.5 1.732 2.5z" />
              </svg>
              <h2 className="text-lg font-semibold text-red-800 mb-2">Article Not Found</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={handleNavigateBack}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                ← Back to Articles
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const imageUrl = article.coverImage || 'https://images.unsplash.com/photo-1594736139994-372be0a59976?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="min-h-screen bg-light-bg flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative h-96 bg-gray-900">
          <img 
            src={imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={handleNavigateBack}
                className="mb-4 text-white/80 hover:text-white transition-colors flex items-center gap-2 hover:gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Articles
              </button>
              
              {article.category && (
                <span className="inline-block px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-full mb-4">
                  {article.category}
                </span>
              )}
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                <span>By {article.author.name}</span>
                <span>•</span>
                <span>{formatDate(article.publishedAt)}</span>
                {article.readTime && (
                  <>
                    <span>•</span>
                    <span>{article.readTime} min read</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            {/* Excerpt */}
            {article. excerpt && (
              <div className="text-xl text-gray-600 leading-relaxed mb-8 p-6 bg-teal-50 rounded-lg border-l-4 border-teal-500">
                <svg className="w-8 h-8 text-teal-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {article.excerpt}
              </div>
            )}

            {/* Video */}
            {article. videoUrl && (
              <div className="mb-8">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src={article.videoUrl.replace('watch?v=', 'embed/')}
                    className="w-full h-64 md:h-96"
                    frameBorder="0"
                    allowFullScreen
                    title={article.title}
                  />
                </div>
              </div>
            )}

            {/* Main Content */}
            <article 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
            />

            {/* Tags */}
            {article. tags && article.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Topics</h3>
                <div className="flex flex-wrap gap-3">
                  {article. tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-medium hover:bg-teal-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-xl">
                    {article.author. name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{article.author.name}</h3>
                  <p className="text-gray-600">Wellness Content Creator at Totoz Wellness</p>
                  <p className="text-sm text-gray-500 mt-1">Published on {formatDate(article.publishedAt)}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center">
              <button
                onClick={handleNavigateBack}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Articles
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ArticleReader;