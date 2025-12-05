import { useState } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = () => {
    if (!navigator. geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator. geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position. coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to get your location');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const clearLocation = () => {
    setLocation(null);
    setError(null);
  };

  return { location, loading, error, getCurrentLocation, clearLocation };
};