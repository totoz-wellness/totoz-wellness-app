/**
 * ============================================
 * SEARCH BAR — LEARNWELL
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 */

import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  const clear = () => setSearchTerm('');

  return (
    <div className="relative max-w-lg">
      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search articles..."
        className="w-full pl-11 pr-10 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/35 text-sm focus:outline-none focus:border-[#e9924b]/60 focus:bg-white/15 transition-all"
      />
      {searchTerm && (
        <button
          onClick={clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
          aria-label="Clear search"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;