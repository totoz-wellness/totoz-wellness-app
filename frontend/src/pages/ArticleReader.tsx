/**
 * ============================================
 * ARTICLE READER — LEARNWELL
 * ============================================
 * @version     3.0.0
 * @updated     2025-04-23
 * @description Brand-aligned article reading experience
 * ============================================
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
// @ts-expect-error Missing types for react-helmet in this project setup
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

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const getVideoEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
};

// ─── BACK BUTTON ─────────────────────────────────────────────────────────────

const BackButton: React.FC<{ onClick: () => void; light?: boolean }> = ({ onClick, light }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 text-sm font-medium transition-all group ${
      light
        ? 'text-white/70 hover:text-white'
        : 'text-[#1e3a6e]/50 hover:text-[#1e3a6e]'
    }`}
  >
    <svg
      className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
    Back to LearnWell
  </button>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const ArticleReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchArticle(id);
  }, [id]);

  const fetchArticle = async (articleId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/articles/${articleId}`);
      if (response.data.success) {
        setArticle(response.data.data.article);
      } else {
        throw new Error(response.data.message || 'Article not found');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => navigate('/learnwell');

  // ── Loading ──
  if (loading) {
    return (
      <>
        <Navbar />
        <ArticleSkeleton />
        <Footer />
      </>
    );
  }

  // ── Error ──
  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-6 py-20">
          <div className="text-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="font-heading font-bold text-[#1e3a6e] text-xl mb-2">Article not found</h2>
            <p className="text-[#1e3a6e]/50 text-sm mb-8">{error}</p>
            <button
              onClick={goBack}
              className="px-6 py-2.5 bg-[#e9924b] text-white font-semibold rounded-full text-sm hover:bg-[#d4762a] transition-all"
            >
              Back to LearnWell
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const imageUrl =
    article.coverImage ||
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1400&auto=format&fit=crop&q=80';
  const videoEmbedUrl = article.videoUrl ? getVideoEmbedUrl(article.videoUrl) : null;
  const currentUrl = window.location.href;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.content.substring(0, 160),
    image: imageUrl,
    datePublished: article.publishedAt,
    author: { '@type': 'Person', name: article.author.name },
    publisher: {
      '@type': 'Organization',
      name: 'Totoz Wellness',
      logo: { '@type': 'ImageObject', url: 'https://totoz.com/logo.png' },
    },
  };

  return (
    <>
      <Helmet>
        <title>{article.title} | Totoz Wellness</title>
        <meta name="description" content={article.excerpt || article.content.substring(0, 160)} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt || article.content.substring(0, 160)} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt || article.content.substring(0, 160)} />
        <meta name="twitter:image" content={imageUrl} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen bg-[#fbfbfb] flex flex-col">
        <Navbar />
        <ReadingProgress />

        <main className="flex-grow">

          {/* ── Hero ─────────────────────────────────── */}
          <div className="relative h-[480px] md:h-[560px] bg-[#1e3a6e]">
            <img
              src={imageUrl}
              alt={article.title}
              className="w-full h-full object-cover opacity-30"
              loading="eager"
              decoding="async"
            />
            {/* Gradient — strong at bottom for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a6e]/95 via-[#1e3a6e]/50 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-between px-6 md:px-12 lg:px-20 py-8">
              {/* Top bar */}
              <div className="max-w-4xl mx-auto w-full pt-20">
                <BackButton onClick={goBack} light />
              </div>

              {/* Bottom — article meta */}
              <div className="max-w-4xl mx-auto w-full pb-2">
                {article.category && (
                  <span className="inline-block px-3 py-1 bg-[#e9924b] text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                    {article.category}
                  </span>
                )}
                <h1 className="font-heading font-extrabold text-white text-3xl md:text-4xl lg:text-5xl leading-tight mb-5 max-w-3xl">
                  {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-white/55 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#e9924b]/20 border border-white/20 flex items-center justify-center text-white text-xs font-bold">
                      {article.author.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white/75 font-medium">{article.author.name}</span>
                  </div>
                  <span className="text-white/25">·</span>
                  <span>{formatDate(article.publishedAt)}</span>
                  {article.readTime && (
                    <>
                      <span className="text-white/25">·</span>
                      <span>{article.readTime} min read</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Content ──────────────────────────────── */}
          <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12">

            {/* Share */}
            <ShareButtons title={article.title} url={currentUrl} />

            {/* Excerpt / pull quote */}
            {article.excerpt && (
              <div className="mt-8 mb-2 px-6 py-5 border-l-2 border-[#e9924b] bg-white rounded-xl shadow-sm">
                <p className="text-[#1e3a6e]/70 text-base leading-relaxed italic font-medium">
                  {article.excerpt}
                </p>
              </div>
            )}

            {/* Video */}
            {videoEmbedUrl && (
              <div className="my-10 rounded-2xl overflow-hidden shadow-lg" style={{ position: 'relative', paddingBottom: '56.25%' }}>
                <iframe
                  src={videoEmbedUrl}
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={article.title}
                />
              </div>
            )}

            {/* Article body */}
            <article className="mt-10">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="font-heading font-extrabold text-[#1e3a6e] text-3xl mt-10 mb-5 leading-tight" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="font-heading font-bold text-[#1e3a6e] text-2xl mt-8 mb-4 leading-snug" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="font-heading font-semibold text-[#1e3a6e] text-xl mt-6 mb-3" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-[#1e3a6e]/70 text-base leading-[1.85] mb-5" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="mb-5 space-y-2 pl-1" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="mb-5 space-y-2 list-decimal list-inside text-[#1e3a6e]/70 text-base" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="flex gap-2.5 text-[#1e3a6e]/70 text-base leading-relaxed">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#e9924b] flex-shrink-0" />
                      <span {...props} />
                    </li>
                  ),
                  a: ({ node, ...props }) => (
                    <a className="text-[#e9924b] hover:text-[#d4762a] font-semibold underline underline-offset-2 transition-colors" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-2 border-[#e9924b] bg-white px-6 py-4 my-6 rounded-xl shadow-sm italic text-[#1e3a6e]/65 text-base" {...props} />
                  ),
                  code: ({ node, ...props }) => (
                    <code className="bg-[#1e3a6e]/6 px-2 py-0.5 rounded text-sm font-mono text-[#1e3a6e]" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold text-[#1e3a6e]" {...props} />
                  ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            </article>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-[#1e3a6e]/8">
                <p className="text-xs text-[#1e3a6e]/35 tracking-widest uppercase mb-4">Related topics</p>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-[#e9924b]/8 text-[#e9924b] text-xs font-semibold rounded-full border border-[#e9924b]/15"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author */}
            <div className="mt-10 pt-8 border-t border-[#1e3a6e]/8">
              <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-[#1e3a6e]/6">
                <div className="w-12 h-12 rounded-xl bg-[#1e3a6e] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-base">
                    {article.author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-heading font-bold text-[#1e3a6e] text-sm">{article.author.name}</p>
                  <p className="text-[#1e3a6e]/45 text-xs mt-0.5">Wellness Content Creator · Totoz Wellness</p>
                  <p className="text-[#1e3a6e]/35 text-xs mt-0.5">Published {formatDate(article.publishedAt)}</p>
                </div>
              </div>
            </div>

            {/* Share (bottom) */}
            <div className="mt-8">
              <ShareButtons title={article.title} url={currentUrl} />
            </div>

            {/* Back nav */}
            <div className="mt-12 pt-8 border-t border-[#1e3a6e]/8 flex justify-center">
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-7 py-3 bg-[#1e3a6e] text-white font-semibold rounded-full text-sm hover:bg-[#1e3a6e]/90 hover:-translate-y-px transition-all shadow-sm group"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to LearnWell
              </button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ArticleReader;