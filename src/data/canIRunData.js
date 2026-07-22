// Curated model × GPU combinations for the "Can I run {model} on {GPU}?" feature.
// Kept to a moderate, genuinely-useful set (real popular search targets) rather than
// mass-generating thin pages. Only these combos are indexed; arbitrary combos still
// work but are marked noindex.
//
// Model specs are stable, well-known architecture values used to compute an
// accurate KV cache (layers, kv_heads, head_dim). paramsB is the parameter count in
// billions.

// Only `vram` (GB) feeds the fit verdict; `tier`/`vendor` are descriptive metadata
// and are not consumed by the can-i-run engine or pages. VRAM figures are the
// standard advertised on-board memory for each card's mainstream variant.
export const CURATED_GPUS = [
  // Consumer — NVIDIA
  { slug: 'rtx-5090', name: 'RTX 5090', vram: 32, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-5080', name: 'RTX 5080', vram: 16, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-5070-ti', name: 'RTX 5070 Ti', vram: 16, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-5070', name: 'RTX 5070', vram: 12, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-5060-ti-16gb', name: 'RTX 5060 Ti 16GB', vram: 16, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-4090', name: 'RTX 4090', vram: 24, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-4080', name: 'RTX 4080', vram: 16, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-4070-ti-super', name: 'RTX 4070 Ti SUPER', vram: 16, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-4070-super', name: 'RTX 4070 SUPER', vram: 12, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-4070-ti', name: 'RTX 4070 Ti', vram: 12, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-4070', name: 'RTX 4070', vram: 12, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-4060-ti-16gb', name: 'RTX 4060 Ti 16GB', vram: 16, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-4060-ti-8gb', name: 'RTX 4060 Ti 8GB', vram: 8, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-4060', name: 'RTX 4060', vram: 8, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-3090', name: 'RTX 3090', vram: 24, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-3080', name: 'RTX 3080', vram: 10, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-3070', name: 'RTX 3070', vram: 8, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-3060-ti', name: 'RTX 3060 Ti', vram: 8, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-3060', name: 'RTX 3060', vram: 12, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-3050', name: 'RTX 3050', vram: 8, tier: 'Consumer', vendor: 'NVIDIA' },
  { slug: 'rtx-2080-ti', name: 'RTX 2080 Ti', vram: 11, tier: 'Consumer', vendor: 'NVIDIA' },
  // Consumer — AMD Radeon (ROCm / Vulkan via llama.cpp)
  { slug: 'rx-7900-xtx', name: 'Radeon RX 7900 XTX', vram: 24, tier: 'Consumer', vendor: 'AMD' },
  { slug: 'rx-7900-xt', name: 'Radeon RX 7900 XT', vram: 20, tier: 'Consumer', vendor: 'AMD' },
  { slug: 'rx-7800-xt', name: 'Radeon RX 7800 XT', vram: 16, tier: 'Consumer', vendor: 'AMD' },
  { slug: 'rx-9070-xt', name: 'Radeon RX 9070 XT', vram: 16, tier: 'Consumer', vendor: 'AMD' },
  // Workstation
  { slug: 'rtx-6000-ada', name: 'RTX 6000 Ada', vram: 48, tier: 'Workstation', vendor: 'NVIDIA' },
  { slug: 'rtx-a6000', name: 'RTX A6000', vram: 48, tier: 'Workstation', vendor: 'NVIDIA' },
  { slug: 'rtx-a5000', name: 'RTX A5000', vram: 24, tier: 'Workstation', vendor: 'NVIDIA' },
  { slug: 'rtx-a4000', name: 'RTX A4000', vram: 16, tier: 'Workstation', vendor: 'NVIDIA' },
  // Data center
  { slug: 'h200', name: 'H200 141GB', vram: 141, tier: 'Data center', vendor: 'NVIDIA' },
  { slug: 'h100', name: 'H100 80GB', vram: 80, tier: 'Data center', vendor: 'NVIDIA' },
  { slug: 'a100-80gb', name: 'A100 80GB', vram: 80, tier: 'Data center', vendor: 'NVIDIA' },
  { slug: 'a100-40gb', name: 'A100 40GB', vram: 40, tier: 'Data center', vendor: 'NVIDIA' },
  { slug: 'l40s', name: 'NVIDIA L40S', vram: 48, tier: 'Data center', vendor: 'NVIDIA' },
  { slug: 'a10g', name: 'NVIDIA A10G', vram: 24, tier: 'Data center', vendor: 'NVIDIA' },
  { slug: 'l4', name: 'NVIDIA L4', vram: 24, tier: 'Data center', vendor: 'NVIDIA' },
  { slug: 'v100-32gb', name: 'Tesla V100 32GB', vram: 32, tier: 'Data center', vendor: 'NVIDIA' },
  { slug: 't4', name: 'Tesla T4', vram: 16, tier: 'Data center', vendor: 'NVIDIA' },
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
  {
    id: 'Qwen/Qwen2.5-3B-Instruct',
    label: 'Qwen2.5 3B Instruct',
    paramsB: 3.09,
    layers: 36, heads: 16, kvHeads: 2, headDim: 128, hiddenSize: 2048, context: 32768, moe: false,
  },
  {
    id: 'Qwen/Qwen2.5-14B-Instruct',
    label: 'Qwen2.5 14B Instruct',
    paramsB: 14.77,
    layers: 48, heads: 40, kvHeads: 8, headDim: 128, hiddenSize: 5120, context: 32768, moe: false,
  },
  {
    id: 'Qwen/Qwen2.5-72B-Instruct',
    label: 'Qwen2.5 72B Instruct',
    paramsB: 72.71,
    layers: 80, heads: 64, kvHeads: 8, headDim: 128, hiddenSize: 8192, context: 32768, moe: false,
  },
  {
    id: 'Qwen/Qwen2.5-Coder-7B-Instruct',
    label: 'Qwen2.5 Coder 7B Instruct',
    paramsB: 7.62,
    layers: 28, heads: 28, kvHeads: 4, headDim: 128, hiddenSize: 3584, context: 32768, moe: false,
  },
  {
    id: 'Qwen/Qwen2.5-Coder-32B-Instruct',
    label: 'Qwen2.5 Coder 32B Instruct',
    paramsB: 32.76,
    layers: 64, heads: 40, kvHeads: 8, headDim: 128, hiddenSize: 5120, context: 32768, moe: false,
  },
  {
    id: 'Qwen/Qwen3-8B',
    label: 'Qwen3 8B',
    paramsB: 8.19,
    layers: 36, heads: 32, kvHeads: 8, headDim: 128, hiddenSize: 4096, context: 40960, moe: false,
  },
  {
    id: 'Qwen/Qwen3-14B',
    label: 'Qwen3 14B',
    paramsB: 14.77,
    layers: 40, heads: 40, kvHeads: 8, headDim: 128, hiddenSize: 5120, context: 40960, moe: false,
  },
  {
    id: 'Qwen/Qwen3-32B',
    label: 'Qwen3 32B',
    paramsB: 32.76,
    layers: 64, heads: 64, kvHeads: 8, headDim: 128, hiddenSize: 5120, context: 40960, moe: false,
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
    label: 'DeepSeek R1 Distill Qwen 7B',
    paramsB: 7.62,
    layers: 28, heads: 28, kvHeads: 4, headDim: 128, hiddenSize: 3584, context: 131072, moe: false,
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B',
    label: 'DeepSeek R1 Distill Qwen 14B',
    paramsB: 14.77,
    layers: 48, heads: 40, kvHeads: 8, headDim: 128, hiddenSize: 5120, context: 131072, moe: false,
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    label: 'DeepSeek R1 Distill Qwen 32B',
    paramsB: 32.76,
    layers: 64, heads: 40, kvHeads: 8, headDim: 128, hiddenSize: 5120, context: 131072, moe: false,
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Llama-8B',
    label: 'DeepSeek R1 Distill Llama 8B',
    paramsB: 8.03,
    layers: 32, heads: 32, kvHeads: 8, headDim: 128, hiddenSize: 4096, context: 131072, moe: false,
  },
  {
    id: 'microsoft/Phi-3.5-mini-instruct',
    label: 'Phi-3.5 Mini Instruct',
    paramsB: 3.82,
    layers: 32, heads: 32, kvHeads: 32, headDim: 96, hiddenSize: 3072, context: 131072, moe: false,
  },
  {
    id: 'microsoft/phi-4',
    label: 'Phi-4',
    paramsB: 14.66,
    layers: 40, heads: 40, kvHeads: 10, headDim: 128, hiddenSize: 5120, context: 16384, moe: false,
  },
  {
    id: 'mistralai/Mistral-Nemo-Instruct-2407',
    label: 'Mistral Nemo Instruct',
    paramsB: 12.25,
    layers: 40, heads: 32, kvHeads: 8, headDim: 128, hiddenSize: 5120, context: 131072, moe: false,
  },
  {
    id: 'HuggingFaceTB/SmolLM2-1.7B-Instruct',
    label: 'SmolLM2 1.7B Instruct',
    paramsB: 1.71,
    layers: 24, heads: 32, kvHeads: 32, headDim: 64, hiddenSize: 2048, context: 8192, moe: false,
  },
  // Specs below fetched from each model's live config.json + HF safetensors param
  // count (scripts/can-i-run-specs-check.mjs proves them). Do not hand-edit.
  {
    id: 'Qwen/Qwen2.5-0.5B-Instruct',
    label: 'Qwen2.5 0.5B Instruct',
    paramsB: 0.49,
    layers: 24, heads: 14, kvHeads: 2, headDim: 64, hiddenSize: 896, context: 32768, moe: false,
  },
  {
    id: 'Qwen/Qwen2.5-1.5B-Instruct',
    label: 'Qwen2.5 1.5B Instruct',
    paramsB: 1.54,
    layers: 28, heads: 12, kvHeads: 2, headDim: 128, hiddenSize: 1536, context: 32768, moe: false,
  },
  {
    id: 'Qwen/Qwen2.5-Coder-1.5B-Instruct',
    label: 'Qwen2.5 Coder 1.5B Instruct',
    paramsB: 1.54,
    layers: 28, heads: 12, kvHeads: 2, headDim: 128, hiddenSize: 1536, context: 32768, moe: false,
  },
  {
    id: 'Qwen/Qwen2.5-Coder-14B-Instruct',
    label: 'Qwen2.5 Coder 14B Instruct',
    paramsB: 14.77,
    layers: 48, heads: 40, kvHeads: 8, headDim: 128, hiddenSize: 5120, context: 32768, moe: false,
  },
  {
    id: 'Qwen/Qwen3-0.6B',
    label: 'Qwen3 0.6B',
    paramsB: 0.75,
    layers: 28, heads: 16, kvHeads: 8, headDim: 128, hiddenSize: 1024, context: 40960, moe: false,
  },
  {
    id: 'Qwen/Qwen3-1.7B',
    label: 'Qwen3 1.7B',
    paramsB: 2.03,
    layers: 28, heads: 16, kvHeads: 8, headDim: 128, hiddenSize: 2048, context: 40960, moe: false,
  },
  {
    id: 'Qwen/Qwen3-4B',
    label: 'Qwen3 4B',
    paramsB: 4.02,
    layers: 36, heads: 32, kvHeads: 8, headDim: 128, hiddenSize: 2560, context: 40960, moe: false,
  },
  {
    id: 'Qwen/QwQ-32B',
    label: 'QwQ 32B',
    paramsB: 32.76,
    layers: 64, heads: 40, kvHeads: 8, headDim: 128, hiddenSize: 5120, context: 40960, moe: false,
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
    label: 'DeepSeek R1 Distill Qwen 1.5B',
    paramsB: 1.78,
    layers: 28, heads: 12, kvHeads: 2, headDim: 128, hiddenSize: 1536, context: 131072, moe: false,
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
    label: 'DeepSeek R1 Distill Llama 70B',
    paramsB: 70.55,
    layers: 80, heads: 64, kvHeads: 8, headDim: 128, hiddenSize: 8192, context: 131072, moe: false,
  },
  {
    id: 'mistralai/Mistral-Small-24B-Instruct-2501',
    label: 'Mistral Small 24B Instruct',
    paramsB: 23.57,
    layers: 40, heads: 32, kvHeads: 8, headDim: 128, hiddenSize: 5120, context: 32768, moe: false,
  },
  {
    id: 'ibm-granite/granite-3.1-8b-instruct',
    label: 'Granite 3.1 8B Instruct',
    paramsB: 8.17,
    layers: 40, heads: 32, kvHeads: 8, headDim: 128, hiddenSize: 4096, context: 131072, moe: false,
  },
  {
    id: 'allenai/OLMo-2-1124-7B-Instruct',
    label: 'OLMo 2 7B Instruct',
    paramsB: 7.3,
    layers: 32, heads: 32, kvHeads: 32, headDim: 128, hiddenSize: 4096, context: 4096, moe: false,
  },
  {
    id: 'HuggingFaceTB/SmolLM2-360M-Instruct',
    label: 'SmolLM2 360M Instruct',
    paramsB: 0.36,
    layers: 32, heads: 15, kvHeads: 5, headDim: 64, hiddenSize: 960, context: 8192, moe: false,
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

// Per-GPU hub page ("What can I run on an RTX 4090?"). Parent of every
// canIRunPath() combo for that card.
export function canIRunGpuPath(gpuSlug) {
  return `/can-i-run/${gpuSlug}`;
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
