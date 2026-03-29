"use client";

import { ChevronDown, TriangleAlert } from "lucide-react";
import { formatCompactNumber } from "../../hooks/useRooflineModel";

function SidebarCard({ label, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function UtilizationBar({ value }) {
  const pct = Math.max(0, Math.min(value, 100));
  const barColor = pct > 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-400" : "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-14 text-right text-sm font-semibold text-gray-600">{formatCompactNumber(pct, 1)}%</span>
    </div>
  );
}

export default function MetricsSidebar({ kernel, gpuName, precisionLabel, ridgePoint, expandedHints, onToggleHints }) {
  const position = !kernel?.arithmetic_intensity || !ridgePoint ? 50 : Math.max(0, Math.min(100, 50 + Math.log10(kernel.arithmetic_intensity / ridgePoint) * 25));
  const hint = kernel?.hints?.[0];
  const description =
    kernel?.bound === "MEMORY BOUND"
      ? "HBM bandwidth saturation is limiting throughput for this kernel."
      : kernel?.bound === "COMPUTE BOUND"
        ? "Peak FLOPS ceiling is limiting throughput for this kernel."
        : "Kernel is near the optimal ridge point.";

  return (
    <div className="space-y-4">
      <SidebarCard label="Arithmetic Intensity">
        <div className="flex items-end gap-3">
          <span className="text-5xl font-black text-gray-900">{kernel ? formatCompactNumber(kernel.arithmetic_intensity, 2) : "--"}</span>
          <span className="pb-1 text-sm text-gray-400">FLOP/B</span>
        </div>
        <div className="mt-5 rounded-xl border border-gray-200 bg-slate-50 p-3">
          <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <span>Memory Bound Zone</span>
            <span>Ridge</span>
            <span>Compute Bound Zone</span>
          </div>
          <div className="mt-3 relative h-2 rounded-full bg-gradient-to-r from-blue-200 via-gray-300 to-amber-200">
            <div className="absolute left-1/2 top-1/2 h-5 w-px -translate-y-1/2 bg-gray-900" />
            <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gray-900 bg-white" style={{ left: `${position}%` }} />
          </div>
        </div>
      </SidebarCard>

      <SidebarCard label="Primary Bottleneck">
        <div className={`inline-flex rounded px-4 py-2 text-sm font-bold uppercase ${kernel?.bound === "BALANCED" ? "border border-green-600 text-green-700" : "border-2 border-gray-900 text-gray-900"}`}>
          {kernel?.bound || "NOT SET"}
        </div>
        <p className="mt-4 text-sm text-gray-500">{description}</p>
      </SidebarCard>

      <SidebarCard label="Optimization Hint" className="border-orange-200 bg-orange-50">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-700">
          <TriangleAlert className="h-4 w-4 text-orange-500" />
          <span>Optimization Hint</span>
        </div>
        <p className="mt-4 whitespace-pre-line text-sm text-gray-600">{hint?.text || "Plot a kernel to surface optimization hints."}</p>
        {kernel?.hints?.length > 1 ? (
          <button type="button" onClick={onToggleHints} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-700 transition-all duration-150 hover:text-orange-800">
            See all {kernel.hints.length} hints <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${expandedHints ? "rotate-180" : ""}`} />
          </button>
        ) : null}
        {expandedHints ? (
          <div className="mt-4 space-y-3">
            {kernel.hints.slice(1).map((item) => (
              <div key={`${item.title}-${item.text}`} className="rounded-xl border border-orange-200 bg-white/80 p-3">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-700">{item.title}</p>
                <p className="mt-2 whitespace-pre-line text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        ) : null}
      </SidebarCard>

      <SidebarCard label="Performance Breakdown">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-gray-500">Memory Roof Utilization</p>
            <UtilizationBar value={kernel?.memory_efficiency || 0} />
          </div>
          <div>
            <p className="mb-2 text-sm text-gray-500">Compute Roof Utilization</p>
            <UtilizationBar value={kernel?.compute_efficiency || 0} />
          </div>
        </div>
      </SidebarCard>

      <SidebarCard label="Ridge Point">
        <p className="text-3xl font-black text-gray-900">{formatCompactNumber(ridgePoint, 2)} FLOP/B</p>
        <p className="mt-2 text-sm text-gray-500">Optimal AI for {gpuName} at {precisionLabel}</p>
      </SidebarCard>
    </div>
  );
}
