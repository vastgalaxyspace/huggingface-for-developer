// Chart Data Utilities
// Prepares model data for various chart types

/**
 * Prepare data for VRAM vs Quality scatter plot
 * @param {array} models - Array of model data
 * @returns {array} Chart data
 */
export const prepareVRAMQualityData = (models) => {
  return models
    .filter(model => 
      model.vramEstimates?.fp16 && 
      (model.card?.benchmarks?.mmlu || model.vramEstimates?.totalParams)
    )
    .map(model => {
      const vram = parseFloat(model.vramEstimates.fp16);
      const quality = model.card?.benchmarks?.mmlu || 
                     estimateQualityFromParams(parseFloat(model.vramEstimates.totalParams));
      
      return {
        name: model.modelId.split('/')[1] || model.modelId,
        fullName: model.modelId,
        vram,
        quality,
        params: model.vramEstimates.totalParams,
        license: model.licenseInfo?.commercial === true ? 'Commercial' : 
                 model.licenseInfo?.commercial === false ? 'Non-Commercial' : 'Conditional',
        author: model.author
      };
    })
    .sort((a, b) => a.vram - b.vram);
};

/**
 * Estimate quality score from parameter count
 * (Used when benchmark data is missing)
 */
const estimateQualityFromParams = (params) => {
  if (params >= 70) return 70;
  if (params >= 30) return 65;
  if (params >= 13) return 60;
  if (params >= 7) return 50;
  if (params >= 3) return 40;
  return 30;
};

/**
 * Prepare data for radar chart (multi-dimensional comparison)
 * @param {array} models - Array of model data (max 3 recommended)
 * @returns {array} Chart data
 */
export const prepareRadarData = (models) => {
  const metrics = [
    { key: 'quality', label: 'Quality', getValue: (m) => getQualityScore(m) },
    { key: 'speed', label: 'Speed', getValue: (m) => getSpeedScore(m) },
    { key: 'efficiency', label: 'Efficiency', getValue: (m) => getEfficiencyScore(m) },
    { key: 'context', label: 'Context', getValue: (m) => getContextScore(m) },
    { key: 'support', label: 'Support', getValue: (m) => getSupportScore(m) }
  ];

  return metrics.map(metric => {
    const dataPoint = { metric: metric.label };
    
    models.forEach((model, idx) => {
      const modelName = model.modelId.split('/')[1] || model.modelId;
      dataPoint[modelName] = metric.getValue(model);
    });
    
    return dataPoint;
  });
};

// Scoring functions for radar chart
const getQualityScore = (model) => {
  const params = parseFloat(model.vramEstimates?.totalParams || 0);
  if (params >= 70) return 95;
  if (params >= 30) return 85;
  if (params >= 13) return 75;
  if (params >= 7) return 65;
  return 45;
};

const getSpeedScore = (model) => {
  const vram = parseFloat(model.vramEstimates?.fp16 || 999);
  const hasGQA = model.config?.num_key_value_heads < model.config?.num_attention_heads;
  
  let score = 0;
  if (vram <= 8) score = 90;
  else if (vram <= 16) score = 70;
  else if (vram <= 24) score = 50;
  else score = 30;
  
  if (hasGQA) score = Math.min(100, score + 10);
  return score;
};

const getEfficiencyScore = (model) => {
  const vram = parseFloat(model.vramEstimates?.fp16 || 999);
  const params = parseFloat(model.vramEstimates?.totalParams || 0);
  const hasGQA = model.config?.num_key_value_heads < model.config?.num_attention_heads;
  
  // Quality per GB of VRAM
  const efficiency = (params / vram) * 10;
  let score = Math.min(100, efficiency * 10);
  
  if (hasGQA) score = Math.min(100, score + 15);
  return Math.round(score);
};

const getContextScore = (model) => {
  const context = model.config?.max_position_embeddings || 0;
  if (context >= 128000) return 100;
  if (context >= 32768) return 85;
  if (context >= 16384) return 70;
  if (context >= 8192) return 55;
  if (context >= 4096) return 40;
  return 20;
};

const getSupportScore = (model) => {
  const downloads = model.downloads || 0;
  if (downloads >= 5000000) return 95;
  if (downloads >= 1000000) return 85;
  if (downloads >= 500000) return 70;
  if (downloads >= 100000) return 55;
  return 35;
};

/**
 * Prepare data for context comparison bar chart
 * @param {array} models - Array of model data
 * @returns {array} Chart data
 */
export const prepareContextComparisonData = (models) => {
  return models
    .filter(model => model.config?.max_position_embeddings)
    .map(model => ({
      name: model.modelId.split('/')[1] || model.modelId,
      fullName: model.modelId,
      context: model.config.max_position_embeddings,
      contextK: (model.config.max_position_embeddings / 1000).toFixed(0) + 'k',
      vram: parseFloat(model.vramEstimates?.fp16 || 0)
    }))
    .sort((a, b) => b.context - a.context);
};

/**
 * Prepare data for parameter size comparison
 * @param {array} models - Array of model data
 * @returns {array} Chart data
 */
export const prepareParameterComparisonData = (models) => {
  return models
    .filter(model => model.vramEstimates?.totalParams)
    .map(model => ({
      name: model.modelId.split('/')[1] || model.modelId,
      fullName: model.modelId,
      params: parseFloat(model.vramEstimates.totalParams),
      vram: parseFloat(model.vramEstimates.fp16),
      license: model.licenseInfo?.commercial === true ? 'Commercial' : 'Other'
    }))
    .sort((a, b) => a.params - b.params);
};

/**
 * Get color for license type
 */
export const getLicenseColor = (licenseType) => {
  const colors = {
    'Commercial': '#10b981',      // green
    'Conditional': '#eab308',      // yellow
    'Non-Commercial': '#ef4444',   // red
    'Unknown': '#6b7280'           // gray
  };
  return colors[licenseType] || colors['Unknown'];
};

/**
 * Get model colors for charts
 */
export const getModelColors = () => {
  return [
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f59e0b', // amber
    '#10b981', // emerald
    '#6366f1', // indigo
    '#f43f5e', // rose
    '#14b8a6'  // teal
  ];
};