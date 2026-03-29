"use client";

import { useMemo, useState } from "react";
import { DIRECT_ARCH_ORDER, GPU_MODEL_GROUPS, inputClassName, sectionLabelClassName } from "./kernel_utils";

function TogglePill({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-lg bg-gray-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            value === option.value ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function GpuArchSelector({ architectures, selection, onConfirm }) {
  const [vendor, setVendor] = useState(selection.vendor || "nvidia");
  const [kernelMode, setKernelMode] = useState(selection.kernelMode || "cuda");
  const [gpuModel, setGpuModel] = useState(selection.gpuModel || "");
  const [archId, setArchId] = useState(selection.archId || "");

  const filteredArchitectures = useMemo(
    () =>
      architectures
        .filter((arch) => arch.vendor === vendor)
        .sort((left, right) => DIRECT_ARCH_ORDER.indexOf(left.id) - DIRECT_ARCH_ORDER.indexOf(right.id)),
    [architectures, vendor]
  );

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className={sectionLabelClassName}>GPU Architecture</p>
      <div className="mt-4 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <TogglePill
            options={[
              { value: "nvidia", label: "NVIDIA (CUDA)" },
              { value: "amd", label: "AMD (ROCm)" }
            ]}
            value={vendor}
            onChange={(nextVendor) => {
              setVendor(nextVendor);
              setGpuModel("");
              setArchId("");
            }}
          />

          <TogglePill
            options={[
              { value: "cuda", label: "CUDA / HIP" },
              { value: "triton", label: "Triton" }
            ]}
            value={kernelMode}
            onChange={setKernelMode}
          />
        </div>

        {vendor === "amd" ? <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">Wavefront size = 64 threads</div> : null}

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-gray-900">Select by GPU Model</span>
            <select
              value={gpuModel && archId ? `${archId}|${gpuModel}` : ""}
              onChange={(event) => {
                const selectedValue = event.target.value;
                const [nextArchId, nextModel] = selectedValue.split("|");
                setGpuModel(nextModel || "");
                setArchId(nextArchId || "");
              }}
              className={inputClassName}
            >
              <option value="">Choose a GPU model</option>
              {GPU_MODEL_GROUPS.filter((group) => group.label.toLowerCase().includes(vendor === "nvidia" ? "nvidia" : "amd")).map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((option) => (
                    <option key={`${option.archId}-${option.model}`} value={`${option.archId}|${option.model}`}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-gray-900">Or Select Architecture Directly</span>
            <select value={archId} onChange={(event) => setArchId(event.target.value)} className={inputClassName}>
              <option value="">Choose an architecture</option>
              {filteredArchitectures.map((arch) => (
                <option key={arch.id} value={arch.id}>
                  {arch.id} ({arch.name})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-500">
            {kernelMode === "triton"
              ? "Triton mode computes thread count from num_warps and uses a staged shared-memory estimate."
              : "CUDA / HIP mode uses explicit launch dimensions, registers, and shared memory."}
          </p>
          <button
            type="button"
            disabled={!archId}
            onClick={() => onConfirm({ vendor, kernelMode, archId, gpuModel })}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Apply GPU Selection
          </button>
        </div>
      </div>
    </section>
  );
}
