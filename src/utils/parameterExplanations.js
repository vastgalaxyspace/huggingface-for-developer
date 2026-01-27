// Complete Parameter Explanation Database
// This is the knowledge base that powers the entire app

export const parameterExplanations = {
  
  // ========================================
  // CATEGORY 1: ARCHITECTURE & IDENTITY
  // ========================================
  
  model_type: {
    icon: "Database",
    label: "Model Architecture",
    category: "Architecture",
    color: "purple",
    explanation: "The underlying neural network architecture (e.g., GPT, LLAMA, BERT, Mistral). This determines the model's fundamental design and capabilities.",
    devNote: "Critical for compatibility. Different architectures require different inference engines and have different optimization strategies.",
    impact: "Framework Compatibility",
    importance: "critical",
    goodValues: ["llama", "mistral", "phi", "gemma", "qwen", "falcon"],
    example: "model_type: 'llama' → Compatible with vLLM, Transformers, Ollama, TensorRT-LLM",
    deployment: {
      vllm: "Most architectures supported",
      transformers: "Universal support",
      ollama: "Popular architectures only"
    }
  },

  // ========================================
  // CATEGORY 2: MEMORY & DIMENSIONS
  // ========================================
  
  hidden_size: {
    icon: "Box",
    label: "Hidden Size / Embedding Dimension",
    category: "Memory",
    color: "blue",
    explanation: "The size of the internal representation vectors. Every token is converted into a vector of this size.",
    devNote: "Directly proportional to VRAM usage. Larger = more expressive representations but requires more memory.",
    impact: "VRAM & Memory Bandwidth",
    importance: "high",
    calculation: "VRAM ≈ (hidden_size × num_layers × 12) bytes per billion parameters",
    example: "hidden_size: 4096 → Each token uses 4096 floating point numbers → ~14GB VRAM for 7B model",
    values: {
      small: "< 2048 (Lightweight models)",
      medium: "2048-4096 (Standard 7B models)",
      large: "> 4096 (High-capacity models)"
    }
  },

  num_hidden_layers: {
    icon: "Layers",
    label: "Number of Transformer Layers",
    category: "Architecture",
    color: "indigo",
    explanation: "How many stacked transformer blocks process the input. More layers = deeper processing.",
    devNote: "More layers = better understanding of complex patterns but slower inference and higher memory.",
    impact: "Latency & Model Depth",
    importance: "high",
    example: "32 layers (7B model) vs 80 layers (70B model). Each layer adds ~30-50ms latency.",
    values: {
      small: "< 24 layers (Fast models)",
      medium: "24-40 layers (Standard)",
      large: "> 40 layers (Deep models)"
    },
    tradeoff: "Quality vs Speed: More layers = smarter but slower"
  },

  num_attention_heads: {
    icon: "Zap",
    label: "Number of Attention Heads",
    category: "Performance",
    color: "cyan",
    explanation: "How many parallel attention mechanisms run in each layer. Each head focuses on different patterns.",
    devNote: "More heads = better at capturing diverse relationships but requires more computation.",
    impact: "Parallelization & Quality",
    importance: "medium",
    example: "32 heads → Can simultaneously focus on syntax, semantics, context, and 29 other patterns",
    relationship: "Usually: num_attention_heads = hidden_size / head_dim (where head_dim = 128 or 256)"
  },

  num_key_value_heads: {
    icon: "Zap",
    label: "Key-Value Heads (GQA)",
    category: "Performance",
    color: "teal",
    explanation: "For Grouped Query Attention (GQA): separate, fewer heads for keys/values vs queries.",
    devNote: "Optimization technique: Fewer KV heads = much faster inference with minimal quality loss.",
    impact: "Inference Speed Optimization",
    importance: "high",
    example: "8 KV heads + 32 query heads → 4x faster than full Multi-Head Attention (MHA)",
    recommendation: "If num_key_value_heads < num_attention_heads → Model uses GQA → Faster inference!",
    values: {
      mha: "num_key_value_heads = num_attention_heads (Standard MHA)",
      gqa: "num_key_value_heads < num_attention_heads (Optimized GQA)",
      mqa: "num_key_value_heads = 1 (Extreme optimization)"
    }
  },

  // ========================================
  // CATEGORY 3: CONTEXT & TOKENS
  // ========================================
  
  max_position_embeddings: {
    icon: "FileText",
    label: "Maximum Context Length",
    category: "Context",
    color: "green",
    explanation: "Maximum number of tokens the model can process in a single forward pass. This is your context window.",
    devNote: "YOUR HARD LIMIT. Cannot exceed this in RAG, conversations, or prompts. Plan chunk sizes accordingly.",
    impact: "Context Window / RAG Design",
    importance: "critical",
    example: "4096 tokens ≈ 3000 words | 32768 tokens ≈ 24,000 words | 128k tokens ≈ 96,000 words",
    ragImplications: {
      4096: "Small chunks, aggressive summarization needed",
      8192: "Moderate chunks, standard RAG",
      32768: "Large documents, multi-turn conversations",
      131072: "Entire codebases, long documents"
    },
    warning: "Models may degrade in quality near max length. Use 70-80% as safe limit."
  },

  vocab_size: {
    icon: "Book",
    label: "Vocabulary Size",
    category: "Tokenization",
    color: "yellow",
    explanation: "Number of unique tokens in the tokenizer's vocabulary.",
    devNote: "Larger vocab = better multilingual support and code handling, but slower embedding lookup.",
    impact: "Tokenization Efficiency",
    importance: "medium",
    example: "32,000 → Standard English-focused | 100,000+ → Multilingual/Code-optimized",
    values: {
      small: "< 50k (English-focused)",
      medium: "50k-100k (Multilingual)",
      large: "> 100k (Code + Multilingual)"
    }
  },

  // ========================================
  // CATEGORY 4: ADVANCED FEATURES
  // ========================================
  
  rope_theta: {
    icon: "Settings",
    label: "RoPE Theta (Positional Encoding)",
    category: "Advanced",
    color: "orange",
    explanation: "Base frequency for Rotary Position Embeddings. Affects how the model understands token positions.",
    devNote: "Higher theta = better long-context performance. Modified for extended context windows.",
    impact: "Long Context Stability",
    importance: "low",
    example: "10,000 (standard) | 1,000,000 (extended context models)",
    when_to_care: "Only relevant if you're using near-max context length or fine-tuning"
  },

  rope_scaling: {
    icon: "Maximize",
    label: "RoPE Scaling Configuration",
    category: "Advanced",
    color: "red",
    explanation: "How positional embeddings are scaled to support longer contexts than the model was trained on.",
    devNote: "Allows models to handle contexts beyond their training length, but may reduce quality.",
    impact: "Extended Context Support",
    importance: "medium",
    example: "type: 'linear', factor: 2.0 → Doubles effective context length",
    types: {
      linear: "Simple scaling (quality degrades)",
      dynamic: "Adaptive scaling (better quality)",
      yarn: "Advanced scaling (best for long context)"
    }
  },

  sliding_window: {
    icon: "Columns",
    label: "Sliding Window Attention",
    category: "Performance",
    color: "pink",
    explanation: "Local attention pattern where each token only attends to nearby tokens within a window.",
    devNote: "Trades global context for speed. Great for code and structured data.",
    impact: "Memory Efficiency",
    importance: "medium",
    example: "sliding_window: 4096 → Each token only sees 4096 nearest tokens → 2-4x faster",
    use_cases: ["Code generation", "Long documents", "Streaming applications"]
  },

  // ========================================
  // CATEGORY 5: MIXTURE OF EXPERTS (MoE)
  // ========================================
  
  num_experts: {
    icon: "Users",
    label: "Number of Experts (MoE)",
    category: "Architecture",
    color: "violet",
    explanation: "For Mixture of Experts models: how many specialized sub-networks exist.",
    devNote: "MoE models are huge on disk but only activate a few experts per token → efficient inference.",
    impact: "Model Size vs Active Parameters",
    importance: "high",
    example: "8 experts, 2 active → 56B total params, only 14B active per token",
    deployment: "Requires special support (vLLM, Transformers with MoE support)"
  },

  num_experts_per_tok: {
    icon: "Target",
    label: "Active Experts Per Token",
    category: "Performance",
    color: "fuchsia",
    explanation: "How many experts are activated for each token in MoE models.",
    devNote: "Lower = faster and more efficient. Usually 1-2 experts per token.",
    impact: "Inference Speed",
    importance: "medium",
    example: "2 experts per token from pool of 8 → Only 25% of model active at once"
  },

  // ========================================
  // CATEGORY 6: QUANTIZATION
  // ========================================
  
  quantization_config: {
    icon: "Minimize",
    label: "Quantization Configuration",
    category: "Optimization",
    color: "emerald",
    explanation: "How model weights are compressed (FP16 → INT8 → INT4) to reduce memory and speed up inference.",
    devNote: "Critical for deployment. INT8 = 2x smaller, INT4 = 4x smaller with minimal quality loss.",
    impact: "VRAM & Inference Speed",
    importance: "critical",
    formats: {
      fp16: "Full precision - 14GB for 7B model",
      int8: "Half size - 7GB for 7B model - 5-10% quality loss",
      int4: "Quarter size - 4GB for 7B model - 10-15% quality loss",
      gptq: "Popular format for INT4",
      awq: "Better quality INT4",
      gguf: "For Ollama/llama.cpp"
    },
    recommendation: "INT8 for production (best quality/size tradeoff), INT4 for edge devices"
  },

  // ========================================
  // CATEGORY 7: GENERATION CONFIG
  // ========================================
  
  max_new_tokens: {
    icon: "Type",
    label: "Maximum Generation Length",
    category: "Generation",
    color: "sky",
    explanation: "Default maximum number of tokens the model will generate in a single response.",
    devNote: "Can be overridden at inference time. Set based on your use case.",
    impact: "Response Length Control",
    importance: "low",
    example: "512 tokens ≈ 400 words (short answers) | 2048 tokens ≈ 1500 words (detailed responses)"
  },

  temperature: {
    icon: "Thermometer",
    label: "Default Temperature",
    category: "Generation",
    color: "amber",
    explanation: "Controls randomness in generation. Lower = more focused, higher = more creative.",
    devNote: "Usually overridden at inference time, but shows model's intended use case.",
    impact: "Output Determinism",
    importance: "low",
    values: {
      low: "0.1-0.3 (Factual, deterministic)",
      medium: "0.7-0.9 (Balanced)",
      high: "1.0+ (Creative, diverse)"
    }
  },

  top_p: {
    icon: "Filter",
    label: "Nucleus Sampling (Top-p)",
    category: "Generation",
    color: "lime",
    explanation: "Samples from smallest set of tokens whose cumulative probability exceeds p.",
    devNote: "Alternative to temperature. 0.9 is common. Lower = more focused.",
    impact: "Output Quality",
    importance: "low",
    example: "top_p: 0.9 → Only consider tokens that make up 90% of probability mass"
  },

  // ========================================
  // CATEGORY 8: SPECIAL TOKENS
  // ========================================
  
  bos_token_id: {
    icon: "Play",
    label: "Beginning of Sequence Token",
    category: "Tokenization",
    color: "rose",
    explanation: "Special token ID that marks the start of a sequence.",
    devNote: "Must be added to beginning of prompts. Different models use different BOS tokens.",
    impact: "Prompt Formatting",
    importance: "medium",
    example: "1 for Llama, <s> for some models"
  },

  eos_token_id: {
    icon: "Square",
    label: "End of Sequence Token",
    category: "Tokenization",
    color: "red",
    explanation: "Special token ID that signals the model to stop generating.",
    devNote: "Critical for stopping generation. Multiple EOS tokens possible.",
    impact: "Generation Control",
    importance: "medium",
    example: "2 for Llama, </s> for most models. Can be array: [2, 128001]"
  },

  pad_token_id: {
    icon: "Space",
    label: "Padding Token",
    category: "Tokenization",
    color: "gray",
    explanation: "Token used to pad sequences to equal length in batched inference.",
    devNote: "Required for batch processing. Often same as EOS token.",
    impact: "Batch Inference",
    importance: "low",
    example: "Ensures all sequences in batch are same length"
  },

  // ========================================
  // CATEGORY 9: TRAINING INFO
  // ========================================
  
  torch_dtype: {
    icon: "Cpu",
    label: "Default Tensor Data Type",
    category: "Technical",
    color: "slate",
    explanation: "The precision format weights are stored in.",
    devNote: "float16/bfloat16 = standard. bfloat16 better for training, float16 better for inference.",
    impact: "Memory & Precision",
    importance: "low",
    values: {
      float32: "Full precision - Rarely used",
      float16: "Half precision - Standard for inference",
      bfloat16: "Brain Float - Good for training & inference"
    }
  },

  use_cache: {
    icon: "Database",
    label: "KV Cache Enabled",
    category: "Performance",
    color: "indigo",
    explanation: "Whether the model caches key-value pairs during generation.",
    devNote: "Should always be True for autoregressive generation. Dramatically speeds up inference.",
    impact: "Generation Speed",
    importance: "medium",
    example: "True → Each token generation reuses previous computations → 10x+ faster"
  }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

export const getParametersByCategory = () => {
  const categories = {};
  
  Object.entries(parameterExplanations).forEach(([key, value]) => {
    const category = value.category || 'Other';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push({ key, ...value });
  });
  
  return categories;
};

export const getCriticalParameters = () => {
  return Object.entries(parameterExplanations)
    .filter(([_, value]) => value.importance === 'critical')
    .map(([key, value]) => ({ key, ...value }));
};

export const getParameterExplanation = (paramName) => {
  return parameterExplanations[paramName] || {
    label: paramName,
    explanation: "Parameter documentation not yet available",
    importance: "low"
  };
};