import { useMemo } from "react";
import { gpuPickerGpus } from "../data/gpuPickerData";
import { buildQuantizationAlternatives } from "../utils/gpuPickerModelDetection";

const QUALITY_FLOOR = {
  int8: 0.85,
  int4: 0.75,
  q4_km: 0.78,
  q3_km: 0.6,
  q2_k: 0.4,
  fp16: 1,
};

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function getAvailabilityScore(gpu) {
  if (gpu.cloud_available && gpu.retail_available) return 1;
  if (gpu.cloud_available) return 0.8;
  if (gpu.retail_available) return 0.7;
  return 0.3;
}

function getEcosystemScore(gpu, modelProfile, usageIntent) {
  let score = gpu.vendor === "nvidia" ? 1 : gpu.vendor === "amd" ? 0.7 : gpu.vendor === "apple" ? 0.6 : 0.5;
  if (modelProfile.supports_apple_mps && gpu.vendor === "apple") score += 0.15;
  if (usageIntent === "training" && gpu.nvlink) score += 0.1;
  return clamp(score);
}

function getBudgetFitScore(gpu, budgetTier, perfMetric) {
  if (budgetTier === "any") return 0.8;
  if (budgetTier === "consumer") return clamp(1 - gpu.price_usd_approx / 2000);
  if (budgetTier === "workstation") return clamp(1 - (gpu.price_usd_approx - 2000) / 13000);

  const enterpriseGpus = gpuPickerGpus.filter((item) => item.tier === "enterprise");
  const best = Math.max(...enterpriseGpus.map((item) => (item[perfMetric] || 0) / Math.max(item.price_usd_approx, 1)), 1);
  return clamp(((gpu[perfMetric] || 0) / Math.max(gpu.price_usd_approx, 1)) / best);
}

function getPerfMetric(modelProfile, usageIntent) {
  if (usageIntent === "inference") return "int8_tops";
  if (usageIntent === "finetune") return "bf16_tflops";
  if (modelProfile.detected_context === "diffusion") return "fp32_tflops";
  if (modelProfile.detected_context === "embedding") return "memory_bandwidth_gbps";
  return "fp16_tflops";
}

function getPerfLabel(metric) {
  if (metric === "int8_tops") return "INT8 TOPS";
  if (metric === "bf16_tflops") return "BF16 TFLOPS";
  if (metric === "fp32_tflops") return "FP32 TFLOPS";
  if (metric === "memory_bandwidth_gbps") return "GB/s bandwidth";
  return "FP16 TFLOPS";
}

function getVramFitScore(gpu, vramNeeded, modelProfile) {
  if (gpu.vram_gb >= vramNeeded * 1.5) return 1;
  if (gpu.vram_gb >= vramNeeded) return 0.7;
  if (modelProfile.detected_context === "diffusion" && gpu.vram_gb >= 16) return 0.5;
  if (gpu.multi_gpu_support) return 0.25;
  return 0.05;
}

function buildWeights(modelProfile) {
  const weights = { vram: 0.35, tflops: 0.25, budget: 0.2, ecosystem: 0.1, avail: 0.1, bandwidth: 0 };
  if (modelProfile.long_context) {
    weights.bandwidth = 0.2;
    weights.tflops -= 0.1;
    weights.vram -= 0.1;
  }
  if (modelProfile.is_moe) {
    weights.bandwidth = 0.25;
  }
  return weights;
}

function generateDescription({ gpu, modelProfile, usageIntent, vramNeeded, tierTopPerf, perfMetric, bestValueId }) {
  const lines = [];
  if (gpu.vram_gb >= vramNeeded * 1.5) lines.push(`Generous VRAM headroom for ${modelProfile.model_id}.`);
  if ((gpu[perfMetric] || 0) === tierTopPerf) lines.push("Highest throughput in this shortlist.");
  if (gpu.id === bestValueId) lines.push(`Best performance-per-dollar for ${usageIntent}.`);
  if (gpu.cloud_available && usageIntent !== "full_training") lines.push(`Available on ${gpu.cloud_providers.slice(0, 3).join(", ")}.`);
  if (lines.length === 0 && gpu.multi_gpu_support) lines.push("Scales to multi-GPU for larger model footprints.");
  if (lines.length === 0) lines.push("Balanced fit across VRAM, throughput, and ecosystem support.");
  return lines.slice(0, 2).join(" ");
}

function buildWarnings({ modelProfile, usageIntent, budgetTier, fp16Alt, int4Alt, results }) {
  const warnings = [];
  const contextK = Math.round(modelProfile.context_length / 1000);
  if (modelProfile.long_context && usageIntent === "inference") {
    warnings.push({
      tone: "warning",
      text: `${modelProfile.model_id} supports ${contextK}K context. KV cache alone = ${modelProfile.kv_cache_vram_gb.toFixed(1)} GB at max length. Consider reducing max_new_tokens for smaller GPUs.`,
    });
  }
  if (modelProfile.is_moe) {
    warnings.push({
      tone: "info",
      text: `${modelProfile.model_id} is a Mixture-of-Experts model. Only ${modelProfile.active_params_display} active params are loaded per token, so practical VRAM is lower than total params.`,
    });
  }
  if (usageIntent === "full_training" && modelProfile.param_count >= 70e9) {
    warnings.push({
      tone: "warning",
      text: `Full training ${modelProfile.param_count_display} models requires ${Math.ceil(modelProfile.total_vram_training / 80)}x H100 minimum. Consider LoRA or QLoRA fine-tuning instead - reduces VRAM by about 4x.`,
    });
  }
  if (modelProfile.current_precision.toLowerCase().includes("gguf") && usageIntent !== "inference") {
    warnings.push({
      tone: "warning",
      text: "GGUF models cannot be trained. Switched to Inference mode. Use the original fp16 model ID for training.",
    });
  }
  if (modelProfile.supports_apple_mps && modelProfile.current_precision.toLowerCase().includes("gguf")) {
    warnings.push({
      tone: "success",
      text: "This GGUF model runs natively on Apple Silicon via llama.cpp or Ollama. Apple M-series GPUs are included in the results.",
    });
  }
  if (results.length === 0 && budgetTier !== "any" && int4Alt) {
    warnings.push({
      tone: "info",
      text: `No ${budgetTier} GPUs have enough VRAM for ${modelProfile.model_id} at ${modelProfile.current_precision}. Try INT4 quantization - reduces requirement from ${fp16Alt?.vram_gb?.toFixed(1)}GB to ${int4Alt.vram_gb.toFixed(1)}GB.`,
    });
  }
  return warnings;
}

export function useGpuPicker({ modelProfile, usageIntent, budgetTier, vendorPreference }) {
  return useMemo(() => {
    if (!modelProfile || !usageIntent) {
      return {
        ready: false,
        results: [],
        warnings: [],
        quantizedAlternatives: [],
        perf_metric: "fp16_tflops",
        perf_label: "FP16 TFLOPS",
      };
    }

    const vramNeeded = usageIntent === "inference"
      ? modelProfile.total_vram_inference
      : usageIntent === "finetune"
        ? modelProfile.total_vram_finetune
        : modelProfile.total_vram_training;

    const perfMetric = getPerfMetric(modelProfile, usageIntent);
    const perfLabel = getPerfLabel(perfMetric);
    const weights = buildWeights(modelProfile);
    const maxPerf = Math.max(...gpuPickerGpus.map((gpu) => gpu[perfMetric] || 0), 1);
    const maxBw = Math.max(...gpuPickerGpus.map((gpu) => gpu.memory_bandwidth_gbps || 0), 1);

    const filteredByPrefs = gpuPickerGpus.filter((gpu) => {
      if (budgetTier !== "any" && gpu.tier !== budgetTier) return false;
      if (vendorPreference !== "all" && gpu.vendor !== vendorPreference) return false;
      return true;
    });

    const fallbackPool = filteredByPrefs.length > 0 ? filteredByPrefs : gpuPickerGpus.filter((gpu) => vendorPreference === "all" || gpu.vendor === vendorPreference);
    const relaxedFilter = filteredByPrefs.length === 0 && fallbackPool.length > 0;
    const scorePool = relaxedFilter ? fallbackPool : filteredByPrefs;
    const bestValueId = [...scorePool]
      .sort((a, b) => ((b[perfMetric] || 0) / b.price_usd_approx) - ((a[perfMetric] || 0) / a.price_usd_approx))[0]?.id;
    const tierTopPerf = Math.max(...scorePool.map((gpu) => gpu[perfMetric] || 0), 0);

    const results = scorePool
      .map((gpu) => {
        const vramFit = getVramFitScore(gpu, vramNeeded, modelProfile);
        const performance = clamp((gpu[perfMetric] || 0) / maxPerf);
        const budgetFit = getBudgetFitScore(gpu, budgetTier, perfMetric);
        const ecosystem = getEcosystemScore(gpu, modelProfile, usageIntent);
        const availability = getAvailabilityScore(gpu);
        const bandwidth = clamp((gpu.memory_bandwidth_gbps || 0) / maxBw);
        const totalScore = (
          vramFit * weights.vram +
          performance * weights.tflops +
          budgetFit * weights.budget +
          ecosystem * weights.ecosystem +
          availability * weights.avail +
          bandwidth * weights.bandwidth
        ) * 100;

        const headroomGb = Number((gpu.vram_gb - vramNeeded).toFixed(1));
        const headroomPct = Number(((headroomGb / gpu.vram_gb) * 100).toFixed(1));
        const multiGpuNeeded = gpu.vram_gb < vramNeeded && gpu.multi_gpu_support ? Math.ceil(vramNeeded / gpu.vram_gb) : null;
        const tokensPerSecond = Math.max(
          1,
          Math.round(((gpu.memory_bandwidth_gbps * 1e9) / Math.max(modelProfile.active_params * modelProfile.precision_bytes, 1)) * 0.6),
        );
        const maxBatch = Math.min(32, Math.max(1, Math.floor(gpu.vram_gb / Math.max(vramNeeded, 1))));
        const badges = [];
        if (relaxedFilter && budgetTier !== "any" && gpu.tier !== budgetTier) badges.push("Outside Budget");
        if (gpu.nvlink) badges.push("NVLink");
        if (gpu.cloud_available) badges.push("Cloud Ready");
        if (gpu.vendor === "apple" && modelProfile.supports_apple_mps) badges.push("Apple MPS");
        if (gpu.vendor === "amd") badges.push("ROCm");
        if (modelProfile.is_quantized && usageIntent === "inference") badges.push("Quantized OK");
        if (multiGpuNeeded) badges.push("Multi-GPU");

        return {
          gpu,
          rank: 0,
          total_score: Number(totalScore.toFixed(1)),
          sub_scores: { vram_fit: vramFit, performance, budget_fit: budgetFit, ecosystem, availability, bandwidth },
          description: generateDescription({ gpu, modelProfile, usageIntent, vramNeeded, tierTopPerf, perfMetric, bestValueId }),
          badges,
          bottleneck: Object.entries({
            "VRAM Fit": vramFit,
            Performance: performance,
            "Budget Fit": budgetFit,
            Ecosystem: ecosystem,
            Availability: availability,
            Bandwidth: bandwidth,
          }).sort((a, b) => a[1] - b[1])[0][0],
          headroom_gb: headroomGb,
          headroom_pct: headroomPct,
          vram_usage_pct: Number(((vramNeeded / gpu.vram_gb) * 100).toFixed(1)),
          vram_needed_gb: Number(vramNeeded.toFixed(1)),
          tokens_per_second: tokensPerSecond,
          max_batch_estimate: maxBatch,
          fits_precision_label: modelProfile.current_precision,
          multi_gpu_needed: multiGpuNeeded,
        };
      })
      .filter((result) => result.gpu.vram_gb >= vramNeeded || result.multi_gpu_needed)
      .sort((a, b) => b.total_score - a.total_score)
      .map((result, index) => ({ ...result, rank: index + 1 }));

    const quantizedAlternatives = buildQuantizationAlternatives(modelProfile, gpuPickerGpus).map((row) => ({
      ...row,
      best_value: QUALITY_FLOOR[row.precision] >= 0.75 && row.cheapest_gpu,
      current: row.precision === modelProfile.precision_key,
    }));

    const fp16Alt = quantizedAlternatives.find((item) => item.precision === "fp16");
    const int4Alt = quantizedAlternatives.find((item) => item.precision === "int4");
    const warnings = buildWarnings({ modelProfile, usageIntent, budgetTier, fp16Alt, int4Alt, results });

    return {
      ready: true,
      results,
      warnings,
      quantizedAlternatives,
      perf_metric: perfMetric,
      perf_label: perfLabel,
      vram_needed_gb: Number(vramNeeded.toFixed(1)),
      relaxed_filter: relaxedFilter,
      total_gpus_considered: gpuPickerGpus.length,
      total_gpus_filtered: gpuPickerGpus.length - results.length,
      summary_label: `${results.length} GPUs match | ${modelProfile.model_id} | ${usageIntent} | ${Number(vramNeeded.toFixed(1))} GB needed`,
    };
  }, [budgetTier, modelProfile, usageIntent, vendorPreference]);
}
