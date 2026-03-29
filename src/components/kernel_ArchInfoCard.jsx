"use client";

import { formatBytes, formatInteger, getExecutionTerms, sectionLabelClassName } from "./kernel_utils";

function SpecCell({ label, value, highlight = false }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-yellow-300 bg-yellow-50" : "border-gray-200 bg-gray-50"}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-2 text-base font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function ArchInfoCard({ arch, bottleneckNames = [] }) {
  if (!arch) return null;

  const terms = getExecutionTerms(arch);
  const highlight = {
    warp: bottleneckNames.includes("Warp/Thread Limit"),
    register: bottleneckNames.includes("Register Limit"),
    smem: bottleneckNames.includes("Shared Memory"),
    block: bottleneckNames.includes("Block Limit")
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className={sectionLabelClassName}>SM Limits for {arch.name}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <SpecCell label="Compute Capability" value={arch.compute_capability} />
        <SpecCell label={terms.threadGroupLabel} value={`${arch.warp_size} threads`} highlight={highlight.warp} />
        <SpecCell label={`Max ${terms.warpLabelPlural} per SM`} value={formatInteger(arch.max_warps_per_sm)} highlight={highlight.warp} />
        <SpecCell label="Max Threads per SM" value={formatInteger(arch.max_threads_per_sm)} highlight={highlight.warp} />
        <SpecCell label="Max Blocks per SM" value={formatInteger(arch.max_blocks_per_sm)} highlight={highlight.block} />
        <SpecCell label={`Max ${arch.vendor === "amd" ? "VGPR Pool" : "Registers"} per SM`} value={formatInteger(arch.max_registers_per_sm)} highlight={highlight.register} />
        <SpecCell label={`Max ${terms.registerLabel} per Thread`} value={formatInteger(arch.max_registers_per_thread)} highlight={highlight.register} />
        <SpecCell label={`Max ${terms.sharedMemoryLabel} / SM`} value={`${arch.max_smem_per_sm_kb} KB`} highlight={highlight.smem} />
        <SpecCell label={`Max ${terms.sharedMemoryLabel} / Block`} value={`${arch.max_smem_per_block_kb} KB`} highlight={highlight.smem} />
        <SpecCell label="Register Granularity" value={formatInteger(arch.reg_alloc_granularity)} highlight={highlight.register} />
        <SpecCell label={`${terms.sharedMemoryLabel} Granularity`} value={formatBytes(arch.smem_alloc_granularity)} highlight={highlight.smem} />
        <SpecCell label="Example GPUs" value={arch.gpu_examples.join(", ")} />
      </div>
    </section>
  );
}
