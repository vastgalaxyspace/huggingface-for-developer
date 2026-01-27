// License Analysis Utility
// Determines commercial usability and deployment restrictions

/**
 * License database with detailed permissions
 */
const LICENSE_DATABASE = {
  'apache-2.0': {
    name: 'Apache 2.0',
    commercial: true,
    modification: true,
    distribution: true,
    patent: true,
    status: 'permissive',
    color: 'green',
    icon: 'CheckCircle',
    summary: '✓ Full commercial use allowed',
    details: 'Can use commercially, modify, distribute, and sublicense. Includes patent protection.',
    warnings: []
  },
  
  'mit': {
    name: 'MIT License',
    commercial: true,
    modification: true,
    distribution: true,
    patent: false,
    status: 'permissive',
    color: 'green',
    icon: 'CheckCircle',
    summary: '✓ Full commercial use allowed',
    details: 'Very permissive. Can use commercially and modify freely. Must include license notice.',
    warnings: []
  },
  
  'llama2': {
    name: 'Llama 2 Community License',
    commercial: 'conditional',
    modification: true,
    distribution: true,
    patent: false,
    status: 'restricted',
    color: 'yellow',
    icon: 'AlertCircle',
    summary: '⚠ Commercial use with conditions',
    details: 'Free for commercial use if you have <700M monthly active users. Above that, need Meta approval.',
    warnings: [
      'Must have <700M MAU for free commercial use',
      'Cannot use to improve other LLMs',
      'Must include license in distribution'
    ]
  },
  
  'llama3': {
    name: 'Llama 3 Community License',
    commercial: 'conditional',
    modification: true,
    distribution: true,
    patent: false,
    status: 'restricted',
    color: 'yellow',
    icon: 'AlertCircle',
    summary: '⚠ Commercial use with conditions',
    details: 'Similar to Llama 2. Free commercial use under 700M MAU threshold.',
    warnings: [
      'Must have <700M MAU for free commercial use',
      'Cannot use outputs to train other models',
      'Review acceptable use policy'
    ]
  },
  
  'cc-by-nc-4.0': {
    name: 'Creative Commons Non-Commercial',
    commercial: false,
    modification: true,
    distribution: true,
    patent: false,
    status: 'non-commercial',
    color: 'red',
    icon: 'XCircle',
    summary: '✗ Non-commercial use only',
    details: 'Cannot use for commercial purposes. Fine for research and personal projects.',
    warnings: [
      'NO commercial use allowed',
      'No revenue generation permitted',
      'Research and education only'
    ]
  },
  
  'openrail': {
    name: 'OpenRAIL License',
    commercial: true,
    modification: true,
    distribution: true,
    patent: false,
    status: 'responsible',
    color: 'blue',
    icon: 'Shield',
    summary: '✓ Commercial use with responsible AI clauses',
    details: 'Permissive but includes responsible AI requirements. Cannot use for harmful purposes.',
    warnings: [
      'Must follow use restrictions (no harmful content)',
      'Downstream users inherit restrictions',
      'Review use-based restrictions'
    ]
  },
  
  'bigscience-bloom-rail-1.0': {
    name: 'BigScience BLOOM RAIL',
    commercial: true,
    modification: true,
    distribution: true,
    patent: false,
    status: 'responsible',
    color: 'blue',
    icon: 'Shield',
    summary: '✓ Commercial use with use-based restrictions',
    details: 'Open license with responsible AI clauses. Prohibits harmful applications.',
    warnings: [
      'Cannot use for discrimination or harm',
      'Must comply with use restrictions',
      'Liability provisions apply'
    ]
  },
  
  'other': {
    name: 'Other/Custom License',
    commercial: 'unknown',
    modification: 'unknown',
    distribution: 'unknown',
    patent: false,
    status: 'unknown',
    color: 'gray',
    icon: 'AlertCircle',
    summary: '? Review license carefully',
    details: 'Custom license detected. You must review the full license text before deployment.',
    warnings: [
      'Unknown license terms',
      'Review full license before use',
      'Consult legal if deploying commercially'
    ]
  }
};

/**
 * Get detailed license information
 * @param {string} licenseId - License identifier from HuggingFace
 * @returns {object} License details
 */
export const getLicenseInfo = (licenseId) => {
  if (!licenseId) {
    return LICENSE_DATABASE.other;
  }
  
  const normalizedId = licenseId.toLowerCase().trim();
  
  // Direct match
  if (LICENSE_DATABASE[normalizedId]) {
    return LICENSE_DATABASE[normalizedId];
  }
  
  // Partial matches
  if (normalizedId.includes('apache')) return LICENSE_DATABASE['apache-2.0'];
  if (normalizedId.includes('mit')) return LICENSE_DATABASE['mit'];
  if (normalizedId.includes('llama-2')) return LICENSE_DATABASE['llama2'];
  if (normalizedId.includes('llama-3') || normalizedId.includes('llama3')) return LICENSE_DATABASE['llama3'];
  if (normalizedId.includes('cc-by-nc')) return LICENSE_DATABASE['cc-by-nc-4.0'];
  if (normalizedId.includes('openrail')) return LICENSE_DATABASE['openrail'];
  if (normalizedId.includes('bloom')) return LICENSE_DATABASE['bigscience-bloom-rail-1.0'];
  
  // Unknown license
  return LICENSE_DATABASE.other;
};

/**
 * Check if model can be used commercially
 * @param {string} licenseId - License identifier
 * @returns {object} Commercial use analysis
 */
export const canUseCommercially = (licenseId) => {
  const license = getLicenseInfo(licenseId);
  
  return {
    allowed: license.commercial === true,
    conditional: license.commercial === 'conditional',
    forbidden: license.commercial === false,
    summary: license.summary,
    warnings: license.warnings,
    needsReview: license.commercial === 'unknown' || license.commercial === 'conditional'
  };
};

/**
 * Get deployment recommendation based on license
 * @param {string} licenseId - License identifier
 * @param {string} useCase - Intended use case
 * @returns {object} Deployment recommendation
 */
export const getDeploymentRecommendation = (licenseId, useCase = 'commercial') => {
  const license = getLicenseInfo(licenseId);
  
  const recommendations = {
    permissive: {
      status: 'ready',
      message: '✅ Ready for production deployment',
      actions: ['Deploy freely', 'Include license notice in distribution'],
      risks: 'Minimal legal risk'
    },
    
    restricted: {
      status: 'review',
      message: '⚠️ Review license terms before deploying',
      actions: ['Check user count limits', 'Review use restrictions', 'Document compliance'],
      risks: 'Conditional approval required for large scale'
    },
    
    'non-commercial': {
      status: 'blocked',
      message: '❌ Cannot deploy commercially',
      actions: ['Use for research/personal only', 'Find alternative model', 'Contact license holder'],
      risks: 'Legal violation if used commercially'
    },
    
    responsible: {
      status: 'caution',
      message: '✓ Can deploy with responsible AI compliance',
      actions: ['Review use restrictions', 'Implement content filtering', 'Document compliance'],
      risks: 'Liability if used for harmful purposes'
    },
    
    unknown: {
      status: 'uncertain',
      message: '? Legal review required',
      actions: ['Read full license', 'Consult legal team', 'Contact model author'],
      risks: 'Unknown legal implications'
    }
  };
  
  return recommendations[license.status] || recommendations.unknown;
};

/**
 * Format license display
 * @param {string} licenseId - License identifier
 * @returns {object} Formatted license info for UI
 */
export const formatLicenseDisplay = (licenseId) => {
  const license = getLicenseInfo(licenseId);
  
  return {
    name: license.name,
    badge: {
      text: license.summary,
      color: license.color,
      icon: license.icon
    },
    canDeploy: license.commercial === true,
    needsReview: license.commercial === 'conditional' || license.commercial === 'unknown',
    details: license.details,
    warnings: license.warnings
  };
};