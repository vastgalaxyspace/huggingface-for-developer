// VRAM Estimation Calculator
// Calculates memory requirements for different precision levels

/**
 * Calculate VRAM requirements for a model
 * @param {object} config - Model configuration
 * @param {object} options - Additional options
 * @param {number} options.safetensorsTotal - Actual total parameter count from safetensors metadata
 * @returns {object} VRAM estimates in GB for different precisions (as Numbers)
 */
export const calculateVRAM = (config, options = {}) => {
  let totalParams;

  // PRIORITY 1: Use actual parameter count from HuggingFace safetensors metadata
  // This is the most reliable source — it's the real weight count from the model files
  if (options.safetensorsTotal && options.safetensorsTotal > 0) {
    totalParams = options.safetensorsTotal / 1e9; // Convert from raw count to billions
  } else {
    // PRIORITY 2: Estimate from config (fallback)
    totalParams = estimateParamsFromConfig(config);
  }

  // Weight memory only. Each parameter needs:
  // FP32=4 bytes, FP16=2 bytes, INT8=1 byte, INT4=0.5 bytes.
  // A ~15% allowance covers CUDA context + framework buffers + activation working set
  // for a short prompt. KV cache is NOT included here — it scales with context length
  // and is computed separately by calculateContextVRAM().
  const runtimeOverhead = 1.15;

  const vramEstimates = {
    fp32: Number((totalParams * 4 * runtimeOverhead).toFixed(1)),
    fp16: Number((totalParams * 2 * runtimeOverhead).toFixed(1)),
    int8: Number((totalParams * 1 * runtimeOverhead).toFixed(1)),
    int4: Number((totalParams * 0.5 * runtimeOverhead).toFixed(1)),
    totalParams: Number(totalParams.toFixed(1)),
    paramSource: options.safetensorsTotal ? 'safetensors' : 'estimated'
  };

  return vramEstimates;
};

/**
 * Calculate KV-cache memory for a given context length using the real model
 * architecture (layers, KV heads, head dim). This is the dominant memory term at
 * long context and cannot be approximated by a per-token constant.
 *
 * Formula: 2 (K and V) × layers × kv_heads × head_dim × context × batch × bytes
 * The KV cache is stored in FP16 even when the weights are quantized, so we default
 * to 2 bytes/element regardless of the weight precision.
 *
 * @param {object} config - Model configuration
 * @param {number} contextLength - Context window size (tokens)
 * @param {number} batchSize - Concurrent sequences
 * @param {number} bytesPerElement - KV element size in bytes (default 2 = FP16)
 * @returns {number} KV cache size in GB (0 when config is insufficient)
 */
export const calculateKVCacheVRAM = (config, contextLength, batchSize = 1, bytesPerElement = 2) => {
  if (!config || !contextLength) return 0;

  const numLayers = config.num_hidden_layers || config.n_layer || config.num_layers;
  const hiddenSize = config.hidden_size || config.d_model || config.n_embd;
  const numAttentionHeads = config.num_attention_heads || config.n_head;
  // Grouped-query / multi-query attention: KV cache scales with KV heads, not attention heads.
  const numKVHeads = config.num_key_value_heads || numAttentionHeads;
  const headDim = config.head_dim || (hiddenSize && numAttentionHeads ? hiddenSize / numAttentionHeads : null);

  if (!numLayers || !numKVHeads || !headDim) return 0;

  const bytes = 2 * numLayers * numKVHeads * headDim * contextLength * batchSize * bytesPerElement;
  return bytes / 1024 ** 3; // → GB
};

/**
 * Estimate parameters from model config (fallback when safetensors data unavailable)
 * Now handles both dense transformers and Mixture-of-Experts (MoE) architectures
 * @param {object} config - Model configuration
 * @returns {number} Estimated parameters in billions
 */
const estimateParamsFromConfig = (config) => {
  const hiddenSize = config.hidden_size || config.d_model || 4096;
  const numLayers = config.num_hidden_layers || config.n_layer || config.num_layers || 32;
  const vocabSize = config.vocab_size || 32000;
  const intermediateSize = config.intermediate_size || hiddenSize * 4;

  // Embedding parameters
  const embeddingParams = (vocabSize * hiddenSize) / 1e9;

  // Check if this is a Mixture-of-Experts (MoE) model
  const numExperts = config.num_local_experts || config.num_experts || null;
  let transformerParams;

  if (numExperts && numExperts > 1) {
    // MoE model: each layer has attention + (numExperts × FFN) + router
    // Attention params per layer: 4 * hidden_size^2 (Q, K, V, O projections)
    // Account for GQA (grouped query attention) if num_key_value_heads < num_attention_heads
    const numKVHeads = config.num_key_value_heads || config.num_attention_heads || 32;
    const numAttentionHeads = config.num_attention_heads || 32;
    const headDim = config.head_dim || Math.floor(hiddenSize / numAttentionHeads);

    const qProjSize = numAttentionHeads * headDim * hiddenSize;
    const kProjSize = numKVHeads * headDim * hiddenSize;
    const vProjSize = numKVHeads * headDim * hiddenSize;
    const oProjSize = hiddenSize * numAttentionHeads * headDim;
    const attentionPerLayer = (qProjSize + kProjSize + vProjSize + oProjSize) / 1e9;

    // FFN params per expert: typically 3 * hidden_size * intermediate_size (gate, up, down)
    const ffnPerExpert = (3 * hiddenSize * intermediateSize) / 1e9;

    // Router params per layer (small): hidden_size * numExperts
    const routerPerLayer = (hiddenSize * numExperts) / 1e9;

    // Total per layer = attention + (numExperts * FFN) + router
    const paramsPerLayer = attentionPerLayer + (numExperts * ffnPerExpert) + routerPerLayer;

    transformerParams = paramsPerLayer * numLayers;
  } else {
    // Dense model: standard transformer formula
    // Approximate: (hidden_size^2 * num_layers * 12) covers Q/K/V/O + FFN
    transformerParams = (hiddenSize * hiddenSize * numLayers * 12) / 1e9;
  }

  return embeddingParams + transformerParams;
};

/**
 * Get recommended GPU for a model
 * @param {number|string} vramGB - VRAM requirement in GB
 * @returns {object} GPU recommendation
 */
export const getGPURecommendation = (vramGB) => {
  const vram = parseFloat(vramGB);

  // Each tier's GPUs have enough VRAM to actually hold a model of the given size
  // (with headroom for KV cache and activations).
  if (vram <= 10) {
    return {
      tier: "Consumer",
      gpus: ["RTX 3060 (12GB)", "RTX 4060 Ti (16GB)"],
      cloud: "T4 16GB (AWS, GCP)",
      cost: "$0.35-0.85/hour"
    };
  } else if (vram <= 20) {
    return {
      tier: "Prosumer",
      gpus: ["RTX 3090 (24GB)", "RTX 4090 (24GB)"],
      cloud: "L4 24GB (GCP), g5.xlarge (AWS)",
      cost: "$0.85-2/hour"
    };
  } else if (vram <= 32) {
    return {
      tier: "Professional",
      gpus: ["RTX A6000 (48GB)", "A100 (40GB)"],
      cloud: "A10G/L4 24GB or A100 40GB",
      cost: "$2-4/hour"
    };
  } else if (vram <= 40) {
    return {
      tier: "High-End",
      gpus: ["A100 (80GB)", "H100 (80GB)"],
      cloud: "A100 80GB, H100",
      cost: "$8-15/hour"
    };
  } else if (vram <= 80) {
    return {
      tier: "Multi-GPU",
      gpus: ["2x A100 (80GB)", "H100 (80GB)"],
      cloud: "Multi-GPU instances",
      cost: "$15-30/hour"
    };
  } else if (vram <= 160) {
    return {
      tier: "Multi-GPU Cluster",
      gpus: ["2-4x H100 (80GB)", "4x A100 (80GB)"],
      cloud: "Multi-node GPU cluster",
      cost: "$30-60/hour"
    };
  } else {
    return {
      tier: "Large-Scale Cluster",
      gpus: ["4-8x H100 (80GB)", "8x A100 (80GB)"],
      cloud: "Enterprise GPU cluster",
      cost: "$60+/hour"
    };
  }
};

/**
 * Calculate total VRAM at a given context length by adding the architecture-aware
 * KV cache to the base (weight) VRAM.
 *
 * @param {number|string} baseVRAM - Base weight VRAM in GB (from calculateVRAM)
 * @param {number} contextLength - Context window size (tokens)
 * @param {object} config - Model configuration (required for accurate KV cache)
 * @param {number} batchSize - Concurrent sequences
 * @returns {object} Adjusted VRAM estimates
 */
export const calculateContextVRAM = (baseVRAM, contextLength, config, batchSize = 1) => {
  const parsedBase = parseFloat(baseVRAM);
  // KV cache is FP16 regardless of weight quantization.
  const kvCache = calculateKVCacheVRAM(config, contextLength, batchSize, 2);

  return {
    baseVRAM: parsedBase,
    kvCache: Number(kvCache.toFixed(1)),
    total: Number((parsedBase + kvCache).toFixed(1)),
    warning: contextLength > 8192 ? "High context significantly increases KV-cache memory" : null
  };
};

/**
 * Format VRAM display string
 * @param {object} vramEstimates - VRAM estimates object
 * @returns {string} Formatted string
 */
export const formatVRAMDisplay = (vramEstimates) => {
  return `~${vramEstimates.fp16}GB (FP16) | ~${vramEstimates.int8}GB (INT8) | ~${vramEstimates.int4}GB (INT4)`;
};

/**
 * Check if model fits in available VRAM
 * @param {number|string} modelVRAM - Required VRAM in GB
 * @param {number|string} availableVRAM - Available VRAM in GB
 * @returns {object} Compatibility info
 */
export const checkVRAMCompatibility = (modelVRAM, availableVRAM) => {
  const required = parseFloat(modelVRAM);
  const available = parseFloat(availableVRAM);
  
  const fits = required <= available;
  const utilizationPercent = available > 0 ? ((required / available) * 100).toFixed(0) : "0";
  
  return {
    fits,
    utilizationPercent,
    headroom: Number((available - required).toFixed(1)),
    recommendation: fits 
      ? "Model will fit comfortably" 
      : `Need ${(required - available).toFixed(1)}GB more VRAM`
  };
};
