export function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

export const POPULAR_MODELS = [
  "mistralai/Mistral-7B-v0.1",
  "meta-llama/Meta-Llama-3-8B",
  "tiiuae/falcon-40b",
  "bigscience/bloom",
  "mistralai/Mixtral-8x7B-v0.1",
  "Qwen/Qwen2-72B-Instruct",
  "google/gemma-2-27b"
];

export const PRECISION_OPTIONS = [
  { value: "fp32", label: "fp32", bytes: 4 },
  { value: "fp16", label: "fp16", bytes: 2 },
  { value: "bf16", label: "bf16", bytes: 2 },
  { value: "fp8", label: "fp8", bytes: 1 },
  { value: "int8", label: "int8", bytes: 1 },
  { value: "int4_gptq", label: "int4/GPTQ", bytes: 0.5 },
  { value: "int4_awq", label: "int4/AWQ", bytes: 0.5 },
  { value: "q4_k_m", label: "Q4_K_M", bytes: 0.45 },
  { value: "q3_k_m", label: "Q3_K_M", bytes: 0.375 },
  { value: "q2_k", label: "Q2_K", bytes: 0.25 }
];

export const OPTIMIZER_OPTIONS = ["AdamW", "AdamW 8-bit", "SGD", "Lion"];
export const PARALLELISM_OPTIONS = ["Single GPU", "Tensor Parallel", "Pipeline Parallel", "Data Parallel"];
export const BYTES_PER_GB = 1024 ** 3;

export function getBytesPerParam(precision) {
  return PRECISION_OPTIONS.find((option) => option.value === precision)?.bytes ?? 2;
}

export function formatGb(value) {
  if (!Number.isFinite(value)) {
    return "0.00 GB";
  }

  return `${value.toFixed(2)} GB`;
}

export function formatParams(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return "Unknown";
  }

  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(0);
}

export function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Unknown";
  }

  return value.toLocaleString();
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function getPrecisionBadgeClasses(precision) {
  if (precision.includes("int4") || precision.startsWith("q")) {
    return "bg-blue-50 text-blue-700 border border-blue-200";
  }

  if (precision === "int8" || precision === "fp8") {
    return "bg-yellow-50 text-yellow-700 border border-yellow-200";
  }

  return "bg-green-50 text-green-700 border border-green-200";
}

export function getStatusClasses(status) {
  if (status === "Fits") {
    return { badge: "bg-green-50 text-green-700 border border-green-200", bar: "bg-green-500" };
  }

  if (status === "Tight") {
    return { badge: "bg-yellow-50 text-yellow-700 border border-yellow-200", bar: "bg-yellow-500" };
  }

  return { badge: "bg-red-50 text-red-700 border border-red-200", bar: "bg-red-500" };
}

export function toTitleCase(value) {
  if (!value) {
    return "Unknown";
  }

  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

