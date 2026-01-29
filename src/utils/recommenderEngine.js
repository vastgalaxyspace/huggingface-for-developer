// Smart Model Recommender Engine
// Analyzes user requirements and scores models

/**
 * Use case definitions with scoring weights
 */
const USE_CASES = {
  chat: {
    name: 'Conversational AI / Chatbot',
    icon: '💬',
    description: 'Customer support, virtual assistants, general chat',
    weights: { quality: 9, speed: 8, context: 7, cost: 6 },
    requirements: {
      minContextLength: 4096,
      preferredFeatures: ['chat_template', 'instruction_tuned'],
      benchmarks: ['mmlu', 'hellaswag']
    }
  },
  rag: {
    name: 'RAG / Document Analysis',
    icon: '📚',
    description: 'Question answering over documents, knowledge bases',
    weights: { context: 10, quality: 8, speed: 6, cost: 7 },
    requirements: {
      minContextLength: 16384,
      preferredFeatures: ['long_context', 'retrieval'],
      benchmarks: ['mmlu']
    }
  },
  code: {
    name: 'Code Generation / Assistant',
    icon: '💻',
    description: 'Code completion, debugging, code explanation',
    weights: { quality: 10, speed: 7, context: 8, cost: 6 },
    requirements: {
      minContextLength: 8192,
      preferredFeatures: ['code_trained', 'fill_in_middle'],
      benchmarks: ['humaneval', 'mbpp']
    }
  },
  analysis: {
    name: 'Text Analysis / Classification',
    icon: '🔍',
    description: 'Sentiment analysis, summarization, extraction',
    weights: { quality: 8, speed: 9, context: 6, cost: 8 },
    requirements: {
      minContextLength: 4096,
      preferredFeatures: ['instruction_tuned'],
      benchmarks: ['mmlu']
    }
  },
  creative: {
    name: 'Creative Writing',
    icon: '✍️',
    description: 'Story writing, content generation, brainstorming',
    weights: { quality: 10, context: 9, speed: 5, cost: 6 },
    requirements: {
      minContextLength: 8192,
      preferredFeatures: ['creative', 'high_temperature'],
      benchmarks: []
    }
  },
  research: {
    name: 'Research & Experimentation',
    icon: '🔬',
    description: 'Testing, research, learning about LLMs',
    weights: { quality: 7, speed: 5, context: 6, cost: 5 },
    requirements: {
      minContextLength: 2048,
      preferredFeatures: [],
      benchmarks: []
    }
  }
};

/**
 * Priority definitions
 */
const PRIORITIES = {
  speed: {
    name: 'Speed First',
    description: 'Low latency, high throughput',
    weights: { speed: 10, cost: 8, quality: 6, context: 5 }
  },
  quality: {
    name: 'Quality First',
    description: 'Best accuracy and capability',
    weights: { quality: 10, context: 8, speed: 5, cost: 4 }
  },
  balanced: {
    name: 'Balanced',
    description: 'Good mix of speed and quality',
    weights: { quality: 8, speed: 8, cost: 7, context: 7 }
  },
  cost: {
    name: 'Cost Efficient',
    description: 'Minimize hardware requirements',
    weights: { cost: 10, speed: 7, quality: 6, context: 5 }
  }
};

/**
 * Score a single model based on user requirements
 */
export const scoreModel = (modelData, requirements) => {
  const scores = { quality: 0, speed: 0, context: 0, cost: 0, license: 0 };
  const reasons = [];
  
  // 1. QUALITY SCORE
  const params = parseFloat(modelData.vramEstimates?.totalParams || 0);
  if (params >= 70) { scores.quality = 95; reasons.push('Excellent quality (70B+)'); }
  else if (params >= 13) { scores.quality = 85; reasons.push('High quality (13B+)'); }
  else if (params >= 7) { scores.quality = 75; reasons.push('Good quality (7B+)'); }
  else if (params >= 3) { scores.quality = 60; reasons.push('Decent quality (3B+)'); }
  else { scores.quality = 40; reasons.push('Compact model (<3B params)'); }
  
  const modelId = (modelData.modelId || "").toLowerCase();
  if (modelId.includes('llama-3') || modelId.includes('mixtral')) scores.quality += 5;

  // 2. SPEED SCORE
  const vram = parseFloat(modelData.vramEstimates?.fp16 || 999);
  const hasGQA = modelData.config?.num_key_value_heads < modelData.config?.num_attention_heads;
  
  if (vram <= 4) { scores.speed = 95; reasons.push('Very fast (low VRAM)'); }
  else if (vram <= 8) { scores.speed = 85; reasons.push('Fast inference'); }
  else if (vram <= 16) { scores.speed = 70; reasons.push('Moderate speed'); }
  else { scores.speed = 40; reasons.push('Requires powerful GPU'); }
  
  if (hasGQA) { scores.speed += 10; reasons.push('GQA optimization'); }

  // 3. CONTEXT SCORE
  const contextLength = modelData.config?.max_position_embeddings || 0;
  if (contextLength >= 128000) { scores.context = 100; reasons.push('Massive context (128k+)'); }
  else if (contextLength >= 32768) { scores.context = 90; reasons.push('Long context (32k+)'); }
  else if (contextLength >= 8192) { scores.context = 60; reasons.push('Standard context (8k)'); }
  else { scores.context = 30; reasons.push('Limited context'); }

  // 4. COST SCORE
  if (vram <= 4) { scores.cost = 100; reasons.push('Very affordable'); }
  else if (vram <= 8) { scores.cost = 85; reasons.push('Budget friendly'); }
  else { scores.cost = 40; reasons.push('Higher hardware cost'); }

  // 5. LICENSE SCORE
  const license = modelData.licenseInfo;
  if (license?.commercial === true) { scores.license = 100; reasons.push('Commercial use allowed'); }
  else if (license?.commercial === false) { 
    scores.license = requirements.license === 'commercial' ? 0 : 60; 
    reasons.push('Non-commercial only');
  } else { scores.license = 50; reasons.push('License unclear'); }

  // Weight Calculation
  const useCase = USE_CASES[requirements.useCase] || USE_CASES.research;
  const priority = PRIORITIES[requirements.priority] || PRIORITIES.balanced;
  
  const weights = {
    quality: (useCase.weights.quality + priority.weights.quality) / 2,
    speed: (useCase.weights.speed + priority.weights.speed) / 2,
    context: (useCase.weights.context + priority.weights.context) / 2,
    cost: (useCase.weights.cost + priority.weights.cost) / 2,
    license: 10
  };

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const weightedScore = Object.keys(scores).reduce((acc, key) => acc + (scores[key] * weights[key]), 0) / totalWeight;

  // --- HARD CONSTRAINTS (Lenient Logic Added) ---
  let meetsConstraints = true;
  const constraintFailures = [];

  // VRAM constraint - 10% tolerance
  if (requirements.maxVRAM && vram > requirements.maxVRAM * 1.1) {
    meetsConstraints = false;
    constraintFailures.push(`Exceeds VRAM budget (${vram}GB > ${requirements.maxVRAM}GB)`);
  }

  // Context constraint - 10% tolerance
  if (requirements.minContext && contextLength < requirements.minContext * 0.9) {
    meetsConstraints = false;
    constraintFailures.push(`Context too short (${contextLength} < ${requirements.minContext})`);
  }

  // License constraint - strict for commercial
  if (requirements.license === 'commercial' && license?.commercial === false) {
    meetsConstraints = false;
    constraintFailures.push('Not licensed for commercial use');
  }

  return {
    score: Math.round(weightedScore),
    scores,
    reasons: reasons.slice(0, 5),
    meetsConstraints,
    constraintFailures,
    weights
  };
};

/**
 * Get top N recommendations
 */
export const getRecommendations = (models, requirements, topN = 3) => {
  return models
    .map(model => ({ ...model, recommendation: scoreModel(model, requirements) }))
    .filter(model => model.recommendation.meetsConstraints)
    .sort((a, b) => b.recommendation.score - a.recommendation.score)
    .slice(0, topN);
};

export const generateExplanation = (modelData, rank) => {
  const rec = modelData.recommendation;
  const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
  return `${rankEmoji} Score: ${rec.score}/100. ${rec.reasons.join('. ')}. Matches your priorities and hardware.`;
};

export const getUseCases = () => USE_CASES;
export const getPriorities = () => PRIORITIES;

export const validateRequirements = (requirements) => {
  const errors = [];
  if (!requirements.useCase) errors.push('Please select a use case');
  if (!requirements.priority) errors.push('Please select a priority');
  if (requirements.maxVRAM && requirements.maxVRAM < 1) errors.push('VRAM budget must be at least 1GB');
  return { valid: errors.length === 0, errors };
};