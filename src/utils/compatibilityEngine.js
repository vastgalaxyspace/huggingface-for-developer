// Compatibility Analysis Engine
// Determines model compatibility with various frameworks and hardware

/**
 * Analyze complete compatibility for a model
 * @param {object} modelData - Full model data
 * @returns {object} Compatibility analysis
 */
export const analyzeCompatibility = (modelData) => {
  return {
    frameworks: analyzeFrameworkCompatibility(modelData),
    hardware: analyzeHardwareCompatibility(modelData),
    quantization: analyzeQuantizationSupport(modelData),
    features: analyzeFeatureSupport(modelData),
    deployment: analyzeDeploymentOptions(modelData)
  };
};

/**
 * Framework Compatibility Analysis
 */
const analyzeFrameworkCompatibility = (modelData) => {
  const modelType = modelData.config?.model_type?.toLowerCase();
  const architectures = modelData.config?.architectures || [];
  
  const frameworks = {
    transformers: {
      name: 'Transformers (HuggingFace)',
      icon: '🤗',
      compatible: true, // Universal
      confidence: 100,
      notes: ['Official HuggingFace library', 'Best compatibility'],
      installCmd: 'pip install transformers torch',
      docs: 'https://huggingface.co/docs/transformers'
    },
    
    vllm: {
      name: 'vLLM',
      icon: '⚡',
      compatible: checkVLLMCompatibility(modelType, architectures),
      confidence: getVLLMConfidence(modelType),
      notes: getVLLMNotes(modelType),
      installCmd: 'pip install vllm',
      docs: 'https://docs.vllm.ai'
    },
    
    ollama: {
      name: 'Ollama',
      icon: '🦙',
      compatible: checkOllamaCompatibility(modelType, modelData),
      confidence: getOllamaConfidence(modelData),
      notes: getOllamaNotes(modelData),
      installCmd: 'curl -fsSL https://ollama.ai/install.sh | sh',
      docs: 'https://ollama.ai'
    },
    
    llamacpp: {
      name: 'llama.cpp',
      icon: '💻',
      compatible: checkLlamaCppCompatibility(modelType),
      confidence: getLlamaCppConfidence(modelType),
      notes: getLlamaCppNotes(modelType),
      installCmd: 'pip install llama-cpp-python',
      docs: 'https://github.com/ggerganov/llama.cpp'
    },
    
    tensorrt: {
      name: 'TensorRT-LLM',
      icon: '🚀',
      compatible: checkTensorRTCompatibility(modelType),
      confidence: getTensorRTConfidence(modelType),
      notes: getTensorRTNotes(modelType),
      installCmd: 'See NVIDIA TensorRT-LLM docs',
      docs: 'https://github.com/NVIDIA/TensorRT-LLM'
    }
  };
  
  return frameworks;
};

// vLLM compatibility checks
const checkVLLMCompatibility = (modelType, architectures) => {
  const supportedTypes = ['llama', 'mistral', 'qwen', 'phi', 'gemma', 'yi', 'deepseek'];
  return supportedTypes.includes(modelType);
};

const getVLLMConfidence = (modelType) => {
  const highSupport = ['llama', 'mistral'];
  const mediumSupport = ['qwen', 'phi', 'gemma'];
  if (highSupport.includes(modelType)) return 95;
  if (mediumSupport.includes(modelType)) return 85;
  return 50;
};

const getVLLMNotes = (modelType) => {
  const notes = ['High-performance inference', 'Continuous batching'];
  if (['llama', 'mistral'].includes(modelType)) {
    notes.push('Excellent support');
  } else if (modelType) {
    notes.push('Check vLLM docs for version compatibility');
  } else {
    notes.push('Unknown architecture - may need testing');
  }
  return notes;
};

// Ollama compatibility
const checkOllamaCompatibility = (modelType, modelData) => {
  const commonTypes = ['llama', 'mistral', 'phi', 'gemma'];
  const popular = modelData.downloads > 1000000;
  return commonTypes.includes(modelType) || popular;
};

const getOllamaConfidence = (modelData) => {
  const modelId = modelData.modelId.toLowerCase();
  if (modelId.includes('llama') || modelId.includes('mistral')) return 90;
  if (modelData.downloads > 1000000) return 75;
  return 50;
};

const getOllamaNotes = (modelData) => {
  const notes = ['Easy local deployment', 'Built-in model management'];
  if (modelData.downloads > 5000000) {
    notes.push('Likely available in Ollama library');
  } else {
    notes.push('May need custom import');
  }
  return notes;
};

// llama.cpp compatibility
const checkLlamaCppCompatibility = (modelType) => {
  return true; // Most models can be converted
};

const getLlamaCppConfidence = (modelType) => {
  if (['llama', 'mistral', 'phi'].includes(modelType)) return 95;
  return 75;
};

const getLlamaCppNotes = (modelType) => {
  return [
    'CPU inference capable',
    'GGUF format conversion needed',
    'Excellent for local/edge deployment'
  ];
};

// TensorRT-LLM compatibility
const checkTensorRTCompatibility = (modelType) => {
  const supportedTypes = ['llama', 'gpt', 'bloom', 'chatglm'];
  return supportedTypes.includes(modelType);
};

const getTensorRTConfidence = (modelType) => {
  if (['llama', 'gpt'].includes(modelType)) return 85;
  return 60;
};

const getTensorRTNotes = (modelType) => {
  return [
    'NVIDIA GPUs only',
    'Fastest inference performance',
    'Requires conversion process'
  ];
};

/**
 * Hardware Compatibility Analysis
 */
const analyzeHardwareCompatibility = (modelData) => {
  const vram = parseFloat(modelData.vramEstimates?.fp16 || 999);
  const vramInt8 = parseFloat(modelData.vramEstimates?.int8 || 999);
  
  const hardware = {
    consumer: {
      name: 'Consumer GPUs',
      icon: '🎮',
      options: getConsumerGPUOptions(vram, vramInt8),
      compatible: vram <= 24,
      recommendation: vram <= 24 ? 'Compatible with high-end consumer cards' : 'Requires professional/server GPUs'
    },
    
    professional: {
      name: 'Professional GPUs',
      icon: '💼',
      options: getProfessionalGPUOptions(vram),
      compatible: true,
      recommendation: 'All professional GPUs can run this model'
    },
    
    cloud: {
      name: 'Cloud Providers',
      icon: '☁️',
      options: getCloudOptions(vram),
      compatible: true,
      recommendation: 'Available on all major cloud platforms'
    },
    
    cpu: {
      name: 'CPU Inference',
      icon: '🖥️',
      compatible: vramInt8 <= 16,
      performance: vramInt8 <= 8 ? 'Moderate' : vramInt8 <= 16 ? 'Slow' : 'Very Slow',
      recommendation: vramInt8 <= 8 
        ? 'Feasible with quantization' 
        : 'Not recommended for production'
    }
  };
  
  return hardware;
};

const getConsumerGPUOptions = (vram, vramInt8) => {
  const options = [];
  
  if (vramInt8 <= 12) {
    options.push({ name: 'RTX 3060 12GB', format: 'INT8', feasible: true });
    options.push({ name: 'RTX 4060 Ti 16GB', format: 'INT8', feasible: true });
  }
  
  if (vram <= 24) {
    options.push({ name: 'RTX 3090 24GB', format: 'FP16', feasible: true });
    options.push({ name: 'RTX 4090 24GB', format: 'FP16', feasible: true });
  }
  
  if (options.length === 0) {
    options.push({ name: 'Multi-GPU setup required', format: 'N/A', feasible: false });
  }
  
  return options;
};

const getProfessionalGPUOptions = (vram) => {
  const options = [];
  
  if (vram <= 24) {
    options.push({ name: 'A10 24GB', suitable: true });
    options.push({ name: 'L4 24GB', suitable: true });
  }
  
  if (vram <= 40) {
    options.push({ name: 'A100 40GB', suitable: true });
  }
  
  if (vram <= 80) {
    options.push({ name: 'A100 80GB', suitable: true });
    options.push({ name: 'H100 80GB', suitable: true });
  }
  
  if (vram > 80) {
    options.push({ name: 'Multi-GPU A100/H100', suitable: true });
  }
  
  return options;
};

const getCloudOptions = (vram) => {
  const options = [];
  
  if (vram <= 16) {
    options.push({ provider: 'AWS', instance: 'g5.xlarge (A10G)', price: '~$1/hr' });
    options.push({ provider: 'GCP', instance: 'g2-standard-4 (L4)', price: '~$0.85/hr' });
  }
  
  if (vram <= 24) {
    options.push({ provider: 'AWS', instance: 'g5.2xlarge (A10G)', price: '~$1.5/hr' });
    options.push({ provider: 'Azure', instance: 'NC A10 v5', price: '~$1.2/hr' });
  }
  
  if (vram <= 40) {
    options.push({ provider: 'AWS', instance: 'p4d.24xlarge (A100)', price: '~$4/hr' });
    options.push({ provider: 'GCP', instance: 'a2-highgpu-1g (A100)', price: '~$3.7/hr' });
  }
  
  return options;
};

/**
 * Quantization Support Analysis
 */
const analyzeQuantizationSupport = (modelData) => {
  const formats = {
    fp16: {
      name: 'FP16 (Half Precision)',
      supported: true,
      vram: modelData.vramEstimates?.fp16 + 'GB',
      quality: '100% (reference)',
      notes: ['Full precision', 'Best quality', 'Standard deployment']
    },
    
    int8: {
      name: 'INT8 (8-bit)',
      supported: true,
      vram: modelData.vramEstimates?.int8 + 'GB',
      quality: '~95-98%',
      notes: ['2x smaller', 'Minimal quality loss', 'Production ready']
    },
    
    int4: {
      name: 'INT4 (4-bit)',
      supported: true,
      vram: modelData.vramEstimates?.int4 + 'GB',
      quality: '~85-92%',
      notes: ['4x smaller', 'Noticeable quality loss', 'Good for inference']
    },
    
    gguf: {
      name: 'GGUF (llama.cpp)',
      supported: checkGGUFAvailability(modelData),
      vram: 'Varies by quant',
      quality: 'Varies (Q2-Q8)',
      notes: ['CPU compatible', 'Flexible quantization', 'Check HF for GGUF files']
    },
    
    gptq: {
      name: 'GPTQ',
      supported: checkGPTQAvailability(modelData),
      vram: '~' + modelData.vramEstimates?.int4 + 'GB',
      quality: '~90%',
      notes: ['GPU optimized', 'Popular format', 'AutoGPTQ support']
    },
    
    awq: {
      name: 'AWQ',
      supported: checkAWQAvailability(modelData),
      vram: '~' + modelData.vramEstimates?.int4 + 'GB',
      quality: '~92%',
      notes: ['Better quality than GPTQ', 'vLLM compatible', 'Check HF for AWQ versions']
    }
  };
  
  return formats;
};

const checkGGUFAvailability = (modelData) => {
  const modelId = modelData.modelId.toLowerCase();
  return modelId.includes('gguf') || modelData.downloads > 500000;
};

const checkGPTQAvailability = (modelData) => {
  return modelData.modelId.toLowerCase().includes('gptq');
};

const checkAWQAvailability = (modelData) => {
  return modelData.modelId.toLowerCase().includes('awq');
};

/**
 * Feature Support Analysis
 */
const analyzeFeatureSupport = (modelData) => {
  const config = modelData.config || {};
  
  const features = {
    flashAttention: {
      name: 'Flash Attention',
      supported: config.use_cache !== false,
      benefit: '2-4x faster inference',
      notes: config.use_cache !== false 
        ? ['Reduces memory usage', 'Faster training/inference']
        : ['Not supported by this architecture']
    },
    
    gqa: {
      name: 'Grouped Query Attention (GQA)',
      supported: config.num_key_value_heads < config.num_attention_heads,
      benefit: config.num_key_value_heads < config.num_attention_heads 
        ? `${Math.round(config.num_attention_heads / config.num_key_value_heads)}x faster KV cache`
        : 'N/A',
      notes: config.num_key_value_heads < config.num_attention_heads
        ? ['Faster inference', 'Lower memory usage', 'Minimal quality impact']
        : ['Standard MHA - no optimization']
    },
    
    longContext: {
      name: 'Long Context Support',
      supported: config.max_position_embeddings >= 32768,
      benefit: `${(config.max_position_embeddings / 1000).toFixed(0)}k token window`,
      notes: config.max_position_embeddings >= 32768
        ? ['Great for RAG', 'Long documents', 'Extended conversations']
        : ['Standard context window']
    },
    
    ropeScaling: {
      name: 'RoPE Scaling',
      supported: !!config.rope_scaling,
      benefit: config.rope_scaling ? 'Extended context beyond training length' : 'N/A',
      notes: config.rope_scaling
        ? ['Can handle longer sequences', `Method: ${config.rope_scaling.type || 'unknown'}`]
        : ['Fixed context window']
    },
    
    slidingWindow: {
      name: 'Sliding Window Attention',
      supported: !!config.sliding_window,
      benefit: config.sliding_window ? 'Reduced memory for long sequences' : 'N/A',
      notes: config.sliding_window
        ? [`Window size: ${config.sliding_window}`, 'Memory efficient']
        : ['Full attention']
    }
  };
  
  return features;
};

/**
 * Deployment Options Analysis
 */
const analyzeDeploymentOptions = (modelData) => {
  const vram = parseFloat(modelData.vramEstimates?.fp16 || 999);
  const commercial = modelData.licenseInfo?.commercial === true;
  
  const options = {
    cloudAPI: {
      name: 'Managed API Services',
      suitable: true,
      providers: ['Together AI', 'Replicate', 'HuggingFace Inference'],
      pros: ['No infrastructure', 'Auto-scaling', 'Pay per use'],
      cons: ['Recurring costs', 'Data privacy concerns'],
      costEstimate: '$0.0002-0.002 per 1k tokens'
    },
    
    cloudGPU: {
      name: 'Cloud GPU Instances',
      suitable: commercial,
      providers: ['AWS', 'GCP', 'Azure', 'Lambda Labs'],
      pros: ['Full control', 'Custom models', 'Predictable costs'],
      cons: ['DevOps required', 'Higher complexity'],
      costEstimate: vram <= 24 ? '$1-2/hour' : '$4-8/hour'
    },
    
    selfHosted: {
      name: 'Self-Hosted',
      suitable: commercial,
      requirements: [`${vram}GB VRAM GPU`, 'Server infrastructure'],
      pros: ['One-time cost', 'Full control', 'Data privacy'],
      cons: ['High upfront', 'Maintenance', 'Power costs'],
      costEstimate: vram <= 24 ? '$2k-5k hardware' : '$10k-30k hardware'
    },
    
    edge: {
      name: 'Edge Deployment',
      suitable: vram <= 8,
      platforms: ['Mobile', 'IoT', 'Browser (WASM)'],
      pros: ['Offline capable', 'Low latency', 'Privacy'],
      cons: ['Limited performance', 'Quantization required'],
      recommendation: vram <= 4 ? 'Feasible with INT4' : 'Challenging'
    }
  };
  
  return options;
};

/**
 * Get compatibility summary
 */
export const getCompatibilitySummary = (compatibilityData) => {
  const { frameworks, hardware, quantization, features } = compatibilityData;
  
  const compatibleFrameworks = Object.values(frameworks).filter(f => f.compatible).length;
  const supportedFormats = Object.values(quantization).filter(q => q.supported).length;
  const advancedFeatures = Object.values(features).filter(f => f.supported).length;
  
  return {
    frameworkScore: (compatibleFrameworks / Object.keys(frameworks).length) * 100,
    quantizationScore: (supportedFormats / Object.keys(quantization).length) * 100,
    featureScore: (advancedFeatures / Object.keys(features).length) * 100,
    overallCompatibility: compatibleFrameworks >= 3 ? 'Excellent' : compatibleFrameworks >= 2 ? 'Good' : 'Limited'
  };
};