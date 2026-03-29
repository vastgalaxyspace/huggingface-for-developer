"use client";

import { Check, ExternalLink } from "lucide-react";

function StatBox({ label, value, highlight }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`mt-2 text-sm font-bold ${highlight ? "text-emerald-700" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

export default function ModelDetectedCard({ profile, configError, overrideOpen, onToggleOverride, overrides, onOverrideChange }) {
  return (
    <div className="rounded-2xl border border-gray-200 border-l-4 border-l-emerald-400 bg-white p-6 shadow-sm transition-all duration-300 ease-in-out">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">MODEL DETECTED</p>
          <h2 className="mt-3 text-2xl font-black text-gray-900">{profile.model_id}</h2>
        </div>
        <a href={profile.model_url} target="_blank" rel="noreferrer" className="text-emerald-700 hover:text-emerald-900">
          <ExternalLink className="h-5 w-5" />
        </a>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <StatBox label="Parameters" value={profile.param_count_display} />
        <StatBox label="Architecture" value={profile.architecture} />
        <StatBox label="Precision" value={profile.current_precision} highlight />
        <StatBox label="Context" value={`${profile.context_length.toLocaleString()} tokens`} />
        <StatBox label="Task" value={profile.task_label} />
        <StatBox label="Library" value={profile.library_name} />
      </div>

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">AUTO-DETECTED FOR GPU MATCHING</p>
        <div className="mt-3 space-y-2 text-sm text-gray-600">
          <p className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Task Type: {profile.detected_context === "llm" ? "LLM Inference / Training" : profile.task_label}</p>
          <p className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> VRAM Required: ~{profile.total_vram_inference.toFixed(1)} GB (fp16 inference)</p>
          <p className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Precision: {profile.current_precision} ({profile.precision_bytes} bytes/param)</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {profile.is_moe ? <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">Mixture-of-Experts - only active experts loaded (~{profile.active_params_display} params)</span> : null}
        {profile.long_context ? <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Long context ({Math.round(profile.context_length / 1000)}K tokens) - KV cache adds significant VRAM</span> : null}
        {profile.is_quantized ? <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Quantized model - inference only (no training)</span> : null}
        {!profile.config_available && configError ? <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">{configError}</span> : null}
      </div>

      <button type="button" onClick={onToggleOverride} className="mt-5 text-sm font-semibold text-gray-500 hover:text-gray-900">
        Override detected settings {overrideOpen ? "^" : "v"}
      </button>

      {overrideOpen ? (
        <div className="mt-4 grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-emerald-800">Precision</label>
            <select value={overrides.precision} onChange={(event) => onOverrideChange("precision", event.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm">
              <option value="">Auto</option>
              <option value="fp16">fp16</option>
              <option value="int8">int8</option>
              <option value="int4">int4</option>
              <option value="q4_km">q4_km</option>
              <option value="q3_km">q3_km</option>
              <option value="q2_k">q2_k</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-emerald-800">Sequence Length</label>
            <input type="range" min="512" max="131072" step="512" value={overrides.sequenceLength} onChange={(event) => onOverrideChange("sequenceLength", Number(event.target.value))} className="mt-3 w-full accent-emerald-600" />
            <p className="mt-1 text-xs text-gray-500">{Number(overrides.sequenceLength).toLocaleString()} tokens</p>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-emerald-800">Batch Size</label>
            <input type="number" min="1" value={overrides.batchSize} onChange={(event) => onOverrideChange("batchSize", Number(event.target.value) || 1)} className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
