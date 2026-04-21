import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Helmet } from 'react-helmet';
import api from '../config/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ReadingProgress from '../components/ArticleReader/ReadingProgress';
import ShareButtons from '../components/ArticleReader/ShareButtons';
import ArticleSkeleton from '../components/ArticleReader/ArticleSkeleton';

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

const ArticleReader: React. FC = () => {
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
      
      if (response.data. success) {
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

  // Extract video embed URL
  const getVideoEmbedUrl = (url: string): string | null => {
    if (! url) return null;
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return null;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <ArticleSkeleton />
        <Footer />
      </>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-light-bg flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
              <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-. 833-1.864-.833-2.634 0L3.732 16.5c-.77. 833.192 2.5 1.732 2.5z" />
              </svg>
              <h2 className="text-2xl font-bold text-red-800 mb-2">Article Not Found</h2>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={handleNavigateBack}
                className="px-6 py-3 bg-teal text-white rounded-xl hover:bg-teal/90 transition-all font-semibold"
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

  const imageUrl = article.coverImage || 'https://images.unsplash.com/photo-1594736139994-372be0a59976? ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
  const videoEmbedUrl = article.videoUrl ?  getVideoEmbedUrl(article.videoUrl) : null;
  const currentUrl = window.location.href;

  // JSON-LD Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt || article.content. substring(0, 160),
    "image": imageUrl,
    "datePublished": article.publishedAt,
    "author": {
      "@type": "Person",
      "name": article.author. name
    },
    "publisher": {
      "@type": "Organization",
      "name": "Totoz Wellness",
      "logo": {
        "@type": "ImageObject",
        "url": "https://totoz.com/logo.png"
      }
    }
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{article.title} | Totoz Wellness</title>
        <meta name="description" content={article.excerpt || article.content.substring(0, 160)} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt || article.content. substring(0, 160)} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt || article.content.substring(0, 160)} />
        <meta name="twitter:image" content={imageUrl} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-light-bg flex flex-col">
        <Navbar />
        <ReadingProgress />
        
        <main className="flex-grow">
          {/* Hero Section */}
          <div className="relative h-[500px] bg-gray-900">
            <img 
              src={imageUrl} 
              alt={article.title}
              className="w-full h-full object-cover opacity-70"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="max-w-4xl mx-auto">
                <button
                  onClick={handleNavigateBack}
                  className="mb-6 text-white/90 hover:text-white transition-all flex items-center gap-2 group"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Articles
                </button>
                
                {article.category && (
                  <span className="inline-block px-4 py-2 bg-teal text-white text-sm font-bold uppercase tracking-wide rounded-full mb-4 shadow-lg">
                    {article.category}
                  </span>
                )}
                
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                  {article.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold backdrop-blur-sm">
                      {article.author.name. charAt(0). toUpperCase()}
                    </div>
                    <span>By {article.author.name}</span>
                  </div>
                  <span>•</span>
                  <span>{formatDate(article.publishedAt)}</span>
                  {article.readTime && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {article.readTime} min read
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              {/* Share Buttons */}
              <ShareButtons title={article.title} url={currentUrl} />

              {/* Excerpt */}
              {article.excerpt && (
                <div className="mt-8 text-xl text-gray-700 leading-relaxed p-6 bg-gradient-to-br from-teal/5 to-blue-50 rounded-xl border-l-4 border-teal shadow-sm">
                  <svg className="w-10 h-10 text-teal mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="font-medium italic">{article.excerpt}</p>
                </div>
              )}

              {/* Video */}
              {videoEmbedUrl && (
                <div className="my-10">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={videoEmbedUrl}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={article.title}
                    />
                  </div>
                </div>
              )}

              {/* Main Content with React Markdown */}
              <article className="prose prose-lg prose-teal max-w-none mt-10">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-4xl font-extrabold text-gray-900 mb-6 mt-10" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-3xl font-bold text-gray-900 mb-4 mt-8" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6" {...props} />,
                    p: ({node, ...props}) => <p className="mb-6 leading-relaxed text-gray-700 text-lg" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-6 ml-4 space-y-2 text-gray-700" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-6 ml-4 space-y-2 text-gray-700" {...props} />,
                    li: ({node, ...props}) => <li className="mb-2" {...props} />,
                    a: ({node, ...props}) => <a className="text-teal hover:text-teal/80 font-semibold underline" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-teal bg-gray-50 p-4 my-6 italic text-gray-700" {...props} />,
                    code: ({node, ...props}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-teal" {...props} />,
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </article>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A. 997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512. 098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Related Topics
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {article.tags. map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="px-4 py-2 bg-gradient-to-r from-teal/10 to-blue-50 text-teal-800 rounded-full text-sm font-semibold hover:from-teal/20 hover:to-blue-100 transition-all cursor-pointer border border-teal/20"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Bio */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-gray-50 to-teal/5 rounded-xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {article. author.name.charAt(0). toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{article.author.name}</h3>
                    <p className="text-gray-600 font-medium">Wellness Content Creator at Totoz Wellness</p>
                    <p className="text-sm text-gray-500 mt-1">Published on {formatDate(article.publishedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Share Again */}
              <div className="mt-8">
                <ShareButtons title={article.title} url={currentUrl} />
              </div>

              {/* Navigation */}
              <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                <button
                  onClick={handleNavigateBack}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-lg group"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </>
  );
};

export default ArticleReader;