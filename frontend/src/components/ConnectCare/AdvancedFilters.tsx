import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

export interface FilterState {
  verifiedOnly: boolean;
  featuredOnly: boolean;
  languages: string[];
  counties: string[];
  religions: string[];
  sessionTypes: string[];
  ageGroups: string[];
  areasOfSupport: string[];
  maxDistance?: number;
}

const AVAILABLE_RELIGIONS    = ['Christian', 'Muslim', 'Hindu', 'Buddhist', 'Jewish', 'Non-religious', 'Other'];
const AVAILABLE_SESSION_TYPES = ['Online', 'In-Person', 'Hybrid'];
const AVAILABLE_AGE_GROUPS   = ['Toddlers (1-3)', 'Children (4-11)', 'Adolescents (12-18)', 'Young Adults (19-25)', 'Adults', 'Seniors'];
const AVAILABLE_AREAS        = ['Anxiety', 'Depression', 'Trauma', 'Grief', 'ADHD', 'Autism Spectrum', 'Behavioral Issues', 'Family Conflict', 'Stress Management', 'Other'];

interface Props {
  filters: FilterState;
  onFilterChange: (f: FilterState) => void;
  availableLanguages: string[];
  availableCounties: string[];
  userLocation: { lat: number; lng: number } | null;
}

const AdvancedFilters: React.FC<Props> = ({ filters, onFilterChange, availableLanguages, availableCounties, userLocation }) => {
  const [open, setOpen] = useState(false);

  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onFilterChange({ ...filters, [key]: value });

  const toggle = (key: 'languages' | 'counties' | 'religions' | 'sessionTypes' | 'ageGroups' | 'areasOfSupport', val: string) => {
    const cur = filters[key] || [];
    update(key, (cur.includes(val as never) ? cur.filter((v: string) => v !== val) : [...cur, val]) as any);
  };

  const clear = () => onFilterChange({ verifiedOnly: false, featuredOnly: false, languages: [], counties: [], religions: [], sessionTypes: [], ageGroups: [], areasOfSupport: [], maxDistance: undefined });

  const count =
    (filters.verifiedOnly ? 1 : 0) + (filters.featuredOnly ? 1 : 0) +
    (filters.languages?.length || 0) + (filters.counties?.length || 0) +
    (filters.religions?.length || 0) + (filters.sessionTypes?.length || 0) +
    (filters.ageGroups?.length || 0) + (filters.areasOfSupport?.length || 0) +
    (filters.maxDistance ? 1 : 0);

  const checkClass = 'w-4 h-4 rounded border-[#1e3a6e]/20 text-[#e9924b] focus:ring-[#e9924b]/30';
  const sectionHeadClass = 'text-[10px] font-semibold tracking-[0.15em] uppercase text-[#1e3a6e]/40 mb-3';
  const labelClass = 'flex items-center gap-2.5 cursor-pointer group text-sm text-[#1e3a6e]/65 hover:text-[#1e3a6e] transition-colors';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          count > 0
            ? 'bg-[#e9924b] text-white shadow-sm'
            : 'bg-white border border-[#1e3a6e]/15 text-[#1e3a6e]/60 hover:border-[#e9924b]/30 hover:text-[#1e3a6e]'
        }`}
      >
        <Filter className="w-4 h-4" />
        Filters
        {count > 0 && (
          <span className="w-5 h-5 flex items-center justify-center bg-white/25 text-white text-[10px] font-bold rounded-full">
            {count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-[#1e3a6e]/30 md:bg-transparent" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 md:absolute md:top-full md:bottom-auto md:mt-2 md:right-0 w-full md:w-88 bg-white rounded-t-2xl md:rounded-2xl shadow-2xl border border-[#1e3a6e]/8 p-6 z-50 max-h-[85vh] md:max-h-[600px] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading font-bold text-[#1e3a6e] text-base">Filter Resources</h3>
              <button onClick={() => setOpen(false)} className="text-[#1e3a6e]/40 hover:text-[#1e3a6e] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Quick toggles */}
              <div>
                <p className={sectionHeadClass}>Quick filters</p>
                <div className="space-y-2.5">
                  {[
                    { key: 'verifiedOnly' as const, label: 'Verified only' },
                    { key: 'featuredOnly' as const, label: 'Featured only' },
                  ].map(({ key, label }) => (
                    <label key={key} className={labelClass}>
                      <input type="checkbox" checked={filters[key]} onChange={(e) => update(key, e.target.checked)} className={checkClass} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Distance */}
              {userLocation && (
                <div>
                  <p className={sectionHeadClass}>Distance</p>
                  <select
                    value={filters.maxDistance || ''}
                    onChange={(e) => update('maxDistance', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2.5 border border-[#1e3a6e]/15 rounded-xl text-sm text-[#1e3a6e] focus:outline-none focus:border-[#e9924b]/50 transition-colors"
                  >
                    <option value="">Any distance</option>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="20">Within 20 km</option>
                    <option value="50">Within 50 km</option>
                  </select>
                </div>
              )}

              {/* Session types */}
              <div>
                <p className={sectionHeadClass}>Session type</p>
                <div className="space-y-2">
                  {AVAILABLE_SESSION_TYPES.map((t) => (
                    <label key={t} className={labelClass}>
                      <input type="checkbox" checked={filters.sessionTypes?.includes(t) || false} onChange={() => toggle('sessionTypes', t)} className={checkClass} />
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              {/* Areas of support */}
              <div>
                <p className={sectionHeadClass}>Area of support</p>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {AVAILABLE_AREAS.map((a) => (
                    <label key={a} className={labelClass}>
                      <input type="checkbox" checked={filters.areasOfSupport?.includes(a) || false} onChange={() => toggle('areasOfSupport', a)} className={checkClass} />
                      {a}
                    </label>
                  ))}
                </div>
              </div>

              {/* Age groups */}
              <div>
                <p className={sectionHeadClass}>Age group</p>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {AVAILABLE_AGE_GROUPS.map((a) => (
                    <label key={a} className={labelClass}>
                      <input type="checkbox" checked={filters.ageGroups?.includes(a) || false} onChange={() => toggle('ageGroups', a)} className={checkClass} />
                      {a}
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              {availableLanguages.length > 0 && (
                <div>
                  <p className={sectionHeadClass}>Languages</p>
                  <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                    {availableLanguages.map((l) => (
                      <label key={l} className={labelClass}>
                        <input type="checkbox" checked={filters.languages.includes(l)} onChange={() => toggle('languages', l)} className={checkClass} />
                        {l}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Counties */}
              {availableCounties.length > 0 && (
                <div>
                  <p className={sectionHeadClass}>Counties</p>
                  <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                    {availableCounties.map((c) => (
                      <label key={c} className={labelClass}>
                        <input type="checkbox" checked={filters.counties.includes(c)} onChange={() => toggle('counties', c)} className={checkClass} />
                        {c}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Religion */}
              <div>
                <p className={sectionHeadClass}>Religion / Faith</p>
                <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                  {AVAILABLE_RELIGIONS.map((r) => (
                    <label key={r} className={labelClass}>
                      <input type="checkbox" checked={filters.religions?.includes(r) || false} onChange={() => toggle('religions', r)} className={checkClass} />
                      {r}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-[#1e3a6e]/8 flex gap-3">
              <button onClick={clear} className="flex-1 px-4 py-2.5 text-sm font-medium text-[#1e3a6e]/50 hover:text-[#1e3a6e] hover:bg-[#1e3a6e]/5 rounded-xl transition-colors">
                Clear all
              </button>
              <button onClick={() => setOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#e9924b] text-white rounded-xl hover:bg-[#d4762a] transition-colors">
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