"use client";

import { useMemo } from "react";
import {
  BLOCK_SWEEP_THREADS,
  HEATMAP_BLOCK_SIZES,
  HEATMAP_REGISTERS,
  MAX_THREADS_PER_BLOCK,
  REGISTER_SWEEP_VALUES,
  formatPercent,
  getLimiterColor,
  isPowerOfTwo
} from "../components/kernel_utils";

function roundUpToGranularity(value, granularity) {
  if (value <= 0) return 0;
  return Math.ceil(value / granularity) * granularity;
}

function getEffectiveRegisterPool(arch) {
  if (arch.vendor === "amd" && arch.max_registers_per_sm <= arch.max_registers_per_thread) {
    return arch.max_warps_per_sm * arch.max_registers_per_thread;
  }

  return arch.max_registers_per_sm;
}

function getThreadsPerBlock(config, kernelMode, arch) {
  if (kernelMode === "triton") {
    return Math.max(0, Number(config.numWarps) || 0) * arch.warp_size;
  }

  return (Number(config.blockDimX) || 0) * (Number(config.blockDimY) || 0) * (Number(config.blockDimZ) || 0);
}

function getRegistersPerThread(config, kernelMode) {
  return kernelMode === "triton" ? Number(config.tritonRegistersPerThread) || 32 : Number(config.registersPerThread) || 0;
}

function getSharedMemory(config, kernelMode) {
  if (kernelMode === "triton") {
    return { staticSmem: 0, dynamicSmem: 0, totalSmem: (Number(config.numStages) || 0) * (Number(config.blockSize) || 0) * (Number(config.elementSizeBytes) || 0) };
  }

  const staticSmem = Number(config.staticSmemBytes) || 0;
  const dynamicSmem = Number(config.dynamicSmemBytes) || 0;
  return { staticSmem, dynamicSmem, totalSmem: staticSmem + dynamicSmem };
}

function getBottleneckExplanation(name, arch) {
  if (name === "Warp/Thread Limit") return `Your block shape consumes too many ${arch.vendor === "amd" ? "wavefront" : "warp"} slots per SM, reducing residency.`;
  if (name === "Register Limit") return `Per-thread register usage caps the number of resident ${arch.vendor === "amd" ? "wavefronts" : "warps"}.`;
  if (name === "Shared Memory") return `${arch.vendor === "amd" ? "LDS" : "Shared memory"} per block is the primary limiter for concurrent blocks.`;
  return "Architectural block slot limits are capping occupancy before other resources do.";
}

function calculateKernelOccupancy({ arch, kernelMode, config, overrideThreadsPerBlock, overrideRegistersPerThread, overrideSmemBytes }) {
  if (!arch) return null;

  const threadsPerBlock = overrideThreadsPerBlock ?? getThreadsPerBlock(config, kernelMode, arch);
  const registersPerThread = overrideRegistersPerThread ?? getRegistersPerThread(config, kernelMode);
  const sharedMemory = getSharedMemory(config, kernelMode);
  const totalSmem = overrideSmemBytes ?? sharedMemory.totalSmem;
  const warpsPerBlock = threadsPerBlock > 0 ? Math.ceil(threadsPerBlock / arch.warp_size) : 0;
  const launchThreadLimit = Math.min(MAX_THREADS_PER_BLOCK, arch.max_threads_per_sm);
  const wastedThreads = threadsPerBlock > 0 && threadsPerBlock % arch.warp_size !== 0 ? arch.warp_size - (threadsPerBlock % arch.warp_size) : 0;
  const warnings = [];

  if (!threadsPerBlock) {
    return {
      occupancy_percent: 0,
      active_warps: 0,
      active_blocks: 0,
      warps_per_block: 0,
      threads_per_block: 0,
      total_smem: totalSmem,
      registers_per_thread: registersPerThread,
      wasted_threads: 0,
      bottleneck: null,
      limiters: [],
      resource_usage: null,
      warnings,
      isLaunchValid: false
    };
  }

  if (threadsPerBlock > launchThreadLimit) warnings.push({ type: "error", message: "Thread block exceeds SM thread limit. Kernel will FAIL to launch." });
  if (totalSmem > arch.max_smem_per_block_kb * 1024) warnings.push({ type: "error", message: "Shared memory exceeds per-block limit. Kernel will FAIL to launch." });
  if (registersPerThread > arch.max_registers_per_thread) warnings.push({ type: "error", message: "Register count exceeds per-thread maximum. Compiler will spill to local memory." });

  const maxBlocksByWarps = warpsPerBlock > 0 ? Math.floor(arch.max_warps_per_sm / warpsPerBlock) : 0;
  const blocksWarpLimited = Math.min(maxBlocksByWarps, arch.max_blocks_per_sm);
  const warpsWarpLimited = blocksWarpLimited * warpsPerBlock;

  let blocksRegLimited = arch.max_blocks_per_sm;
  let warpsRegLimited = arch.max_warps_per_sm;
  let regsPerWarpAllocated = 0;
  const effectiveRegisterPool = getEffectiveRegisterPool(arch);

  if (registersPerThread !== 0) {
    regsPerWarpAllocated = roundUpToGranularity(registersPerThread * arch.warp_size, arch.reg_alloc_granularity);
    const maxWarpsByRegs = regsPerWarpAllocated > 0 ? Math.floor(effectiveRegisterPool / regsPerWarpAllocated) : arch.max_warps_per_sm;
    blocksRegLimited = Math.min(Math.floor(maxWarpsByRegs / warpsPerBlock), arch.max_blocks_per_sm);
    warpsRegLimited = Math.max(0, blocksRegLimited) * warpsPerBlock;
  }

  const smemAllocated = totalSmem === 0 ? 0 : roundUpToGranularity(totalSmem, arch.smem_alloc_granularity);
  const blocksSmemLimited = totalSmem === 0 ? arch.max_blocks_per_sm : Math.min(Math.floor((arch.max_smem_per_sm_kb * 1024) / smemAllocated), arch.max_blocks_per_sm);
  const warpsSmemLimited = blocksSmemLimited * warpsPerBlock;

  const blocksBlockLimited = arch.max_blocks_per_sm;
  const warpsBlockLimited = Math.min(blocksBlockLimited * warpsPerBlock, arch.max_warps_per_sm);

  const activeWarps = Math.max(0, Math.min(warpsWarpLimited, warpsRegLimited, warpsSmemLimited, warpsBlockLimited));
  const activeBlocks = warpsPerBlock > 0 ? Math.floor(activeWarps / warpsPerBlock) : 0;
  const occupancyPercent = arch.max_warps_per_sm > 0 ? (activeWarps / arch.max_warps_per_sm) * 100 : 0;

  const limiters = [
    { name: "Warp/Thread Limit", warps: warpsWarpLimited, blocks: blocksWarpLimited, percent_of_max: arch.max_warps_per_sm > 0 ? (warpsWarpLimited / arch.max_warps_per_sm) * 100 : 0, color: getLimiterColor("Warp/Thread Limit") },
    { name: "Register Limit", warps: warpsRegLimited, blocks: blocksRegLimited, percent_of_max: arch.max_warps_per_sm > 0 ? (warpsRegLimited / arch.max_warps_per_sm) * 100 : 0, color: getLimiterColor("Register Limit") },
    { name: "Shared Memory", warps: warpsSmemLimited, blocks: blocksSmemLimited, percent_of_max: arch.max_warps_per_sm > 0 ? (warpsSmemLimited / arch.max_warps_per_sm) * 100 : 0, color: getLimiterColor("Shared Memory") },
    { name: "Block Limit", warps: warpsBlockLimited, blocks: blocksBlockLimited, percent_of_max: arch.max_warps_per_sm > 0 ? (warpsBlockLimited / arch.max_warps_per_sm) * 100 : 0, color: getLimiterColor("Block Limit") }
  ];

  const minWarps = Math.min(...limiters.map((limiter) => limiter.warps));
  const bottlenecks = limiters.filter((limiter) => limiter.warps === minWarps).map((limiter) => limiter.name);
  const bottleneck = {
    name: bottlenecks.join(" + "),
    names: bottlenecks,
    explanation: bottlenecks.length > 1 ? `Multiple resources tie as co-bottlenecks at ${formatPercent(occupancyPercent)} occupancy.` : getBottleneckExplanation(bottlenecks[0], arch),
    color: getLimiterColor(bottlenecks[0] || "Block Limit")
  };

  const decoratedLimiters = limiters.map((limiter) => ({ ...limiter, is_bottleneck: bottlenecks.includes(limiter.name) }));

  if (threadsPerBlock % arch.warp_size !== 0) warnings.push({ type: "warning", message: `Block size not a multiple of warp size (${arch.warp_size}). Partial ${arch.vendor === "amd" ? "wavefront" : "warp"} active.` });
  if (occupancyPercent < 25) warnings.push({ type: "warning", message: `Very low occupancy (${formatPercent(occupancyPercent)}). Significant performance impact expected.` });
  if (activeBlocks === 1) warnings.push({ type: "warning", message: "Only 1 block active per SM. No warp switching possible. Memory stalls will halt execution." });

  return {
    occupancy_percent: occupancyPercent,
    active_warps: activeWarps,
    active_blocks: activeBlocks,
    warps_per_block: warpsPerBlock,
    threads_per_block: threadsPerBlock,
    total_smem: totalSmem,
    shared_memory: sharedMemory,
    registers_per_thread: registersPerThread,
    wasted_threads: wastedThreads,
    bottleneck,
    limiters: decoratedLimiters,
    warnings,
    isLaunchValid: !warnings.some((warning) => warning.type === "error"),
    resource_usage: {
      registers_used: activeWarps * regsPerWarpAllocated,
      registers_max: effectiveRegisterPool,
      shared_mem_used: activeBlocks * smemAllocated,
      shared_mem_max: arch.max_smem_per_sm_kb * 1024,
      thread_slots_used: activeBlocks * threadsPerBlock,
      block_slots_used: activeBlocks
    },
    limiter_details: { max_blocks_by_warps: maxBlocksByWarps, blocks_reg_limited: blocksRegLimited, blocks_smem_limited: blocksSmemLimited, regs_per_warp_allocated: regsPerWarpAllocated, smem_allocated: smemAllocated }
  };
}

function getLatencyStatus(occupancy) {
  if (occupancy >= 75) return "excellent";
  if (occupancy >= 50) return "good";
  if (occupancy >= 25) return "partial";
  return "poor";
}

function getMemoryStallRisk(occupancy) {
  if (occupancy < 25) return "HIGH — memory latency likely exposed";
  if (occupancy < 50) return "MEDIUM — partial hiding";
  return "LOW — latency well hidden";
}

function getComputeBoundLikelihood({ occupancy, registersPerThread, arch }) {
  const registerPressure = arch.max_registers_per_thread > 0 ? (registersPerThread / arch.max_registers_per_thread) * 100 : 0;
  if (occupancy < 25 && registerPressure < 35) return "Low — kernel is likely memory-bound";
  if (registerPressure > 50 && occupancy >= 25) return "High — register pressure suggests compute-heavy work";
  return "Moderate — inspect memory throughput and IPC together";
}

function buildRecommendations({ arch, kernelMode, config, result, registerSweep, smemSweep }) {
  if (!arch || !result) return [];

  const recommendations = [];
  const threadsPerBlock = result.threads_per_block;
  const registersPerThread = result.registers_per_thread;
  const totalSmem = result.total_smem;

  if (threadsPerBlock % arch.warp_size !== 0) {
    const wasted = arch.warp_size - (threadsPerBlock % arch.warp_size);
    const nextMultiple = threadsPerBlock + wasted;
    recommendations.push({ severity: "warning", title: "Align block size to full warp utilization", body: `Block size ${threadsPerBlock} wastes ${wasted} thread slots per ${arch.vendor === "amd" ? "wavefront" : "warp"}. Round up to ${nextMultiple} for full utilization.`, action: { type: "setThreadsPerBlock", value: nextMultiple } });
  }

  if (result.bottleneck?.names?.includes("Register Limit")) {
    const nextRegisterLevel = registerSweep.find((item) => item.registers < registersPerThread && item.occupancy_percent > result.occupancy_percent + 0.05);
    if (nextRegisterLevel) recommendations.push({ severity: "info", title: "Reduce register pressure for higher occupancy", body: `Reducing registers/thread from ${registersPerThread} to ${nextRegisterLevel.registers} would increase occupancy from ${formatPercent(result.occupancy_percent)} to ${formatPercent(nextRegisterLevel.occupancy_percent)}.`, action: { type: "setRegistersPerThread", value: nextRegisterLevel.registers } });
    recommendations.push({ severity: "info", title: "Guide the compiler with launch bounds", body: `Add __launch_bounds__(${threadsPerBlock}, 2) to hint the compiler to cap register usage for this launch shape.` });
  }

  if (result.bottleneck?.names?.includes("Shared Memory")) {
    const currentBlocks = result.limiters.find((limiter) => limiter.name === "Shared Memory")?.blocks ?? 0;
    const nextSmemLevel = smemSweep.find((item) => item.smem_bytes < totalSmem && item.blocks > currentBlocks);
    if (nextSmemLevel) recommendations.push({ severity: "info", title: "Trim shared memory to unlock another resident block", body: `Reducing shared memory by ${(totalSmem - nextSmemLevel.smem_bytes).toLocaleString()} bytes would allow ${nextSmemLevel.blocks - currentBlocks} more block(s) per SM.`, action: { type: "setTotalSmem", value: nextSmemLevel.smem_bytes } });
    recommendations.push({ severity: "info", title: "Use caches when shared memory is the limiter", body: "Consider using __ldg() for read-only data or improving cache reuse to reduce explicit shared memory pressure." });
  }

  if (result.occupancy_percent < 25) recommendations.push({ severity: "critical", title: "Occupancy is dangerously low", body: "Occupancy below 25%. Memory latency is likely exposed and the GPU will stall waiting for memory." });
  else if (result.occupancy_percent < 50) recommendations.push({ severity: "info", title: "Moderate occupancy", body: "Consider whether the kernel is compute-bound, where this may be acceptable, or memory-bound, where higher occupancy could help." });

  if (threadsPerBlock < 64) recommendations.push({ severity: "warning", title: "Increase very small blocks", body: `Block size of ${threadsPerBlock} is very small. Modern GPUs usually prefer 128-256+ threads per block for healthier scheduling.`, action: { type: "setThreadsPerBlock", value: 128 } });
  if (kernelMode === "triton" && !isPowerOfTwo(Number(config.numWarps) || 0)) recommendations.push({ severity: "warning", title: "Use a power-of-two num_warps", body: "num_warps should be a power of 2 for Triton kernels.", action: { type: "setNumWarps", value: 4 } });
  if (result.occupancy_percent >= 99.95) recommendations.push({ severity: "success", title: "Theoretical occupancy is maxed out", body: "100% theoretical occupancy achieved. Focus next on memory access patterns and instruction throughput." });

  return recommendations;
}

export function useKernelOccupancy({ arch, kernelMode, config }) {
  return useMemo(() => {
    if (!arch) return null;

    const result = calculateKernelOccupancy({ arch, kernelMode, config });
    const sweepBlocksize = BLOCK_SWEEP_THREADS.map((threads) => {
      const sample = calculateKernelOccupancy({ arch, kernelMode, config, overrideThreadsPerBlock: threads });
      return { threads, occupancy_percent: sample.occupancy_percent, bottleneck: sample.bottleneck?.name || "None" };
    });

    const sweepRegisters = REGISTER_SWEEP_VALUES.map((registers) => {
      const sample = calculateKernelOccupancy({ arch, kernelMode, config, overrideRegistersPerThread: registers });
      return { registers, occupancy_percent: sample.occupancy_percent };
    });

    const smemLimitBytes = arch.max_smem_per_sm_kb * 1024;
    const sweepSmem = Array.from({ length: Math.floor(smemLimitBytes / 1024) + 1 }, (_, index) => {
      const smemBytes = index * 1024;
      const sample = calculateKernelOccupancy({ arch, kernelMode, config, overrideSmemBytes: smemBytes });
      return { smem_kb: smemBytes / 1024, smem_bytes: smemBytes, occupancy_percent: sample.occupancy_percent, blocks: sample.active_blocks };
    });

    const heatmap = HEATMAP_REGISTERS.map((registers) =>
      HEATMAP_BLOCK_SIZES.map((threads) => {
        const sample = calculateKernelOccupancy({ arch, kernelMode, config, overrideThreadsPerBlock: threads, overrideRegistersPerThread: registers });
        return { block_size: threads, registers, occupancy_percent: sample.occupancy_percent, bottleneck: sample.bottleneck?.name || "None" };
      })
    );

    return {
      ...result,
      sweep_blocksize: sweepBlocksize,
      sweep_registers: sweepRegisters,
      sweep_smem: sweepSmem,
      heatmap,
      latency_status: getLatencyStatus(result.occupancy_percent),
      memory_stall_risk: getMemoryStallRisk(result.occupancy_percent),
      compute_bound_likelihood: getComputeBoundLikelihood({ occupancy: result.occupancy_percent, registersPerThread: result.registers_per_thread, arch }),
      recommendations: buildRecommendations({ arch, kernelMode, config, result, registerSweep: sweepRegisters, smemSweep: sweepSmem })
    };
  }, [arch, config, kernelMode]);
}
