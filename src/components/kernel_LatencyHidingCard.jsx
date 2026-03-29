"use client";

import { formatPercent, getOccupancyTone, sectionLabelClassName } from "./kernel_utils";

function getExplanation(status, occupancy) {
  if (status === "excellent") return `At ${formatPercent(occupancy)}, the warp scheduler has enough resident warps to hide memory latency effectively.`;
  if (status === "good") return "Decent occupancy. Most memory latency is hidden but some stalls may still appear during high-latency operations.";
  if (status === "partial") return "Low-medium occupancy. Memory stalls are likely visible. Consider increasing occupancy or adding prefetching.";
  return "Very low occupancy. Memory latency is fully exposed and the GPU will stall frequently.";
}

export default function LatencyHidingCard({ arch, result, launchConfig }) {
  if (!arch || !result) return null;

  const tone = getOccupancyTone(result.occupancy_percent);
  const statusLabel = { excellent: "Excellent", good: "Good", partial: "Partial", poor: "Poor" }[result.latency_status];
  const totalBlocks = Number(launchConfig.totalBlocks) || 0;
  const totalSms = Number(launchConfig.totalSms) || 0;
  const totalResidentBlocks = result.active_blocks * totalSms;
  const utilization = totalResidentBlocks > 0 ? Math.min(totalBlocks / totalResidentBlocks, 1) * 100 : 0;
  const waveCount = totalResidentBlocks > 0 ? totalBlocks / totalResidentBlocks : 0;
  const waveCountRounded = totalResidentBlocks > 0 ? Math.ceil(waveCount) : 0;
  const lastWaveFraction = waveCount > 0 ? (waveCount % 1 || (waveCount >= 1 ? 1 : waveCount)) : 0;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className={sectionLabelClassName}>Latency Hiding Estimate</p>
      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${tone.badge}`}>{statusLabel}</p>
        <p className="mt-3 text-sm text-gray-600">{getExplanation(result.latency_status, result.occupancy_percent)}</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Memory Stall Risk</p>
          <p className="mt-2 text-lg font-bold text-gray-900">{result.memory_stall_risk}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Compute Bound Likelihood</p>
          <p className="mt-2 text-lg font-bold text-gray-900">{result.compute_bound_likelihood}</p>
        </div>
      </div>

      {launchConfig.showLaunchConfig && totalBlocks > 0 && totalSms > 0 ? (
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Total Active Warps on GPU</p>
              <p className="mt-2 text-lg font-bold text-gray-900">{(result.active_warps * totalSms).toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">GPU Utilization</p>
              <p className="mt-2 text-lg font-bold text-gray-900">{formatPercent(utilization)}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Wave Count</p>
              <p className="mt-2 text-lg font-bold text-gray-900">{waveCountRounded ? `${waveCount.toFixed(2)} (${waveCountRounded} wave${waveCountRounded > 1 ? "s" : ""})` : "0"}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Last Wave Fill</p>
              <p className="mt-2 text-lg font-bold text-gray-900">{formatPercent(lastWaveFraction * 100)}</p>
            </div>
          </div>

          {waveCount > 1 && lastWaveFraction > 0 && lastWaveFraction < 1 ? <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">Last wave is only {formatPercent(lastWaveFraction * 100)} full. Consider adjusting grid size.</div> : null}
        </div>
      ) : null}
    </section>
  );
}
