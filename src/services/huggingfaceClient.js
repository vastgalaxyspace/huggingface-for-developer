// Browser-safe Hugging Face accessors. These only call same-origin API routes.

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const fetchModelMetadata = async (modelId, options = {}) => {
  const data = await fetchJson(`/api/hf-model?modelId=${encodeURIComponent(modelId)}`, {
    signal: options.signal,
  });
  return data?.metadata || null;
};

export const fetchCompleteModelData = async (modelId, options = {}) => {
  if (!modelId || !modelId.includes('/')) {
    throw new Error('Invalid model ID format. Use: author/model-name');
  }

  const data = await fetchJson(`/api/hf-model?modelId=${encodeURIComponent(modelId)}`, {
    signal: options.signal,
  });

  if (!data?.metadata) {
    throw new Error('Could not fetch model metadata');
  }

  return {
    metadata: data.metadata,
    config: data.config || null,
    readme: null,
    tokenizerConfig: null,
    fetchedAt: new Date().toISOString(),
  };
};

export const searchModels = async (query, limit = 10) => {
  if (!query || query.length < 2) return [];

  const params = new URLSearchParams({
    search: query,
    limit: String(limit),
  });

  try {
    return await fetchJson(`/api/hf-search?${params.toString()}`);
  } catch (error) {
    console.error('Error searching models:', error);
    return [];
  }
};

export const getTrendingModels = async (limit = 10) => {
  const params = new URLSearchParams({ limit: String(limit) });

  try {
    return await fetchJson(`/api/hf-trending?${params.toString()}`);
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
