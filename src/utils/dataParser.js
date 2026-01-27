// Data Parser Utility
// Cleans and structures raw HuggingFace API responses

/**
 * Parse model metadata from HuggingFace API
 * @param {object} apiResponse - Raw API response
 * @returns {object} Cleaned model metadata
 */
export const parseModelMetadata = (apiResponse) => {
  return {
    modelId: apiResponse.modelId || apiResponse.id || 'unknown',
    author: apiResponse.author || extractAuthor(apiResponse.modelId),
    lastModified: apiResponse.lastModified || apiResponse.last_modified || null,
    downloads: apiResponse.downloads || 0,
    likes: apiResponse.likes || 0,
    tags: apiResponse.tags || [],
    library: apiResponse.library_name || 'unknown',
    pipelineTag: apiResponse.pipeline_tag || 'text-generation',
    private: apiResponse.private || false,
    gated: apiResponse.gated || false
  };
};

/**
 * Extract author from model ID
 * @param {string} modelId - Full model ID (e.g., "meta-llama/Llama-2-7b")
 * @returns {string} Author name
 */
const extractAuthor = (modelId) => {
  if (!modelId) return 'unknown';
  const parts = modelId.split('/');
  return parts.length > 1 ? parts[0] : 'unknown';
};

/**
 * Parse model configuration (config.json)
 * @param {object} config - Raw config object
 * @returns {object} Cleaned configuration
 */
export const parseModelConfig = (config) => {
  if (!config) return null;
  
  return {
    // Core architecture
    model_type: config.model_type || config.architectures?.[0] || 'unknown',
    architectures: config.architectures || [],
    
    // Dimensions
    hidden_size: config.hidden_size || config.d_model || null,
    num_hidden_layers: config.num_hidden_layers || config.n_layer || config.num_layers || null,
    num_attention_heads: config.num_attention_heads || config.n_head || null,
    num_key_value_heads: config.num_key_value_heads || config.num_attention_heads || null,
    
    // Context
    max_position_embeddings: config.max_position_embeddings || config.n_positions || config.max_sequence_length || null,
    
    // Vocabulary
    vocab_size: config.vocab_size || null,
    
    // Advanced features
    rope_theta: config.rope_theta || config.rotary_emb_base || 10000,
    rope_scaling: config.rope_scaling || null,
    sliding_window: config.sliding_window || null,
    
    // MoE parameters
    num_experts: config.num_local_experts || config.num_experts || null,
    num_experts_per_tok: config.num_experts_per_tok || null,
    
    // Technical
    torch_dtype: config.torch_dtype || 'float16',
    use_cache: config.use_cache !== false, // Default true
    
    // Tokenizer references
    bos_token_id: config.bos_token_id || null,
    eos_token_id: config.eos_token_id || null,
    pad_token_id: config.pad_token_id || null,
    
    // Generation defaults
    max_new_tokens: config.max_new_tokens || null,
    temperature: config.temperature || null,
    top_p: config.top_p || null,
    
    // Quantization
    quantization_config: config.quantization_config || null
  };
};

/**
 * Parse README/model card
 * @param {string} readmeText - Raw README markdown
 * @returns {object} Extracted information
 */
export const parseModelCard = (readmeText) => {
  if (!readmeText) return null;
  
  const extractSection = (text, heading) => {
    const regex = new RegExp(`#+\\s*${heading}[\\s\\S]*?(?=\\n#+|$)`, 'i');
    const match = text.match(regex);
    return match ? match[0] : null;
  };
  
  const extractBenchmarks = (text) => {
    const benchmarks = {};
    
    // Common benchmark patterns
    const patterns = {
      mmlu: /MMLU[:\s]+(\d+\.?\d*)/i,
      gsm8k: /GSM8?K[:\s]+(\d+\.?\d*)/i,
      humaneval: /HumanEval[:\s]+(\d+\.?\d*)/i,
      hellaswag: /HellaSwag[:\s]+(\d+\.?\d*)/i,
      arc: /ARC[:\s]+(\d+\.?\d*)/i
    };
    
    for (const [name, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        benchmarks[name] = parseFloat(match[1]);
      }
    }
    
    return Object.keys(benchmarks).length > 0 ? benchmarks : null;
  };
  
  return {
    description: extractFirstParagraph(readmeText),
    benchmarks: extractBenchmarks(readmeText),
    usage: extractSection(readmeText, 'Usage'),
    limitations: extractSection(readmeText, 'Limitations'),
    training: extractSection(readmeText, 'Training')
  };
};

/**
 * Extract first paragraph from text
 * @param {string} text - Full text
 * @returns {string} First paragraph
 */
const extractFirstParagraph = (text) => {
  if (!text) return '';
  
  // Remove YAML frontmatter if present
  const withoutFrontmatter = text.replace(/^---[\s\S]*?---/, '');
  
  // Get first non-empty paragraph
  const paragraphs = withoutFrontmatter
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p && !p.startsWith('#'));
  
  return paragraphs[0] || '';
};

/**
 * Determine if model is quantized
 * @param {object} config - Model config
 * @param {string} modelId - Model ID
 * @returns {object} Quantization info
 */
export const detectQuantization = (config, modelId) => {
  const id = modelId?.toLowerCase() || '';
  
  // Check config
  if (config?.quantization_config) {
    return {
      quantized: true,
      method: config.quantization_config.quant_method || 'unknown',
      bits: config.quantization_config.bits || null
    };
  }
  
  // Check model ID for common patterns
  if (id.includes('gptq')) {
    return { quantized: true, method: 'gptq', bits: 4 };
  }
  if (id.includes('awq')) {
    return { quantized: true, method: 'awq', bits: 4 };
  }
  if (id.includes('gguf') || id.includes('ggml')) {
    return { quantized: true, method: 'gguf', bits: null };
  }
  if (id.includes('int8')) {
    return { quantized: true, method: 'int8', bits: 8 };
  }
  if (id.includes('int4')) {
    return { quantized: true, method: 'int4', bits: 4 };
  }
  
  return { quantized: false, method: null, bits: null };
};

/**
 * Complete model data parser
 * @param {object} apiData - Raw API data bundle
 * @returns {object} Fully parsed model data
 */
export const parseCompleteModel = (apiData) => {
  const { metadata, config, readme } = apiData;
  
  return {
    ...parseModelMetadata(metadata),
    config: parseModelConfig(config),
    card: parseModelCard(readme),
    quantization: detectQuantization(config, metadata?.modelId)
  };
};