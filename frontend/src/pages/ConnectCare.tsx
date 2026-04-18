import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { LayoutGrid, Map as MapIcon, Heart } from 'lucide-react';
import api from '../config/api';
import { useFavorites } from '../hooks/useFavorites';
import { useGeolocation } from '../hooks/useGeolocation';
import { calculateDistance } from '../utils/distance';
import { trackSearch, trackFilterChange, trackFavoriteToggle } from '../utils/analytics';
import AdvancedFilters, { FilterState } from '../components/ConnectCare/AdvancedFilters';
import LocationFilter from '../components/ConnectCare/LocationFilter';
import ResourceCard from '../components/ConnectCare/ResourceCard';
import ResourceDetailModal from '../components/ConnectCare/ResourceDetailModal';
import ResourceMap from '../components/ConnectCare/ResourceMap';

type ResourceType = 'NGO' | 'COUNSELOR' | 'HELPLINE' | 'SUPPORT_GROUP' | 'HOSPITAL' | 'CLINIC' | 'THERAPIST' | 'PSYCHIATRIST' | 'COMMUNITY_CENTER' | 'ONLINE_SERVICE';

interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  excerpt?: string;
  specializations: string[];
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  location: {
    address?: string;
    city?: string;
    county?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
  };
  operatingHours?: string;
  languages: string[];
  tags: string[];
  isVerified: boolean;
  isFeatured: boolean;
}

const typeConfig: Record<ResourceType, { label: string; color: string; bg: string }> = {
  NGO: { label: 'NGO', color: 'text-purple-700', bg: 'bg-purple-50' },
  COUNSELOR: { label: 'Counselor', color: 'text-teal-700', bg: 'bg-teal-50' },
  HELPLINE: { label: 'Helpline', color: 'text-blue-700', bg: 'bg-blue-50' },
  SUPPORT_GROUP: { label: 'Support Group', color: 'text-pink-700', bg: 'bg-pink-50' },
  HOSPITAL: { label: 'Hospital', color: 'text-red-700', bg: 'bg-red-50' },
  CLINIC: { label: 'Clinic', color: 'text-green-700', bg: 'bg-green-50' },
  THERAPIST: { label: 'Therapist', color: 'text-indigo-700', bg: 'bg-indigo-50' },
  PSYCHIATRIST: { label: 'Psychiatrist', color: 'text-orange-700', bg: 'bg-orange-50' },
  COMMUNITY_CENTER: { label: 'Community Center', color: 'text-amber-700', bg: 'bg-amber-50' },
  ONLINE_SERVICE: { label: 'Online Service', color: 'text-cyan-700', bg: 'bg-cyan-50' },
};

const ConnectCare: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<ResourceType | 'All'>('All');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    verifiedOnly: false,
    featuredOnly: false,
    languages: [],
    counties: [],
    religions: [],
    sessionTypes: [],
    ageGroups: [],
    areasOfSupport: [],
    maxDistance: undefined
  });

  const observerTarget = useRef<HTMLDivElement>(null);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { location: userLocation, loading: locationLoading, getCurrentLocation } = useGeolocation();

  // Infinite Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ['resources', activeFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        limit: '12',
        publishedOnly: 'true'
      });

      if (activeFilter !== 'All') {
        params.append('type', activeFilter);
      }

      const response = await api.get(`/directory?${params. toString()}`);
      return response.data;
    },
    getNextPageParam: (lastPage, pages) => {
      const currentPage = pages.length;
      const totalPages = lastPage. data.pagination?. totalPages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1
  });

  // Flatten all pages into single array
  const allResources = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap(page => 
      page.data.directories.map((dir: any): Resource => ({
        id: dir.id,
        name: dir.name,
        type: dir.type,
        description: dir.description,
        excerpt: dir.excerpt,
        specializations: dir.specializations || [],
        contact: {
          phone: dir.phone,
          email: dir.email,
          website: dir.website,
        },
        location: {
          address: dir.address,
          city: dir.city,
          county: dir.county,
          region: dir.region,
          latitude: dir.latitude,
          longitude: dir.longitude,
        },
        operatingHours: dir.operatingHours,
        languages: dir.languages || [],
        tags: dir.tags || [],
        isVerified: dir.isVerified || false,
        isFeatured: dir.isFeatured || false,
      }))
    );
  }, [data]);

  // Infinite scroll observer
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]. isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Filter resources
  const filteredResources = useMemo(() => {
    let filtered = allResources;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase(). includes(term) ||
        r.description.toLowerCase().includes(term) ||
        r.location.city?. toLowerCase().includes(term) ||
        r.location.county?.toLowerCase().includes(term) ||
        r.specializations.some(s => s.toLowerCase().includes(term)) ||
        r.tags.some(t => t.toLowerCase().includes(term))
      );
    }

    // Advanced filters
    if (advancedFilters.verifiedOnly) {
      filtered = filtered.filter(r => r.isVerified);
    }

    if (advancedFilters.featuredOnly) {
      filtered = filtered.filter(r => r. isFeatured);
    }

    if (advancedFilters.languages.length > 0) {
      filtered = filtered.filter(r =>
        advancedFilters.languages.some(lang => r.languages.includes(lang))
      );
    }

    if (advancedFilters.counties && advancedFilters.counties.length > 0) {
      filtered = filtered.filter(r =>
        r.location.county && advancedFilters.counties.includes(r.location.county)
      );
    }

    if (advancedFilters.religions && advancedFilters.religions.length > 0) {
      filtered = filtered.filter(r =>
        advancedFilters.religions.some(rel => r.tags?.includes(rel) || r.specializations?.includes(rel))
      );
    }

    if (advancedFilters.sessionTypes && advancedFilters.sessionTypes.length > 0) {
      filtered = filtered.filter(r =>
        advancedFilters.sessionTypes.some(type => r.tags?.includes(type) || r.operatingHours?.includes(type) || r.description?.includes(type))
      );
    }

    if (advancedFilters.ageGroups && advancedFilters.ageGroups.length > 0) {
      filtered = filtered.filter(r =>
        advancedFilters.ageGroups.some(age => r.tags?.includes(age) || r.description?.includes(age))
      );
    }

    if (advancedFilters.areasOfSupport && advancedFilters.areasOfSupport.length > 0) {
      filtered = filtered.filter(r =>
        advancedFilters.areasOfSupport.some(area => r.specializations?.includes(area) || r.tags?.includes(area))
      );
    }

    // Distance filter
    if (userLocation && advancedFilters.maxDistance) {
      filtered = filtered.filter(r => {
        if (!r.location.latitude || !r.location.longitude) return false;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          r.location.latitude,
          r.location.longitude
        );
        return distance <= advancedFilters.maxDistance! ;
      });
    }

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(r => favorites.includes(r.id));
    }

    // Sort: Featured > Verified > Distance > Name
    return filtered.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;

      if (userLocation && a.location.latitude && b.location.latitude) {
        const distA = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          a.location.latitude,
          a.location.longitude
        );
        const distB = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          b. location.latitude,
          b. location.longitude
        );
        if (distA !== distB) return distA - distB;
      }

      return a.name.localeCompare(b.name);
    });
  }, [allResources, searchTerm, advancedFilters, userLocation, showFavoritesOnly, favorites]);

  // Track search
  React.useEffect(() => {
    if (searchTerm) {
      const timer = setTimeout(() => {
        trackSearch(searchTerm, filteredResources. length);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, filteredResources.length]);

  // Extract unique values for filters
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    allResources.forEach(r => r.languages.forEach(l => langs.add(l)));
    return Array.from(langs). sort();
  }, [allResources]);

  const availableCounties = useMemo(() => {
    const counties = new Set<string>();
    allResources. forEach(r => {
      if (r.location. county) counties.add(r.location.county);
    });
    return Array.from(counties).sort();
  }, [allResources]);

  const availableTypes = useMemo(() => {
    return ['All', ...new Set(allResources.map(r => r.type))] as const;
  }, [allResources]);

  const handleTypeFilterChange = (type: ResourceType | 'All') => {
    setActiveFilter(type);
    trackFilterChange('type', type);
  };

  const handleToggleFavorite = useCallback((resourceId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const wasFavorite = isFavorite(resourceId);
    toggleFavorite(resourceId);
    trackFavoriteToggle(resourceId, wasFavorite ?  'remove' : 'add');
  }, [isFavorite, toggleFavorite]);

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
  };

  const calculateResourceDistance = (resource: Resource): number | undefined => {
    if (!userLocation || !resource.location.latitude || !resource.location.longitude) {
      return undefined;
    }
    return calculateDistance(
      userLocation. lat,
      userLocation.lng,
      resource.location.latitude,
      resource.location.longitude
    );
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mt-8 mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Find Mental Health Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with verified counselors, helplines, clinics, and support services dedicated to children and families. 
          </p>
        </div>

        {/* Search & Controls */}
        <div className="max-w-4xl mx-auto mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, city, specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target. value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal/20 focus:border-teal transition-all shadow-sm"
              aria-label="Search resources"
            />
            <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              {/* <LocationFilter
                onLocationChange={(loc) => {
                  if (loc) getCurrentLocation();
                }}
                loading={locationLoading}
                hasLocation={!! userLocation}
              /> */}

              <AdvancedFilters
                filters={advancedFilters}
                onFilterChange={setAdvancedFilters}
                availableLanguages={availableLanguages}
                availableCounties={availableCounties}
                userLocation={userLocation}
              />

              {favorites.length > 0 && (
                <button
                  onClick={() => setShowFavoritesOnly(! showFavoritesOnly)}
                  className={`flex items-center gap-2 px-4 py-2. 5 rounded-xl font-medium transition-all ${
                    showFavoritesOnly
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-red-300'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                  Favorites ({favorites.length})
                </button>
              )}
            </div>

            {/* View Toggle */}
            {/* <div className="flex gap-2 bg-white rounded-xl p-1 border-2 border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-teal text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'map'
                    ? 'bg-teal text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Map view"
              >
                <MapIcon className="w-5 h-5" />
              </button>
            </div> */}
          </div>

          {/* Type Filters */}
          {/* <div className="flex flex-wrap justify-center gap-3">
            {availableTypes. map((type) => (
              <button
                key={type}
                onClick={() => handleTypeFilterChange(type)}
                className={`px-5 py-2. 5 rounded-full font-semibold transition-all transform hover:scale-105 ${
                  activeFilter === type
                    ? 'bg-teal text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                {type === 'All' ? 'All Services' : typeConfig[type as ResourceType]?.label || type}
              </button>
            ))}
          </div> */}
        </div>

        {/* Results Count */}
        {filteredResources.length > 0 && (
          <div className="text-center mb-6">
            <p className="text-gray-600 font-medium">
              Showing {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'}
              {showFavoritesOnly && ' from your favorites'}
              {userLocation && advancedFilters.maxDistance && ` within ${advancedFilters.maxDistance}km`}
            </p>
          </div>
        )}

        {/* Content */}
        {viewMode === 'map' ?  (
          <ResourceMap
            resources={filteredResources}
            onResourceClick={handleResourceClick}
            selectedResource={selectedResource}
            userLocation={userLocation}
          />
        ) : (
          <>
            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="text-center py-16">
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                  <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-. 833-1.864-.833-2.634 0L3.732 16. 5c-.77.833. 192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-800 font-semibold text-lg">Failed to load resources</p>
                  <p className="text-red-600 mt-2">Please try again later</p>
                </div>
              </div>
            )}

            {/* Resource Grid */}
            {! isLoading && ! isError && (
              <>
                {filteredResources. length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9. 172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium mb-2">No resources found</p>
                    <p className="text-gray-400">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredResources.map((resource) => (
                        <ResourceCard
                          key={resource.id}
                          resource={resource}
                          onClick={() => handleResourceClick(resource)}
                          isFavorite={isFavorite(resource.id)}
                          onToggleFavorite={(e) => handleToggleFavorite(resource.id, e)}
                          distance={calculateResourceDistance(resource)}
                          typeConfig={typeConfig}
                        />
                      ))}
                    </div>

                    {/* Infinite Scroll Trigger */}
                    <div ref={observerTarget} className="py-8">
                      {isFetchingNextPage && (
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal" />
                          <p className="mt-4 text-gray-600">Loading more resources...</p>
                        </div>
                      )}
                      {! hasNextPage && filteredResources.length > 12 && (
                        <p className="text-center text-gray-500 font-medium">
                          You've reached the end of the list
                        </p>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Resource Detail Modal */}
      {selectedResource && (
        <ResourceDetailModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          typeConfig={typeConfig}
          isFavorite={isFavorite(selectedResource.id)}
          onToggleFavorite={() => handleToggleFavorite(selectedResource.id)}
        />
      )}
    </section>
  );
};

export default ConnectCare;