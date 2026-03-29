"use client";

import { formatCompactNumber } from "../../hooks/useRooflineModel";

export default function GpuSelector({ gpuGroups, selectedGpuId, onSelect, summary }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">GPU Selector</p>
          <h2 className="mt-2 text-3xl font-black text-gray-900">Roofline Model Analyzer</h2>
          <p className="mt-3 text-sm text-gray-500">Pick a target GPU, then compare kernel arithmetic intensity against the device rooflines.</p>
        </div>
        <div className="w-full max-w-md">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Target GPU</label>
          <select
            value={selectedGpuId}
            onChange={(event) => onSelect(event.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all duration-150 focus:border-gray-900"
          >
            {Object.entries(gpuGroups).map(([group, gpus]) => (
              <optgroup key={group} label={group}>
                {gpus.map((gpu) => (
                  <option key={gpu.id} value={gpu.id}>
                    {gpu.shortName}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-xs text-gray-500">
        Peak FP32: {formatCompactNumber(summary.peakFp32Tflops, 1)} TFLOP/s | HBM BW: {formatCompactNumber(summary.bandwidth, 0)} GB/s | Ridge (FP32): {formatCompactNumber(summary.ridge, 2)} FLOP/B
      </div>
    </div>
  );
}
