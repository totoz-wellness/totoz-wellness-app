/**
 * ============================================
 * PARENTCIRCLE SIDEBAR
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 06:47:13 UTC
 * ============================================
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Category } from '../../../types/parentcircle.types';

interface SidebarProps {
  categories: Category[];
  selectedCategory: number | null;
  onCategorySelect: (categoryId: number | null) => void;
  activeTab: 'question' | 'story';
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  activeTab,
  sortBy,
  onSortChange
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter categories based on active tab
  const filteredCategories = categories.filter(cat => 
    cat.type === 'BOTH' || 
    (activeTab === 'question' && cat.type === 'QUESTION') ||
    (activeTab === 'story' && cat.type === 'STORY')
  );

  const sortOptions = activeTab === 'question' 
    ? [
        { value: 'recent', label: 'Most Recent' },
        { value: 'popular', label: 'Most Popular' },
        { value: 'unanswered', label: 'Unanswered' },
        { value: 'answered', label: 'Answered' }
      ]
    : [
        { value: 'recent', label: 'Most Recent' },
        { value: 'popular', label: 'Most Popular' },
        { value: 'views', label: 'Most Viewed' }
      ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:border-teal transition-all shadow-sm"
        >
          <AdjustmentsHorizontalIcon className="w-5 h-5" />
          Filter & Sort
        </button>
      </div>

      {/* Dimmed Overlay */}
      {showMobileFilters && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity"
          onClick={() => setShowMobileFilters(false)}
        />
      )}

      {/* Sidebar Content rendered as bottom sheet on mobile, sidebar on desktop */}
      <div className={`
        ${showMobileFilters ? 'fixed inset-x-0 bottom-0 z-50 rounded-t-3xl max-h-[85vh] overflow-y-auto pb-8 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] bg-white' : 'hidden lg:block'}
        lg:relative lg:w-full lg:max-h-none lg:overflow-visible lg:bg-gradient-to-br lg:from-teal/5 lg:to-blue-500/5 lg:rounded-2xl lg:shadow-sm lg:sticky lg:top-4 p-6
      `}>
        {/* Mobile Header with Close Button */}
        <div className="lg:hidden flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-gray-900">Filters & Sorting</h3>
          <button onClick={() => setShowMobileFilters(false)} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

      {/* Sort By */}
      <div className="mb-6">
        <h3 className="font-heading font-bold text-dark-text mb-3 uppercase text-sm tracking-wider flex items-center gap-2">
          <span>🎯</span>
          Sort By
        </h3>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none transition-all text-sm font-semibold bg-white"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-heading font-bold text-dark-text mb-3 uppercase text-sm tracking-wider flex items-center gap-2">
          <span>📂</span>
          Categories
        </h3>
        <div className="flex flex-col space-y-1">
          {/* All Topics */}
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCategorySelect(null)}
            className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
              selectedCategory === null
                ? 'bg-white text-teal shadow-sm font-bold'
                : 'text-gray-600 hover:text-teal hover:bg-white/50'
            }`}
          >
            All Topics
          </motion.button>

          {/* Category List */}
          {filteredCategories.map(cat => (
            <motion.button
              key={cat.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCategorySelect(cat.id)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-white text-teal shadow-sm font-bold'
                  : 'text-gray-600 hover:text-teal hover:bg-white/50'
              }`}
            >
              {cat.icon && <span>{cat.icon}</span>}
              <span>{cat.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
          <span>📊</span>
          Quick Stats
        </h4>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Active Categories</span>
            <span className="font-bold text-teal">{filteredCategories.length}</span>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-xs text-blue-700">
          <span className="font-bold">💡 Tip:</span> Use categories to find relevant {activeTab === 'question' ? 'questions' : 'stories'} faster!
        </p>
      </div>
      </div>
    </>
  );
};

export default Sidebar;