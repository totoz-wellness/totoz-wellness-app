import React from 'react';
import { MapPin, CheckCircle, Heart } from 'lucide-react';
import { formatDistance } from '../../utils/distance';

interface ResourceCardProps {
  resource: any;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  distance?: number;
  typeConfig: any;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource, onClick, isFavorite, onToggleFavorite, distance, typeConfig,
}) => {
  const cfg = typeConfig[resource.type] || { label: resource.type, color: 'text-[#1e3a6e]', bg: 'bg-[#1e3a6e]/8' };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl border border-[#1e3a6e]/8 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#e9924b]/20 transition-all duration-300 cursor-pointer p-6 flex flex-col"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
      aria-label={`View details for ${resource.name}`}
    >
      {/* Favorite */}
      <button
        onClick={onToggleFavorite}
        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#1e3a6e]/5 transition-colors z-10"
        aria-label={isFavorite ? 'Remove from saved' : 'Save resource'}
      >
        <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-[#e9924b] text-[#e9924b]' : 'text-[#1e3a6e]/25 group-hover:text-[#1e3a6e]/40'}`} />
      </button>

      {/* Type + verified badges */}
      <div className="flex flex-wrap gap-2 mb-3 pr-8">
        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
        {resource.isFeatured && (
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-[#e9924b]/10 text-[#e9924b] uppercase tracking-wide">
            Featured
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="font-heading font-bold text-[#1e3a6e] text-base leading-snug mb-2 group-hover:text-[#e9924b] transition-colors flex items-center gap-1.5">
        {resource.name}
        {resource.isVerified && (
          <CheckCircle className="w-3.5 h-3.5 text-[#659ec3] flex-shrink-0" />
        )}
      </h3>

      {/* Excerpt */}
      <p className="text-[#1e3a6e]/55 text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
        {resource.excerpt || resource.description}
      </p>

      {/* Location */}
      <div className="space-y-1.5 mt-auto">
        {(resource.location.city || resource.location.county) && (
          <div className="flex items-center gap-1.5 text-[#1e3a6e]/40 text-xs">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {[resource.location.city, resource.location.county].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        {distance !== undefined && (
          <div className="flex items-center gap-1.5 text-[#659ec3] text-xs font-medium">
            <MapPin className="w-3.5 h-3.5" />
            {formatDistance(distance)} away
          </div>
        )}
      </div>

      {/* Specializations */}
      {resource.specializations?.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#1e3a6e]/6">
          <p className="text-[#1e3a6e]/35 text-xs line-clamp-1">
            {resource.specializations.slice(0, 2).join(' · ')}
            {resource.specializations.length > 2 && ' +more'}
          </p>
        </div>
      )}

      {/* Hover accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e9924b] rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </div>
  );
};

export default ResourceCard;