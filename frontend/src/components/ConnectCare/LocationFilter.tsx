import React from 'react';
import { MapPin, Loader, X } from 'lucide-react';

interface LocationFilterProps {
  onLocationChange: (location: { lat: number; lng: number } | null) => void;
  loading: boolean;
  hasLocation: boolean;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ onLocationChange, loading, hasLocation }) => {
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => onLocationChange({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert('Unable to get your location. Please enable location services.'),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  if (hasLocation) {
    return (
      <button
        onClick={() => onLocationChange(null)}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#659ec3]/10 border border-[#659ec3]/25 text-[#659ec3] rounded-xl text-sm font-semibold hover:bg-[#659ec3]/20 transition-all"
      >
        <X className="w-3.5 h-3.5" />
        Clear location
      </button>
    );
  }

  return (
    <button
      onClick={handleUseLocation}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#1e3a6e]/15 text-[#1e3a6e]/60 rounded-xl text-sm font-semibold hover:border-[#659ec3]/40 hover:text-[#659ec3] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      {loading ? (
        <>
          <Loader className="w-3.5 h-3.5 animate-spin" />
          Locating...
        </>
      ) : (
        <>
          <MapPin className="w-3.5 h-3.5" />
          Near me
        </>
      )}
    </button>
  );
};

export default LocationFilter;