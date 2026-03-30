"use client";

import { Cloud, Cpu, Laptop, MonitorSmartphone } from "lucide-react";
import { gpuDatabase } from "../../../data/gpuDatabase";
import SelectionGrid from "../shared/SelectionGrid";

const HARDWARE_OPTIONS = [
  { id: "cloud_gpu", label: "Cloud GPU", icon: <Cloud className="h-5 w-5" />, description: "AWS, GCP, Azure, Lambda" },
  { id: "local_gpu", label: "Local GPU", icon: <Laptop className="h-5 w-5" />, description: "Your own NVIDIA or AMD GPU" },
  { id: "apple_silicon", label: "Apple Silicon", icon: <MonitorSmartphone className="h-5 w-5" />, description: "MacBook Pro, Mac Studio, Mac Pro" },
  { id: "cpu", label: "CPU / Edge", icon: <Cpu className="h-5 w-5" />, description: "CPU server or edge device" },
];

const GROUPS = {
  cloud_gpu: ["data_center_nvidia", "blackwell", "amd_data_center", "apple_silicon"],
  local_gpu: ["consumer_nvidia", "professional_nvidia", "amd_consumer", "amd_data_center"],
  apple_silicon: ["apple_silicon"],
};

function getGpuChoices(hardwareType) {
  const tiers = GROUPS[hardwareType] || [];
  return gpuDatabase.filter((gpu) => tiers.includes(gpu.tier));
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
        checked ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-700"
      }`}
    >
      <span
        className={`flex h-6 w-10 items-center rounded-full p-1 transition-colors ${
          checked ? "bg-white/30" : "bg-gray-200"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

export default function Step2Compute({ state, updateCompute, updateMetrics }) {
  const gpuChoices = getGpuChoices(state.compute.hardware_type);

  const selectGpu = (name) => {
    const gpu = gpuChoices.find((item) => item.name === name);
    updateCompute({
      gpu_model: name,
      vram_gb: gpu?.vram ?? state.compute.vram_gb,
      ram_gb:
        state.compute.hardware_type === "apple_silicon"
          ? gpu?.vram ?? state.compute.ram_gb
          : state.compute.ram_gb,
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section>
        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">
          Where Will This Run?
        </p>
        <SelectionGrid
          options={HARDWARE_OPTIONS}
          selected={state.compute.hardware_type}
          onSelect={(value) =>
            updateCompute({
              hardware_type: value,
              gpu_model: null,
            })
          }
          columns="sm:grid-cols-2"
        />
      </section>

      {state.compute.hardware_type && state.compute.hardware_type !== "cpu" ? (
        <section>
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">
            GPU / Chip Model
          </p>
          <select
            value={state.compute.gpu_model || ""}
            onChange={(event) => selectGpu(event.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-gray-400"
          >
            <option value="">Select hardware</option>
            {gpuChoices.map((gpu) => (
              <option key={`${gpu.name}-${gpu.vram}`} value={gpu.name}>
                {gpu.label} - {gpu.name} ({gpu.vram} GB)
              </option>
            ))}
          </select>
        </section>
      ) : null}

      <section>
        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">
          Resource Constraints
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">VRAM Budget</span>
              <span className="text-sm font-bold text-gray-900">{state.compute.vram_gb} GB</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="1"
              value={state.compute.vram_gb}
              onChange={(event) => updateCompute({ vram_gb: Number(event.target.value) })}
              className="smart-slider w-full appearance-none bg-transparent"
            />
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">RAM Budget</span>
              <span className="text-sm font-bold text-gray-900">{state.compute.ram_gb} GB</span>
            </div>
            <input
              type="range"
              min="0"
              max="512"
              step="1"
              value={state.compute.ram_gb}
              onChange={(event) => updateCompute({ ram_gb: Number(event.target.value) })}
              className="smart-slider w-full appearance-none bg-transparent"
            />
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="mb-3 text-sm font-semibold text-gray-700">Latency Target</div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 100, label: "< 100ms" },
                { id: 500, label: "< 500ms" },
                { id: 2000, label: "< 2s" },
                { id: 10000, label: "< 10s" },
                { id: null, label: "No limit" },
              ].map((item) => (
                <button
                  key={String(item.id)}
                  type="button"
                  onClick={() => updateCompute({ latency_target_ms: item.id })}
                  className={`rounded-full px-3 py-2 text-sm font-medium ${
                    state.compute.latency_target_ms === item.id
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="mb-3 text-sm font-semibold text-gray-700">Batch Size</div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 1, label: "1 (real-time)" },
                { id: 8, label: "4-16" },
                { id: 64, label: "32-128" },
                { id: 256, label: "128+ (batch)" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateCompute({ batch_size: item.id })}
                  className={`rounded-full px-3 py-2 text-sm font-medium ${
                    state.compute.batch_size === item.id
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Throughput Requirement
            </label>
            <input
              type="number"
              value={state.compute.throughput_rps ?? ""}
              onChange={(event) =>
                updateCompute({
                  throughput_rps: event.target.value ? Number(event.target.value) : null,
                })
              }
              placeholder="e.g. 10"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-gray-400"
            />
            <p className="mt-2 text-xs text-gray-400">requests/sec</p>
          </div>

          {state.compute.hardware_type === "cloud_gpu" ? (
            <div className="rounded-2xl border border-gray-200 p-4">
              <div className="mb-3 text-sm font-semibold text-gray-700">Cost Budget</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 0, label: "Free / Self-hosted" },
                  { id: 1, label: "< $1/hr" },
                  { id: 5, label: "< $5/hr" },
                  { id: 20, label: "< $20/hr" },
                  { id: null, label: "No limit" },
                ].map((item) => (
                  <button
                    key={String(item.id)}
                    type="button"
                    onClick={() => updateCompute({ cost_per_hour: item.id })}
                    className={`rounded-full px-3 py-2 text-sm font-medium ${
                      state.compute.cost_per_hour === item.id
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section>
        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">
          Additional Constraints
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <Toggle
            checked={state.compute.allow_quantization}
            onChange={(value) => {
              updateCompute({ allow_quantization: value });
              updateMetrics({ quantization_ok: value });
            }}
            label="Allow Quantization"
          />
          <Toggle
            checked={state.metrics.needs_finetuning}
            onChange={(value) => updateMetrics({ needs_finetuning: value })}
            label="Allow Fine-tuning Required"
          />
          <Toggle
            checked={state.compute.multi_gpu}
            onChange={(value) => updateCompute({ multi_gpu: value })}
            label="Multi-GPU OK"
          />
        </div>
        {state.compute.multi_gpu ? (
          <div className="mt-4 max-w-xs">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Number of GPUs</label>
            <input
              type="number"
              min="1"
              max="8"
              value={state.compute.num_gpus}
              onChange={(event) => updateCompute({ num_gpus: Number(event.target.value) })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-gray-400"
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
