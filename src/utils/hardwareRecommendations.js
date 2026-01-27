// Hardware Recommendation Engine
// Provides GPU, cloud, and deployment recommendations

/**
 * GPU Database with specs and pricing
 */
const GPU_DATABASE = {
  // Consumer GPUs
  'rtx-3060-12gb': {
    name: 'RTX 3060 12GB',
    vram: 12,
    tier: 'consumer',
    performance: 3,
    price: 300,
    availability: 'high',
    use_case: 'Development & small models',
    fp16_tflops: 13
  },
  'rtx-4060-ti-16gb': {
    name: 'RTX 4060 Ti 16GB',
    vram: 16,
    tier: 'consumer',
    performance: 4,
    price: 500,
    availability: 'high',
    use_case: 'Development & 7B models',
    fp16_tflops: 22
  },
  'rtx-3090': {
    name: 'RTX 3090 24GB',
    vram: 24,
    tier: 'prosumer',
    performance: 6,
    price: 1500,
    availability: 'medium',
    use_case: 'Development & 13B models',
    fp16_tflops: 35
  },
  'rtx-4090': {
    name: 'RTX 4090 24GB',
    vram: 24,
    tier: 'prosumer',
    performance: 8,
    price: 1600,
    availability: 'medium',
    use_case: 'Development & 13B models',
    fp16_tflops: 82
  },
  
  // Professional GPUs
  'a10': {
    name: 'NVIDIA A10 24GB',
    vram: 24,
    tier: 'professional',
    performance: 7,
    price: 4000,
    availability: 'high',
    use_case: 'Production inference',
    fp16_tflops: 31
  },
  'a10g': {
    name: 'NVIDIA A10G 24GB',
    vram: 24,
    tier: 'professional',
    performance: 7,
    price: 4500,
    availability: 'high',
    use_case: 'Cloud inference (AWS)',
    fp16_tflops: 35
  },
  'l4': {
    name: 'NVIDIA L4 24GB',
    vram: 24,
    tier: 'professional',
    performance: 7,
    price: 5000,
    availability: 'high',
    use_case: 'Cloud inference (GCP)',
    fp16_tflops: 30
  },
  'a100-40gb': {
    name: 'NVIDIA A100 40GB',
    vram: 40,
    tier: 'enterprise',
    performance: 10,
    price: 10000,
    availability: 'medium',
    use_case: 'High-performance training/inference',
    fp16_tflops: 77
  },
  'a100-80gb': {
    name: 'NVIDIA A100 80GB',
    vram: 80,
    tier: 'enterprise',
    performance: 10,
    price: 15000,
    availability: 'medium',
    use_case: 'Large models & batching',
    fp16_tflops: 77
  },
  'h100': {
    name: 'NVIDIA H100 80GB',
    vram: 80,
    tier: 'enterprise',
    performance: 12,
    price: 30000,
    availability: 'low',
    use_case: 'Cutting-edge large models',
    fp16_tflops: 204
  }
};

/**
 * Cloud provider pricing (per hour)
 */
const CLOUD_PRICING = {
  aws: {
    't4': { gpu: 'T4 16GB', price: 0.526, name: 'g4dn.xlarge' },
    'a10g': { gpu: 'A10G 24GB', price: 1.006, name: 'g5.xlarge' },
    'a10g-4x': { gpu: '4x A10G 24GB', price: 5.672, name: 'g5.12xlarge' },
    'a100': { gpu: 'A100 40GB', price: 4.098, name: 'p4d.24xlarge (1/8)' }
  },
  gcp: {
    't4': { gpu: 'T4 16GB', price: 0.35, name: 'n1-standard-4 + T4' },
    'l4': { gpu: 'L4 24GB', price: 0.85, name: 'g2-standard-4' },
    'a100-40gb': { gpu: 'A100 40GB', price: 3.67, name: 'a2-highgpu-1g' },
    'a100-80gb': { gpu: 'A100 80GB', price: 4.89, name: 'a2-ultragpu-1g' }
  },
  azure: {
    't4': { gpu: 'T4 16GB', price: 0.526, name: 'NC4as T4 v3' },
    'a10': { gpu: 'A10 24GB', price: 1.22, name: 'NVadsA10 v5' },
    'a100': { gpu: 'A100 80GB', price: 3.67, name: 'NC24ads A100 v4' }
  },
  together: {
    'inference': { gpu: 'Shared Infrastructure', price: 0.0002, name: 'per 1K tokens', unit: 'tokens' }
  },
  replicate: {
    'inference': { gpu: 'Various GPUs', price: 0.0002, name: 'per 1K tokens', unit: 'tokens' }
  },
  huggingface: {
    'inference': { gpu: 'Shared Infrastructure', price: 0.0006, name: 'per 1K tokens', unit: 'tokens' }
  }
};

/**
 * Get GPU recommendations based on VRAM requirements
 * @param {number} requiredVRAM - Required VRAM in GB
 * @param {string} useCase - Use case type
 * @returns {array} Recommended GPUs
 */
export const getGPURecommendations = (requiredVRAM, useCase = 'inference') => {
  const margin = 1.3; // 30% overhead for safety
  const targetVRAM = requiredVRAM * margin;
  
  // Find suitable GPUs
  const suitable = Object.entries(GPU_DATABASE)
    .filter(([_, gpu]) => gpu.vram >= targetVRAM)
    .map(([id, gpu]) => ({
      id,
      ...gpu,
      utilization: ((requiredVRAM / gpu.vram) * 100).toFixed(0),
      pricePerformance: (gpu.price / gpu.performance).toFixed(0)
    }))
    .sort((a, b) => a.price - b.price);
  
  return {
    recommended: suitable.slice(0, 3),
    budget: suitable.filter(g => g.tier === 'consumer' || g.tier === 'prosumer')[0],
    professional: suitable.filter(g => g.tier === 'professional')[0],
    enterprise: suitable.filter(g => g.tier === 'enterprise')[0],
    allOptions: suitable
  };
};

/**
 * Calculate cloud costs
 * @param {number} vram - VRAM requirements
 * @param {number} hoursPerMonth - Usage hours per month
 * @returns {object} Cost breakdown
 */
export const calculateCloudCosts = (vram, hoursPerMonth = 730) => {
  const costs = {};
  
  // Find appropriate instance for each provider
  Object.entries(CLOUD_PRICING).forEach(([provider, instances]) => {
    const suitable = Object.entries(instances)
      .map(([key, instance]) => {
        // Extract VRAM from GPU name
        const vramMatch = instance.gpu.match(/(\d+)GB/);
        const instanceVRAM = vramMatch ? parseInt(vramMatch[1]) : 999;
        
        return {
          key,
          ...instance,
          vram: instanceVRAM,
          monthlyCost: instance.price * hoursPerMonth
        };
      })
      .filter(inst => inst.vram >= vram)
      .sort((a, b) => a.monthlyCost - b.monthlyCost);
    
    if (suitable.length > 0) {
      costs[provider] = suitable[0];
    }
  });
  
  return costs;
};

/**
 * Calculate API vs Self-Hosted costs
 * @param {number} tokensPerMonth - Expected tokens per month
 * @param {number} vram - VRAM requirements
 * @returns {object} Cost comparison
 */
export const compareDeploymentCosts = (tokensPerMonth, vram) => {
  // API costs (per 1K tokens)
  const apiCosts = {
    together: {
      name: 'Together AI',
      costPer1K: 0.0002,
      monthly: (tokensPerMonth / 1000) * 0.0002,
      pros: ['No setup', 'Auto-scaling', 'Pay per use'],
      cons: ['Data privacy', 'Latency', 'Vendor lock-in']
    },
    replicate: {
      name: 'Replicate',
      costPer1K: 0.0002,
      monthly: (tokensPerMonth / 1000) * 0.0002,
      pros: ['Easy deployment', 'Flexible', 'Good DX'],
      cons: ['Cold starts', 'Cost at scale']
    },
    openai: {
      name: 'OpenAI API',
      costPer1K: 0.002, // GPT-3.5 Turbo pricing
      monthly: (tokensPerMonth / 1000) * 0.002,
      pros: ['Best quality', 'No infra', 'Reliable'],
      cons: ['Expensive', 'No customization', 'Rate limits']
    }
  };
  
  // Self-hosted costs
  const cloudCosts = calculateCloudCosts(vram, 730);
  const cheapestCloud = Object.values(cloudCosts).sort((a, b) => a.monthlyCost - b.monthlyCost)[0];
  
  const selfHosted = {
    cloud: {
      name: 'Cloud GPU (24/7)',
      setup: cheapestCloud?.name || 'N/A',
      monthly: cheapestCloud?.monthlyCost || 0,
      pros: ['Full control', 'Custom models', 'Predictable cost'],
      cons: ['Management overhead', 'Fixed cost', 'DevOps required']
    },
    dedicated: {
      name: 'Dedicated Server',
      setup: 'Own hardware',
      monthly: 0,
      upfront: 5000, // Rough estimate
      pros: ['No ongoing cost', 'Full control', 'No vendor lock-in'],
      cons: ['High upfront', 'Maintenance', 'Power costs']
    }
  };
  
  // Calculate break-even point
  const breakEven = {
    vsAPI: cheapestCloud ? (cheapestCloud.monthlyCost / apiCosts.together.monthly).toFixed(1) : 'N/A',
    months: cheapestCloud ? (5000 / cheapestCloud.monthlyCost).toFixed(1) : 'N/A'
  };
  
  return {
    apiCosts,
    selfHosted,
    breakEven,
    recommendation: getDeploymentRecommendation(tokensPerMonth, cheapestCloud?.monthlyCost)
  };
};

/**
 * Get deployment recommendation
 */
const getDeploymentRecommendation = (tokensPerMonth, cloudMonthlyCost) => {
  const apiMonthlyCost = (tokensPerMonth / 1000) * 0.0002;
  
  if (!cloudMonthlyCost) {
    return {
      type: 'api',
      reason: 'Start with API - Low initial investment'
    };
  }
  
  if (tokensPerMonth < 1000000) {
    return {
      type: 'api',
      reason: 'Low volume - API is more cost-effective'
    };
  } else if (apiMonthlyCost < cloudMonthlyCost * 0.5) {
    return {
      type: 'api',
      reason: 'API still cheaper at this scale'
    };
  } else if (apiMonthlyCost < cloudMonthlyCost * 2) {
    return {
      type: 'hybrid',
      reason: 'Consider hybrid: API for spikes, self-hosted for base load'
    };
  } else {
    return {
      type: 'self-hosted',
      reason: 'High volume - Self-hosting is more economical'
    };
  }
};

/**
 * Calculate batch size recommendations
 * @param {number} availableVRAM - Available VRAM in GB
 * @param {number} modelVRAM - Model VRAM requirement in GB
 * @param {number} contextLength - Context length
 * @returns {object} Batch recommendations
 */
export const calculateBatchSizeRecommendations = (availableVRAM, modelVRAM, contextLength) => {
  // Simplified calculation
  const baseVRAM = parseFloat(modelVRAM);
  const overhead = availableVRAM - baseVRAM;
  
  // KV cache scales with context and batch size
  const kvCachePerSample = (contextLength * 0.002); // Rough estimate: 2MB per 1K tokens
  
  const maxBatchSize = Math.floor(overhead / kvCachePerSample);
  
  return {
    recommended: Math.max(1, Math.floor(maxBatchSize * 0.7)), // 70% utilization
    maximum: Math.max(1, maxBatchSize),
    conservative: Math.max(1, Math.floor(maxBatchSize * 0.5)),
    aggressive: Math.max(1, Math.floor(maxBatchSize * 0.9)),
    note: maxBatchSize < 4 ? 'Limited headroom - consider larger GPU for batching' : null
  };
};

/**
 * Estimate throughput
 * @param {object} gpuInfo - GPU information
 * @param {number} batchSize - Batch size
 * @returns {object} Throughput estimates
 */
export const estimateThroughput = (gpuInfo, batchSize = 1) => {
  // Very rough estimates based on GPU performance
  const baseTokensPerSec = gpuInfo.performance * 10; // Rough multiplier
  const batchMultiplier = Math.sqrt(batchSize); // Sublinear scaling
  
  const tokensPerSecond = baseTokensPerSec * batchMultiplier;
  
  return {
    tokensPerSecond: Math.round(tokensPerSecond),
    requestsPerSecond: (tokensPerSecond / 512).toFixed(2), // Assuming 512 tokens per request
    dailyTokens: Math.round(tokensPerSecond * 60 * 60 * 24),
    note: 'Estimates - actual performance varies by model and optimization'
  };
};

/**
 * Multi-GPU recommendations
 * @param {number} modelVRAM - Model VRAM in GB
 * @returns {object} Multi-GPU configs
 */
export const getMultiGPURecommendations = (modelVRAM) => {
  if (modelVRAM <= 24) {
    return {
      needed: false,
      message: 'Single GPU sufficient',
      alternatives: []
    };
  }
  
  const configs = [];
  
  if (modelVRAM <= 48) {
    configs.push({
      gpus: 2,
      model: 'A100 40GB',
      totalVRAM: 80,
      strategy: 'Tensor Parallelism',
      cost: 'High',
      complexity: 'Medium'
    });
  }
  
  if (modelVRAM <= 80) {
    configs.push({
      gpus: 1,
      model: 'A100 80GB',
      totalVRAM: 80,
      strategy: 'Single GPU',
      cost: 'High',
      complexity: 'Low'
    });
  }
  
  if (modelVRAM > 80) {
    const gpusNeeded = Math.ceil(modelVRAM / 80);
    configs.push({
      gpus: gpusNeeded,
      model: 'A100 80GB',
      totalVRAM: gpusNeeded * 80,
      strategy: 'Tensor Parallelism',
      cost: 'Very High',
      complexity: 'High'
    });
  }
  
  return {
    needed: true,
    message: `Model requires ${modelVRAM}GB - multi-GPU setup needed`,
    configurations: configs
  };
};