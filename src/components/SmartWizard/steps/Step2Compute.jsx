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
      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
        checked
          ? "border-blue-500 bg-blue-500/5 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span className={`text-[13px] font-bold ${checked ? "text-blue-700" : "text-slate-700"}`}>
        {label}
      </span>
      <span
        className={`relative flex h-[22px] w-[38px] shrink-0 items-center rounded-full transition-all duration-300 ease-in-out ${
          checked ? "bg-blue-500 shadow-[inset_0_1px_4px_rgba(0,0,0,0.1)]" : "bg-slate-300 shadow-[inset_0_1px_4px_rgba(0,0,0,0.06)]"
        }`}
      >
        <span
          className={`h-[18px] w-[18px] transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
            checked ? "translate-x-[18px]" : "translate-x-[2px]"
          }`}
        />
      </span>
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

  const getVramZoneColors = (vram) => {
    if (vram <= 8) return "bg-emerald-500";
    if (vram <= 24) return "bg-blue-500";
    if (vram <= 48) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-500">
          Step 2
        </p>
        <h2 className="mb-6 text-xl font-black text-slate-900">Where Will This Run?</h2>
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
        <section className="fade-in-section">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Hardware Selection
          </p>
          <div className="relative">
            <select
              value={state.compute.gpu_model || ""}
              onChange={(event) => selectGpu(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[15px] font-semibold text-slate-800 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">Select specific hardware to auto-fill limits</option>
              {gpuChoices.map((gpu) => (
                <option key={`${gpu.name}-${gpu.vram}`} value={gpu.name}>
                  {gpu.label} - {gpu.name} ({gpu.vram} GB)
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-400">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M5 7.5L10 12.5L15 7.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </section>
      ) : null}

      <section>
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          Resource Constraints
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          {/* VRAM Budget */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/50 p-6 backdrop-blur-sm transition-all hover:border-slate-300">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Laptop className="h-4 w-4" />
                </div>
                <span className="text-[15px] font-bold text-slate-800">VRAM Budget</span>
              </div>
              <span className="rounded-xl bg-slate-900 px-3 py-1 text-sm font-black text-white">
                {state.compute.vram_gb} GB
              </span>
            </div>
            
            <div className="relative pt-4 pb-2">
              <div className="relative mt-2 h-10 w-full rounded-full border border-slate-200/80 bg-white/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                <div className="relative h-full w-full">
                  <div className="absolute left-[10px] right-[10px] top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
                  
                  <div
                    className={`absolute left-[10px] top-1/2 h-1.5 -translate-y-1/2 rounded-full transition-all duration-300 ease-out ${getVramZoneColors(state.compute.vram_gb)}`}
                    style={{
                      width: `calc(${(state.compute.vram_gb / 80) * 100}% * calc(100% - 20px) / 100)`,
                    }}
                  />

                  {[0, 25, 50, 75, 100].map((mark) => (
                    <div
                      key={mark}
                      className="pointer-events-none absolute top-1/2 h-[12px] w-[12px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-white transition-all duration-300"
                      style={{
                        left: `calc(10px + ${mark}% * calc(100% - 20px) / 100)`,
                        background: (state.compute.vram_gb / 80) * 100 >= mark 
                           ? (state.compute.vram_gb <= 8 ? '#10b981' : state.compute.vram_gb <= 24 ? '#3b82f6' : state.compute.vram_gb <= 48 ? '#f59e0b' : '#f43f5e') 
                           : "#e2e8f0",
                      }}
                    />
                  ))}

                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="1"
                    value={state.compute.vram_gb}
                    onChange={(event) => updateCompute({ vram_gb: Number(event.target.value) })}
                    className="app-slider--overlay absolute left-0 top-0 h-full w-full bg-transparent cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-bold text-slate-400">
              <span>0 GB</span>
              <span>Drag to adjust</span>
              <span>80+ GB</span>
            </div>
          </div>

          {/* RAM Budget */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/50 p-6 backdrop-blur-sm transition-all hover:border-slate-300">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <Cpu className="h-4 w-4" />
                </div>
                <span className="text-[15px] font-bold text-slate-800">RAM Budget</span>
              </div>
              <span className="rounded-xl bg-slate-100 px-3 py-1 text-sm font-black text-slate-700">
                {state.compute.ram_gb} GB
              </span>
            </div>
            
            <div className="relative pt-4 pb-2">
              <div className="relative mt-2 h-10 w-full rounded-full border border-slate-200/80 bg-white/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                <div className="relative h-full w-full">
                  <div className="absolute left-[10px] right-[10px] top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
                  
                  <div
                    className="absolute left-[10px] top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-emerald-500 transition-all duration-300 ease-out"
                    style={{
                      width: `calc(${(state.compute.ram_gb / 512) * 100}% * calc(100% - 20px) / 100)`,
                    }}
                  />

                  {[0, 25, 50, 75, 100].map((mark) => (
                    <div
                      key={mark}
                      className="pointer-events-none absolute top-1/2 h-[12px] w-[12px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-white transition-all duration-300"
                      style={{
                        left: `calc(10px + ${mark}% * calc(100% - 20px) / 100)`,
                        background: (state.compute.ram_gb / 512) * 100 >= mark ? '#10b981' : "#e2e8f0",
                      }}
                    />
                  ))}

                  <input
                    type="range"
                    min="0"
                    max="512"
                    step="1"
                    value={state.compute.ram_gb}
                    onChange={(event) => updateCompute({ ram_gb: Number(event.target.value) })}
                    className="app-slider--overlay absolute left-0 top-0 h-full w-full bg-transparent cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-bold text-slate-400">
              <span>0 GB</span>
              <span>System RAM</span>
              <span>512+ GB</span>
            </div>
          </div>

          {/* Quick selectors for Latency/Batch */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/50 p-5 backdrop-blur-sm transition-all">
            <div className="mb-3 text-[13px] font-bold text-slate-500">Latency Target</div>
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
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                    state.compute.latency_target_ms === item.id
                      ? "bg-slate-800 text-white shadow-md shadow-slate-200"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/50 p-5 backdrop-blur-sm transition-all">
            <div className="mb-3 text-[13px] font-bold text-slate-500">Batch Size</div>
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
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                    state.compute.batch_size === item.id
                      ? "bg-slate-800 text-white shadow-md shadow-slate-200"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          Advanced Settings
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Toggle
            checked={state.compute.allow_quantization}
            onChange={(value) => {
              updateCompute({ allow_quantization: value });
              updateMetrics({ quantization_ok: value });
            }}
            label="Quantization OK"
          />
          <Toggle
            checked={state.metrics.needs_finetuning}
            onChange={(value) => updateMetrics({ needs_finetuning: value })}
            label="Needs Finetuning"
          />
          <Toggle
            checked={state.compute.multi_gpu}
            onChange={(value) => updateCompute({ multi_gpu: value })}
            label="Multi-GPU Setup"
          />
        </div>
      </section>
    </div>
  );
}
