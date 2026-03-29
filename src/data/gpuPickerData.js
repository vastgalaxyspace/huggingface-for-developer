const DEFAULT_CLOUD_PROVIDERS = ["AWS", "GCP", "Azure", "Lambda", "CoreWeave"];

function toTitleCase(value) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createGpu({
  id,
  name,
  vendor,
  architecture,
  compute_capability,
  tier,
  vram_gb,
  memory_bandwidth_gbps,
  fp16_tflops,
  fp32_tflops = Number((fp16_tflops / 2).toFixed(1)),
  bf16_tflops = fp16_tflops,
  int8_tops = Math.round(fp16_tflops * 2),
  int4_tops = Math.round(fp16_tflops * 4),
  tdp_watts,
  price_usd_approx,
  price_label,
  cloud_available,
  retail_available,
  multi_gpu_support = tier === "enterprise",
  nvlink = false,
  pcie_gen = 4,
  best_for,
  min_params_b,
  max_params_b,
  description,
  cloud_providers = cloud_available ? DEFAULT_CLOUD_PROVIDERS : [],
  release_year,
  unified_memory = false,
}) {
  return {
    id,
    name,
    short_name: name.replace(/^NVIDIA\s+/u, "").replace(/^AMD\s+/u, ""),
    vendor,
    architecture,
    compute_capability,
    tier,
    vram_gb,
    memory_bandwidth_gbps,
    fp32_tflops,
    fp16_tflops,
    bf16_tflops,
    int8_tops,
    int4_tops,
    tdp_watts,
    price_usd_approx,
    price_label,
    cloud_available,
    retail_available,
    multi_gpu_support,
    nvlink,
    pcie_gen,
    best_for,
    min_params_b,
    max_params_b,
    description,
    cloud_providers,
    release_year,
    unified_memory,
    ecosystem_label: toTitleCase(vendor),
  };
}

export const executionContextConfig = {
  llm_training: {
    id: "llm_training",
    label: "LLM TRAINING",
    weights: { vram: 0.4, tflops: 0.3, budget: 0.15, ecosystem: 0.1, avail: 0.05 },
    vram_multiplier: 4,
    perf_metric: "fp16_tflops",
  },
  inference: {
    id: "inference",
    label: "INFERENCE",
    weights: { vram: 0.35, tflops: 0.25, budget: 0.2, ecosystem: 0.1, avail: 0.1 },
    vram_multiplier: 1.2,
    perf_metric: "int8_tops",
  },
  data_science: {
    id: "data_science",
    label: "DATA SCIENCE",
    weights: { vram: 0.25, tflops: 0.2, budget: 0.3, ecosystem: 0.15, avail: 0.1 },
    vram_multiplier: 0.5,
    perf_metric: "memory_bandwidth_gbps",
  },
  rendering: {
    id: "rendering",
    label: "RENDERING",
    weights: { vram: 0.2, tflops: 0.35, budget: 0.25, ecosystem: 0.1, avail: 0.1 },
    vram_multiplier: 0.3,
    perf_metric: "fp32_tflops",
  },
};

export const parameterScaleConfig = {
  llm_training: [
    { id: "7b_13b", label: "7B-13B", min_vram_inference: 14, min_vram_training: 56, requires_multi_gpu: false, scale_label: "7B-13B" },
    { id: "30b_70b", label: "30B-70B", min_vram_inference: 60, min_vram_training: 240, requires_multi_gpu: false, scale_label: "30B-70B" },
    { id: "175b_plus", label: "175B+", min_vram_inference: 350, min_vram_training: 1400, requires_multi_gpu: true, scale_label: "175B+" },
  ],
  inference: [
    { id: "7b_13b", label: "7B-13B", min_vram_inference: 14, min_vram_training: 56, requires_multi_gpu: false, scale_label: "7B-13B" },
    { id: "30b_70b", label: "30B-70B", min_vram_inference: 60, min_vram_training: 240, requires_multi_gpu: false, scale_label: "30B-70B" },
    { id: "175b_plus", label: "175B+", min_vram_inference: 350, min_vram_training: 1400, requires_multi_gpu: true, scale_label: "175B+" },
  ],
  data_science: [
    { id: "ds_small", label: "< 10GB DATA", min_vram_inference: 8, min_vram_training: 8, requires_multi_gpu: false, scale_label: "< 10GB data" },
    { id: "ds_medium", label: "10-100GB", min_vram_inference: 24, min_vram_training: 24, requires_multi_gpu: false, scale_label: "10-100GB data" },
    { id: "ds_large", label: "100GB+", min_vram_inference: 64, min_vram_training: 64, requires_multi_gpu: true, scale_label: "100GB+ data" },
  ],
};

export const budgetTierConfig = {
  consumer: { id: "consumer", label: "CONSUMER", min: 0, max: 2000 },
  workstation: { id: "workstation", label: "WORKSTATION", min: 2000, max: 15000 },
  enterprise: { id: "enterprise", label: "ENTERPRISE", min: 15000, max: Number.POSITIVE_INFINITY },
};

export const precisionMetricMap = {
  fp32: "fp32_tflops",
  fp16: "fp16_tflops",
  bf16: "bf16_tflops",
  int8: "int8_tops",
  int4: "int4_tops",
};

export const quickPresets = [
  { id: "llama3_8b_ft", label: "Fine-tune LLaMA 3 8B", context: "llm_training", scale: "7b_13b", budget: "consumer" },
  { id: "mistral_7b_inf", label: "Run Mistral 7B inference", context: "inference", scale: "7b_13b", budget: "consumer" },
  { id: "train_70b", label: "Train 70B model", context: "llm_training", scale: "30b_70b", budget: "enterprise" },
  { id: "gpt4_scale_inf", label: "GPT-4 scale inference", context: "inference", scale: "175b_plus", budget: "enterprise" },
  { id: "local_ds", label: "Local data science", context: "data_science", scale: "ds_small", budget: "consumer" },
];

export const gpuPickerGpus = [
  createGpu({ id: "h200_sxm", name: "NVIDIA H200 SXM", vendor: "nvidia", architecture: "Hopper", compute_capability: "sm_90", tier: "enterprise", vram_gb: 141, memory_bandwidth_gbps: 4800, fp16_tflops: 3958, tdp_watts: 700, price_usd_approx: 80000, price_label: "$80K+", cloud_available: true, retail_available: false, multi_gpu_support: true, nvlink: true, pcie_gen: 5, best_for: ["llm_training", "inference", "data_science"], min_params_b: 70, max_params_b: 9999, description: "Top-end Hopper part for ultra-large model training and dense inference clusters.", release_year: 2024 }),
  createGpu({ id: "h200_nvl", name: "NVIDIA H200 NVL", vendor: "nvidia", architecture: "Hopper", compute_capability: "sm_90", tier: "enterprise", vram_gb: 94, memory_bandwidth_gbps: 3350, fp16_tflops: 3958, tdp_watts: 600, price_usd_approx: 60000, price_label: "$60K+", cloud_available: true, retail_available: false, multi_gpu_support: true, nvlink: true, pcie_gen: 5, best_for: ["llm_training", "inference"], min_params_b: 40, max_params_b: 9999, description: "High-throughput NVL configuration for large inference and scale-out training.", release_year: 2024 }),
  createGpu({ id: "h100_sxm", name: "NVIDIA H100 SXM", vendor: "nvidia", architecture: "Hopper", compute_capability: "sm_90", tier: "enterprise", vram_gb: 80, memory_bandwidth_gbps: 3350, fp16_tflops: 1979, tdp_watts: 700, price_usd_approx: 35000, price_label: "$35K+", cloud_available: true, retail_available: false, multi_gpu_support: true, nvlink: true, pcie_gen: 5, best_for: ["llm_training", "inference", "data_science"], min_params_b: 30, max_params_b: 9999, description: "Premier Hopper accelerator for 70B-class training and high-throughput serving.", release_year: 2023 }),
  createGpu({ id: "h100_pcie", name: "NVIDIA H100 PCIe", vendor: "nvidia", architecture: "Hopper", compute_capability: "sm_90", tier: "enterprise", vram_gb: 80, memory_bandwidth_gbps: 2000, fp16_tflops: 1513, fp32_tflops: 756, bf16_tflops: 1513, int8_tops: 3026, int4_tops: 6052, tdp_watts: 350, price_usd_approx: 30000, price_label: "$25K-$35K", cloud_available: true, retail_available: false, multi_gpu_support: true, nvlink: true, pcie_gen: 5, best_for: ["llm_training", "inference", "data_science"], min_params_b: 30, max_params_b: 9999, description: "Best for 70B+ training and heavy throughput.", cloud_providers: ["AWS", "GCP", "Azure", "Lambda", "CoreWeave"], release_year: 2023 }),
  createGpu({ id: "a100_sxm_80", name: "NVIDIA A100 SXM 80GB", vendor: "nvidia", architecture: "Ampere", compute_capability: "sm_80", tier: "enterprise", vram_gb: 80, memory_bandwidth_gbps: 2000, fp16_tflops: 312, tdp_watts: 400, price_usd_approx: 15000, price_label: "$15K", cloud_available: true, retail_available: false, multi_gpu_support: true, nvlink: true, pcie_gen: 4, best_for: ["llm_training", "inference", "data_science"], min_params_b: 20, max_params_b: 200, description: "Battle-tested Ampere workhorse for training, fine-tuning, and cluster inference.", release_year: 2020 }),
  createGpu({ id: "a100_pcie_80", name: "NVIDIA A100 PCIe 80GB", vendor: "nvidia", architecture: "Ampere", compute_capability: "sm_80", tier: "enterprise", vram_gb: 80, memory_bandwidth_gbps: 1935, fp16_tflops: 312, tdp_watts: 300, price_usd_approx: 12000, price_label: "$12K", cloud_available: true, retail_available: false, multi_gpu_support: true, nvlink: false, pcie_gen: 4, best_for: ["llm_training", "inference"], min_params_b: 20, max_params_b: 200, description: "Strong PCIe option when you need A100-class memory without SXM integration.", release_year: 2021 }),
  createGpu({ id: "a100_sxm_40", name: "NVIDIA A100 SXM 40GB", vendor: "nvidia", architecture: "Ampere", compute_capability: "sm_80", tier: "enterprise", vram_gb: 40, memory_bandwidth_gbps: 1555, fp16_tflops: 312, tdp_watts: 400, price_usd_approx: 10000, price_label: "$10K", cloud_available: true, retail_available: false, multi_gpu_support: true, nvlink: true, pcie_gen: 4, best_for: ["llm_training", "inference"], min_params_b: 7, max_params_b: 70, description: "Efficient Ampere training GPU for mid-scale clusters and mature CUDA stacks.", release_year: 2020 }),
  createGpu({ id: "l40s", name: "NVIDIA L40S", vendor: "nvidia", architecture: "Ada Lovelace", compute_capability: "sm_89", tier: "enterprise", vram_gb: 48, memory_bandwidth_gbps: 864, fp16_tflops: 733, tdp_watts: 350, price_usd_approx: 8000, price_label: "$8K", cloud_available: true, retail_available: false, multi_gpu_support: true, nvlink: false, pcie_gen: 4, best_for: ["inference", "rendering", "data_science"], min_params_b: 7, max_params_b: 70, description: "High-density inference and rendering card with modern Ada throughput.", release_year: 2023 }),
  createGpu({ id: "a40", name: "NVIDIA A40", vendor: "nvidia", architecture: "Ampere", compute_capability: "sm_86", tier: "enterprise", vram_gb: 48, memory_bandwidth_gbps: 696, fp16_tflops: 149, tdp_watts: 300, price_usd_approx: 6000, price_label: "$6K", cloud_available: true, retail_available: false, multi_gpu_support: true, nvlink: true, pcie_gen: 4, best_for: ["rendering", "inference"], min_params_b: 7, max_params_b: 70, description: "Balanced data center GPU for visualization, inference, and virtual workstation use.", release_year: 2020 }),
  createGpu({ id: "l4", name: "NVIDIA L4", vendor: "nvidia", architecture: "Ada Lovelace", compute_capability: "sm_89", tier: "enterprise", vram_gb: 24, memory_bandwidth_gbps: 300, fp16_tflops: 242, tdp_watts: 72, price_usd_approx: 2500, price_label: "$2.5K", cloud_available: true, retail_available: false, multi_gpu_support: false, nvlink: false, pcie_gen: 4, best_for: ["inference", "rendering"], min_params_b: 3, max_params_b: 13, description: "Excellent low-power inference accelerator for production serving and media pipelines.", release_year: 2023 }),
  createGpu({ id: "t4", name: "NVIDIA T4", vendor: "nvidia", architecture: "Turing", compute_capability: "sm_75", tier: "enterprise", vram_gb: 16, memory_bandwidth_gbps: 300, fp16_tflops: 65, tdp_watts: 70, price_usd_approx: 2000, price_label: "$2K", cloud_available: true, retail_available: false, multi_gpu_support: false, nvlink: false, pcie_gen: 3, best_for: ["inference"], min_params_b: 1, max_params_b: 7, description: "Popular cloud inference baseline with wide availability and excellent efficiency.", release_year: 2018 }),
  createGpu({ id: "v100_32gb", name: "NVIDIA V100 32GB", vendor: "nvidia", architecture: "Volta", compute_capability: "sm_70", tier: "enterprise", vram_gb: 32, memory_bandwidth_gbps: 900, fp16_tflops: 125, tdp_watts: 300, price_usd_approx: 4000, price_label: "$4K", cloud_available: true, retail_available: false, multi_gpu_support: true, nvlink: true, pcie_gen: 3, best_for: ["llm_training", "data_science"], min_params_b: 3, max_params_b: 30, description: "Older but still capable accelerator for classic deep learning and HPC data science.", release_year: 2019 }),
  createGpu({ id: "a10g", name: "NVIDIA A10G", vendor: "nvidia", architecture: "Ampere", compute_capability: "sm_86", tier: "enterprise", vram_gb: 24, memory_bandwidth_gbps: 600, fp16_tflops: 125, tdp_watts: 300, price_usd_approx: 3500, price_label: "$3.5K", cloud_available: true, retail_available: false, multi_gpu_support: false, nvlink: false, pcie_gen: 4, best_for: ["inference", "rendering"], min_params_b: 3, max_params_b: 13, description: "Cloud-friendly Ampere choice for inference, diffusion, and graphics workloads.", release_year: 2021 }),

  createGpu({ id: "mi300x", name: "AMD MI300X", vendor: "amd", architecture: "CDNA 3", compute_capability: "gfx942", tier: "enterprise", vram_gb: 192, memory_bandwidth_gbps: 5300, fp16_tflops: 1307, tdp_watts: 750, price_usd_approx: 20000, price_label: "$20K", cloud_available: true, retail_available: false, multi_gpu_support: true, best_for: ["llm_training", "inference", "data_science"], min_params_b: 70, max_params_b: 9999, description: "Massive HBM footprint for ROCm-first training and large-context inference.", release_year: 2023 }),
  createGpu({ id: "mi300a", name: "AMD MI300A", vendor: "amd", architecture: "CDNA 3", compute_capability: "gfx942", tier: "enterprise", vram_gb: 128, memory_bandwidth_gbps: 5300, fp16_tflops: 1307, tdp_watts: 760, price_usd_approx: 15000, price_label: "$15K", cloud_available: false, retail_available: false, multi_gpu_support: true, best_for: ["llm_training", "data_science"], min_params_b: 30, max_params_b: 9999, description: "APU-style HPC accelerator with huge unified memory for tightly coupled compute.", release_year: 2023 }),
  createGpu({ id: "mi250x", name: "AMD MI250X", vendor: "amd", architecture: "CDNA 2", compute_capability: "gfx90a", tier: "enterprise", vram_gb: 128, memory_bandwidth_gbps: 3200, fp16_tflops: 383, tdp_watts: 500, price_usd_approx: 10000, price_label: "$10K", cloud_available: true, retail_available: false, multi_gpu_support: true, best_for: ["llm_training", "data_science"], min_params_b: 30, max_params_b: 175, description: "Strong HBM-heavy accelerator for ROCm clusters and scientific workloads.", release_year: 2021 }),
  createGpu({ id: "mi210", name: "AMD MI210", vendor: "amd", architecture: "CDNA 2", compute_capability: "gfx90a", tier: "enterprise", vram_gb: 64, memory_bandwidth_gbps: 1600, fp16_tflops: 181, tdp_watts: 300, price_usd_approx: 6000, price_label: "$6K", cloud_available: false, retail_available: false, multi_gpu_support: true, best_for: ["data_science", "llm_training"], min_params_b: 13, max_params_b: 70, description: "HBM-backed ROCm accelerator suited to research clusters and mid-scale training.", release_year: 2022 }),

  createGpu({ id: "gaudi_3", name: "Intel Gaudi 3", vendor: "intel", architecture: "Gaudi 3", compute_capability: "gaudi3", tier: "enterprise", vram_gb: 128, memory_bandwidth_gbps: 3700, fp16_tflops: 1835, tdp_watts: 900, price_usd_approx: 15000, price_label: "$15K", cloud_available: true, retail_available: false, multi_gpu_support: true, best_for: ["llm_training", "inference"], min_params_b: 30, max_params_b: 9999, description: "Aggressive throughput-focused alternative for large-scale training and serving.", release_year: 2024 }),
  createGpu({ id: "gaudi_2", name: "Intel Gaudi 2", vendor: "intel", architecture: "Gaudi 2", compute_capability: "gaudi2", tier: "enterprise", vram_gb: 96, memory_bandwidth_gbps: 2460, fp16_tflops: 865, tdp_watts: 600, price_usd_approx: 8000, price_label: "$8K", cloud_available: true, retail_available: false, multi_gpu_support: true, best_for: ["llm_training", "inference"], min_params_b: 20, max_params_b: 175, description: "Cost-conscious training accelerator for teams comfortable outside the CUDA default.", release_year: 2022 }),

  createGpu({ id: "rtx_6000_ada", name: "NVIDIA RTX 6000 Ada", vendor: "nvidia", architecture: "Ada Lovelace", compute_capability: "sm_89", tier: "workstation", vram_gb: 48, memory_bandwidth_gbps: 960, fp16_tflops: 91.1, tdp_watts: 300, price_usd_approx: 7000, price_label: "$7K", cloud_available: false, retail_available: true, multi_gpu_support: true, nvlink: false, pcie_gen: 4, best_for: ["rendering", "inference", "data_science"], min_params_b: 7, max_params_b: 70, description: "Flagship pro visualization GPU that also handles serious local inference and rendering.", release_year: 2022 }),
  createGpu({ id: "rtx_5000_ada", name: "NVIDIA RTX 5000 Ada", vendor: "nvidia", architecture: "Ada Lovelace", compute_capability: "sm_89", tier: "workstation", vram_gb: 32, memory_bandwidth_gbps: 576, fp16_tflops: 65.3, tdp_watts: 250, price_usd_approx: 4000, price_label: "$4K", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["rendering", "inference"], min_params_b: 3, max_params_b: 30, description: "Well-balanced workstation card for local pipelines, creative work, and model serving.", release_year: 2023 }),
  createGpu({ id: "rtx_4500_ada", name: "NVIDIA RTX 4500 Ada", vendor: "nvidia", architecture: "Ada Lovelace", compute_capability: "sm_89", tier: "workstation", vram_gb: 24, memory_bandwidth_gbps: 432, fp16_tflops: 39.6, tdp_watts: 210, price_usd_approx: 2500, price_label: "$2.5K", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["rendering", "inference"], min_params_b: 3, max_params_b: 13, description: "Compact pro Ada option for small studios and entry workstation inference.", release_year: 2023 }),
  createGpu({ id: "rtx_4000_ada", name: "NVIDIA RTX 4000 Ada", vendor: "nvidia", architecture: "Ada Lovelace", compute_capability: "sm_89", tier: "workstation", vram_gb: 20, memory_bandwidth_gbps: 360, fp16_tflops: 26.7, tdp_watts: 130, price_usd_approx: 1500, price_label: "$1.5K", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["rendering", "inference"], min_params_b: 1, max_params_b: 13, description: "Lower-power Ada workstation board for desktop inference and viewport-heavy work.", release_year: 2023 }),
  createGpu({ id: "rtx_a6000", name: "NVIDIA RTX A6000", vendor: "nvidia", architecture: "Ampere", compute_capability: "sm_86", tier: "workstation", vram_gb: 48, memory_bandwidth_gbps: 768, fp16_tflops: 38.7, tdp_watts: 300, price_usd_approx: 4500, price_label: "$4.5K", cloud_available: false, retail_available: true, multi_gpu_support: true, nvlink: true, pcie_gen: 4, best_for: ["rendering", "data_science", "inference"], min_params_b: 7, max_params_b: 70, description: "Mature 48GB workstation GPU with NVLink support for pro desktops.", release_year: 2020 }),
  createGpu({ id: "rtx_a5000", name: "NVIDIA RTX A5000", vendor: "nvidia", architecture: "Ampere", compute_capability: "sm_86", tier: "workstation", vram_gb: 24, memory_bandwidth_gbps: 768, fp16_tflops: 27.8, tdp_watts: 230, price_usd_approx: 2500, price_label: "$2.5K", cloud_available: false, retail_available: true, multi_gpu_support: true, nvlink: true, pcie_gen: 4, best_for: ["rendering", "inference"], min_params_b: 3, max_params_b: 13, description: "Solid Ampere workstation option with strong memory bandwidth for the price.", release_year: 2021 }),
  createGpu({ id: "rtx_a4000", name: "NVIDIA RTX A4000", vendor: "nvidia", architecture: "Ampere", compute_capability: "sm_86", tier: "workstation", vram_gb: 16, memory_bandwidth_gbps: 448, fp16_tflops: 19.6, tdp_watts: 140, price_usd_approx: 1200, price_label: "$1.2K", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["rendering"], min_params_b: 1, max_params_b: 7, description: "Accessible professional board for rendering, content creation, and lighter inference.", release_year: 2021 }),

  createGpu({ id: "w7900", name: "AMD Radeon Pro W7900", vendor: "amd", architecture: "RDNA 3", compute_capability: "gfx1100", tier: "workstation", vram_gb: 48, memory_bandwidth_gbps: 864, fp16_tflops: 61.3, tdp_watts: 295, price_usd_approx: 4000, price_label: "$4K", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["rendering", "data_science"], min_params_b: 7, max_params_b: 70, description: "Large-VRAM AMD workstation card for pro graphics and ROCm-capable local experiments.", release_year: 2023 }),
  createGpu({ id: "w7800", name: "AMD Radeon Pro W7800", vendor: "amd", architecture: "RDNA 3", compute_capability: "gfx1100", tier: "workstation", vram_gb: 32, memory_bandwidth_gbps: 576, fp16_tflops: 45.2, tdp_watts: 260, price_usd_approx: 2500, price_label: "$2.5K", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["rendering", "data_science"], min_params_b: 3, max_params_b: 30, description: "Balanced AMD workstation choice for creators and memory-sensitive desktop workloads.", release_year: 2023 }),
  createGpu({ id: "w6800", name: "AMD Radeon Pro W6800", vendor: "amd", architecture: "RDNA 2", compute_capability: "gfx1030", tier: "workstation", vram_gb: 32, memory_bandwidth_gbps: 512, fp16_tflops: 17.8, tdp_watts: 250, price_usd_approx: 2200, price_label: "$2.2K", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["rendering"], min_params_b: 3, max_params_b: 13, description: "Previous-gen pro AMD card with generous VRAM for workstation visualization.", release_year: 2021 }),

  createGpu({ id: "rtx_5090", name: "NVIDIA RTX 5090", vendor: "nvidia", architecture: "Blackwell", compute_capability: "sm_100", tier: "consumer", vram_gb: 32, memory_bandwidth_gbps: 1792, fp16_tflops: 838, tdp_watts: 575, price_usd_approx: 2000, price_label: "$2K", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["inference", "rendering", "data_science"], min_params_b: 7, max_params_b: 30, description: "Fastest local prosumer choice for inference, rendering, and memory-heavy desktop work.", release_year: 2025 }),
  createGpu({ id: "rtx_5080", name: "NVIDIA RTX 5080", vendor: "nvidia", architecture: "Blackwell", compute_capability: "sm_100", tier: "consumer", vram_gb: 16, memory_bandwidth_gbps: 960, fp16_tflops: 503, tdp_watts: 360, price_usd_approx: 1000, price_label: "$1K", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["inference", "rendering"], min_params_b: 3, max_params_b: 13, description: "High-throughput gaming-class GPU that doubles as a strong local inference card.", release_year: 2025 }),
  createGpu({ id: "rtx_4090", name: "NVIDIA RTX 4090", vendor: "nvidia", architecture: "Ada Lovelace", compute_capability: "sm_89", tier: "consumer", vram_gb: 24, memory_bandwidth_gbps: 1008, fp16_tflops: 165, tdp_watts: 450, price_usd_approx: 1600, price_label: "$1.6K", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["inference", "rendering", "data_science"], min_params_b: 3, max_params_b: 13, description: "Classic local AI favorite with excellent CUDA support and 24GB of VRAM.", release_year: 2022 }),
  createGpu({ id: "rtx_4080_super", name: "NVIDIA RTX 4080 Super", vendor: "nvidia", architecture: "Ada Lovelace", compute_capability: "sm_89", tier: "consumer", vram_gb: 16, memory_bandwidth_gbps: 736, fp16_tflops: 122, tdp_watts: 320, price_usd_approx: 1000, price_label: "$1K", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["inference", "rendering"], min_params_b: 3, max_params_b: 13, description: "Strong upper-midrange local GPU for inference, graphics, and creative pipelines.", release_year: 2024 }),
  createGpu({ id: "rtx_4080", name: "NVIDIA RTX 4080", vendor: "nvidia", architecture: "Ada Lovelace", compute_capability: "sm_89", tier: "consumer", vram_gb: 16, memory_bandwidth_gbps: 717, fp16_tflops: 97.5, tdp_watts: 320, price_usd_approx: 900, price_label: "$900", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["inference", "rendering"], min_params_b: 3, max_params_b: 13, description: "Reliable Ada card for desktop inference and high-end rendering without 4090 pricing.", release_year: 2022 }),
  createGpu({ id: "rtx_4070_ti_super", name: "NVIDIA RTX 4070 Ti Super", vendor: "nvidia", architecture: "Ada Lovelace", compute_capability: "sm_89", tier: "consumer", vram_gb: 16, memory_bandwidth_gbps: 672, fp16_tflops: 94.9, tdp_watts: 285, price_usd_approx: 800, price_label: "$800", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["inference", "rendering"], min_params_b: 3, max_params_b: 13, description: "Popular local inference sweet spot with 16GB memory and modern Ada efficiency.", release_year: 2024 }),
  createGpu({ id: "rtx_4070_ti", name: "NVIDIA RTX 4070 Ti", vendor: "nvidia", architecture: "Ada Lovelace", compute_capability: "sm_89", tier: "consumer", vram_gb: 12, memory_bandwidth_gbps: 504, fp16_tflops: 82.6, tdp_watts: 285, price_usd_approx: 700, price_label: "$700", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["rendering", "inference"], min_params_b: 1, max_params_b: 7, description: "Fast desktop GPU for compact inference rigs and creator workstations.", release_year: 2023 }),
  createGpu({ id: "rtx_4070_super", name: "NVIDIA RTX 4070 Super", vendor: "nvidia", architecture: "Ada Lovelace", compute_capability: "sm_89", tier: "consumer", vram_gb: 12, memory_bandwidth_gbps: 504, fp16_tflops: 71.9, tdp_watts: 220, price_usd_approx: 600, price_label: "$600", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["rendering", "inference"], min_params_b: 1, max_params_b: 7, description: "Balanced consumer card with strong efficiency for local model serving and graphics.", release_year: 2024 }),
  createGpu({ id: "rtx_4070", name: "NVIDIA RTX 4070", vendor: "nvidia", architecture: "Ada Lovelace", compute_capability: "sm_89", tier: "consumer", vram_gb: 12, memory_bandwidth_gbps: 504, fp16_tflops: 58.5, tdp_watts: 200, price_usd_approx: 500, price_label: "$500", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["rendering", "inference"], min_params_b: 1, max_params_b: 7, description: "Practical mainstream GPU for lightweight local inference and game-dev rendering.", release_year: 2023 }),
  createGpu({ id: "rtx_4060_ti_16", name: "NVIDIA RTX 4060 Ti 16GB", vendor: "nvidia", architecture: "Ada Lovelace", compute_capability: "sm_89", tier: "consumer", vram_gb: 16, memory_bandwidth_gbps: 288, fp16_tflops: 44.5, tdp_watts: 165, price_usd_approx: 500, price_label: "$500", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["inference"], min_params_b: 1, max_params_b: 7, description: "VRAM-heavy budget pick for smaller quantized models and compact inference setups.", release_year: 2023 }),
  createGpu({ id: "rtx_3090_ti", name: "NVIDIA RTX 3090 Ti", vendor: "nvidia", architecture: "Ampere", compute_capability: "sm_86", tier: "consumer", vram_gb: 24, memory_bandwidth_gbps: 1008, fp16_tflops: 40, tdp_watts: 450, price_usd_approx: 800, price_label: "$800", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["inference", "rendering"], min_params_b: 3, max_params_b: 13, description: "24GB Ampere card that still holds up well for local LLM inference workflows.", release_year: 2022 }),
  createGpu({ id: "rtx_3090", name: "NVIDIA RTX 3090", vendor: "nvidia", architecture: "Ampere", compute_capability: "sm_86", tier: "consumer", vram_gb: 24, memory_bandwidth_gbps: 936, fp16_tflops: 35.6, tdp_watts: 350, price_usd_approx: 700, price_label: "$700", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["inference", "data_science"], min_params_b: 3, max_params_b: 13, description: "Used-market favorite for 24GB local AI builds with mature CUDA support.", release_year: 2020 }),
  createGpu({ id: "rtx_3080_ti", name: "NVIDIA RTX 3080 Ti", vendor: "nvidia", architecture: "Ampere", compute_capability: "sm_86", tier: "consumer", vram_gb: 12, memory_bandwidth_gbps: 912, fp16_tflops: 34.1, tdp_watts: 350, price_usd_approx: 500, price_label: "$500", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["rendering"], min_params_b: 1, max_params_b: 7, description: "Solid older enthusiast GPU for rendering and entry local inference.", release_year: 2021 }),

  createGpu({ id: "rx_7900_xtx", name: "AMD RX 7900 XTX", vendor: "amd", architecture: "RDNA 3", compute_capability: "gfx1100", tier: "consumer", vram_gb: 24, memory_bandwidth_gbps: 960, fp16_tflops: 123, tdp_watts: 355, price_usd_approx: 900, price_label: "$900", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["rendering", "data_science"], min_params_b: 3, max_params_b: 13, description: "High-VRAM AMD consumer flagship for creators and ROCm-friendly local experiments.", release_year: 2022 }),
  createGpu({ id: "rx_7900_xt", name: "AMD RX 7900 XT", vendor: "amd", architecture: "RDNA 3", compute_capability: "gfx1100", tier: "consumer", vram_gb: 20, memory_bandwidth_gbps: 800, fp16_tflops: 103, tdp_watts: 300, price_usd_approx: 750, price_label: "$750", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["rendering", "data_science"], min_params_b: 3, max_params_b: 13, description: "Strong AMD option for memory-conscious desktop rendering and AI tinkering.", release_year: 2022 }),
  createGpu({ id: "rx_7800_xt", name: "AMD RX 7800 XT", vendor: "amd", architecture: "RDNA 3", compute_capability: "gfx1100", tier: "consumer", vram_gb: 16, memory_bandwidth_gbps: 624, fp16_tflops: 74.9, tdp_watts: 263, price_usd_approx: 500, price_label: "$500", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["rendering"], min_params_b: 1, max_params_b: 7, description: "Efficient AMD card with enough VRAM for smaller models and creative apps.", release_year: 2023 }),
  createGpu({ id: "rx_6900_xt", name: "AMD RX 6900 XT", vendor: "amd", architecture: "RDNA 2", compute_capability: "gfx1030", tier: "consumer", vram_gb: 16, memory_bandwidth_gbps: 512, fp16_tflops: 46.1, tdp_watts: 300, price_usd_approx: 400, price_label: "$400", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["rendering"], min_params_b: 1, max_params_b: 7, description: "Used-market AMD option for affordable high-end raster and desktop compute.", release_year: 2020 }),
  createGpu({ id: "rx_6800_xt", name: "AMD RX 6800 XT", vendor: "amd", architecture: "RDNA 2", compute_capability: "gfx1030", tier: "consumer", vram_gb: 16, memory_bandwidth_gbps: 512, fp16_tflops: 41.4, tdp_watts: 300, price_usd_approx: 350, price_label: "$350", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["rendering"], min_params_b: 1, max_params_b: 7, description: "Budget-friendly 16GB AMD card for local visualization and smaller experiments.", release_year: 2020 }),

  createGpu({ id: "m4_ultra", name: "Apple M4 Ultra", vendor: "apple", architecture: "Apple Silicon", compute_capability: "m4_ultra", tier: "workstation", vram_gb: 192, memory_bandwidth_gbps: 546, fp16_tflops: 54.8, tdp_watts: 200, price_usd_approx: 10000, price_label: "$10K+", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["inference", "data_science"], min_params_b: 30, max_params_b: 175, description: "Massive unified-memory Apple workstation for local large-model inference workflows.", release_year: 2025, unified_memory: true }),
  createGpu({ id: "m4_max", name: "Apple M4 Max", vendor: "apple", architecture: "Apple Silicon", compute_capability: "m4_max", tier: "workstation", vram_gb: 128, memory_bandwidth_gbps: 546, fp16_tflops: 27.4, tdp_watts: 120, price_usd_approx: 4000, price_label: "$4K", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["inference", "data_science"], min_params_b: 13, max_params_b: 70, description: "Portable Apple high-end platform with large unified memory for local inference.", release_year: 2025, unified_memory: true }),
  createGpu({ id: "m4_pro", name: "Apple M4 Pro", vendor: "apple", architecture: "Apple Silicon", compute_capability: "m4_pro", tier: "workstation", vram_gb: 48, memory_bandwidth_gbps: 273, fp16_tflops: 13.8, tdp_watts: 75, price_usd_approx: 2000, price_label: "$2K", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["inference", "data_science"], min_params_b: 3, max_params_b: 13, description: "Practical Apple desktop option for local development and smaller model serving.", release_year: 2025, unified_memory: true }),
  createGpu({ id: "m3_ultra", name: "Apple M3 Ultra", vendor: "apple", architecture: "Apple Silicon", compute_capability: "m3_ultra", tier: "workstation", vram_gb: 192, memory_bandwidth_gbps: 819, fp16_tflops: 44.4, tdp_watts: 180, price_usd_approx: 10000, price_label: "$10K+", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["inference", "data_science"], min_params_b: 30, max_params_b: 175, description: "Large-memory Mac Studio class platform for local multimodal inference and analysis.", release_year: 2024, unified_memory: true }),
  createGpu({ id: "m3_max", name: "Apple M3 Max", vendor: "apple", architecture: "Apple Silicon", compute_capability: "m3_max", tier: "workstation", vram_gb: 128, memory_bandwidth_gbps: 400, fp16_tflops: 22.4, tdp_watts: 90, price_usd_approx: 3500, price_label: "$3.5K", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["inference", "data_science"], min_params_b: 13, max_params_b: 70, description: "High-memory Apple notebook or desktop choice for local LLM prototyping.", release_year: 2023, unified_memory: true }),
  createGpu({ id: "m2_ultra", name: "Apple M2 Ultra", vendor: "apple", architecture: "Apple Silicon", compute_capability: "m2_ultra", tier: "workstation", vram_gb: 192, memory_bandwidth_gbps: 800, fp16_tflops: 27.2, tdp_watts: 150, price_usd_approx: 8000, price_label: "$8K", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["inference", "data_science"], min_params_b: 30, max_params_b: 175, description: "Reliable large-memory Apple workstation for on-device inference and notebooks-to-desktop continuity.", release_year: 2023, unified_memory: true }),
  createGpu({ id: "m2_max", name: "Apple M2 Max", vendor: "apple", architecture: "Apple Silicon", compute_capability: "m2_max", tier: "workstation", vram_gb: 96, memory_bandwidth_gbps: 400, fp16_tflops: 13.6, tdp_watts: 60, price_usd_approx: 3000, price_label: "$3K", cloud_available: false, retail_available: true, multi_gpu_support: false, best_for: ["inference", "data_science"], min_params_b: 7, max_params_b: 30, description: "Mature Apple silicon platform with enough unified memory for substantial local models.", release_year: 2023, unified_memory: true }),
];
