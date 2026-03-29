"use client";

import { formatGb } from "./utils";

const SEGMENTS = [
  { key: "weights", label: "Weights", color: "#1e3a5f" },
  { key: "kv_cache", label: "KV Cache", color: "#3b82f6" },
  { key: "activations", label: "Activations", color: "#14b8a6" },
  { key: "optimizer", label: "Optimizer", color: "#8b5cf6" },
  { key: "gradients", label: "Gradients", color: "#ec4899" },
  { key: "overhead", label: "Overhead", color: "#9ca3af" }
];

export default function BreakdownChart({ breakdown, numGpus }) {
  if (!breakdown) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
        Load a model and complete any required manual fields to see the VRAM breakdown.
      </div>
    );
  }

  const total = SEGMENTS.reduce((sum, segment) => sum + (breakdown[segment.key] || 0), 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400">VRAM Breakdown</p>
      <div className="mt-3 text-center">
        <p className="text-3xl font-bold text-gray-900">Total: {formatGb(breakdown.total)}</p>
        {numGpus > 1 ? <p className="mt-1 text-sm text-gray-600">Per GPU: {formatGb(breakdown.per_gpu)}</p> : null}
      </div>

      <div className="mt-6 flex h-5 w-full overflow-hidden rounded-full bg-gray-200">
        {SEGMENTS.map((segment) => {
          const value = breakdown[segment.key] || 0;
          const width = total > 0 ? (value / total) * 100 : 0;
          if (width <= 0) {
            return null;
          }

          return <div key={segment.key} style={{ width: `${width}%`, backgroundColor: segment.color }} />;
        })}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {SEGMENTS.map((segment) => (
          <div key={segment.key} className="flex items-center justify-between rounded-lg bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="text-sm font-medium text-gray-700">{segment.label}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{formatGb(breakdown[segment.key] || 0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

