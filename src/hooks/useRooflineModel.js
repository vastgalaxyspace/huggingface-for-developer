"use client";

import { useMemo } from "react";

export const PRECISION_OPTIONS = [
  { id: "fp64", label: "FP64", chipLabel: "FP64", color: "#9ca3af", dash: "2 4" },
  { id: "fp32", label: "FP32", chipLabel: "FP32", color: "#3b82f6" },
  { id: "tf32", label: "TF32", chipLabel: "TF32", color: "#14b8a6", dash: "8 5" },
  { id: "fp16", label: "FP16/BF16", chipLabel: "FP16/BF16", color: "#22c55e" },
  { id: "int8", label: "INT8", chipLabel: "INT8", color: "#8b5cf6", dash: "8 5" },
];

export const MEMORY_HIERARCHY_OPTIONS = [
  { id: "hbm", label: "HBM only", levels: ["HBM"] },
  { id: "hbm_l2", label: "HBM + L2", levels: ["HBM", "L2"] },
  { id: "all", label: "All levels", levels: ["HBM", "L2", "L1"] },
];

export const KERNEL_COLORS = ["#22c55e", "#0ea5e9", "#f97316", "#8b5cf6", "#ef4444"];

const MEMORY_LEVELS = [
  { key: "hbm_bandwidth_gbs", label: "HBM", color: "#3b82f6" },
  { key: "l2_bandwidth_gbs", label: "L2", color: "#8b5cf6" },
  { key: "l1_bandwidth_gbs", label: "L1", color: "#14b8a6" },
];

export function getPrecisionPeak(gpu, precision) {
  if (!gpu) return 0;
  if (precision === "int8") return gpu.peak_int8_tops || 0;
  if (precision === "fp16") return gpu.peak_bf16_gflops || gpu.peak_fp16_gflops || 0;
  return gpu[`peak_${precision}_gflops`] || 0;
}

export function computeRoofline(gpu, precision) {
  const peak_flops = getPrecisionPeak(gpu, precision);
  const bandwidth = gpu?.hbm_bandwidth_gbs || gpu?.unified_bandwidth_gbs || 0;
  const ridge_point_x = bandwidth > 0 ? peak_flops / bandwidth : 0;
  const roofline_y = (x) => Math.min(bandwidth * x, peak_flops);
  return { peak_flops, bandwidth, ridge_point_x, roofline_y };
}

export function computeKernelMetrics(flops, bytes, time_ms, roofline) {
  const safeFlops = Number(flops) || 0;
  const safeBytes = Number(bytes) || 0;
  const safeTime = Number(time_ms) || 0;
  const arithmetic_intensity = safeBytes > 0 ? safeFlops / safeBytes : 0;
  const achieved_gflops = safeTime > 0 ? safeFlops / (safeTime / 1000) / 1e9 : 0;
  const ridge = roofline?.ridge_point_x || 0;
  const bandwidth = roofline?.bandwidth || 0;
  const peak = roofline?.peak_flops || 0;
  const memory_roof_at_ai = bandwidth * arithmetic_intensity;
  const compute_roof = peak;
  const memory_efficiency = memory_roof_at_ai > 0 ? (achieved_gflops / memory_roof_at_ai) * 100 : 0;
  const compute_efficiency = compute_roof > 0 ? (achieved_gflops / compute_roof) * 100 : 0;
  const bound = arithmetic_intensity < ridge ? "MEMORY BOUND" : "COMPUTE BOUND";
  const distance_to_ridge = arithmetic_intensity > 0 && ridge > 0 ? Math.log10(arithmetic_intensity / ridge) : -Infinity;
  const magnitude = Number.isFinite(distance_to_ridge) ? Math.abs(distance_to_ridge) : 10;

  let severity = "SEVERE";
  if (magnitude < 0.1) severity = "BALANCED";
  else if (magnitude < 0.5) severity = "SLIGHT";
  else if (magnitude < 1.0) severity = "MODERATE";

  return {
    arithmetic_intensity,
    achieved_gflops,
    bound: severity === "BALANCED" ? "BALANCED" : bound,
    memory_roof_at_ai,
    compute_roof,
    memory_efficiency,
    compute_efficiency,
    distance_to_ridge,
    severity,
  };
}

export function computeAllRooflines(gpu, precision) {
  const peak_flops = getPrecisionPeak(gpu, precision);
  return MEMORY_LEVELS.filter((level) => gpu?.[level.key]).map((level) => ({
    label: level.label,
    color: level.color,
    bandwidth: gpu[level.key],
    ridge_x: peak_flops / gpu[level.key],
    roofline_y: (x) => Math.min(gpu[level.key] * x, peak_flops),
  }));
}

function applyTemplate(text, values) {
  return text.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

export function generateHints(bound, severity, memory_efficiency, compute_efficiency, AI, ridge) {
  const hints = [];
  const values = {
    AI: AI.toFixed(2),
    ridge: ridge.toFixed(2),
    memory_efficiency: memory_efficiency.toFixed(1),
    compute_efficiency: compute_efficiency.toFixed(1),
  };

  if (bound === "MEMORY BOUND") {
    if (severity === "SEVERE") {
      hints.push({
        type: "critical",
        title: "Severely Memory Bound",
        text: applyTemplate("Arithmetic intensity {AI} FLOP/B is far below ridge ({ridge} FLOP/B). Focus on data reuse through tiling and kernel fusion.", values),
      });
    } else if (severity === "MODERATE" || severity === "SLIGHT") {
      hints.push({
        type: "warning",
        title: "Memory Bound",
        text: "Increase data reuse and fuse adjacent kernels to move toward the compute roof.",
      });
    }

    if (memory_efficiency < 50) {
      hints.push({
        type: "warning",
        title: "Low Memory Bandwidth Utilization",
        text: applyTemplate("Achieving only {memory_efficiency}% of peak HBM bandwidth. Check for irregular access patterns or cache thrashing.", values),
      });
    }

    hints.push({
      type: "tip",
      title: "Optimization Strategies",
      text: "1. Tiling: keep data in L1/L2 cache for reuse\n2. Kernel fusion: combine operations to reduce memory round-trips\n3. Prefetching: use __ldg() for read-only data",
    });
  } else if (bound === "COMPUTE BOUND") {
    if (severity === "SEVERE" || severity === "MODERATE") {
      hints.push({
        type: "warning",
        title: "Compute Bound",
        text: "Kernel is compute-limited. Consider lower precision (FP16/INT8) or tensor core utilization.",
      });
    }
    if (compute_efficiency < 50) {
      hints.push({
        type: "warning",
        title: "Low Compute Utilization",
        text: applyTemplate("Only {compute_efficiency}% of peak FLOPS achieved. Possible thread divergence, pipeline stalls, or poor instruction mix.", values),
      });
    }
  } else {
    hints.push({
      type: "success",
      title: "Near Ridge Point",
      text: applyTemplate("Kernel is well-balanced at {AI} FLOP/B (ridge: {ridge} FLOP/B). Focus on micro-optimizations.", values),
    });
  }

  return hints;
}

export function formatCompactNumber(value, digits = 2) {
  if (!Number.isFinite(value)) return "--";
  if (Math.abs(value) >= 1000 || (Math.abs(value) > 0 && Math.abs(value) < 0.01)) return value.toExponential(2);
  return value.toFixed(digits).replace(/\.?0+$/, "");
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function useRooflineAnalysis({ gpu, activePrecisionIds, kernels, primaryPrecision }) {
  return useMemo(() => {
    const precisionIds = activePrecisionIds.filter((precision) => getPrecisionPeak(gpu, precision) > 0);
    const roofline = computeRoofline(gpu, primaryPrecision);
    const rooflinesByPrecision = Object.fromEntries(
      precisionIds.map((precision) => [precision, { roofline: computeRoofline(gpu, precision), memoryLevels: computeAllRooflines(gpu, precision) }]),
    );
    const analyzedKernels = kernels.map((kernel, index) => {
      const metrics = computeKernelMetrics(kernel.flops, kernel.bytes, kernel.timeMs, roofline);
      return {
        ...kernel,
        color: kernel.color || KERNEL_COLORS[index % KERNEL_COLORS.length],
        ...metrics,
        hints: generateHints(metrics.bound, metrics.severity, metrics.memory_efficiency, metrics.compute_efficiency, metrics.arithmetic_intensity, roofline.ridge_point_x),
      };
    });
    return { roofline, rooflinesByPrecision, analyzedKernels };
  }, [activePrecisionIds, gpu, kernels, primaryPrecision]);
}
