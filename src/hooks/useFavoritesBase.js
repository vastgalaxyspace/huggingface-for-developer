import { useState, useEffect, useCallback } from 'react';
import { notify } from '../lib/notifications';

const FAVORITES_KEY = 'hf_model_explorer_favorites';

const loadInitialFavorites = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
};

/**
 * Custom hook for managing favorite models
 * @returns {object} Favorites state and methods
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState(loadInitialFavorites);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites]);

  // Add model to favorites
  const addFavorite = useCallback((modelData) => {
    setFavorites(prev => {
      // Don't add if already in favorites
      if (prev.some(fav => fav.modelId === modelData.modelId)) {
        return prev;
      }

      const favorite = {
        modelId: modelData.modelId,
        author: modelData.author,
        addedAt: new Date().toISOString(),
        // Store lightweight data
        vram: modelData.vramEstimates?.fp16,
        license: modelData.licenseInfo?.name,
        params: modelData.vramEstimates?.totalParams,
        downloads: modelData.downloads,
        likes: modelData.likes
      };

      return [...prev, favorite];
    });
  }, []);

  // Remove model from favorites
  const removeFavorite = useCallback((modelId) => {
    setFavorites(prev => prev.filter(fav => fav.modelId !== modelId));
  }, []);

  // Check if model is favorited (must be defined before toggleFavorite)
  const isFavorite = useCallback((modelId) => {
    return favorites.some(fav => fav.modelId === modelId);
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback((modelData) => {
    if (isFavorite(modelData.modelId)) {
      removeFavorite(modelData.modelId);
    } else {
      addFavorite(modelData);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    if (confirm('Are you sure you want to clear all favorites?')) {
      setFavorites([]);
    }
  }, []);

  // Export favorites as JSON
  const exportFavorites = useCallback(() => {
    const dataStr = JSON.stringify(favorites, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hf-model-favorites.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [favorites]);

  // Import favorites from JSON
  const importFavorites = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          setFavorites(prev => {
            // Merge with existing, avoid duplicates
            const merged = [...prev];
            imported.forEach(imp => {
              if (!merged.some(fav => fav.modelId === imp.modelId)) {
                merged.push(imp);
              }
            });
            return merged;
          });
          notify('Favorites imported successfully.', 'success');
        }
      } catch {
        notify('Error importing favorites. Please check the file format.', 'error');
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    exportFavorites,
    importFavorites,
    count: favorites.length
  };
};
