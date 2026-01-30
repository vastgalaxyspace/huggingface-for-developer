// Total Cost of Ownership Calculator
// Calculates complete cost analysis for different deployment options

/**
 * Calculate comprehensive TCO
 * @param {object} modelData - Model data
 * @param {object} usage - Usage parameters
 * @returns {object} Complete TCO analysis
 */
export const calculateTCO = (modelData, usage = {}) => {
  const {
    tokensPerMonth = 1000000,
    requestsPerDay = 1000,
    peakConcurrency = 10,
    monthlyActiveUsers = 10000,
    hoursPerDay = 24,
    daysPerMonth = 30
  } = usage;

  const vram = parseFloat(modelData.vramEstimates?.fp16 || 16);

  return {
    api: calculateAPICost(tokensPerMonth),
    cloudGPU: calculateCloudGPUCost(vram, hoursPerDay, daysPerMonth),
    selfHosted: calculateSelfHostedCost(vram),
    comparison: compareOptions(tokensPerMonth, vram, hoursPerDay, daysPerMonth),
    breakEven: calculateBreakEven(tokensPerMonth, vram),
    recommendations: generateCostRecommendations(tokensPerMonth, vram, monthlyActiveUsers)
  };
};

/**
 * API Service Costs
 */
const calculateAPICost = (tokensPerMonth) => {
  const providers = {
    together: {
      name: 'Together AI',
      costPer1k: 0.0002,
      monthly: (tokensPerMonth / 1000) * 0.0002,
      setup: 0,
      maintenance: 0,
      scaling: 'Automatic',
      pros: ['No infrastructure', 'Auto-scaling', 'Pay per use', 'No DevOps'],
      cons: ['Data privacy concerns', 'Vendor lock-in', 'API rate limits', 'Network latency']
    },
    replicate: {
      name: 'Replicate',
      costPer1k: 0.0002,
      monthly: (tokensPerMonth / 1000) * 0.0002,
      setup: 0,
      maintenance: 0,
      scaling: 'Automatic',
      pros: ['Easy deployment', 'Flexible billing', 'Good documentation'],
      cons: ['Cold starts', 'Cost at scale', 'Limited customization']
    },
    huggingface: {
      name: 'HuggingFace Inference',
      costPer1k: 0.0006,
      monthly: (tokensPerMonth / 1000) * 0.0006,
      setup: 0,
      maintenance: 0,
      scaling: 'Automatic',
      pros: ['Integrated ecosystem', 'Easy to start', 'Model updates'],
      cons: ['Higher cost', 'Rate limits', 'Less control']
    },
    openai: {
      name: 'OpenAI GPT-3.5',
      costPer1k: 0.002,
      monthly: (tokensPerMonth / 1000) * 0.002,
      setup: 0,
      maintenance: 0,
      scaling: 'Automatic',
      pros: ['Best quality', 'Reliable', 'Great support'],
      cons: ['Most expensive', 'No customization', 'No open source']
    }
  };

  return providers;
};

/**
 * Cloud GPU Costs
 */
const calculateCloudGPUCost = (vram, hoursPerDay, daysPerMonth) => {
  const hoursPerMonth = hoursPerDay * daysPerMonth;
  
  const instances = {
    aws_t4: {
      name: 'AWS g4dn.xlarge (T4)',
      gpu: 'T4 16GB',
      suitable: vram <= 12,
      hourly: 0.526,
      monthly: 0.526 * hoursPerMonth,
      setup: 200, // DevOps setup
      maintenance: 500, // Monthly maintenance
      scaling: 'Manual/Auto',
      notes: vram <= 12 ? 'Good fit with quantization' : 'Insufficient VRAM'
    },
    aws_a10g: {
      name: 'AWS g5.xlarge (A10G)',
      gpu: 'A10G 24GB',
      suitable: vram <= 20,
      hourly: 1.006,
      monthly: 1.006 * hoursPerMonth,
      setup: 200,
      maintenance: 500,
      scaling: 'Manual/Auto',
      notes: vram <= 20 ? 'Recommended for production' : 'Consider larger instance'
    },
    gcp_l4: {
      name: 'GCP g2-standard-4 (L4)',
      gpu: 'L4 24GB',
      suitable: vram <= 20,
      hourly: 0.85,
      monthly: 0.85 * hoursPerMonth,
      setup: 200,
      maintenance: 500,
      scaling: 'Manual/Auto',
      notes: vram <= 20 ? 'Cost-effective option' : 'Insufficient VRAM'
    },
    aws_a100: {
      name: 'AWS p4d.24xlarge (A100)',
      gpu: 'A100 40GB',
      suitable: vram <= 35,
      hourly: 4.098,
      monthly: 4.098 * hoursPerMonth,
      setup: 500,
      maintenance: 1000,
      scaling: 'Manual/Auto',
      notes: vram <= 35 ? 'High-performance option' : 'Consider multi-GPU'
    }
  };

  // Find most suitable instance
  const suitable = Object.entries(instances)
    .filter(([_, inst]) => inst.suitable)
    .sort((a, b) => a[1].monthly - b[1].monthly);

  return {
    instances,
    recommended: suitable[0] ? suitable[0][1] : instances.aws_a100,
    yearOneCost: suitable[0] 
      ? suitable[0][1].monthly * 12 + suitable[0][1].setup + suitable[0][1].maintenance * 12
      : instances.aws_a100.monthly * 12 + instances.aws_a100.setup + instances.aws_a100.maintenance * 12
  };
};

/**
 * Self-Hosted Costs
 */
const calculateSelfHostedCost = (vram) => {
  const hardware = getHardwareForVRAM(vram);
  
  return {
    hardware: {
      initial: hardware.cost,
      gpu: hardware.gpu,
      depreciation: hardware.cost / 36, // 3-year depreciation
      replacement: 36 // months
    },
    infrastructure: {
      server: 1500, // Server chassis, CPU, RAM, etc.
      networking: 500,
      ups: 500,
      cooling: 300
    },
    recurring: {
      power: calculatePowerCost(hardware.watts),
      internet: 100, // per month
      maintenance: 200, // per month
      backup: 50 // per month
    },
    personnel: {
      devOps: {
        fte: 0.25, // 25% of one engineer
        salary: 120000,
        monthly: (120000 * 0.25) / 12
      },
      mlOps: {
        fte: 0.1,
        salary: 140000,
        monthly: (140000 * 0.1) / 12
      }
    },
    total: {
      yearOne: hardware.cost + 1500 + 500 + 500 + 300 + 
               (calculatePowerCost(hardware.watts) + 100 + 200 + 50) * 12 +
               ((120000 * 0.25) / 12) * 12 + ((140000 * 0.1) / 12) * 12,
      yearTwo: (calculatePowerCost(hardware.watts) + 100 + 200 + 50) * 12 +
               ((120000 * 0.25) / 12) * 12 + ((140000 * 0.1) / 12) * 12,
      yearThree: (calculatePowerCost(hardware.watts) + 100 + 200 + 50) * 12 +
                 ((120000 * 0.25) / 12) * 12 + ((140000 * 0.1) / 12) * 12
    }
  };
};

const getHardwareForVRAM = (vram) => {
  if (vram <= 12) return { gpu: 'RTX 3060 12GB', cost: 400, watts: 170 };
  if (vram <= 16) return { gpu: 'RTX 4060 Ti 16GB', cost: 600, watts: 160 };
  if (vram <= 24) return { gpu: 'RTX 4090 24GB', cost: 1800, watts: 450 };
  if (vram <= 40) return { gpu: 'A100 40GB', cost: 10000, watts: 400 };
  if (vram <= 80) return { gpu: 'A100 80GB', cost: 15000, watts: 400 };
  return { gpu: '2x A100 80GB', cost: 30000, watts: 800 };
};

const calculatePowerCost = (watts) => {
  const kwhPerMonth = (watts / 1000) * 24 * 30;
  const costPerKwh = 0.12; // $0.12 per kWh average
  return Math.round(kwhPerMonth * costPerKwh);
};

/**
 * Compare all options
 */
const compareOptions = (tokensPerMonth, vram, hoursPerDay, daysPerMonth) => {
  const api = calculateAPICost(tokensPerMonth);
  const cloud = calculateCloudGPUCost(vram, hoursPerDay, daysPerMonth);
  const selfHosted = calculateSelfHostedCost(vram);

  const cheapestAPI = Math.min(...Object.values(api).map(p => p.monthly));
  
  return {
    yearOne: {
      api: cheapestAPI * 12,
      cloudGPU: cloud.yearOneCost,
      selfHosted: selfHosted.total.yearOne
    },
    yearTwo: {
      api: cheapestAPI * 12,
      cloudGPU: cloud.recommended.monthly * 12 + cloud.recommended.maintenance * 12,
      selfHosted: selfHosted.total.yearTwo
    },
    yearThree: {
      api: cheapestAPI * 12,
      cloudGPU: cloud.recommended.monthly * 12 + cloud.recommended.maintenance * 12,
      selfHosted: selfHosted.total.yearThree
    },
    threeYearTotal: {
      api: cheapestAPI * 36,
      cloudGPU: cloud.yearOneCost + 
                (cloud.recommended.monthly * 12 + cloud.recommended.maintenance * 12) * 2,
      selfHosted: selfHosted.total.yearOne + 
                  selfHosted.total.yearTwo + 
                  selfHosted.total.yearThree
    }
  };
};

/**
 * Calculate break-even points
 */
const calculateBreakEven = (tokensPerMonth, vram) => {
  const api = calculateAPICost(tokensPerMonth);
  const cloud = calculateCloudGPUCost(vram, 24, 30);
  const selfHosted = calculateSelfHostedCost(vram);

  const cheapestAPI = Math.min(...Object.values(api).map(p => p.monthly));
  
  return {
    cloudVsAPI: {
      months: Math.ceil(cloud.recommended.setup / (cheapestAPI - cloud.recommended.monthly)),
      note: cheapestAPI > cloud.recommended.monthly 
        ? 'Cloud GPU never breaks even - API cheaper'
        : 'Cloud GPU cheaper from month 1'
    },
    selfHostedVsAPI: {
      months: Math.ceil(selfHosted.total.yearOne / (cheapestAPI * 12)),
      note: 'Self-hosted breaks even vs API'
    },
    selfHostedVsCloud: {
      months: Math.ceil(
        selfHosted.total.yearOne / 
        (cloud.recommended.monthly + cloud.recommended.maintenance)
      ),
      note: 'Self-hosted breaks even vs Cloud GPU'
    }
  };
};

/**
 * Generate recommendations
 */
const generateCostRecommendations = (tokensPerMonth, vram, monthlyActiveUsers) => {
  const recommendations = [];
  
  if (tokensPerMonth < 1000000) {
    recommendations.push({
      type: 'success',
      message: 'Start with API services',
      reason: 'Low volume makes API most cost-effective'
    });
  } else if (tokensPerMonth < 10000000) {
    recommendations.push({
      type: 'info',
      message: 'Consider Cloud GPU',
      reason: 'Volume justifies dedicated infrastructure'
    });
  } else {
    recommendations.push({
      type: 'success',
      message: 'Self-hosted recommended',
      reason: 'High volume makes self-hosting economical'
    });
  }

  if (vram > 24) {
    recommendations.push({
      type: 'warning',
      message: 'High hardware requirements',
      reason: 'Consider model quantization or smaller alternatives'
    });
  }

  if (monthlyActiveUsers > 700000) {
    recommendations.push({
      type: 'warning',
      message: 'Check Llama 2 license',
      reason: 'Commercial use restrictions apply above 700M MAU'
    });
  }

  return recommendations;
};

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};