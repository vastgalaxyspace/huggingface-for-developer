// "Can I fine-tune {model} on {GPU}?" memory engine.
//
// Pure functions, no React. Training memory is a different calculation from
// inference and is routinely underestimated: inference needs roughly 2 bytes per
// parameter, while a full fine-tune with Adam needs about 16. That factor of eight
// is why a model you can serve comfortably may be impossible to train.
//
// Terms, per trainable parameter, for mixed-precision training:
//   bf16 weights        2 bytes   (the copy used for forward/backward)
//   bf16 gradients      2 bytes
//   fp32 master weights 4 bytes   (kept for numerically stable updates)
//   Adam m + v          8 bytes   (two fp32 moments)
//                      --------
//                      16 bytes
//
// LoRA freezes the base model, so only the small adapter carries gradients, master
// weights, and optimizer state. QLoRA additionally stores the frozen base in 4-bit.
// That is the whole reason QLoRA works on consumer hardware.

const GB = 1024 ** 3;

// Bytes per parameter for the frozen/base copy under each method.
// NF4 is 4 bits plus quantization constants; with double quantization the realised
// cost lands near 0.55 bytes/param rather than a clean 0.5.
const BASE_BYTES = {
  full: 2, // bf16
  lora: 2, // bf16, frozen
  qlora: 0.55, // NF4 + double-quant constants, frozen
};

// Optimizer state bytes per *trainable* parameter.
const OPTIMIZER_BYTES = {
  adamw: 8, // fp32 m + fp32 v
  adamw8bit: 2, // bitsandbytes 8-bit m + v
  sgd: 4, // fp32 momentum buffer
};

export const METHODS = [
  { key: 'full', label: 'Full fine-tune', blurb: 'Every weight updated. Best quality ceiling, highest cost.' },
  { key: 'lora', label: 'LoRA', blurb: 'Frozen bf16 base plus small trainable adapters.' },
  { key: 'qlora', label: 'QLoRA', blurb: 'Frozen 4-bit base plus adapters. Cheapest way to train.' },
];

export const OPTIMIZERS = [
  { key: 'adamw', label: 'AdamW (fp32)' },
  { key: 'adamw8bit', label: 'AdamW 8-bit' },
  { key: 'sgd', label: 'SGD + momentum' },
];

/**
 * Trainable parameter count for a LoRA/QLoRA adapter.
 *
 * Each adapted linear layer of shape (d_in, d_out) gains two matrices of rank r,
 * costing r * (d_in + d_out) parameters. Targeting the four attention projections
 * with square-ish shapes gives roughly 8 * r * hidden per layer; including the MLP
 * projections adds the larger intermediate dimension on top.
 *
 * @param {object} model - { layers, hiddenSize, intermediateSize? }
 * @param {number} rank - LoRA rank r.
 * @param {boolean} includeMlp - Whether MLP projections are adapted too.
 * @returns {number} Trainable parameters.
 */
export function loraAdapterParams(model, rank = 16, includeMlp = false) {
  const { layers, hiddenSize } = model;
  if (!layers || !hiddenSize || !rank) return 0;

  // q, k, v, o — each approximately (hidden, hidden).
  const attention = 4 * rank * (hiddenSize + hiddenSize);
  if (!includeMlp) return layers * attention;

  // Llama-style MLP: gate and up are (hidden, intermediate), down is (intermediate,
  // hidden). Intermediate is ~3.5x hidden when the model does not report it.
  const intermediate = model.intermediateSize || Math.round(hiddenSize * 3.5);
  const mlp = 3 * rank * (hiddenSize + intermediate);
  return layers * (attention + mlp);
}

/**
 * Activation memory during a training step.
 *
 * Uses the per-layer estimate from the Megatron-LM activation-recomputation work:
 *
 *   no recomputation:  s*b*h * (34 + 5*a*s/h) bytes per layer
 *   full recomputation: 2*s*b*h bytes per layer (only the layer input is kept)
 *
 * The quadratic term is attention, which is why sequence length hurts far more than
 * batch size. Gradient checkpointing trades roughly 30% extra compute for an order
 * of magnitude less activation memory, and is on by default in most trainers —
 * without it, activations rather than weights are usually what runs you out of VRAM.
 *
 * @param {object} model - { layers, hiddenSize, heads }
 * @param {number} batchSize - Per-device batch size (not counting accumulation).
 * @param {number} seqLen - Sequence length in tokens.
 * @param {boolean} gradientCheckpointing
 * @returns {number} Bytes.
 */
export function activationBytes(model, batchSize, seqLen, gradientCheckpointing = true) {
  const { layers, hiddenSize, heads } = model;
  if (!layers || !hiddenSize || !batchSize || !seqLen) return 0;

  const sbh = seqLen * batchSize * hiddenSize;
  if (gradientCheckpointing) {
    // Stored layer inputs, plus one layer recomputed in full at any moment.
    const attnHeads = heads || Math.max(1, Math.round(hiddenSize / 128));
    const oneLayerFull = sbh * (34 + (5 * attnHeads * seqLen) / hiddenSize);
    return layers * 2 * sbh + oneLayerFull;
  }
  const attnHeads = heads || Math.max(1, Math.round(hiddenSize / 128));
  return layers * sbh * (34 + (5 * attnHeads * seqLen) / hiddenSize);
}

/**
 * Estimate total VRAM to fine-tune a model.
 *
 * @param {object} model - { paramsB, layers, hiddenSize, heads, intermediateSize? }
 * @param {object} opts
 * @param {string} opts.method - 'full' | 'lora' | 'qlora'
 * @param {string} opts.optimizer - 'adamw' | 'adamw8bit' | 'sgd'
 * @param {number} opts.batchSize
 * @param {number} opts.seqLen
 * @param {number} opts.loraRank
 * @param {boolean} opts.loraTargetMlp
 * @param {boolean} opts.gradientCheckpointing
 * @returns {object} Per-component breakdown in GB plus the total.
 */
export function estimateFineTuneVram(model, opts = {}) {
  const {
    method = 'qlora',
    optimizer = 'adamw',
    batchSize = 1,
    seqLen = 2048,
    loraRank = 16,
    loraTargetMlp = false,
    gradientCheckpointing = true,
  } = opts;

  const totalParams = (model.paramsB || 0) * 1e9;
  const baseBytesPerParam = BASE_BYTES[method] ?? BASE_BYTES.qlora;
  const optBytesPerParam = OPTIMIZER_BYTES[optimizer] ?? OPTIMIZER_BYTES.adamw;

  const isAdapter = method === 'lora' || method === 'qlora';
  const trainableParams = isAdapter
    ? loraAdapterParams(model, loraRank, loraTargetMlp)
    : totalParams;

  // Frozen or forward-pass copy of the base model.
  const weights = totalParams * baseBytesPerParam;

  // Gradients: bf16, only for trainable parameters.
  const gradients = trainableParams * 2;

  // fp32 master weights exist only for parameters the optimizer updates.
  const masterWeights = trainableParams * 4;

  const optimizerState = trainableParams * optBytesPerParam;

  const activations = activationBytes(model, batchSize, seqLen, gradientCheckpointing);

  // CUDA context, fragmentation, cuBLAS workspaces, and the trainer itself.
  const overheadFixed = 0.8 * GB;
  const subtotal = weights + gradients + masterWeights + optimizerState + activations;
  const overhead = overheadFixed + subtotal * 0.05;

  const total = subtotal + overhead;

  const toGB = (bytes) => Number((bytes / GB).toFixed(2));

  return {
    method,
    optimizer,
    trainableParams,
    trainablePercent: totalParams ? Number(((trainableParams / totalParams) * 100).toFixed(3)) : 0,
    breakdown: {
      weights: toGB(weights),
      gradients: toGB(gradients),
      masterWeights: toGB(masterWeights),
      optimizerState: toGB(optimizerState),
      activations: toGB(activations),
      overhead: toGB(overhead),
    },
    totalGB: toGB(total),
  };
}

/** Verdict for a training configuration against a specific card. */
export function fineTuneVerdict(totalGB, gpuVram) {
  if (!gpuVram) return 'unknown';
  if (totalGB <= gpuVram * 0.9) return 'fits';
  if (totalGB <= gpuVram) return 'tight';
  return 'no';
}

/**
 * Evaluate all three methods for a model against one GPU.
 * @returns {Array} One entry per method, cheapest first.
 */
export function compareMethods(model, gpuVram, opts = {}) {
  return METHODS.map((m) => {
    const estimate = estimateFineTuneVram(model, { ...opts, method: m.key });
    return {
      ...m,
      ...estimate,
      status: fineTuneVerdict(estimate.totalGB, gpuVram),
      gpusNeeded:
        gpuVram && estimate.totalGB > gpuVram ? Math.ceil(estimate.totalGB / gpuVram) : 1,
    };
  });
}
