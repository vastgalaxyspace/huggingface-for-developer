"use client";

import { formatKbFromBytes, formatPercent, getExecutionTerms, getOccupancyTone, sectionLabelClassName } from "./kernel_utils";

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-2 text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ResourceCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default function OccupancyResultCard({ arch, result, blocked }) {
  if (!arch || !result) return null;

  const terms = getExecutionTerms(arch);
  const tone = getOccupancyTone(result.occupancy_percent);
  const resourceUsage = result.resource_usage;

  return (
    <section className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {blocked ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80 px-6 text-center backdrop-blur-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-red-500">Launch Blocked</p>
            <p className="mt-2 text-base font-semibold text-gray-900">Fix the launch errors to see valid occupancy results.</p>
          </div>
        </div>
      ) : null}

      <div className="text-center">
        <p className={sectionLabelClassName}>Result</p>
        <p className={`mt-4 text-6xl font-black ${tone.value}`}>{formatPercent(result.occupancy_percent)}</p>
        <p className="mt-2 text-sm text-gray-500">Kernel Occupancy</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={`Active ${terms.warpLabelPlural}`} value={`${result.active_warps} / ${arch.max_warps_per_sm}`} />
        <StatCard label="Active Blocks" value={`${result.active_blocks} / ${arch.max_blocks_per_sm}`} />
        <StatCard label={`${terms.warpLabelPlural} per Block`} value={String(result.warps_per_block)} />
        <StatCard label="Wasted Threads" value={String(result.wasted_threads)} />
      </div>

      <div className="mt-8">
        <p className={sectionLabelClassName}>Occupancy Limiters</p>
        <div className="mt-4 space-y-4">
          {result.limiters.map((limiter) => (
            <div key={limiter.name} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-900">{limiter.name}</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">{formatPercent(limiter.percent_of_max)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${limiter.is_bottleneck ? "border border-red-200 bg-red-50 text-red-700" : "border border-green-200 bg-green-50 text-green-700"}`}>{limiter.is_bottleneck ? "BOTTLENECK" : "OK"}</span>
                </div>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, limiter.percent_of_max))}%`, backgroundColor: limiter.color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-semibold text-gray-900">Primary Bottleneck: {result.bottleneck?.name}</p>
          <p className="mt-1 text-sm text-gray-600">{result.bottleneck?.explanation}</p>
        </div>
      </div>

      {resourceUsage ? (
        <div className="mt-8">
          <p className={sectionLabelClassName}>Resource Utilization</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <ResourceCard label="Registers" value={`${resourceUsage.registers_used.toLocaleString()} / ${resourceUsage.registers_max.toLocaleString()} per SM (${formatPercent((resourceUsage.registers_used / Math.max(1, resourceUsage.registers_max)) * 100)})`} />
            <ResourceCard label={terms.sharedMemoryLabel} value={`${formatKbFromBytes(resourceUsage.shared_mem_used)} / ${arch.max_smem_per_sm_kb} KB (${formatPercent((resourceUsage.shared_mem_used / Math.max(1, resourceUsage.shared_mem_max)) * 100)})`} />
            <ResourceCard label="Thread Slots" value={`${resourceUsage.thread_slots_used.toLocaleString()} / ${arch.max_threads_per_sm.toLocaleString()} (${formatPercent((resourceUsage.thread_slots_used / Math.max(1, arch.max_threads_per_sm)) * 100)})`} />
            <ResourceCard label="Block Slots" value={`${resourceUsage.block_slots_used.toLocaleString()} / ${arch.max_blocks_per_sm.toLocaleString()} (${formatPercent((resourceUsage.block_slots_used / Math.max(1, arch.max_blocks_per_sm)) * 100)})`} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
