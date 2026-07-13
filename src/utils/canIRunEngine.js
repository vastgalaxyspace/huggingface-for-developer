// "Can I run {model} on {GPU}?" evaluation engine.
// Pure functions, no React. Reuses the corrected VRAM engine so the weight and
// KV-cache math stays consistent with the calculator.

import { calculateVRAM, calculateKVCacheVRAM } from './vramCalculator';

// Reference context length used for the headline verdict. A short, realistic prompt
// length; the page also explains how longer context changes the result.
export const REFERENCE_CONTEXT = 4096;

const PRECISIONS = [
  { key: 'fp16', label: 'FP16 / BF16', note: 'full quality' },
  { key: 'int8', label: 'INT8 (8-bit)', note: 'near-full quality' },
  { key: 'int4', label: 'INT4 (4-bit)', note: 'GPTQ / AWQ / GGUF Q4' },
];

function toConfig(model) {
  return {
    num_hidden_layers: model.layers,
    num_attention_heads: model.heads,
    num_key_value_heads: model.kvHeads,
    head_dim: model.headDim,
    hidden_size: model.hiddenSize,
    max_position_embeddings: model.context,
    num_experts: model.moe ? model.numExperts || 8 : undefined,
  };
}

function verdict(totalGB, gpuVram) {
  if (totalGB <= gpuVram * 0.9) return 'fits';
  if (totalGB <= gpuVram) return 'tight';
  return 'no';
}

/**
 * Build per-precision fit rows from weight estimates + a KV-cache size against a GPU.
 * @param {object} weights - { fp16, int8, int4 } weight VRAM in GB (from calculateVRAM)
 * @param {number} kvGB - KV cache in GB
 * @param {number} gpuVram - GPU VRAM in GB
 */
export function buildFitRows(weights, kvGB, gpuVram) {
  return PRECISIONS.map((p) => {
    const weightGB = weights[p.key];
    const totalGB = Number((weightGB + kvGB).toFixed(1));
    return {
      precision: p.key,
      label: p.label,
      note: p.note,
      weightGB,
      kvGB: Number(kvGB.toFixed(1)),
      totalGB,
      status: verdict(totalGB, gpuVram),
      utilization: gpuVram > 0 ? Math.round((totalGB / gpuVram) * 100) : null,
    };
  });
}

/** Derive the headline verdict + best runnable precision from fit rows. */
export function summarizeRows(rows) {
  const runnable = rows.find((r) => r.status === 'fits') || rows.find((r) => r.status === 'tight');
  let headline;
  if (rows[0].status === 'fits') headline = 'yes-full';
  else if (runnable) headline = 'yes-quantized';
  else headline = 'no';
  return { headline, bestPrecision: runnable ? runnable.precision : null };
}

/**
 * Evaluate an already-computed model (live VRAM estimates + config) across a list of
 * GPUs. Used by model detail pages where weights come from real safetensors metadata.
 * @param {object} params - { vramEstimates, config }
 * @param {Array} gpus - [{ name, vram, ... }]
 * @param {number} context - context length for the KV cache
 */
export function evaluateAcrossGpus({ vramEstimates, config }, gpus, context = REFERENCE_CONTEXT) {
  if (!vramEstimates || !vramEstimates.fp16) return [];
  const kvGB = calculateKVCacheVRAM(config, context);
  return gpus.map((gpu) => {
    const rows = buildFitRows(vramEstimates, kvGB, gpu.vram);
    const { headline, bestPrecision } = summarizeRows(rows);
    const best = rows.find((r) => r.precision === bestPrecision) || null;
    return { gpu, headline, bestPrecision, best, kvGB: Number(kvGB.toFixed(1)) };
  });
}

/**
 * Evaluate whether a model fits on a GPU across precisions.
 * @param {object} model - Curated model spec (paramsB, layers, kvHeads, headDim, ...)
 * @param {number} gpuVram - GPU VRAM in GB
 * @param {number} context - Context length for the KV cache
 * @returns {object} Structured result with per-precision breakdown and a headline verdict
 */
export function evaluateModelOnGpu(model, gpuVram, context = REFERENCE_CONTEXT) {
  const config = toConfig(model);
  const weights = calculateVRAM(config, { safetensorsTotal: model.paramsB * 1e9 });
  const kvGB = calculateKVCacheVRAM(config, context);

  const rows = buildFitRows(weights, kvGB, gpuVram);
  const { headline, bestPrecision } = summarizeRows(rows);
  const anyFits = headline !== 'no';

  // How many of this GPU would be needed at 4-bit (for the "no" case).
  const int4Total = rows[rows.length - 1].totalGB;
  const gpusNeeded = anyFits ? 1 : Math.max(2, Math.ceil(int4Total / gpuVram));

  return {
    gpuVram,
    context,
    kvGB: Number(kvGB.toFixed(1)),
    rows,
    headline,
    bestPrecision,
    gpusNeeded,
  };
}
