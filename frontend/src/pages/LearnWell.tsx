import React, { useState, useEffect } from 'react';
import api from '../config/api';

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  coverImage?: string;
  imageUrl?: string;
  readTime?: number;
  status: string; // Added status for debugging
  author?: {
    id: string;
    name: string;
  };
  publishedAt?: string;
  tags?: string[];
}

interface LearnWellProps {
  onNavigateToArticle?: (articleId: string) => void;
}

const LearnWell: React.FC<LearnWellProps> = ({ onNavigateToArticle }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [debugMode, setDebugMode] = useState(false); // Default to false for production

  const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
    const imageUrl = article.coverImage || article.imageUrl || 'https://images.unsplash.com/photo-1594736139994-372be0a59976?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    const displayContent = article.excerpt || article.content;
    const category = article.category || 'Wellness';

    const handleClick = () => {
      console.log('📱 Article card clicked:', article.id, article.title);
      if (onNavigateToArticle) {
        onNavigateToArticle(article.id);
      }
    };

    return (
      <div 
        onClick={handleClick}
        className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group transform hover:-translate-y-2 transition-all duration-300 cursor-pointer hover:shadow-xl"
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && handleClick()}
        aria-label={`Read article: ${article.title}`}
      >
        <img className="h-56 w-full object-cover group-hover:scale-105 transition-transform duration-300" src={imageUrl} alt={article.title} />
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">{category}</p>
            {article.readTime && (
              <span className="text-xs text-gray-500">{article.readTime} min read</span>
            )}
          </div>
          
          {/* Debug Badge - Only show in debug mode */}
          {debugMode && (
            <div className="mb-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                article.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                article.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {article.status} {article.publishedAt && `(${new Date(article.publishedAt).toLocaleDateString()})`}
              </span>
            </div>
          )}
          
          <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-teal-600 transition-colors">
            {article.title}
          </h3>
          <p className="text-gray-600 flex-grow line-clamp-3">{displayContent?.substring(0, 150)}...</p>
          
          {article.author && (
            <p className="text-sm text-gray-500 mt-4">By {article.author.name}</p>
          )}
          
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {article.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Read More Button */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-teal-600 font-medium text-sm group-hover:text-teal-700 transition-colors">
                Read Full Article
              </span>
              <svg className="w-4 h-4 text-teal-600 group-hover:text-teal-700 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const fetchAllArticlesForDebug = async () => {
    try {
      console.log('🔍 [DEBUG] Fetching ALL articles for debugging...');
      
      // Fetch without auth (as public user would)
      const publicResponse = await api.get('/articles?publishedOnly=false&limit=100');
      console.log('👥 [PUBLIC] All articles response:', publicResponse.data);
      
      // Try with auth to see all statuses
      const token = localStorage.getItem('token');
      if (token) {
        const authResponse = await api.get('/articles?publishedOnly=false&limit=100', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('🔐 [AUTH] All articles response:', authResponse.data);
        setAllArticles(authResponse.data.data?.articles || []);
      } else {
        setAllArticles(publicResponse.data.data?.articles || []);
      }
    } catch (err) {
      console.error('❌ [DEBUG] Failed to fetch all articles:', err);
    }
  };

  const fetchArticles = async (currentPage: number = 1, category: string = '') => {
    try {
      setLoading(true);
      setError(null);

      // First, get all articles for debugging
      if (debugMode) {
        await fetchAllArticlesForDebug();
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '9',
        publishedOnly: 'true'
      });

      if (category) {
        params.append('category', category);
      }

      console.log('🔍 [LEARNWELL] Fetching published articles...');
      console.log('📋 [LEARNWELL] Query params:', params.toString());

      // Fetch as public user (no auth header)
      const response = await api.get(`/articles?${params.toString()}`);

      console.log('📦 [LEARNWELL] Public API response:', response.data);

      if (response.data.success) {
        const fetchedArticles = response.data.data.articles || [];
        console.log('✅ [LEARNWELL] Found published articles:', fetchedArticles.length);
        
        setArticles(fetchedArticles);
        setTotalPages(response.data.data.pagination?.total || 1);
      } else {
        throw new Error(response.data.message || 'Failed to fetch articles');
      }
    } catch (err: any) {
      console.error('❌ [LEARNWELL] Failed to fetch articles:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load articles. Please try again later.');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(page, selectedCategory);
  }, [page, selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Debug calculations
  const publishedArticles = allArticles.filter(article => article.status === 'PUBLISHED');
  const approvedArticles = allArticles.filter(article => article.status === 'APPROVED');
  const otherArticles = allArticles.filter(article => !['PUBLISHED', 'APPROVED'].includes(article.status));

  if (loading && articles.length === 0) {
    return (
      <section id="learnwell" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="mt-4 text-gray-600">Loading articles...</p>
          </div>
        </div>
      </section>
    );
  }

  const categories = ['All', 'Anxiety', 'Communication', 'Self-Care', 'Parenting', 'Mental Health'];

  return (
    <section id="learnwell" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            LearnWell Resources
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our library of guides and practical tips for mental wellness. Click any article to read the full content.
          </p>

          {/* Debug Toggle */}
          <div className="mt-4">
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="px-3 py-1 bg-gray-200 text-gray-600 rounded text-xs hover:bg-gray-300 transition-colors"
            >
              {debugMode ? 'Hide Debug' : 'Show Debug'}
            </button>
          </div>

          {/* Debug Information Panel */}
          {debugMode && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-left max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-blue-800">🐛 Debug Panel - LearnWell</h3>
                <span className="text-blue-600 text-sm">User: ArogoClin | Time: {new Date().toLocaleTimeString()}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Database Status</h4>
                  <ul className="text-blue-700 space-y-1">
                    <li>📝 Total Articles: {allArticles.length}</li>
                    <li>✅ Published: {publishedArticles.length}</li>
                    <li>🔵 Approved: {approvedArticles.length}</li>
                    <li>⚫ Others: {otherArticles.length}</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Current Query</h4>
                  <ul className="text-blue-700 space-y-1">
                    <li>📄 Displayed: {articles.length}</li>
                    <li>🔍 Filter: {selectedCategory || 'All'}</li>
                    <li>📖 Page: {page}</li>
                    <li>🚀 Published Only: true</li>
                    <li>🔗 Clickable: {onNavigateToArticle ? 'Yes' : 'No'}</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">API Test</h4>
                  <button
                    onClick={() => fetchArticles(page, selectedCategory)}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-2"
                  >
                    🔄 Refresh Data
                  </button>
                  <p className="text-xs text-blue-600">
                    Navigation: {onNavigateToArticle ? '✅ Enabled' : '❌ Disabled'}
                  </p>
                </div>
              </div>

              {publishedArticles.length > 0 && (
                <div className="mt-4 bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Published Articles Found:</h4>
                  <ul className="text-green-700 text-sm space-y-1">
                    {publishedArticles.map(article => (
                      <li key={article.id}>
                        📄 "{article.title}" (ID: {article.id})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Category Filter */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat === 'All' ? '' : cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  (cat === 'All' && !selectedCategory) || cat === selectedCategory
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => fetchArticles(page, selectedCategory)}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {!error && (
          <>
            {articles.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No published articles found</h3>
                <p className="mt-1 text-gray-500">
                  {approvedArticles.length > 0
                    ? `There are ${approvedArticles.length} approved articles that need to be published.`
                    : 'No articles available at the moment. Check back soon!'
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Article Count */}
                <div className="text-center mb-8">
                  <p className="text-gray-600">
                    {articles.length === 1 ? '1 article' : `${articles.length} articles`} 
                    {selectedCategory && ` in ${selectedCategory}`}
                    {' • Click any card to read the full article'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Loading Overlay for Page Changes */}
        {loading && articles.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LearnWell;