// src/services/huggingface.js

const HF_API_BASE = 'https://huggingface.co';
const HF_API_MODELS = 'https://huggingface.co/api/models';
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;

/**
 * Get headers for authenticated requests
 */
const getHeaders = () => {
  const headers = {};
  if (HF_TOKEN) {
    headers['Authorization'] = `Bearer ${HF_TOKEN}`;
  }
  return headers;
};

/**
 * Fetch model metadata
 */
export const fetchModelMetadata = async (modelId) => {
  try {
    const response = await fetch(`${HF_API_MODELS}/${modelId}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Model not found. Check the model ID and try again.');
      }
      // Specific check for gated models at the metadata level
      if (response.status === 401 || response.status === 403) {
        throw new Error('This is a gated model. You must have access permissions on Hugging Face to view its details.');
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching model metadata:', error);
    throw error;
  }
};

/**
 * Fetch model config.json
 */
export const fetchModelConfig = async (modelId) => {
  try {
    // Try primary raw path
    const response = await fetch(
      `${HF_API_BASE}/${modelId}/raw/main/config.json`,
      { headers: getHeaders() }
    );
    
    if (!response.ok) {
      // If unauthorized, it's likely a gated model or requires a token
      if (response.status === 401 || response.status === 403) {
        console.warn(`Access restricted for ${modelId} config. It may be a gated model.`);
        return null;
      }

      // Try alternative path (resolve)
      const altResponse = await fetch(
        `${HF_API_BASE}/${modelId}/resolve/main/config.json`,
        { headers: getHeaders() }
      );
      
      if (!altResponse.ok) {
        return null; // Return null gracefully instead of throwing to prevent app crash
      }
      
      return await altResponse.json();
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching model config:', error);
    return null; // Return null gracefully
  }
};

/**
 * Fetch model README
 */
export const fetchModelReadme = async (modelId) => {
  try {
    const response = await fetch(
      `${HF_API_BASE}/${modelId}/raw/main/README.md`
    );
    
    if (!response.ok) return null;
    return await response.text();
  } catch (error) {
    console.error('Error fetching README:', error);
    return null;
  }
};

/**
 * Fetch tokenizer config
 */
export const fetchTokenizerConfig = async (modelId) => {
  try {
    const response = await fetch(
      `${HF_API_BASE}/${modelId}/raw/main/tokenizer_config.json`,
      { headers: getHeaders() }
    );
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching tokenizer config:', error);
    return null;
  }
};

/**
 * Fetch all model data in parallel
 */
export const fetchCompleteModelData = async (modelId) => {
  try {
    if (!modelId || !modelId.includes('/')) {
      throw new Error('Invalid model ID format. Use: author/model-name');
    }
    
    // Metadata is fetched first to check existence and gated status
    const metadata = await fetchModelMetadata(modelId);
    
    if (!metadata) {
      throw new Error('Could not fetch model metadata');
    }

    // Parallel fetch for remaining assets
    const [config, readme, tokenizerConfig] = await Promise.all([
      fetchModelConfig(modelId),
      fetchModelReadme(modelId),
      fetchTokenizerConfig(modelId)
    ]);
    
    return {
      metadata,
      config,
      readme,
      tokenizerConfig,
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching complete model data:', error);
    throw error;
  }
};

/**
 * Search models (Autocomplete)
 * Connects to HuggingFace Search API
 */
export const searchModels = async (query, limit = 5) => {
  try {
    const response = await fetch(
      `${HF_API_MODELS}?search=${encodeURIComponent(query)}&limit=${limit}&sort=downloads&direction=-1`
    );
    
    if (!response.ok) throw new Error('Search failed');
    
    return await response.json();
  } catch (error) {
    console.error('Error searching models:', error);
    return [];
  }
};

/**
 * Get trending models for the homepage
 */
export const getTrendingModels = async (limit = 10) => {
  try {
    const response = await fetch(
      `${HF_API_MODELS}?sort=downloads&direction=-1&limit=${limit}&filter=text-generation`
    );
    
    if (!response.ok) throw new Error('Failed to fetch trending models');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching trending models:', error);
    return [];
  }
};

export const handleAPIError = (error) => {
  if (error.message.includes('not found') || error.message.includes('404')) {
    return {
      type: 'not_found',
      title: 'Model Not Found',
      message: 'The model ID you entered does not exist on HuggingFace.',
      suggestion: 'Check the spelling or try searching for similar models.'
    };
  }

  if (error.message.includes('gated') || error.message.includes('permissions')) {
    return {
      type: 'validation',
      title: 'Gated Model',
      message: 'This model is gated and requires approved access from the author.',
      suggestion: 'Visit the model page on Hugging Face to request access or use an open-access model.'
    };
  }
  
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return {
      type: 'network',
      title: 'Network Error',
      message: 'Could not connect to HuggingFace API.',
      suggestion: 'Check your internet connection and try again.'
    };
  }
  
  if (error.message.includes('Invalid model ID')) {
    return {
      type: 'validation',
      title: 'Invalid Model ID',
      message: 'Model ID must be in format: author/model-name',
      suggestion: 'Example: meta-llama/Llama-2-7b-chat-hf'
    };
  }
  
  return {
    type: 'unknown',
    title: 'Error',
    message: error.message || 'An unexpected error occurred',
    suggestion: 'Please try again or contact support.'
  };
};