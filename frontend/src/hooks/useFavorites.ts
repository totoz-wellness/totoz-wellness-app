import { useState, useEffect } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('connectcare_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse favorites:', error);
        setFavorites([]);
      }
    }
  }, []);

  const toggleFavorite = (resourceId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [... prev, resourceId];
      
      localStorage.setItem('connectcare_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (resourceId: string) => favorites.includes(resourceId);

  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('connectcare_favorites');
  };

  return { favorites, toggleFavorite, isFavorite, clearFavorites };
};