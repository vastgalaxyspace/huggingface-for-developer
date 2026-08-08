// "Can I run {model} on {GPU}?" evaluation engine.
// Pure functions, no React. Reuses the corrected VRAM engine so the weight and
// KV-cache math stays consistent with the calculator.

// Explicit .js extension so plain Node ESM (the scripts/ checks) can import this
// module, not just the bundler. Same reason as src/lib/modelEditorial.js.
import { calculateVRAM, calculateKVCacheVRAM } from './vramCalculator.js';

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

// Fraction of peak memory bandwidth a real decode loop achieves. Peak is a
// marketing number nobody hits; well-optimized runtimes land around 55-70% on a
// single stream once kernel launch overhead, attention, and sampling are counted.
// 0.6 matches the estimate already used by the GPU picker (useGpuPicker.js), so the
// two tools do not contradict each other.
const DECODE_BANDWIDTH_EFFICIENCY = 0.6;

// Fixed per-token cost that does not shrink with the model: sampling, detokenization,
// kernel launch and scheduling. Pure bandwidth math ignores it and therefore predicts
// absurd figures for small models on fast cards — a 3B at 4-bit on an H200 comes out
// near 1,800 tok/s, where real single-stream decoding tops out in the hundreds because
// this overhead, not memory, becomes the limit. 2 ms keeps the ceiling near 500 tok/s.
const DECODE_OVERHEAD_SECONDS = 0.002;

const BYTES_PER_PARAM = { fp16: 2, int8: 1, int4: 0.5 };

/**
 * Estimate single-stream decode speed in tokens per second.
 *
 * Generating one token requires reading every weight once, so decode is bound by
 * memory bandwidth rather than compute. Time per token is that read plus a fixed
 * overhead that does not scale with model size:
 *
 *   seconds/token ~= bytes read / (bandwidth x efficiency) + fixed overhead
 *   tokens/sec     = 1 / seconds per token
 *
 * This is why quantizing speeds generation up roughly in proportion to the bytes
 * saved, and why a card with more TFLOPS but less bandwidth can generate slower.
 * The overhead term is what stops small models on fast cards from reporting
 * thousands of tokens per second. Batched serving behaves differently — the weight
 * read is amortized across the batch — so this is explicitly the single-user number.
 *
 * @param {number} paramsB - Active parameters in billions.
 * @param {number} bandwidthGBs - Peak memory bandwidth in GB/s.
 * @param {string} precision - 'fp16' | 'int8' | 'int4'.
 * @returns {number|null} Estimated tokens/sec, or null if inputs are unusable.
 */
export function estimateDecodeSpeed(paramsB, bandwidthGBs, precision = 'fp16') {
  const bytesPerParam = BYTES_PER_PARAM[precision];
  if (!bytesPerParam || !(paramsB > 0) || !(bandwidthGBs > 0)) return null;

  const bytesPerToken = paramsB * 1e9 * bytesPerParam;
  const usableBytesPerSec = bandwidthGBs * 1e9 * DECODE_BANDWIDTH_EFFICIENCY;
  const secondsPerToken = bytesPerToken / usableBytesPerSec + DECODE_OVERHEAD_SECONDS;
  const tokensPerSec = 1 / secondsPerToken;

  // Sub-1 tok/s is real but the exact figure is meaningless at that point.
  return tokensPerSec < 1 ? Number(tokensPerSec.toFixed(1)) : Math.round(tokensPerSec);
}

/** Rough usability banding for a decode-speed estimate. */
export function decodeSpeedBand(tokensPerSec) {
  if (tokensPerSec === null) return null;
  if (tokensPerSec >= 30) return 'fast'; // faster than most people read
  if (tokensPerSec >= 10) return 'usable'; // fine for chat, sluggish for long output
  if (tokensPerSec >= 3) return 'slow'; // batch work only
  return 'impractical';
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
