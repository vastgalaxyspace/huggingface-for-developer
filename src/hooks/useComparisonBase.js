import { useState, useCallback } from 'react';
import { notify } from '../lib/notifications';

/**
 * Custom hook for managing model comparison
 * @returns {object} Comparison state and methods
 */
export const useComparison = () => {
  const [comparisonList, setComparisonList] = useState([]);
  const MAX_COMPARE = 3; // Maximum models to compare

  // Add model to comparison
  const addToComparison = useCallback((modelId) => {
    if (comparisonList.includes(modelId)) {
      return;
    }

    if (comparisonList.length >= MAX_COMPARE) {
      notify(`Maximum ${MAX_COMPARE} models can be compared at once`, 'info');
      return;
    }

    setComparisonList((prev) => (prev.includes(modelId) ? prev : [...prev, modelId]));
  }, [comparisonList]);

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
