import { useState, useEffect } from 'react';
import { getTrendingModels, fetchCompleteModelData } from '../services/huggingface';
import { parseCompleteModel } from '../utils/dataParser';
import { calculateVRAM } from '../utils/vramCalculator';
import { getLicenseInfo } from '../utils/licenseChecker';

/**
 * Hook to maintain a database of popular models for recommender
 */
export const useModelDatabase = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Use a curated list of popular, well-documented models
        const popularModelIds = [
          'meta-llama/Llama-2-7b-chat-hf',
          'meta-llama/Llama-2-13b-chat-hf',
          'mistralai/Mistral-7B-Instruct-v0.2',
          'mistralai/Mixtral-8x7B-Instruct-v0.1',
          'microsoft/phi-2',
          'google/gemma-7b-it',
          'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
          'codellama/CodeLlama-7b-Instruct-hf',
          'codellama/CodeLlama-13b-Instruct-hf',
          'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
          'HuggingFaceH4/zephyr-7b-beta',
          'teknium/OpenHermes-2.5-Mistral-7B'
        ];

        const loadedModels = [];
        
        for (let i = 0; i < popularModelIds.length; i++) {
          const modelId = popularModelIds[i];
          setProgress(Math.round(((i + 1) / popularModelIds.length) * 100));
          
          try {
            // Fetch complete model data
            const rawData = await fetchCompleteModelData(modelId);
            const parsedData = parseCompleteModel(rawData);
            
            // Enrich with calculations
            const vramEstimates = parsedData.config 
              ? calculateVRAM(parsedData.config) 
              : { fp16: '14', int8: '7', int4: '4', totalParams: '7' };
            
            const licenseInfo = getLicenseInfo(
              rawData.metadata.cardData?.license || 
              rawData.metadata.tags?.find(t => t.includes('license'))
            );
            
            loadedModels.push({
              ...parsedData,
              vramEstimates,
              licenseInfo,
              modelId: parsedData.modelId || modelId,
              author: parsedData.author || modelId.split('/')[0]
            });
          } catch (error) {
            console.error(`Failed to load ${modelId}:`, error);
            // Continue loading other models
          }
        }

        setModels(loadedModels);
      } catch (error) {
        console.error('Error loading model database:', error);
        setModels([]);
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  return { models, loading, progress };
};