import { useState, useCallback } from 'react';

/**
 * Custom hook for managing model comparison
 * @returns {object} Comparison state and methods
 */
export const useComparison = () => {
  const [comparisonList, setComparisonList] = useState([]);
  const MAX_COMPARE = 3; // Maximum models to compare

  // Add model to comparison
  const addToComparison = useCallback((modelId) => {
    setComparisonList(prev => {
      // Don't add if already in list
      if (prev.includes(modelId)) {
        return prev;
      }
      
      // Don't add if at max capacity
      if (prev.length >= MAX_COMPARE) {
        alert(`Maximum ${MAX_COMPARE} models can be compared at once`);
        return prev;
      }
      
      return [...prev, modelId];
    });
  }, []);

  // Remove model from comparison
  const removeFromComparison = useCallback((modelId) => {
    setComparisonList(prev => prev.filter(id => id !== modelId));
  }, []);

  // Clear all comparisons
  const clearComparison = useCallback(() => {
    setComparisonList([]);
  }, []);

  // Check if model is in comparison
  const isInComparison = useCallback((modelId) => {
    return comparisonList.includes(modelId);
  }, [comparisonList]);

  return {
    comparisonList,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    canAddMore: comparisonList.length < MAX_COMPARE,
    count: comparisonList.length
  };
};