// Curated model × GPU combinations for the "Can I run {model} on {GPU}?" feature.
// Kept to a moderate, genuinely-useful set (real popular search targets) rather than
// mass-generating thin pages. Only these combos are indexed; arbitrary combos still
// work but are marked noindex.
//
// Model specs are stable, well-known architecture values used to compute an
// accurate KV cache (layers, kv_heads, head_dim). paramsB is the parameter count in
// billions.

export const CURATED_GPUS = [
  { slug: 'rtx-4090', name: 'RTX 4090', vram: 24, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-4080', name: 'RTX 4080', vram: 16, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-4070', name: 'RTX 4070', vram: 12, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-3090', name: 'RTX 3090', vram: 24, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-3060', name: 'RTX 3060', vram: 12, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-a6000', name: 'RTX A6000', vram: 48, tier: 'Workstation', vendor: 'NVIDIA' },
  { slug: 'l4', name: 'NVIDIA L4', vram: 24, tier: 'Data center', vendor: 'NVIDIA' },
  { slug: 'a100-40gb', name: 'A100 40GB', vram: 40, tier: 'Data center', vendor: 'NVIDIA' },
  { slug: 'a100-80gb', name: 'A100 80GB', vram: 80, tier: 'Data center', vendor: 'NVIDIA' },
  { slug: 'h100', name: 'H100 80GB', vram: 80, tier: 'Data center', vendor: 'NVIDIA' },
];

export const CURATED_MODELS = [
  {
    id: 'meta-llama/Llama-3.2-3B-Instruct',
    label: 'Llama 3.2 3B Instruct',
    paramsB: 3.21,
    layers: 28, heads: 24, kvHeads: 8, headDim: 128, hiddenSize: 3072, context: 131072, moe: false,
  },
  {
    id: 'meta-llama/Llama-3.1-8B-Instruct',
    label: 'Llama 3.1 8B Instruct',
    paramsB: 8.03,
    layers: 32, heads: 32, kvHeads: 8, headDim: 128, hiddenSize: 4096, context: 131072, moe: false,
  },
  {
    id: 'meta-llama/Llama-3.1-70B-Instruct',
    label: 'Llama 3.1 70B Instruct',
    paramsB: 70.6,
    layers: 80, heads: 64, kvHeads: 8, headDim: 128, hiddenSize: 8192, context: 131072, moe: false,
  },
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.3',
    label: 'Mistral 7B Instruct v0.3',
    paramsB: 7.25,
    layers: 32, heads: 32, kvHeads: 8, headDim: 128, hiddenSize: 4096, context: 32768, moe: false,
  },
  {
    id: 'Qwen/Qwen2.5-7B-Instruct',
    label: 'Qwen2.5 7B Instruct',
    paramsB: 7.62,
    layers: 28, heads: 28, kvHeads: 4, headDim: 128, hiddenSize: 3584, context: 32768, moe: false,
  },
  {
    id: 'Qwen/Qwen2.5-32B-Instruct',
    label: 'Qwen2.5 32B Instruct',
    paramsB: 32.8,
    layers: 64, heads: 40, kvHeads: 8, headDim: 128, hiddenSize: 5120, context: 32768, moe: false,
  },
  {
    id: 'google/gemma-2-9b-it',
    label: 'Gemma 2 9B Instruct',
    paramsB: 9.24,
    layers: 42, heads: 16, kvHeads: 8, headDim: 256, hiddenSize: 3584, context: 8192, moe: false,
  },
  {
    id: 'google/gemma-2-27b-it',
    label: 'Gemma 2 27B Instruct',
    paramsB: 27.2,
    layers: 46, heads: 32, kvHeads: 16, headDim: 128, hiddenSize: 4608, context: 8192, moe: false,
  },
];

export function gpuBySlug(slug) {
  return CURATED_GPUS.find((gpu) => gpu.slug === slug) || null;
}

export function modelById(id) {
  const normalized = decodeURIComponent(String(id || '')).trim();
  return CURATED_MODELS.find((model) => model.id.toLowerCase() === normalized.toLowerCase()) || null;
}

export function modelPathSegments(id) {
  return id.split('/').map(encodeURIComponent);
}

export function canIRunPath(gpuSlug, modelId) {
  return `/can-i-run/${gpuSlug}/${modelPathSegments(modelId).join('/')}`;
}

// All curated indexable combinations (model × GPU).
export function getCuratedCombos() {
  const combos = [];
  for (const gpu of CURATED_GPUS) {
    for (const model of CURATED_MODELS) {
      combos.push({ gpu, model });
    }
  }
  return combos;
}

export function isCuratedCombo(gpuSlug, modelId) {
  return Boolean(gpuBySlug(gpuSlug) && modelById(modelId));
}
