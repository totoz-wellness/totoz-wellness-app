/**
 * ============================================
 * LEARNWELL - MODERN ARTICLE LIBRARY
 * ============================================
 * @version     2. 0.0
 * @author      ArogoClin
 * @updated     2025-11-27
 * @description Production-grade article browsing with React Query
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
  'Child Development'
];

const LearnWell: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { articles, totalPages, isLoading, error, prefetchNextPage } = useArticles({
    page,
    category: selectedCategory,
    limit: 9
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic here
  };

  // Prefetch next page on hover
  const handlePaginationHover = () => {
    if (page < totalPages) {
      prefetchNextPage();
    }
  };

  // Filter articles by search
  const filteredArticles = searchQuery
    ? articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery. toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery. toLowerCase())
      )
    : articles;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Navbar />
      
      <main className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
            aria-labelledby="learnwell-heading"
          >
            <h1 id="learnwell-heading" className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              LearnWell Resources
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Explore our library of expert guides and practical tips for mental wellness. 
            </p>

            {/* Search Bar */}
            <SearchBar onSearch={handleSearch} />
          </motion.section>

          {/* Mobile Filter Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 lg:hidden"
          >
            <button
              onClick={() => setShowMobileFilters(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:border-teal transition-all shadow-sm"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              Categories
            </button>
          </motion.div>

          {/* Dimmed Overlay */}
          {showMobileFilters && (
            <div 
              className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity"
              onClick={() => setShowMobileFilters(false)}
            />
          )}

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`
              ${showMobileFilters ? 'fixed inset-x-0 bottom-0 z-50 rounded-t-3xl max-h-[85vh] overflow-y-auto pb-8 pt-6 px-6 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] bg-white mb-0' : 'hidden lg:block mb-12'}
            `}
          >
            {/* Mobile Header */}
            <div className="lg:hidden flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-900">Categories</h3>
              <button onClick={() => setShowMobileFilters(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-wrap lg:justify-center gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    handleCategoryChange(cat === 'All' ? '' : cat);
                    setShowMobileFilters(false);
                  }}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all transform hover:scale-105 ${
                    (cat === 'All' && !selectedCategory) || cat === selectedCategory
                      ? 'bg-teal text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 lg:border-none shadow-sm lg:shadow-md'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-12"
            >
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h. 01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-. 833-1.864-.833-2.634 0L3.732 16.5c-.77. 833. 192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-bold text-red-800 mb-2">Failed to load articles</h3>
                <p className="text-red-600 text-sm">{error.message}</p>
              </div>
            </motion.div>
          )}

          {/* Articles Grid */}
          <section aria-label="Articles">
            {isLoading ?  (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(9)].map((_, idx) => (
                  <ArticleCardSkeleton key={idx} />
                ))}
              </div>
            ) : filteredArticles.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600">
                  {searchQuery ? 'Try adjusting your search' : 'Check back soon for new content! '}
                </p>
              </motion.div>
            ) : (
              <>
                {/* Article Count */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mb-8"
                >
                  <p className="text-gray-600 font-medium">
                    {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
                    {selectedCategory && ` in ${selectedCategory}`}
                  </p>
                </motion. div>

                {/* Grid with Masonry Effect (CSS Columns) */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                  {filteredArticles.map((article, index) => (
                    <div key={article.id} className="break-inside-avoid">
                      <ArticleCard article={article} index={index} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Pagination */}
          {totalPages > 1 && ! isLoading && (
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16 flex justify-center items-center gap-3"
              aria-label="Pagination"
              onMouseEnter={handlePaginationHover}
            >
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-5 py-2. 5 rounded-lg bg-white text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all hover:shadow-lg"
                aria-label="Previous page"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                      page === idx + 1
                        ? 'bg-teal text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
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
                className="px-5 py-2.5 rounded-lg bg-white text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all hover:shadow-lg"
                aria-label="Next page"
              >
                Next
              </button>
            </motion.nav>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LearnWell;