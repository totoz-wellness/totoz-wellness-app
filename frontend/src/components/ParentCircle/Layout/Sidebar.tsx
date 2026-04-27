/**
 * ============================================
 * PARENTCIRCLE SIDEBAR
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
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
  categories, selectedCategory, onCategorySelect,
  activeTab, sortBy, onSortChange,
}) => {
  const [showMobile, setShowMobile] = useState(false);

  const filteredCategories = categories.filter(
    cat => cat.type === 'BOTH' ||
      (activeTab === 'question' && cat.type === 'QUESTION') ||
      (activeTab === 'story' && cat.type === 'STORY')
  );

  const sortOptions = activeTab === 'question'
    ? [
        { value: 'recent',     label: 'Most recent' },
        { value: 'popular',    label: 'Most popular' },
        { value: 'unanswered', label: 'Unanswered' },
        { value: 'answered',   label: 'Answered' },
      ]
    : [
        { value: 'recent',  label: 'Most recent' },
        { value: 'popular', label: 'Most popular' },
        { value: 'views',   label: 'Most viewed' },
      ];

  const content = (
    <div className="space-y-7">
      {/* Sort */}
      <div>
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#1e3a6e]/35 mb-3">Sort</p>
        <div className="space-y-1">
          {sortOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                sortBy === opt.value
                  ? 'bg-[#e9924b]/10 text-[#e9924b] font-semibold'
                  : 'text-[#1e3a6e]/55 hover:text-[#1e3a6e] hover:bg-[#1e3a6e]/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#1e3a6e]/8" />

      {/* Categories */}
      <div>
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#1e3a6e]/35 mb-3">Topics</p>
        <div className="space-y-1">
          <button
            onClick={() => onCategorySelect(null)}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
              selectedCategory === null
                ? 'bg-[#1e3a6e]/8 text-[#1e3a6e] font-semibold'
                : 'text-[#1e3a6e]/55 hover:text-[#1e3a6e] hover:bg-[#1e3a6e]/5'
            }`}
          >
            All topics
          </button>
          {filteredCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-[#1e3a6e]/8 text-[#1e3a6e] font-semibold'
                  : 'text-[#1e3a6e]/55 hover:text-[#1e3a6e] hover:bg-[#1e3a6e]/5'
              }`}
            >
              {cat.icon && <span className="text-base leading-none">{cat.icon}</span>}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Safety note */}
      <div className="rounded-xl bg-[#659ec3]/8 border border-[#659ec3]/15 px-4 py-3">
        <p className="text-[#659ec3] text-xs font-semibold mb-0.5">Moderated space</p>
        <p className="text-[#1e3a6e]/50 text-xs leading-relaxed">
          All posts are reviewed. This is a safe, respectful community.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobile(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#1e3a6e]/15 rounded-xl text-sm font-semibold text-[#1e3a6e]/60 hover:border-[#e9924b]/30 hover:text-[#1e3a6e] transition-all shadow-sm"
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
          Filter & sort
        </button>
      </div>

      {/* Mobile overlay */}
      {showMobile && (
        <div
          className="fixed inset-0 z-40 bg-[#1e3a6e]/30 backdrop-blur-sm lg:hidden"
          onClick={() => setShowMobile(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm p-6">
        {content}
      </div>

      {/* Mobile bottom sheet */}
      {showMobile && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto lg:hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e3a6e]/8">
            <p className="font-heading font-bold text-[#1e3a6e] text-base">Filter & sort</p>
            <button onClick={() => setShowMobile(false)} className="text-[#1e3a6e]/40 hover:text-[#1e3a6e] transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="px-6 py-5 pb-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;