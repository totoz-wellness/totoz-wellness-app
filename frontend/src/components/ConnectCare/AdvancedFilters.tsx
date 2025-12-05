import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

export interface FilterState {
  verifiedOnly: boolean;
  featuredOnly: boolean;
  languages: string[];
  counties: string[];
  maxDistance?: number;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableLanguages: string[];
  availableCounties: string[];
  userLocation: { lat: number; lng: number } | null;
}

const AdvancedFilters: React. FC<AdvancedFiltersProps> = ({
  filters,
  onFilterChange,
  availableLanguages,
  availableCounties,
  userLocation
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'languages' | 'counties', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const clearAllFilters = () => {
    onFilterChange({
      verifiedOnly: false,
      featuredOnly: false,
      languages: [],
      counties: [],
      maxDistance: undefined
    });
  };

  const activeFiltersCount = 
    (filters.verifiedOnly ? 1 : 0) +
    (filters.featuredOnly ? 1 : 0) +
    filters.languages.length +
    filters.counties.length +
    (filters.maxDistance ?  1 : 0);

  return (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-4 py-2. 5 bg-white border-2 border-gray-300 rounded-xl hover:border-teal transition-all font-medium"
      >
        <Filter className="w-4 h-4" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="px-2 py-0.5 bg-teal text-white text-xs font-bold rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {showFilters && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute top-full mt-2 right-0 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50 max-h-[600px] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-900">Filter Resources</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Quick Toggles */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-700">Quick Filters</h4>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.verifiedOnly}
                    onChange={(e) => updateFilter('verifiedOnly', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-teal focus:ring-teal"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    ✓ Verified only
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.featuredOnly}
                    onChange={(e) => updateFilter('featuredOnly', e.target. checked)}
                    className="w-5 h-5 rounded border-gray-300 text-teal focus:ring-teal"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    ⭐ Featured only
                  </span>
                </label>
              </div>

              {/* Distance Filter */}
              {userLocation && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">Distance</h4>
                  <select
                    value={filters.maxDistance || ''}
                    onChange={(e) => updateFilter('maxDistance', e.target.value ?  Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal"
                  >
                    <option value="">Any distance</option>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="20">Within 20 km</option>
                    <option value="50">Within 50 km</option>
                  </select>
                </div>
              )}

              {/* Languages */}
              {availableLanguages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">Languages</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {availableLanguages.map(lang => (
                      <label key={lang} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.languages.includes(lang)}
                          onChange={() => toggleArrayFilter('languages', lang)}
                          className="w-4 h-4 rounded border-gray-300 text-teal focus:ring-teal"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          {lang}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Counties */}
              {availableCounties.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">Counties</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {availableCounties.map(county => (
                      <label key={county} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.counties.includes(county)}
                          onChange={() => toggleArrayFilter('counties', county)}
                          className="w-4 h-4 rounded border-gray-300 text-teal focus:ring-teal"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          {county}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Clear all
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 px-4 py-2 text-sm font-medium bg-teal text-white rounded-lg hover:bg-teal/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdvancedFilters;