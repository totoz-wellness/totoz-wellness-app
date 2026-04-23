/**
 * ============================================
 * LEARNWELL — ARTICLE LIBRARY
 * ============================================
 * @version     3.0.0
 * @updated     2025-04-23
 * @description Brand-aligned article library
 * ============================================
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ArticleCard from '../components/LearnWell/ArticleCard';
import ArticleCardSkeleton from '../components/LearnWell/ArticleCardSkeleton';
import SearchBar from '../components/LearnWell/SearchBar';
import { useArticles } from '../hooks/useArticles';

const CATEGORIES = [
  'All',
  'Anxiety',
  'Communication',
  'Self-Care',
  'Parenting',
  'Mental Health',
  'Child Development',
];

const LearnWell: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { articles, totalPages, isLoading, error, prefetchNextPage } = useArticles({
    page,
    category: selectedCategory,
    limit: 9,
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === 'All' ? '' : category);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => setSearchQuery(query);

  const handlePaginationHover = () => {
    if (page < totalPages) prefetchNextPage();
  };

  const filteredArticles = searchQuery
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles;

  const activeCategory = selectedCategory || 'All';

  return (
    <div className="min-h-screen bg-[#fbfbfb]">
      <Navbar />

      <main className="pt-20">
        {/* ── Hero ─────────────────────────────────────── */}
        <section className="py-16 md:py-20 bg-[#1e3a6e] relative overflow-hidden">
          {/* Subtle background texture */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a6e] via-[#1e3a6e] to-[#659ec3]/20 pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8 bg-[#e9924b]" />
                <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">
                  Resource Library
                </span>
              </div>
              <h1 className="font-heading font-extrabold text-white text-3xl md:text-4xl lg:text-5xl leading-tight mb-4 max-w-xl">
                LearnWell
              </h1>
              <p className="text-white/55 text-sm md:text-base leading-relaxed max-w-lg mb-10">
                Expert guides, practical tips, and insights — curated for caregivers and educators navigating children's mental health.
              </p>

              {/* Search */}
              <SearchBar onSearch={handleSearch} />
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-10">

          {/* ── Mobile filter toggle ──────────────────── */}
          <div className="mb-6 lg:hidden">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#1e3a6e]/15 rounded-xl text-sm font-semibold text-[#1e3a6e]/70 hover:border-[#e9924b]/40 transition-all shadow-sm"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              Filter by category
            </button>
          </div>

          {/* Mobile overlay */}
          {showMobileFilters && (
            <div
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
          )}

          {/* ── Category filter ───────────────────────── */}
          <div
            className={`
              ${showMobileFilters
                ? 'fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl pt-6 pb-10 px-6 shadow-2xl max-h-[80vh] overflow-y-auto'
                : 'hidden lg:block mb-10'}
            `}
          >
            {/* Mobile header */}
            <div className="lg:hidden flex justify-between items-center mb-5">
              <h3 className="font-heading font-bold text-[#1e3a6e] text-base">Categories</h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <XMarkIcon className="w-5 h-5 text-[#1e3a6e]/50" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {CATEGORIES.map((cat) => {
                const isActive = cat === activeCategory;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      handleCategoryChange(cat);
                      setShowMobileFilters(false);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#e9924b] text-white shadow-sm shadow-[#e9924b]/20'
                        : 'bg-white border border-[#1e3a6e]/12 text-[#1e3a6e]/60 hover:border-[#e9924b]/30 hover:text-[#1e3a6e]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Error ────────────────────────────────── */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto text-center mb-10">
              <p className="text-sm font-semibold text-red-700 mb-1">Failed to load articles</p>
              <p className="text-xs text-red-500">{(error as any).message}</p>
            </div>
          )}

          {/* ── Articles ─────────────────────────────── */}
          <section aria-label="Articles">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => <ArticleCardSkeleton key={i} />)}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-12 h-12 rounded-2xl bg-[#1e3a6e]/6 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#1e3a6e]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-heading font-bold text-[#1e3a6e] text-base mb-1">No articles found</p>
                <p className="text-[#1e3a6e]/45 text-sm">
                  {searchQuery ? 'Try adjusting your search terms' : 'Check back soon for new content'}
                </p>
              </div>
            ) : (
              <>
                {/* Count */}
                <p className="text-[#1e3a6e]/40 text-xs mb-6">
                  {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
                  {selectedCategory && ` in ${selectedCategory}`}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article, index) => (
                    <ArticleCard key={article.id} article={article} index={index} />
                  ))}
                </div>
              </>
            )}
          </section>

          {/* ── Pagination ───────────────────────────── */}
          {totalPages > 1 && !isLoading && (
            <nav
              className="mt-14 flex justify-center items-center gap-2"
              aria-label="Pagination"
              onMouseEnter={handlePaginationHover}
            >
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl bg-white border border-[#1e3a6e]/12 text-sm font-semibold text-[#1e3a6e]/60 hover:border-[#e9924b]/30 hover:text-[#1e3a6e] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Previous
              </button>

              <div className="flex items-center gap-1.5">
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                      page === idx + 1
                        ? 'bg-[#e9924b] text-white shadow-sm'
                        : 'bg-white border border-[#1e3a6e]/12 text-[#1e3a6e]/50 hover:border-[#e9924b]/30'
                    }`}
                    aria-label={`Page ${idx + 1}`}
                    aria-current={page === idx + 1 ? 'page' : undefined}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl bg-white border border-[#1e3a6e]/12 text-sm font-semibold text-[#1e3a6e]/60 hover:border-[#e9924b]/30 hover:text-[#1e3a6e] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LearnWell;