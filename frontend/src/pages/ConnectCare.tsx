/**
 * ============================================
 * CONNECTCARE — MENTAL HEALTH RESOURCE DIRECTORY
 * ============================================
 * @version     2.0.0
 * @updated     2025-04-23
 * @description Brand-aligned professional referral directory
 * ============================================
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { LayoutGrid, Map as MapIcon, Heart } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
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

type ResourceType =
  | 'NGO' | 'COUNSELOR' | 'HELPLINE' | 'SUPPORT_GROUP'
  | 'HOSPITAL' | 'CLINIC' | 'THERAPIST' | 'PSYCHIATRIST'
  | 'COMMUNITY_CENTER' | 'ONLINE_SERVICE';

interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  excerpt?: string;
  specializations: string[];
  contact: { phone?: string; email?: string; website?: string };
  location: { address?: string; city?: string; county?: string; region?: string; latitude?: number; longitude?: number };
  operatingHours?: string;
  languages: string[];
  tags: string[];
  isVerified: boolean;
  isFeatured: boolean;
}

export const typeConfig: Record<ResourceType, { label: string; color: string; bg: string }> = {
  NGO:              { label: 'NGO',              color: 'text-[#1e3a6e]',   bg: 'bg-[#1e3a6e]/8'  },
  COUNSELOR:        { label: 'Counselor',        color: 'text-[#659ec3]',   bg: 'bg-[#659ec3]/10' },
  HELPLINE:         { label: 'Helpline',         color: 'text-[#e9924b]',   bg: 'bg-[#e9924b]/10' },
  SUPPORT_GROUP:    { label: 'Support Group',    color: 'text-[#659ec3]',   bg: 'bg-[#659ec3]/10' },
  HOSPITAL:         { label: 'Hospital',         color: 'text-red-700',     bg: 'bg-red-50'        },
  CLINIC:           { label: 'Clinic',           color: 'text-[#1e3a6e]',   bg: 'bg-[#1e3a6e]/8'  },
  THERAPIST:        { label: 'Therapist',        color: 'text-[#659ec3]',   bg: 'bg-[#659ec3]/10' },
  PSYCHIATRIST:     { label: 'Psychiatrist',     color: 'text-[#e9924b]',   bg: 'bg-[#e9924b]/10' },
  COMMUNITY_CENTER: { label: 'Community Center', color: 'text-[#1e3a6e]',   bg: 'bg-[#1e3a6e]/8'  },
  ONLINE_SERVICE:   { label: 'Online Service',   color: 'text-[#659ec3]',   bg: 'bg-[#659ec3]/10' },
};

const ConnectCare: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<ResourceType | 'All'>('All');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    verifiedOnly: false, featuredOnly: false,
    languages: [], counties: [], religions: [],
    sessionTypes: [], ageGroups: [], areasOfSupport: [],
    maxDistance: undefined,
  });

  const observerTarget = useRef<HTMLDivElement>(null);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { location: userLocation, loading: locationLoading, getCurrentLocation } = useGeolocation();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['resources', activeFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ page: pageParam.toString(), limit: '12', publishedOnly: 'true' });
      if (activeFilter !== 'All') params.append('type', activeFilter);
      const response = await api.get(`/directory?${params.toString()}`);
      return response.data;
    },
    getNextPageParam: (lastPage, pages) => {
      const totalPages = lastPage.data.pagination?.totalPages || 1;
      return pages.length < totalPages ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const allResources = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) =>
      page.data.directories.map((dir: any): Resource => ({
        id: dir.id, name: dir.name, type: dir.type,
        description: dir.description, excerpt: dir.excerpt,
        specializations: dir.specializations || [],
        contact: { phone: dir.phone, email: dir.email, website: dir.website },
        location: { address: dir.address, city: dir.city, county: dir.county, region: dir.region, latitude: dir.latitude, longitude: dir.longitude },
        operatingHours: dir.operatingHours,
        languages: dir.languages || [],
        tags: dir.tags || [],
        isVerified: dir.isVerified || false,
        isFeatured: dir.isFeatured || false,
      }))
    );
  }, [data]);

  // Infinite scroll
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { threshold: 0.5 }
    );
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const filteredResources = useMemo(() => {
    let f = allResources;
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      f = f.filter(r =>
        r.name.toLowerCase().includes(t) || r.description.toLowerCase().includes(t) ||
        r.location.city?.toLowerCase().includes(t) || r.location.county?.toLowerCase().includes(t) ||
        r.specializations.some(s => s.toLowerCase().includes(t)) || r.tags.some(tag => tag.toLowerCase().includes(t))
      );
    }
    if (advancedFilters.verifiedOnly) f = f.filter(r => r.isVerified);
    if (advancedFilters.featuredOnly) f = f.filter(r => r.isFeatured);
    if (advancedFilters.languages.length) f = f.filter(r => advancedFilters.languages.some(l => r.languages.includes(l)));
    if (advancedFilters.counties?.length) f = f.filter(r => r.location.county && advancedFilters.counties.includes(r.location.county));
    if (advancedFilters.religions?.length) f = f.filter(r => advancedFilters.religions.some(rel => r.tags?.includes(rel) || r.specializations?.includes(rel)));
    if (advancedFilters.sessionTypes?.length) f = f.filter(r => advancedFilters.sessionTypes.some(t => r.tags?.includes(t) || r.description?.includes(t)));
    if (advancedFilters.ageGroups?.length) f = f.filter(r => advancedFilters.ageGroups.some(a => r.tags?.includes(a) || r.description?.includes(a)));
    if (advancedFilters.areasOfSupport?.length) f = f.filter(r => advancedFilters.areasOfSupport.some(a => r.specializations?.includes(a) || r.tags?.includes(a)));
    if (userLocation && advancedFilters.maxDistance) {
      f = f.filter(r => {
        if (!r.location.latitude || !r.location.longitude) return false;
        return calculateDistance(userLocation.lat, userLocation.lng, r.location.latitude, r.location.longitude) <= advancedFilters.maxDistance!;
      });
    }
    if (showFavoritesOnly) f = f.filter(r => favorites.includes(r.id));
    return f.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
      if (userLocation && a.location.latitude && b.location.latitude) {
        const dA = calculateDistance(userLocation.lat, userLocation.lng, a.location.latitude, a.location.longitude!);
        const dB = calculateDistance(userLocation.lat, userLocation.lng, b.location.latitude, b.location.longitude!);
        if (dA !== dB) return dA - dB;
      }
      return a.name.localeCompare(b.name);
    });
  }, [allResources, searchTerm, advancedFilters, userLocation, showFavoritesOnly, favorites]);

  React.useEffect(() => {
    if (searchTerm) {
      const t = setTimeout(() => trackSearch(searchTerm, filteredResources.length), 500);
      return () => clearTimeout(t);
    }
  }, [searchTerm, filteredResources.length]);

  const availableLanguages = useMemo(() => {
    const s = new Set<string>();
    allResources.forEach(r => r.languages.forEach(l => s.add(l)));
    return Array.from(s).sort();
  }, [allResources]);

  const availableCounties = useMemo(() => {
    const s = new Set<string>();
    allResources.forEach(r => { if (r.location.county) s.add(r.location.county); });
    return Array.from(s).sort();
  }, [allResources]);

  const handleToggleFavorite = useCallback((resourceId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    toggleFavorite(resourceId);
    trackFavoriteToggle(resourceId, isFavorite(resourceId) ? 'remove' : 'add');
  }, [isFavorite, toggleFavorite]);

  const calcDistance = (resource: Resource) => {
    if (!userLocation || !resource.location.latitude || !resource.location.longitude) return undefined;
    return calculateDistance(userLocation.lat, userLocation.lng, resource.location.latitude, resource.location.longitude);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfb]">
      <Navbar />

      <main className="pt-20">
        {/* ── Hero ─────────────────────────────────────── */}
        <section className="py-16 md:py-20 bg-[#1e3a6e] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a6e] via-[#1e3a6e] to-[#659ec3]/20 pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-[#e9924b]" />
              <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Professional Referrals</span>
            </div>
            <h1 className="font-heading font-extrabold text-white text-3xl md:text-4xl lg:text-5xl leading-tight mb-4 max-w-2xl">
              ConnectCare
            </h1>
            <p className="text-white/55 text-sm md:text-base leading-relaxed max-w-lg mb-10">
              Verified counselors, helplines, clinics, and support services — for children, caregivers, and families.
            </p>

            {/* Search */}
            <div className="relative max-w-lg">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, city, specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/35 text-sm focus:outline-none focus:border-[#e9924b]/60 focus:bg-white/15 transition-all"
                aria-label="Search resources"
              />
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-10">

          {/* ── Controls ─────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <LocationFilter
              onLocationChange={(loc) => { if (loc) getCurrentLocation(); }}
              loading={locationLoading}
              hasLocation={!!userLocation}
            />

            <AdvancedFilters
              filters={advancedFilters}
              onFilterChange={setAdvancedFilters}
              availableLanguages={availableLanguages}
              availableCounties={availableCounties}
              userLocation={userLocation}
            />

            {favorites.length > 0 && (
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  showFavoritesOnly
                    ? 'bg-[#e9924b] text-white shadow-sm'
                    : 'bg-white border border-[#1e3a6e]/15 text-[#1e3a6e]/60 hover:border-[#e9924b]/30'
                }`}
              >
                <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Saved ({favorites.length})
              </button>
            )}

            {/* View toggle */}
            <div className="ml-auto flex gap-1.5 bg-white border border-[#1e3a6e]/12 rounded-xl p-1">
              {(['grid', 'map'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    viewMode === mode
                      ? 'bg-[#1e3a6e] text-white shadow-sm'
                      : 'text-[#1e3a6e]/50 hover:text-[#1e3a6e]'
                  }`}
                  aria-label={`${mode} view`}
                >
                  {mode === 'grid' ? <LayoutGrid className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          {filteredResources.length > 0 && (
            <p className="text-[#1e3a6e]/40 text-xs mb-6">
              {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'}
              {showFavoritesOnly && ' from your saved list'}
              {userLocation && advancedFilters.maxDistance && ` within ${advancedFilters.maxDistance}km`}
            </p>
          )}

          {/* ── Content ───────────────────────────────── */}
          {viewMode === 'map' ? (
            <ResourceMap
              resources={filteredResources}
              onResourceClick={setSelectedResource}
              selectedResource={selectedResource}
              userLocation={userLocation}
            />
          ) : (
            <>
              {/* Loading skeletons */}
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-[#1e3a6e]/6 p-6 animate-pulse">
                      <div className="h-5 bg-[#1e3a6e]/8 rounded-full w-3/4 mb-3" />
                      <div className="h-3 bg-[#1e3a6e]/6 rounded-full w-full mb-2" />
                      <div className="h-3 bg-[#1e3a6e]/6 rounded-full w-5/6" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {isError && (
                <div className="text-center py-16">
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-sm mx-auto">
                    <p className="font-semibold text-red-700 text-sm mb-1">Failed to load resources</p>
                    <p className="text-red-500 text-xs">Please try again later</p>
                  </div>
                </div>
              )}

              {/* Grid */}
              {!isLoading && !isError && (
                <>
                  {filteredResources.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-12 h-12 rounded-2xl bg-[#1e3a6e]/6 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-[#1e3a6e]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="font-heading font-bold text-[#1e3a6e] text-base mb-1">No resources found</p>
                      <p className="text-[#1e3a6e]/45 text-sm">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredResources.map((resource) => (
                          <ResourceCard
                            key={resource.id}
                            resource={resource}
                            onClick={() => setSelectedResource(resource)}
                            isFavorite={isFavorite(resource.id)}
                            onToggleFavorite={(e) => handleToggleFavorite(resource.id, e)}
                            distance={calcDistance(resource)}
                            typeConfig={typeConfig}
                          />
                        ))}
                      </div>

                      {/* Infinite scroll trigger */}
                      <div ref={observerTarget} className="py-10 text-center">
                        {isFetchingNextPage && (
                          <div className="inline-flex items-center gap-2 text-[#1e3a6e]/40 text-sm">
                            <div className="w-4 h-4 border-2 border-[#e9924b]/40 border-t-[#e9924b] rounded-full animate-spin" />
                            Loading more...
                          </div>
                        )}
                        {!hasNextPage && filteredResources.length > 12 && (
                          <p className="text-[#1e3a6e]/25 text-xs">End of results</p>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Detail modal */}
      {selectedResource && (
        <ResourceDetailModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          typeConfig={typeConfig}
          isFavorite={isFavorite(selectedResource.id)}
          onToggleFavorite={() => handleToggleFavorite(selectedResource.id)}
        />
      )}
    </div>
  );
};

export default ConnectCare;