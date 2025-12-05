import React from 'react';
import { MapPin, Loader, X } from 'lucide-react';

interface LocationFilterProps {
  onLocationChange: (location: { lat: number; lng: number } | null) => void;
  loading: boolean;
  hasLocation: boolean;
}

const LocationFilter: React.FC<LocationFilterProps> = ({
  onLocationChange,
  loading,
  hasLocation
}) => {
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator. geolocation.getCurrentPosition(
      (position) => {
        onLocationChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location.  Please enable location services.');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const handleClearLocation = () => {
    onLocationChange(null);
  };

  return (
    <div className="flex gap-2">
      {! hasLocation ? (
        <button
          onClick={handleUseLocation}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2. 5 bg-teal text-white rounded-xl hover:bg-teal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Getting location...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              Near Me
            </>
          )}
        </button>
      ) : (
        <button
          onClick={handleClearLocation}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
        >
          <X className="w-4 h-4" />
          Clear location
        </button>
      )}
    </div>
  );
};

export default LocationFilter;