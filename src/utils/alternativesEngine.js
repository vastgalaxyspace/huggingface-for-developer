// Alternatives Recommendation Engine
// Suggests similar, better, cheaper, or alternative models

/**
 * Find all alternatives for a model
 * @param {object} currentModel - Current model data
 * @param {array} allModels - Database of all models
 * @returns {object} Categorized alternatives
 */
export const findAlternatives = (currentModel, allModels) => {
  // Filter out current model and invalid models
  const candidates = allModels.filter(m => 
    m.modelId !== currentModel.modelId &&
    m.vramEstimates?.fp16 &&
    m.vramEstimates?.totalParams
  );

  return {
    cheaper: findCheaperAlternatives(currentModel, candidates),
    better: findBetterAlternatives(currentModel, candidates),
    license: findBetterLicenseAlternatives(currentModel, candidates),
    context: findLongerContextAlternatives(currentModel, candidates)
  };
};

/**
 * Find cheaper alternatives (lower VRAM/cost)
 */
const findCheaperAlternatives = (currentModel, candidates) => {
  const currentVRAM = parseFloat(currentModel.vramEstimates.fp16);
  const currentParams = parseFloat(currentModel.vramEstimates.totalParams);

  const cheaper = candidates
    .filter(m => {
      const vram = parseFloat(m.vramEstimates.fp16);
      const params = parseFloat(m.vramEstimates.totalParams);
      
      // Must be significantly cheaper (at least 20% less VRAM)
      return vram < currentVRAM * 0.8;
    })
    .map(m => {
      const vram = parseFloat(m.vramEstimates.fp16);
      const params = parseFloat(m.vramEstimates.totalParams);
      
      return {
        ...m,
        savings: {
          vram: Math.round(((currentVRAM - vram) / currentVRAM) * 100),
          params: Math.round(((currentParams - params) / currentParams) * 100),
          cost: calculateCostSavings(currentVRAM, vram)
        },
        tradeoff: calculateQualityTradeoff(currentParams, params),
        score: scoreCheaperAlternative(currentModel, m)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return cheaper;
};

/**
 * Find better performing alternatives
 */
const findBetterAlternatives = (currentModel, candidates) => {
  const currentVRAM = parseFloat(currentModel.vramEstimates.fp16);
  const currentParams = parseFloat(currentModel.vramEstimates.totalParams);

  const better = candidates
    .filter(m => {
      const params = parseFloat(m.vramEstimates.totalParams);
      const vram = parseFloat(m.vramEstimates.fp16);
      
      // Better quality (more params) but not excessively more expensive
      return params > currentParams && vram < currentVRAM * 2;
    })
    .map(m => {
      const vram = parseFloat(m.vramEstimates.fp16);
      const params = parseFloat(m.vramEstimates.totalParams);
      
      return {
        ...m,
        improvements: {
          params: Math.round(((params - currentParams) / currentParams) * 100),
          quality: estimateQualityImprovement(currentParams, params)
        },
        cost: {
          vramIncrease: Math.round(((vram - currentVRAM) / currentVRAM) * 100),
          additionalVRAM: (vram - currentVRAM).toFixed(1)
        },
        score: scoreBetterAlternative(currentModel, m)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return better;
};

/**
 * Find alternatives with better licenses
 */
const findBetterLicenseAlternatives = (currentModel, candidates) => {
  const currentLicense = currentModel.licenseInfo;
  
  // If already commercial, no need for alternatives
  if (currentLicense?.commercial === true) {
    return [];
  }

  const currentVRAM = parseFloat(currentModel.vramEstimates.fp16);

  const betterLicense = candidates
    .filter(m => {
      // Must have commercial license
      if (m.licenseInfo?.commercial !== true) return false;
      
      const vram = parseFloat(m.vramEstimates.fp16);
      // Similar VRAM (within 50%)
      return vram >= currentVRAM * 0.5 && vram <= currentVRAM * 1.5;
    })
    .map(m => {
      const vram = parseFloat(m.vramEstimates.fp16);
      const params = parseFloat(m.vramEstimates.totalParams);
      const currentParams = parseFloat(currentModel.vramEstimates.totalParams);
      
      return {
        ...m,
        license: {
          current: currentLicense?.name || 'Unknown',
          alternative: m.licenseInfo.name,
          advantage: 'Full commercial use without restrictions'
        },
        comparison: {
          vramDiff: ((vram - currentVRAM) / currentVRAM * 100).toFixed(0),
          paramsDiff: ((params - currentParams) / currentParams * 100).toFixed(0)
        },
        score: scoreLicenseAlternative(currentModel, m)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return betterLicense;
};

/**
 * Find alternatives with longer context
 */
const findLongerContextAlternatives = (currentModel, candidates) => {
  const currentContext = currentModel.config?.max_position_embeddings || 0;
  const currentVRAM = parseFloat(currentModel.vramEstimates.fp16);

  const longerContext = candidates
    .filter(m => {
      const context = m.config?.max_position_embeddings || 0;
      const vram = parseFloat(m.vramEstimates.fp16);
      
      // Must have significantly longer context (at least 2x)
      return context > currentContext * 2 && vram <= currentVRAM * 2;
    })
    .map(m => {
      const context = m.config?.max_position_embeddings || 0;
      const vram = parseFloat(m.vramEstimates.fp16);
      
      return {
        ...m,
        contextImprovement: {
          current: (currentContext / 1000).toFixed(0) + 'k',
          alternative: (context / 1000).toFixed(0) + 'k',
          multiplier: (context / currentContext).toFixed(1) + 'x',
          advantage: getContextAdvantage(context)
        },
        cost: {
          vramIncrease: ((vram - currentVRAM) / currentVRAM * 100).toFixed(0),
          additionalVRAM: (vram - currentVRAM).toFixed(1)
        },
        score: scoreContextAlternative(currentModel, m)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return longerContext;
};

/**
 * Scoring functions
 */
const scoreCheaperAlternative = (current, alternative) => {
  const currentVRAM = parseFloat(current.vramEstimates.fp16);
  const altVRAM = parseFloat(alternative.vramEstimates.fp16);
  const currentParams = parseFloat(current.vramEstimates.totalParams);
  const altParams = parseFloat(alternative.vramEstimates.totalParams);
  
  // Reward VRAM savings
  const vramSavings = (currentVRAM - altVRAM) / currentVRAM * 100;
  
  // Penalize quality loss
  const qualityLoss = (currentParams - altParams) / currentParams * 100;
  
  // Reward popularity
  const popularityScore = Math.min((alternative.downloads || 0) / 1000000, 10);
  
  // Reward commercial license
  const licenseBonus = alternative.licenseInfo?.commercial === true ? 10 : 0;
  
  return vramSavings * 2 - qualityLoss + popularityScore + licenseBonus;
};

const scoreBetterAlternative = (current, alternative) => {
  const currentParams = parseFloat(current.vramEstimates.totalParams);
  const altParams = parseFloat(alternative.vramEstimates.totalParams);
  const currentVRAM = parseFloat(current.vramEstimates.fp16);
  const altVRAM = parseFloat(alternative.vramEstimates.fp16);
  
  // Reward quality improvement
  const qualityGain = (altParams - currentParams) / currentParams * 100;
  
  // Penalize VRAM increase (but not too much)
  const vramCost = (altVRAM - currentVRAM) / currentVRAM * 50;
  
  // Reward popularity
  const popularityScore = Math.min((alternative.downloads || 0) / 1000000, 10);
  
  return qualityGain * 3 - vramCost + popularityScore;
};

const scoreLicenseAlternative = (current, alternative) => {
  const currentVRAM = parseFloat(current.vramEstimates.fp16);
  const altVRAM = parseFloat(alternative.vramEstimates.fp16);
  const currentParams = parseFloat(current.vramEstimates.totalParams);
  const altParams = parseFloat(alternative.vramEstimates.totalParams);
  
  // Heavily reward similar specs
  const vramSimilarity = 100 - Math.abs((altVRAM - currentVRAM) / currentVRAM * 100);
  const paramsSimilarity = 100 - Math.abs((altParams - currentParams) / currentParams * 100);
  
  // Reward popularity
  const popularityScore = Math.min((alternative.downloads || 0) / 1000000, 10);
  
  return vramSimilarity + paramsSimilarity + popularityScore;
};

const scoreContextAlternative = (current, alternative) => {
  const currentContext = current.config?.max_position_embeddings || 0;
  const altContext = alternative.config?.max_position_embeddings || 0;
  const currentVRAM = parseFloat(current.vramEstimates.fp16);
  const altVRAM = parseFloat(alternative.vramEstimates.fp16);
  
  // Reward context improvement
  const contextGain = (altContext - currentContext) / currentContext * 100;
  
  // Penalize VRAM increase
  const vramCost = (altVRAM - currentVRAM) / currentVRAM * 50;
  
  // Reward popularity
  const popularityScore = Math.min((alternative.downloads || 0) / 1000000, 10);
  
  return contextGain - vramCost + popularityScore;
};

/**
 * Helper functions
 */
const calculateCostSavings = (currentVRAM, newVRAM) => {
  const savings = ((currentVRAM - newVRAM) / currentVRAM * 100).toFixed(0);
  if (savings > 50) return 'Major savings (50%+)';
  if (savings > 25) return 'Significant savings (25-50%)';
  return 'Moderate savings (<25%)';
};

const calculateQualityTradeoff = (currentParams, newParams) => {
  const loss = ((currentParams - newParams) / currentParams * 100).toFixed(0);
  if (loss < 10) return 'Minimal quality loss (<10%)';
  if (loss < 25) return 'Moderate quality loss (10-25%)';
  if (loss < 50) return 'Significant quality loss (25-50%)';
  return 'Major quality loss (>50%)';
};

const estimateQualityImprovement = (currentParams, newParams) => {
  const gain = ((newParams - currentParams) / currentParams * 100).toFixed(0);
  if (gain > 100) return 'Major improvement (2x+ parameters)';
  if (gain > 50) return 'Significant improvement (50%+ better)';
  if (gain > 20) return 'Moderate improvement (20-50% better)';
  return 'Slight improvement (<20% better)';
};

const getContextAdvantage = (context) => {
  if (context >= 128000) return 'Entire books, massive documents';
  if (context >= 32768) return 'Long documents, technical papers';
  if (context >= 16384) return 'Standard documents, conversations';
  return 'Short to medium context';
};

/**
 * Get summary statistics
 */
export const getAlternativesSummary = (alternatives) => {
  const total = Object.values(alternatives).reduce((sum, arr) => sum + arr.length, 0);
  
  return {
    total,
    hasCheaper: alternatives.cheaper.length > 0,
    hasBetter: alternatives.better.length > 0,
    hasLicense: alternatives.license.length > 0,
    hasContext: alternatives.context.length > 0
  };
};