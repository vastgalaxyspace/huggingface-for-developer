// Deployment Readiness Scoring Engine
// Evaluates models for production readiness (0-100 scale)

/**
 * Calculate deployment readiness score
 * @param {object} modelData - Complete model data
 * @returns {object} Score breakdown and recommendations
 */
export const calculateDeploymentScore = (modelData) => {
  const scores = {
    license: calculateLicenseScore(modelData),
    community: calculateCommunityScore(modelData),
    documentation: calculateDocumentationScore(modelData),
    compatibility: calculateCompatibilityScore(modelData),
    efficiency: calculateEfficiencyScore(modelData)
  };

  const total = Object.values(scores).reduce((sum, s) => sum + s.score, 0);
  const maxScore = Object.values(scores).reduce((sum, s) => sum + s.maxScore, 0);
  const percentage = Math.round((total / maxScore) * 100);

  return {
    total: percentage,
    scores,
    rating: getRating(percentage),
    recommendations: generateRecommendations(scores, percentage),
    readyForProduction: percentage >= 70
  };
};

/**
 * 1. LICENSE SCORE (/20)
 */
const calculateLicenseScore = (modelData) => {
  const license = modelData.licenseInfo;
  let score = 0;
  const details = [];
  const issues = [];

  if (!license || !license.name) {
    issues.push('License information missing');
    return { score: 0, maxScore: 20, details, issues };
  }

  // Commercial use allowed (10 points)
  if (license.commercial === true) {
    score += 10;
    details.push('✅ Commercial use allowed');
  } else if (license.commercial === 'conditional') {
    score += 5;
    details.push('⚠️ Conditional commercial license');
    issues.push('Review license restrictions carefully');
  } else if (license.commercial === false) {
    score += 0;
    details.push('❌ Non-commercial only');
    issues.push('Cannot use in production without license change');
  } else {
    score += 3;
    details.push('⚠️ License unclear');
    issues.push('Verify commercial use permissions');
  }

  // License clarity (5 points)
  const clearLicenses = ['apache-2.0', 'mit', 'bsd'];
  if (clearLicenses.some(l => license.name?.toLowerCase().includes(l))) {
    score += 5;
    details.push('✅ Clear, permissive license');
  } else {
    score += 2;
    details.push('⚠️ Custom license terms');
  }

  // Modification allowed (3 points)
  if (license.modification !== false) {
    score += 3;
    details.push('✅ Can modify and fine-tune');
  } else {
    issues.push('Modifications restricted');
  }

  // Distribution allowed (2 points)
  if (license.distribution !== false) {
    score += 2;
    details.push('✅ Can distribute');
  } else {
    issues.push('Distribution restricted');
  }

  return { score, maxScore: 20, details, issues };
};

/**
 * 2. COMMUNITY SCORE (/20)
 */
const calculateCommunityScore = (modelData) => {
  let score = 0;
  const details = [];
  const issues = [];

  const downloads = modelData.downloads || 0;
  const likes = modelData.likes || 0;

  // Download count (8 points)
  if (downloads >= 5000000) {
    score += 8;
    details.push(`✅ Very popular (${formatNumber(downloads)} downloads)`);
  } else if (downloads >= 1000000) {
    score += 6;
    details.push(`✅ Popular (${formatNumber(downloads)} downloads)`);
  } else if (downloads >= 100000) {
    score += 4;
    details.push(`⚠️ Moderate adoption (${formatNumber(downloads)} downloads)`);
  } else if (downloads >= 10000) {
    score += 2;
    details.push(`⚠️ Limited adoption (${formatNumber(downloads)} downloads)`);
    issues.push('Lower community usage - less battle-tested');
  } else {
    score += 0;
    details.push(`❌ Very low adoption (${formatNumber(downloads)} downloads)`);
    issues.push('Minimal real-world usage');
  }

  // Likes/Stars (5 points)
  if (likes >= 1000) {
    score += 5;
    details.push(`✅ Highly rated (${formatNumber(likes)} likes)`);
  } else if (likes >= 500) {
    score += 4;
    details.push(`✅ Well-liked (${formatNumber(likes)} likes)`);
  } else if (likes >= 100) {
    score += 2;
    details.push(`⚠️ Some community interest (${formatNumber(likes)} likes)`);
  } else {
    score += 0;
    issues.push('Low community engagement');
  }

  // Recent activity (5 points) - based on last modified
  const lastModified = modelData.lastModified;
  if (lastModified) {
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(lastModified).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceUpdate <= 90) {
      score += 5;
      details.push('✅ Recently updated (< 3 months)');
    } else if (daysSinceUpdate <= 180) {
      score += 3;
      details.push('✅ Updated within 6 months');
    } else if (daysSinceUpdate <= 365) {
      score += 1;
      details.push('⚠️ Updated within a year');
      issues.push('Consider checking for newer versions');
    } else {
      score += 0;
      details.push('❌ Not updated in over a year');
      issues.push('May be abandoned or deprecated');
    }
  } else {
    score += 2;
    details.push('⚠️ Update date unknown');
  }

  // Author reputation (2 points)
  const trustedAuthors = ['meta', 'mistral', 'microsoft', 'google', 'huggingface'];
  if (trustedAuthors.some(a => modelData.author?.toLowerCase().includes(a))) {
    score += 2;
    details.push('✅ Trusted organization');
  }

  return { score, maxScore: 20, details, issues };
};

/**
 * 3. DOCUMENTATION SCORE (/20)
 */
const calculateDocumentationScore = (modelData) => {
  let score = 0;
  const details = [];
  const issues = [];

  // Model card exists (8 points)
  if (modelData.card?.description) {
    const descLength = modelData.card.description.length;
    if (descLength >= 500) {
      score += 8;
      details.push('✅ Comprehensive model card');
    } else if (descLength >= 200) {
      score += 5;
      details.push('✅ Basic model card present');
    } else {
      score += 2;
      details.push('⚠️ Minimal documentation');
      issues.push('Limited model description');
    }
  } else {
    score += 0;
    details.push('❌ No model card');
    issues.push('Missing critical documentation');
  }

  // Usage examples (5 points)
  if (modelData.card?.usage) {
    score += 5;
    details.push('✅ Usage examples provided');
  } else {
    score += 0;
    issues.push('No usage examples found');
  }

  // Benchmarks provided (4 points)
  if (modelData.card?.benchmarks && Object.keys(modelData.card.benchmarks).length > 0) {
    score += 4;
    details.push(`✅ Benchmark results available (${Object.keys(modelData.card.benchmarks).length} metrics)`);
  } else {
    score += 0;
    issues.push('No benchmark data');
  }

  // Limitations documented (3 points)
  if (modelData.card?.limitations) {
    score += 3;
    details.push('✅ Limitations documented');
  } else {
    score += 0;
    issues.push('Known limitations not documented');
  }

  return { score, maxScore: 20, details, issues };
};

/**
 * 4. COMPATIBILITY SCORE (/20)
 */
const calculateCompatibilityScore = (modelData) => {
  let score = 0;
  const details = [];
  const issues = [];

  // Config.json present (5 points)
  if (modelData.config) {
    score += 5;
    details.push('✅ Configuration file available');
  } else {
    score += 0;
    details.push('❌ Missing config.json');
    issues.push('May have loading issues');
  }

  // Standard architecture (5 points)
  const commonArchitectures = ['llama', 'mistral', 'gpt', 'phi', 'gemma', 'qwen'];
  const modelType = modelData.config?.model_type?.toLowerCase();
  if (commonArchitectures.includes(modelType)) {
    score += 5;
    details.push(`✅ Standard architecture (${modelType})`);
  } else {
    score += 2;
    details.push('⚠️ Custom architecture');
    issues.push('May have limited framework support');
  }

  // vLLM compatible (5 points)
  const vllmCompatible = ['llama', 'mistral', 'qwen', 'phi', 'gemma'].includes(modelType);
  if (vllmCompatible) {
    score += 5;
    details.push('✅ vLLM compatible');
  } else {
    score += 1;
    issues.push('Limited vLLM support');
  }

  // Transformers compatible (3 points) - assume all are
  score += 3;
  details.push('✅ Transformers compatible');

  // Tokenizer present (2 points)
  if (modelData.tokenizerConfig) {
    score += 2;
    details.push('✅ Tokenizer configuration available');
  } else {
    score += 1;
    issues.push('Tokenizer config may be missing');
  }

  return { score, maxScore: 20, details, issues };
};

/**
 * 5. EFFICIENCY SCORE (/20)
 */
const calculateEfficiencyScore = (modelData) => {
  let score = 0;
  const details = [];
  const issues = [];

  // GQA/MQA optimization (8 points)
  const attentionHeads = modelData.config?.num_attention_heads || 0;
  const kvHeads = modelData.config?.num_key_value_heads || attentionHeads;
  
  if (kvHeads < attentionHeads && kvHeads > 0) {
    const ratio = attentionHeads / kvHeads;
    if (ratio >= 4) {
      score += 8;
      details.push(`✅ Excellent GQA optimization (${ratio}x)`);
    } else if (ratio >= 2) {
      score += 6;
      details.push(`✅ Good GQA optimization (${ratio}x)`);
    } else {
      score += 4;
      details.push(`✅ Moderate GQA (${ratio}x)`);
    }
  } else if (kvHeads === 1) {
    score += 8;
    details.push('✅ MQA optimization (maximum efficiency)');
  } else {
    score += 0;
    details.push('❌ No GQA/MQA optimization');
    issues.push('Standard MHA - slower inference');
  }

  // Quantization available (5 points)
  if (modelData.quantization?.quantized) {
    score += 5;
    details.push(`✅ Quantized version available (${modelData.quantization.method})`);
  } else {
    score += 2;
    issues.push('No pre-quantized versions');
  }

  // Flash Attention support (4 points) - heuristic
  const hasFlashAttention = modelData.config?.use_cache !== false;
  if (hasFlashAttention) {
    score += 4;
    details.push('✅ Flash Attention compatible');
  } else {
    score += 0;
    issues.push('May not support Flash Attention');
  }

  // Reasonable size (3 points)
  const vram = parseFloat(modelData.vramEstimates?.fp16 || 999);
  if (vram <= 24) {
    score += 3;
    details.push('✅ Fits on common GPUs');
  } else if (vram <= 40) {
    score += 2;
    details.push('⚠️ Requires high-end GPU');
  } else {
    score += 0;
    details.push('❌ Requires multi-GPU setup');
    issues.push('Very high hardware requirements');
  }

  return { score, maxScore: 20, details, issues };
};

/**
 * Get rating based on score
 */
const getRating = (score) => {
  if (score >= 90) return { level: 'excellent', label: 'Excellent', emoji: '🟢', color: 'green' };
  if (score >= 80) return { level: 'great', label: 'Production Ready', emoji: '🟢', color: 'green' };
  if (score >= 70) return { level: 'good', label: 'Good', emoji: '🟡', color: 'yellow' };
  if (score >= 60) return { level: 'fair', label: 'Fair', emoji: '🟡', color: 'yellow' };
  if (score >= 50) return { level: 'caution', label: 'Proceed with Caution', emoji: '🟠', color: 'orange' };
  return { level: 'poor', label: 'Not Recommended', emoji: '🔴', color: 'red' };
};

/**
 * Generate recommendations
 */
const generateRecommendations = (scores, totalScore) => {
  const recommendations = [];
  
  if (totalScore >= 80) {
    recommendations.push({
      type: 'success',
      message: 'This model is ready for production deployment.'
    });
  } else if (totalScore >= 70) {
    recommendations.push({
      type: 'info',
      message: 'This model is suitable for production with some considerations.'
    });
  } else {
    recommendations.push({
      type: 'warning',
      message: 'This model may need additional evaluation before production use.'
    });
  }

  // License recommendations
  if (scores.license.score < 10) {
    recommendations.push({
      type: 'warning',
      message: 'License restrictions may limit production use. Review carefully.'
    });
  }

  // Community recommendations
  if (scores.community.score < 10) {
    recommendations.push({
      type: 'warning',
      message: 'Low community adoption. Consider more battle-tested alternatives.'
    });
  }

  // Documentation recommendations
  if (scores.documentation.score < 10) {
    recommendations.push({
      type: 'info',
      message: 'Limited documentation. Budget extra time for integration.'
    });
  }

  // Compatibility recommendations
  if (scores.compatibility.score < 15) {
    recommendations.push({
      type: 'warning',
      message: 'May have compatibility issues. Test thoroughly before deployment.'
    });
  }

  // Efficiency recommendations
  if (scores.efficiency.score < 10) {
    recommendations.push({
      type: 'info',
      message: 'Consider using quantized versions for better efficiency.'
    });
  }

  return recommendations;
};

/**
 * Format number helper
 */
const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

/**
 * Get score color
 */
export const getScoreColor = (score, maxScore) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return 'green';
  if (percentage >= 60) return 'yellow';
  if (percentage >= 40) return 'orange';
  return 'red';
};