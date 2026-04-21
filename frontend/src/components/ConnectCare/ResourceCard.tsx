import React from 'react';
import { MapPin, CheckCircle, Heart, Star } from 'lucide-react';
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
  resource,
  onClick,
  isFavorite,
  onToggleFavorite,
  distance,
  typeConfig
}) => {
  return (
    <div
      onClick={onClick}
      className="relative bg-white rounded-2xl shadow-sm hover:shadow-2xl border border-gray-200 p-6 text-left transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
      aria-label={`View details for ${resource.name}`}
    >
      {/* Favorite Button */}
      <button
        onClick={onToggleFavorite}
        className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all z-10 group/fav"
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart 
          className={`w-5 h-5 transition-all ${
            isFavorite 
              ? 'fill-red-500 text-red-500' 
              : 'text-gray-400 group-hover/fav:text-red-400'
          }`}
        />
      </button>

      {/* Header */}
      <div className="flex justify-between items-start mb-4 pr-12">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal transition-colors">
          {resource.name}
          {resource.isVerified && (
            <CheckCircle className="inline-block w-5 h-5 text-teal ml-2" />
          )}
        </h3>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${typeConfig[resource.type]. bg} ${typeConfig[resource.type]. color}`}>
          {typeConfig[resource.type].label}
        </span>
        
        {resource.isFeatured && (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </span>
        )}
      </div>

      {/* Excerpt */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
        {resource.excerpt || resource.description}
      </p>

      {/* Location & Distance */}
      <div className="space-y-2">
        {(resource.location.city || resource.location.county) && (
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              {resource.location.city}
              {resource.location.county && `, ${resource.location. county}`}
            </span>
          </div>
        )}

        {distance !== undefined && (
          <div className="flex items-center text-teal text-sm font-medium">
            <MapPin className="w-4 h-4 mr-2" />
            {formatDistance(distance)} away
          </div>
        )}
      </div>

      {/* Specializations */}
      {resource.specializations?. length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 italic line-clamp-1">
            {resource.specializations.slice(0, 2).join(' · ')}
            {resource.specializations.length > 2 && ' ... '}
          </p>
        </div>
      )}

      {/* Hover Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" />
    </div>
  );
};

export default ResourceCard;