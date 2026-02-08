// VRAM Estimation Calculator
// Calculates memory requirements for different precision levels

/**
 * Calculate VRAM requirements for a model
 * @param {object} config - Model configuration
 * @returns {object} VRAM estimates in GB for different precisions (as Numbers)
 */
export const calculateVRAM = (config) => {
  // Extract key parameters
  const hiddenSize = config.hidden_size || 4096;
  const numLayers = config.num_hidden_layers || 32;
  const vocabSize = config.vocab_size || 32000;
  
  // Estimate total parameters (billions)
  // Formula: approximate params = (hidden_size^2 * num_layers * 12) + (vocab_size * hidden_size)
  const embeddingParams = (vocabSize * hiddenSize) / 1e9;
  const transformerParams = (hiddenSize * hiddenSize * numLayers * 12) / 1e9;
  const totalParams = embeddingParams + transformerParams;
  
  // Calculate VRAM for different precisions
  // Each parameter needs: FP32=4 bytes, FP16=2 bytes, INT8=1 byte, INT4=0.5 bytes
  // Add 20% overhead for activations and KV cache
  const overhead = 1.2;
  
  // UPDATED: Returning raw numbers to prevent logic errors in other components
  const vramEstimates = {
    fp32: Number((totalParams * 4 * overhead).toFixed(1)),
    fp16: Number((totalParams * 2 * overhead).toFixed(1)),
    int8: Number((totalParams * 1 * overhead).toFixed(1)),
    int4: Number((totalParams * 0.5 * overhead).toFixed(1)),
    totalParams: Number(totalParams.toFixed(1))
  };
  
  return vramEstimates;
};

/**
 * Get recommended GPU for a model
 * @param {number|string} vramGB - VRAM requirement in GB
 * @returns {object} GPU recommendation
 */
export const getGPURecommendation = (vramGB) => {
  const vram = parseFloat(vramGB);
  
  if (vram <= 4) {
    return {
      tier: "Consumer",
      gpus: ["RTX 3060 (12GB)", "RTX 4060 Ti (16GB)"],
      cloud: "T4 (AWS, GCP)",
      cost: "$0.50-1/hour"
    };
  } else if (vram <= 8) {
    return {
      tier: "Prosumer",
      gpus: ["RTX 3090 (24GB)", "RTX 4090 (24GB)"],
      cloud: "L4 (GCP), g5.xlarge (AWS)",
      cost: "$1-2/hour"
    };
  } else if (vram <= 16) {
    return {
      tier: "Professional",
      gpus: ["A10 (24GB)", "RTX A6000 (48GB)"],
      cloud: "A10 (AWS, GCP)",
      cost: "$2-4/hour"
    };
  } else if (vram <= 24) {
    return {
      tier: "Enterprise",
      gpus: ["A100 (40GB)", "A100 (80GB)"],
      cloud: "A100 (all clouds)",
      cost: "$4-8/hour"
    };
  } else if (vram <= 40) {
    return {
      tier: "High-End",
      gpus: ["A100 (80GB)", "H100 (80GB)"],
      cloud: "A100 80GB, H100",
      cost: "$8-15/hour"
    };
  } else {
    return {
      tier: "Multi-GPU",
      gpus: ["2x A100", "4x A100", "H100 cluster"],
      cloud: "Multi-GPU instances",
      cost: "$15+/hour"
    };
  }
};

/**
 * Calculate context length impact on VRAM
 * @param {number|string} baseVRAM - Base VRAM in GB
 * @param {number} contextLength - Context window size
 * @param {number} batchSize - Batch size
 * @returns {object} Adjusted VRAM estimates
 */
export const calculateContextVRAM = (baseVRAM, contextLength, batchSize = 1) => {
  const kvCacheOverhead = (contextLength * batchSize * 0.002); // GB
  const parsedBase = parseFloat(baseVRAM);
  
  return {
    baseVRAM: parsedBase,
    kvCache: Number(kvCacheOverhead.toFixed(1)),
    total: Number((parsedBase + kvCacheOverhead).toFixed(1)),
    warning: contextLength > 8192 ? "High context increases memory significantly" : null
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