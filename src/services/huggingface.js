// src/services/huggingface.js

const HF_API_BASE = 'https://huggingface.co';
const HF_API_MODELS = 'https://huggingface.co/api/models';
const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;
const OPTIONAL_ASSET_ERROR_TEXT = [
  'failed to fetch',
  'load failed',
  'networkerror',
  'network request failed'
];

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

const isRestrictedStatus = (status) => status === 401 || status === 403;

const isLikelyNetworkFetchError = (error) => {
  if (!error) return false;
  const message = String(error.message || '').toLowerCase();
  return OPTIONAL_ASSET_ERROR_TEXT.some((text) => message.includes(text));
};

const fetchOptionalRepoFile = async (modelId, filePath, responseType = 'json') => {
  const paths = ['raw', 'resolve'];

  try {
    for (const pathType of paths) {
      const response = await fetch(
        `${HF_API_BASE}/${modelId}/${pathType}/main/${filePath}`,
        { headers: getHeaders() }
      );

      if (response.ok) {
        return responseType === 'text' ? response.text() : response.json();
      }

      if (isRestrictedStatus(response.status) || response.status === 404) {
        return null;
      }
    }

    return null;
  } catch (error) {
    if (!isLikelyNetworkFetchError(error)) {
      console.warn(`Optional Hugging Face asset unavailable for ${modelId}/${filePath}:`, error);
    }
    return null;
  }
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
  return fetchOptionalRepoFile(modelId, 'config.json');
};

/**
 * Fetch model README
 */
export const fetchModelReadme = async (modelId) => {
  return fetchOptionalRepoFile(modelId, 'README.md', 'text');
};

/**
 * Fetch tokenizer config
 */
export const fetchTokenizerConfig = async (modelId) => {
  return fetchOptionalRepoFile(modelId, 'tokenizer_config.json');
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

    // Always attempt to fetch config/readme even for gated models.
    // Many gated models (e.g. Llama 2) have public config/readme — only weights are gated.
    // fetchOptionalRepoFile handles 401/403 gracefully by returning null.

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
 * Filters by text-generation for keyword searches to return relevant LLMs
 */
export const searchModels = async (query, limit = 10) => {
  try {
    // If query contains '/', it's likely a specific model ID — search broadly
    // Otherwise filter to text-generation models for more relevant results
    const isKeywordSearch = !query.includes('/');
    const filterParam = isKeywordSearch ? '&filter=text-generation' : '';
    
    const response = await fetch(
      `${HF_API_MODELS}?search=${encodeURIComponent(query)}&limit=${limit}&sort=downloads&direction=-1${filterParam}`,
      { headers: getHeaders() }
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
      `${HF_API_MODELS}?sort=trendingScore&direction=-1&limit=${limit}`,
      { next: { revalidate: 3600 } } // Refresh trending data every hour
    );
    
    if (!response.ok) throw new Error('Failed to fetch trending models');
    
    const models = await response.json();
    const sizeRegex = /(?:^|[-_])(\d+(?:\.\d+)?)[bBmM](?:[-_]|$)|(\d+(?:\.\d+)?)\s*[bBmM]/;
    const candidates = models
      .filter((model) => {
        const hasNameSize = sizeRegex.test(String(model.id || ''));
        const hasMetadataParams =
          Number(model?.safetensors?.total) > 0 ||
          Number(model?.cardData?.model_params) > 0 ||
          Number(model?.cardData?.parameters) > 0 ||
          Number(model?.transformersInfo?.num_parameters) > 0;
        return !hasNameSize && !hasMetadataParams;
      });

    const hydrationEntries = await Promise.all(
      candidates.map(async (model) => {
        const [metadata, config] = await Promise.all([
          fetchModelMetadata(model.id).catch(() => null),
          fetchModelConfig(model.id),
        ]);
        return [model.id, { metadata, config }];
      })
    );
    const hydrationMap = new Map(hydrationEntries);

    return models.map((model) =>
      hydrationMap.has(model.id)
        ? {
            ...model,
            ...(hydrationMap.get(model.id)?.metadata || {}),
            rawConfig: hydrationMap.get(model.id)?.config || model.rawConfig,
          }
        : model
    );
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
