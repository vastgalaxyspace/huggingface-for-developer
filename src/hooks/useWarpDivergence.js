import { useMemo } from "react";

const WARP_SIZE = 32;

function normalizeExpression(input) {
  if (!input) return "";
  const trimmed = input.trim();
  const ifMatch = trimmed.match(/^if\s*\((.*)\)$/i);
  const raw = ifMatch ? ifMatch[1] : trimmed;

  return raw
    .replace(/(^|[^.\w])x(?=[^\w]|$)/g, "$1threadIdx.x")
    .replace(/(^|[^.\w])y(?=[^\w]|$)/g, "$1threadIdx.y")
    .replace(/(^|[^.\w])z(?=[^\w]|$)/g, "$1threadIdx.z")
    .trim();
}

function buildSafeExpression(expression, threadId) {
  return expression
    .replace(/threadIdx\.x/g, String(threadId))
    .replace(/threadIdx\.y/g, "0")
    .replace(/threadIdx\.z/g, "0")
    .replace(/blockIdx\.x/g, "0")
    .replace(/blockDim\.x/g, "32")
    .replace(/blockDim\.y/g, "1");
}

export function evaluateCondition(expression) {
  const normalizedExpression = normalizeExpression(expression);
  const results = [];

  for (let threadId = 0; threadId < WARP_SIZE; threadId += 1) {
    const safeExpr = buildSafeExpression(normalizedExpression, threadId);

    try {
      const result = Boolean(new Function(`return (${safeExpr})`)());
      results.push({ threadId, active: result, error: false });
    } catch {
      results.push({ threadId, active: false, error: true });
    }
  }

  return results;
}

export function validateExpression(expression) {
  const normalizedExpression = normalizeExpression(expression);
  if (!normalizedExpression) {
    return { valid: false, error: "Enter a conditional expression." };
  }

  try {
    const safeExpr = buildSafeExpression(normalizedExpression, 0);
    new Function(`return (${safeExpr})`)();
    return { valid: true, warning: null };
  } catch (error) {
    return { valid: false, error: error.message || "Invalid expression." };
  }
}

function buildDivergencePasses(results) {
  const trueThreads = results.filter((result) => result.active).map((result) => result.threadId);
  const falseThreads = results.filter((result) => !result.active).map((result) => result.threadId);
  const errorThreads = results.filter((result) => result.error).map((result) => result.threadId);
  const parseError = errorThreads.length > 0;

  if (parseError) {
    return {
      passes: [
        {
          id: 1,
          label: "PASS 1",
          active_threads: [],
          waiting_threads: [],
          inactive_threads: Array.from({ length: WARP_SIZE }, (_, index) => index),
          description: "Expression could not be evaluated for this warp.",
          no_divergence: true,
        },
      ],
      trueThreads,
      falseThreads,
      parseError,
      expressionValid: false,
      noDivergence: false,
    };
  }

  if (trueThreads.length === WARP_SIZE || trueThreads.length === 0) {
    return {
      passes: [
        {
          id: 1,
          label: "PASS 1",
          active_threads: Array.from({ length: WARP_SIZE }, (_, index) => index),
          waiting_threads: [],
          inactive_threads: [],
          description: trueThreads.length === WARP_SIZE
            ? "All threads execute the if-branch. No divergence."
            : "All threads execute the else-branch. No divergence.",
          no_divergence: true,
        },
      ],
      trueThreads,
      falseThreads,
      parseError: false,
      expressionValid: true,
      noDivergence: true,
    };
  }

  return {
    passes: [
      {
        id: 1,
        label: "PASS 1",
        active_threads: trueThreads,
        waiting_threads: falseThreads,
        inactive_threads: [],
        description: "Executing the if-branch. Non-matching threads are waiting.",
        no_divergence: false,
      },
      {
        id: 2,
        label: "PASS 2",
        active_threads: falseThreads,
        waiting_threads: trueThreads,
        inactive_threads: [],
        description: "Executing the else-branch. Previously active threads become idle.",
        no_divergence: false,
      },
    ],
    trueThreads,
    falseThreads,
    parseError: false,
    expressionValid: true,
    noDivergence: false,
  };
}

function buildNestedPasses(primaryExpression, nestedExpression) {
  const primaryResults = evaluateCondition(primaryExpression);
  const nestedResults = evaluateCondition(nestedExpression);
  const parseError = primaryResults.some((result) => result.error) || nestedResults.some((result) => result.error);

  if (parseError) {
    return buildDivergencePasses(primaryResults);
  }

  const pathA = [];
  const pathB = [];
  const pathC = [];

  for (let threadId = 0; threadId < WARP_SIZE; threadId += 1) {
    if (primaryResults[threadId].active) {
      if (nestedResults[threadId].active) pathA.push(threadId);
      else pathB.push(threadId);
    } else {
      pathC.push(threadId);
    }
  }

  const passes = [];
  const groups = [
    { id: 1, label: "PASS 1", active_threads: pathA, waiting_threads: [...pathB, ...pathC], description: "Executing nested path A. Other lanes are masked.", accent: "green" },
    { id: 2, label: "PASS 2", active_threads: pathB, waiting_threads: [...pathA, ...pathC], description: "Executing nested path B. Remaining lanes continue waiting.", accent: "green" },
    { id: 3, label: "PASS 3", active_threads: pathC, waiting_threads: [...pathA, ...pathB], description: "Executing the outer else-path. Nested if-paths are now idle.", accent: "orange" },
  ];

  groups.forEach((group) => {
    if (group.active_threads.length > 0) {
      passes.push({ ...group, inactive_threads: [], no_divergence: false });
    }
  });

  if (passes.length === 1) {
    passes[0].description = `No divergence - all ${passes[0].active_threads.length} threads execute the same path.`;
    passes[0].no_divergence = true;
  }

  return {
    passes,
    trueThreads: pathA,
    falseThreads: [...pathB, ...pathC],
    parseError: false,
    expressionValid: true,
    noDivergence: passes.length === 1,
    nestedCounts: { pathA: pathA.length, pathB: pathB.length, pathC: pathC.length },
  };
}

function calculateMetrics({ passes, trueThreads, falseThreads, expression, noDivergence }) {
  let numPasses = passes.length || 1;
  let efficiency = noDivergence ? 100 : (WARP_SIZE / (WARP_SIZE * numPasses)) * 100;

  const moduloMatch = expression.match(/%\s*(\d+)/);
  if (!noDivergence && moduloMatch) {
    const n = Number.parseInt(moduloMatch[1], 10);
    if (n > numPasses) {
      numPasses = n;
      efficiency = (WARP_SIZE / (WARP_SIZE * n)) * 100;
    }
  }

  const activePassSizes = passes.map((pass) => pass.active_threads.length);
  const maxActive = Math.max(...activePassSizes, 0);
  const wastedSlots = WARP_SIZE - maxActive;
  const serializationOverhead = (((numPasses - 1) / numPasses) * 100);
  const branchImbalance = Math.abs(trueThreads.length - falseThreads.length) / WARP_SIZE * 100;

  return {
    efficiency: Number(efficiency.toFixed(1)),
    numPasses,
    wastedSlots,
    serializationOverhead: Number(serializationOverhead.toFixed(1)),
    branchImbalance: Number(branchImbalance.toFixed(1)),
  };
}

function getRecommendedFix(expression, activeCount, noDivergence) {
  if (noDivergence) return "Keep this branch structure - it is already warp-friendly.";
  if (/%/.test(expression)) return "Group similar data per warp to avoid modulo-driven divergence.";
  if (/[<>]=?\s*\d+/.test(expression)) return "Align thresholds to warp boundaries where possible.";
  if (/&&|\|\|/.test(expression)) return "Consider branchless selection or predication for complex conditionals.";
  if (activeCount <= 1) return "Avoid single-lane special cases inside hot warps.";
  return "Consider branchless code paths or warp-aligned work partitioning.";
}

function buildExplainer(expression, analysis) {
  const normalizedExpression = normalizeExpression(expression);
  const activeCount = analysis.true_threads.length;
  const waitingCount = analysis.false_threads.length;

  let happened = `Only ${activeCount} of 32 threads take the if-branch. ${waitingCount} threads sit idle during pass 1, then ${activeCount} sit idle during pass 2. Efficiency: ${analysis.efficiency}%.`;

  if (analysis.no_divergence) {
    const resultWord = activeCount === 32 ? "true" : "false";
    happened = `All 32 threads evaluate ${normalizedExpression} to ${resultWord}. The warp executes as a single unit with no serialization.`;
  } else if (activeCount === 16 && waitingCount === 16) {
    happened = "The warp splits into two equal groups of 16 threads. GPU must serialize both branches - 50% efficiency.";
  } else if (activeCount === 1) {
    happened = `Only thread ${analysis.true_threads[0]} takes the if-branch. 31 threads are idle in pass 1. This is worst-case divergence.`;
  }

  let fix = "Warp divergence is unavoidable sometimes, but minimizing it is key to high GPU occupancy and throughput.";
  if (/%/.test(normalizedExpression)) {
    fix = "Consider restructuring data so threads in the same warp process elements of the same type - eliminating the modulo branch. Warp divergence is unavoidable sometimes, but minimizing it is key to high GPU occupancy and throughput.";
  } else if (/threadIdx\.x\s*<\s*\d+/.test(normalizedExpression)) {
    fix = "This condition is warp-aligned if the threshold is a multiple of 32. Consider padding data to warp boundaries. Warp divergence is unavoidable sometimes, but minimizing it is key to high GPU occupancy and throughput.";
  } else if (/&&|\|\|/.test(normalizedExpression)) {
    fix = "Consider using branchless code patterns: result = condition ? val_a : val_b; (no branch, no divergence). Warp divergence is unavoidable sometimes, but minimizing it is key to high GPU occupancy and throughput.";
  }

  return { happened, fix };
}

export function analyzeWarpDivergence({ expression, nestedEnabled = false, nestedExpression = "" }) {
  const normalizedExpression = normalizeExpression(expression);
  const validation = validateExpression(normalizedExpression);

  if (!validation.valid) {
    return {
      normalizedExpression,
      passes: [],
      efficiency: 0,
      num_passes: 0,
      true_threads: [],
      false_threads: [],
      active_count: 0,
      waiting_count: 0,
      wasted_slots: 32,
      serialization_overhead: 0,
      no_divergence: false,
      parse_error: true,
      expression_valid: false,
      branch_imbalance: 0,
      recommended_fix: "Fix the expression syntax first.",
      explainer: { happened: "The expression could not be evaluated.", fix: "Check operators, parentheses, and CUDA thread symbols." },
      validation,
    };
  }

  const passData = nestedEnabled
    ? buildNestedPasses(normalizedExpression, nestedExpression)
    : buildDivergencePasses(evaluateCondition(normalizedExpression));

  const metrics = calculateMetrics({
    passes: passData.passes,
    trueThreads: passData.trueThreads,
    falseThreads: passData.falseThreads,
    expression: normalizedExpression,
    noDivergence: passData.noDivergence,
  });

  return {
    normalizedExpression,
    passes: passData.passes,
    efficiency: metrics.efficiency,
    num_passes: metrics.numPasses,
    true_threads: passData.trueThreads,
    false_threads: passData.falseThreads,
    active_count: passData.trueThreads.length,
    waiting_count: passData.falseThreads.length,
    wasted_slots: metrics.wastedSlots,
    serialization_overhead: metrics.serializationOverhead,
    no_divergence: passData.noDivergence,
    parse_error: passData.parseError,
    expression_valid: passData.expressionValid,
    branch_imbalance: metrics.branchImbalance,
    recommended_fix: getRecommendedFix(normalizedExpression, passData.trueThreads.length, passData.noDivergence),
    explainer: buildExplainer(normalizedExpression, {
      ...passData,
      efficiency: metrics.efficiency,
      true_threads: passData.trueThreads,
      false_threads: passData.falseThreads,
      no_divergence: passData.noDivergence,
    }),
    validation: {
      ...validation,
      warning: passData.noDivergence ? "Valid expression, but no divergence detected." : null,
    },
  };
}

export function useWarpDivergence(options) {
  const { expression, nestedEnabled, nestedExpression } = options;
  return useMemo(
    () => analyzeWarpDivergence({ expression, nestedEnabled, nestedExpression }),
    [expression, nestedEnabled, nestedExpression],
  );
}

export { normalizeExpression, WARP_SIZE };
