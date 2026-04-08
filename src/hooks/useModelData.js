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
      // Pass safetensors.total from HuggingFace API for accurate parameter count
      const safetensorsTotal = rawData.metadata?.safetensors?.total || null;

      // Use parsed config if available, otherwise try to extract from metadata
      const configForVram = parsedData.config || extractConfigFromMetadata(rawData.metadata);
      const vramEstimates = configForVram
        ? calculateVRAM(configForVram, { safetensorsTotal }) 
        : null;
      
      const licenseInfo = getLicenseInfo(
        rawData.metadata.cardData?.license || 
        rawData.metadata.tags?.find(t => t.includes('license'))
      );
      
      // Combine everything
      const enrichedData = {
        ...parsedData,
        // If config was null from parser but we got some from metadata, use it
        config: parsedData.config || extractConfigFromMetadata(rawData.metadata),
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
 * Extract config-like fields from HuggingFace metadata as a fallback
 * The HF API response often includes config/transformersInfo even for gated models
 */
const extractConfigFromMetadata = (metadata) => {
  if (!metadata) return null;
  
  // HF API sometimes includes a config object directly
  const apiConfig = metadata.config;
  if (apiConfig && typeof apiConfig === 'object' && Object.keys(apiConfig).length > 2) {
    return apiConfig;
  }

  // Try to build from transformersInfo
  const ti = metadata.transformersInfo;
  if (ti) {
    return {
      model_type: ti.auto_model || ti.pipeline_tag || metadata.pipeline_tag || 'unknown',
      architectures: ti.auto_model ? [ti.auto_model] : [],
    };
  }

  return null;
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