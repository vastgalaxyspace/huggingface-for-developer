"use client";

import { useMemo, useState } from "react";
import { Info, Sparkles } from "lucide-react";
import GpuResultCard from "./GpuResultCard";

const SORT_OPTIONS = [
  { id: "best_match", label: "Sort: Best Match" },
  { id: "vram", label: "Sort: VRAM" },
  { id: "price", label: "Sort: Price" },
  { id: "performance", label: "Sort: Performance" },
];

function sortResults(results, sortKey, perfMetric) {
  const next = [...results];
  if (sortKey === "vram") return next.sort((a, b) => b.gpu.vram_gb - a.gpu.vram_gb);
  if (sortKey === "price") return next.sort((a, b) => a.gpu.price_usd_approx - b.gpu.price_usd_approx);
  if (sortKey === "performance") return next.sort((a, b) => (b.gpu[perfMetric] || 0) - (a.gpu[perfMetric] || 0));
  return next.sort((a, b) => a.rank - b.rank);
}

function getCompareValue(result, key) {
  if (key === "price") return -result.gpu.price_usd_approx;
  if (key === "score_total") return result.total_score;
  return result.gpu[key] || 0;
}

function CompareTable({ selectedResults, onClose }) {
  const rows = [
    ["vram_gb", "VRAM", (result) => `${result.gpu.vram_gb} GB`],
    ["fp16_tflops", "FP16 TFLOPS", (result) => result.gpu.fp16_tflops.toLocaleString()],
    ["int8_tops", "INT8 TOPS", (result) => result.gpu.int8_tops.toLocaleString()],
    ["memory_bandwidth_gbps", "Bandwidth", (result) => `${result.gpu.memory_bandwidth_gbps} GB/s`],
    ["tdp_watts", "TDP", (result) => `${result.gpu.tdp_watts} W`],
    ["price", "Price", (result) => result.gpu.price_label],
    ["cloud_available", "Cloud Available", (result) => (result.gpu.cloud_available ? "Yes" : "No")],
    ["multi_gpu_support", "Multi-GPU", (result) => (result.gpu.multi_gpu_support ? "Yes" : "No")],
    ["nvlink", "NVLink", (result) => (result.gpu.nvlink ? "Yes" : "No")],
    ["compute_capability", "Compute Capability", (result) => result.gpu.compute_capability],
    ["score_total", "Score: Total", (result) => `${Math.round(result.total_score)}/100`],
  ];

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-black text-gray-900">GPU Comparison</h3>
        <button className="text-xs font-bold uppercase tracking-widest text-gray-500" onClick={onClose}>Close Compare</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-emerald-800">Spec</th>
              {selectedResults.map((result) => (
                <th key={result.gpu.id} className="px-6 py-4 text-sm font-bold text-gray-900">{result.gpu.short_name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map(([key, label, render]) => {
              const winnerValue = Math.max(...selectedResults.map((result) => getCompareValue(result, key)));
              return (
                <tr key={key}>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-500">{label}</td>
                  {selectedResults.map((result) => (
                    <td key={`${key}-${result.gpu.id}`} className={`px-6 py-4 text-sm ${getCompareValue(result, key) === winnerValue && winnerValue !== 0 ? "bg-emerald-50 font-bold text-emerald-800" : "text-gray-700"}`}>
                      {render(result)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function GpuResultsList({ pickerState, phase, compareIds, onToggleCompare }) {
  const [sortKey, setSortKey] = useState("best_match");
  const [showAll, setShowAll] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  const sortedResults = useMemo(
    () => sortResults(pickerState.results, sortKey, pickerState.perf_metric),
    [pickerState.results, sortKey, pickerState.perf_metric],
  );
  const visibleResults = showAll ? sortedResults : sortedResults.slice(0, 8);
  const selectedResults = pickerState.results.filter((result) => compareIds.includes(result.gpu.id));

  if (phase !== "ready") {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/60 px-8 text-center">
        <Sparkles className="h-10 w-10 text-gray-300" />
        <p className="mt-4 text-lg font-bold text-gray-700">Pick a model and usage intent to get GPU recommendations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 transition-all duration-300 ease-in-out">
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-gray-800">{pickerState.summary_label}</p>
        <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 outline-none" value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </div>

      {pickerState.warnings.map((warning) => (
        <div key={warning.text} className={`rounded-2xl border px-4 py-3 text-sm ${
          warning.tone === "warning" ? "border-amber-300 bg-amber-50 text-amber-900" :
          warning.tone === "success" ? "border-emerald-300 bg-emerald-50 text-emerald-900" :
          "border-sky-200 bg-sky-50 text-sky-900"
        }`}>
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{warning.text}</p>
          </div>
        </div>
      ))}

      <div className="space-y-4">
        {visibleResults.map((result) => (
          <GpuResultCard
            key={result.gpu.id}
            result={result}
            perfMetric={pickerState.perf_metric}
            perfLabel={pickerState.perf_label}
            compareSelected={compareIds.includes(result.gpu.id)}
            compareDisabled={compareIds.length >= 3 && !compareIds.includes(result.gpu.id)}
            onToggleCompare={onToggleCompare}
          />
        ))}
      </div>

      {sortedResults.length > 8 && !showAll ? (
        <button className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold uppercase tracking-widest text-gray-700" onClick={() => setShowAll(true)}>
          Show More
        </button>
      ) : null}

      {selectedResults.length >= 2 ? (
        <div className="sticky bottom-4 z-10 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg">
          <button className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold uppercase tracking-widest text-white" onClick={() => setShowCompare(true)}>
            Compare Selected ({selectedResults.length})
          </button>
        </div>
      ) : null}

      {showCompare && selectedResults.length >= 2 ? <CompareTable selectedResults={selectedResults} onClose={() => setShowCompare(false)} /> : null}
    </div>
  );
}
