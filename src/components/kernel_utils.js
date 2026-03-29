"use client";

export const sectionLabelClassName = "text-xs font-semibold uppercase tracking-widest text-gray-400";
export const inputClassName =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900";
export const mutedCardClassName = "rounded-xl border border-gray-200 bg-gray-50 p-4";

export const MAX_THREADS_PER_BLOCK = 1024;
export const BLOCK_SWEEP_THREADS = Array.from({ length: 32 }, (_, index) => (index + 1) * 32);
export const REGISTER_SWEEP_VALUES = Array.from({ length: 31 }, (_, index) => 8 + index * 4);
export const HEATMAP_REGISTERS = [8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128];
export const HEATMAP_BLOCK_SIZES = [32, 64, 128, 192, 256, 320, 384, 512, 640, 768, 1024];
export const DIRECT_ARCH_ORDER = ["sm_100", "sm_90", "sm_89", "sm_86", "sm_80", "sm_75", "sm_70", "sm_61", "sm_60", "sm_52", "rdna3", "rdna2", "cdna2", "cdna3"];

export const GPU_MODEL_GROUPS = [
  {
    label: "NVIDIA Data Center",
    options: [
      { label: "H100", archId: "sm_90", model: "H100 SXM" },
      { label: "H200", archId: "sm_90", model: "H200" },
      { label: "A100", archId: "sm_80", model: "A100" },
      { label: "V100", archId: "sm_70", model: "V100" },
      { label: "T4", archId: "sm_75", model: "T4" },
      { label: "L40S", archId: "sm_89", model: "L40S" },
      { label: "L4", archId: "sm_89", model: "L4" }
    ]
  },
  {
    label: "NVIDIA Consumer",
    options: [
      { label: "RTX 4090", archId: "sm_89", model: "RTX 4090" },
      { label: "RTX 3090", archId: "sm_86", model: "RTX 3090" },
      { label: "RTX 2080", archId: "sm_75", model: "RTX 2080" },
      { label: "GTX 1080", archId: "sm_61", model: "GTX 1080" }
    ]
  },
  {
    label: "AMD Data Center",
    options: [
      { label: "MI300X", archId: "cdna3", model: "MI300X" },
      { label: "MI250X", archId: "cdna2", model: "MI250X" }
    ]
  },
  {
    label: "AMD Consumer",
    options: [
      { label: "RX 7900 XTX", archId: "rdna3", model: "RX 7900 XTX" },
      { label: "RX 6900 XT", archId: "rdna2", model: "RX 6900 XT" }
    ]
  }
];

export const KERNEL_PRESETS = [
  { id: "flash-attention-v2-a100", label: "Flash Attention v2 (A100)", archId: "sm_80", vendor: "nvidia", kernelMode: "cuda", config: { blockDimX: 128, blockDimY: 1, blockDimZ: 1, registersPerThread: 96, staticSmemBytes: 49152, dynamicSmemBytes: 0 } },
  { id: "matrix-multiply-gemm-a100", label: "Matrix Multiply GEMM (A100)", archId: "sm_80", vendor: "nvidia", kernelMode: "cuda", config: { blockDimX: 256, blockDimY: 1, blockDimZ: 1, registersPerThread: 128, staticSmemBytes: 65536, dynamicSmemBytes: 0 } },
  { id: "elementwise-kernel", label: "Elementwise Kernel", archId: "sm_89", vendor: "nvidia", kernelMode: "cuda", config: { blockDimX: 1024, blockDimY: 1, blockDimZ: 1, registersPerThread: 16, staticSmemBytes: 0, dynamicSmemBytes: 0 } },
  { id: "softmax-kernel", label: "Softmax Kernel", archId: "sm_89", vendor: "nvidia", kernelMode: "cuda", config: { blockDimX: 256, blockDimY: 1, blockDimZ: 1, registersPerThread: 32, staticSmemBytes: 4096, dynamicSmemBytes: 0 } },
  { id: "conv2d-kernel", label: "Conv2D Kernel", archId: "sm_86", vendor: "nvidia", kernelMode: "cuda", config: { blockDimX: 512, blockDimY: 1, blockDimZ: 1, registersPerThread: 64, staticSmemBytes: 32768, dynamicSmemBytes: 0 } },
  { id: "triton-gemm-default", label: "Triton GEMM Default", archId: "sm_89", vendor: "nvidia", kernelMode: "triton", config: { blockSize: 128, numWarps: 4, numStages: 3, elementSizeBytes: 2, tritonRegistersPerThread: 32 } }
];

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

export function formatBytes(bytes) {
  return `${Math.round(bytes).toLocaleString()} bytes`;
}

export function formatKbFromBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function formatInteger(value) {
  return Math.round(value || 0).toLocaleString();
}

export function getExecutionTerms(arch) {
  if (arch?.vendor === "amd") {
    return { warpLabel: "Wavefront", warpLabelPlural: "Wavefronts", threadGroupLabel: "Wavefront Size", sharedMemoryLabel: "LDS", registerLabel: "VGPRs" };
  }

  return { warpLabel: "Warp", warpLabelPlural: "Warps", threadGroupLabel: "Warp Size", sharedMemoryLabel: "Shared Memory", registerLabel: "Registers" };
}

export function getLimiterColor(name) {
  if (name === "Warp/Thread Limit") return "#3b82f6";
  if (name === "Register Limit") return "#8b5cf6";
  if (name === "Shared Memory") return "#14b8a6";
  return "#f97316";
}

export function getSeverityStyles(severity) {
  if (severity === "critical") return { border: "border-red-500", bg: "bg-red-50", text: "text-red-800", button: "bg-red-600 text-white hover:bg-red-500" };
  if (severity === "warning") return { border: "border-yellow-500", bg: "bg-yellow-50", text: "text-yellow-800", button: "bg-yellow-500 text-white hover:bg-yellow-400" };
  if (severity === "success") return { border: "border-green-500", bg: "bg-green-50", text: "text-green-800", button: "bg-green-600 text-white hover:bg-green-500" };
  return { border: "border-blue-500", bg: "bg-blue-50", text: "text-blue-800", button: "bg-gray-900 text-white hover:bg-gray-700" };
}

export function getOccupancyTone(occupancy) {
  if (occupancy >= 75) return { value: "text-green-600", badge: "bg-green-50 text-green-700 border border-green-200" };
  if (occupancy >= 25) return { value: "text-yellow-500", badge: "bg-yellow-50 text-yellow-700 border border-yellow-200" };
  return { value: "text-red-600", badge: "bg-red-50 text-red-700 border border-red-200" };
}

export function getHeatmapColor(occupancy) {
  if (occupancy >= 90) return "#16a34a";
  if (occupancy >= 75) return "#4ade80";
  if (occupancy >= 50) return "#facc15";
  if (occupancy >= 25) return "#fb923c";
  return "#ef4444";
}

export function isPowerOfTwo(value) {
  return value > 0 && (value & (value - 1)) === 0;
}
