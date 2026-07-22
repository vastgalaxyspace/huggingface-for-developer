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
    monthlyActiveUsers = 10000,
    hoursPerDay = 24,
    daysPerMonth = 30
  } = usage;

  const vram = parseFloat(modelData.vramEstimates?.fp16 || 16);
  const comparison = compareOptions(tokensPerMonth, vram, hoursPerDay, daysPerMonth);

  return {
    api: calculateAPICost(tokensPerMonth, vram),
    cloudGPU: calculateCloudGPUCost(vram, hoursPerDay, daysPerMonth),
    selfHosted: calculateSelfHostedCost(vram),
    comparison,
    breakEven: calculateBreakEven(tokensPerMonth, vram),
    recommendations: generateCostRecommendations(tokensPerMonth, vram, monthlyActiveUsers, comparison)
  };
};

/**
 * API Service Costs
 *
 * Prices are blended input+output per 1K tokens, current as of July 2026, and are
 * deliberately illustrative: real cost swings with model size (serverless open-model
 * rates span roughly $0.03–$4.50 per 1M tokens) and with your input/output ratio.
 * Serverless providers here are priced for a mid-size open model; the frontier row is
 * a managed closed API for contrast.
 *
 * These move often. Re-check against provider pricing pages before treating any
 * number as a quote.
 */
const API_PRICING_UPDATED = '2026-07';

// Serverless per-token price tracks model size — a 70B costs far more per token than a
// 3B. Rates are $ per 1K tokens for a mid-tier serverless host, interpolated across the
// observed 2026 range (~$0.03–$4.50 per 1M tokens), anchored on ~$1.04/1M for 70B-class.
// vram is the FP16 footprint, from which params ≈ vram / 2.3 (2 bytes + ~15% overhead).
const serverlessRatePer1k = (vram) => {
  const params = vram / 2.3;
  if (params < 5) return 0.0001;
  if (params < 10) return 0.0002;
  if (params < 20) return 0.00035;
  if (params < 40) return 0.0006;
  return 0.00104;
};

const calculateAPICost = (tokensPerMonth, vram = 16) => {
  const base = serverlessRatePer1k(vram);
  const perMonth = (rate) => (tokensPerMonth / 1000) * rate;

  const providers = {
    together: {
      name: 'Together AI',
      costPer1k: base,
      monthly: perMonth(base),
      setup: 0,
      maintenance: 0,
      scaling: 'Automatic',
      pros: ['No infrastructure', 'Auto-scaling', 'Pay per use', 'No DevOps'],
      cons: ['Data privacy concerns', 'Vendor lock-in', 'API rate limits', 'Network latency']
    },
    huggingface: {
      name: 'Hugging Face Inference',
      costPer1k: base * 2,
      monthly: perMonth(base * 2),
      setup: 0,
      maintenance: 0,
      scaling: 'Automatic',
      pros: ['Integrated ecosystem', 'Easy to start', 'Model updates'],
      cons: ['Higher cost than raw compute', 'Rate limits', 'Less control']
    },
    replicate: {
      name: 'Replicate',
      costPer1k: base * 2.5,
      monthly: perMonth(base * 2.5),
      setup: 0,
      maintenance: 0,
      scaling: 'Automatic',
      pros: ['Easy deployment', 'Flexible billing', 'Good documentation'],
      cons: ['Cold starts', 'Cost at scale', 'Limited customization']
    },
    frontier: {
      name: 'Frontier closed API (Sonnet-class)',
      costPer1k: 0.0036,
      monthly: perMonth(0.0036),
      setup: 0,
      maintenance: 0,
      scaling: 'Automatic',
      pros: ['Top quality', 'Reliable', 'No ops burden'],
      cons: ['Highest per-token cost', 'No weight access', 'Provider retention policy']
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
    .filter(([, inst]) => inst.suitable)
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
  const api = calculateAPICost(tokensPerMonth, vram);
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
  const api = calculateAPICost(tokensPerMonth, vram);
  const cloud = calculateCloudGPUCost(vram, 24, 30);
  const selfHosted = calculateSelfHostedCost(vram);

  const cheapestAPI = Math.min(...Object.values(api).map(p => p.monthly));
  
  // Guard against division by zero and negative values
  const cloudVsAPIDiff = cheapestAPI - cloud.recommended.monthly;
  const cloudVsAPIMonths = cloudVsAPIDiff > 0 
    ? Math.ceil(cloud.recommended.setup / cloudVsAPIDiff) 
    : null;

  const selfHostedVsAPICost = cheapestAPI * 12;
  const selfHostedVsAPIMonths = selfHostedVsAPICost > 0 
    ? Math.ceil(selfHosted.total.yearOne / selfHostedVsAPICost) 
    : null;

  const cloudMonthlyTotal = cloud.recommended.monthly + cloud.recommended.maintenance;
  const selfHostedVsCloudMonths = cloudMonthlyTotal > 0 
    ? Math.ceil(selfHosted.total.yearOne / cloudMonthlyTotal) 
    : null;

  return {
    cloudVsAPI: {
      months: cloudVsAPIMonths,
      note: cloudVsAPIDiff <= 0
        ? 'Cloud GPU never breaks even - API cheaper'
        : 'Cloud GPU cheaper from month 1'
    },
    selfHostedVsAPI: {
      months: selfHostedVsAPIMonths,
      note: 'Self-hosted breaks even vs API'
    },
    selfHostedVsCloud: {
      months: selfHostedVsCloudMonths,
      note: 'Self-hosted breaks even vs Cloud GPU'
    }
  };
};

/**
 * Generate recommendations
 */
const generateCostRecommendations = (tokensPerMonth, vram, monthlyActiveUsers, comparison) => {
  const recommendations = [];

  // Drive the headline recommendation from the numbers actually shown to the user.
  // A fixed token threshold used to contradict the table above it (recommending
  // self-hosting while the API column was orders of magnitude cheaper).
  const totals = comparison?.threeYearTotal;
  if (totals) {
    const ranked = [
      { key: 'api', label: 'API services', total: totals.api, why: 'lowest three-year cost at this volume, with no infrastructure to run' },
      { key: 'cloudGPU', label: 'Cloud GPU', total: totals.cloudGPU, why: 'cheapest three-year cost once the GPU stays busy enough to earn its hourly rate' },
      { key: 'selfHosted', label: 'Self-hosted', total: totals.selfHosted, why: 'lowest three-year cost despite the upfront hardware and staffing' },
    ].sort((a, b) => a.total - b.total);

    const winner = ranked[0];
    const runnerUp = ranked[1];
    const margin = runnerUp.total > 0 ? (runnerUp.total - winner.total) / runnerUp.total : 1;

    recommendations.push({
      type: 'success',
      message: `${winner.label} looks cheapest here`,
      reason: `At ${(tokensPerMonth / 1e6).toLocaleString()}M tokens/month it is the ${winner.why} — about ${formatCurrency(winner.total)} over three years versus ${formatCurrency(runnerUp.total)} for ${runnerUp.label}.`
    });

    if (margin < 0.2) {
      recommendations.push({
        type: 'info',
        message: 'The top two options are close',
        reason: `${winner.label} and ${runnerUp.label} are within 20% over three years, which is inside the error bar of these estimates. Decide on privacy, latency, and operational capacity rather than cost alone.`
      });
    }
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
      message: 'Check the model license at this scale',
      reason: 'Some open-weight licenses (e.g. Llama) add commercial terms above a monthly-active-user threshold'
    });
  }

  return recommendations;
};

export const API_PRICING_LAST_UPDATED = API_PRICING_UPDATED;

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
