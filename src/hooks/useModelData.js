// Custom React Hook for fetching model data
// Handles loading states, errors, and caching

import { useState, useEffect, useCallback } from 'react';
import { fetchCompleteModelData, handleAPIError } from '../services/huggingface';
import { parseCompleteModel } from '../utils/dataParser';
import { calculateVRAM } from '../utils/vramCalculator';
import { getLicenseInfo } from '../utils/licenseChecker';

/**
 * Custom hook for fetching and processing model data
 * @param {string} modelId - Model ID to fetch (null to skip)
 * @returns {object} { data, loading, error, refetch }
 */
export const useModelData = (modelId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!modelId) {
      setData(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch raw data from HuggingFace
      const rawData = await fetchCompleteModelData(modelId);
      
      // Parse and structure the data
      const parsedData = parseCompleteModel(rawData);
      
      // Enrich with calculations
      const vramEstimates = parsedData.config 
        ? calculateVRAM(parsedData.config) 
        : null;
      
      const licenseInfo = getLicenseInfo(
        rawData.metadata.cardData?.license || 
        rawData.metadata.tags?.find(t => t.includes('license'))
      );
      
      // Combine everything
      const enrichedData = {
        ...parsedData,
        vramEstimates,
        licenseInfo,
        rawData // Keep raw data for debugging
      };
      
      setData(enrichedData);
    } catch (err) {
      const friendlyError = handleAPIError(err);
      setError(friendlyError);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [modelId]);

  // Fetch when modelId changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

/**
 * Hook for searching models
 * @returns {object} { search, results, loading }
 */
export const useModelSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    try {
      const { searchModels } = await import('../services/huggingface');
      const models = await searchModels(query, 5);
      setResults(models);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { search, results, loading };
};