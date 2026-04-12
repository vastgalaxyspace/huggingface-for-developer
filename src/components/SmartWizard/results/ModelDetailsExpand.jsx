"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Cpu, Hash, Layers, Calendar, CheckCircle2, AlertCircle } from "lucide-react";

function formatDate(dateString) {
  if (!dateString) return "Unknown Record";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function formatGb(value) {
  if (value == null || Number.isNaN(value)) return "Unknown";
  return `${value.toFixed(1)} GB`;
}

function GridBox({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200/60 bg-white/50 p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
        <div className="mt-1 truncate text-sm font-semibold text-slate-700">{value}</div>
      </div>
    </div>
  );
}

export default function ModelDetailsExpand({ model, hardwareLabel }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
      >
        {open ? "Hide Technical Details" : "View Technical Details"}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open ? (
        <div className="mt-4 grid gap-6 md:grid-cols-2 animate-in slide-in-from-top-2 fade-in duration-300">
          
          {/* Left Column: Specs */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 border-b border-slate-200 pb-2">
              Model Specifications
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <GridBox icon={<Hash className="h-4 w-4" />} label="Context Window" value={model.context_length ? `${model.context_length.toLocaleString()} tokens` : "Unknown"} />
              <GridBox icon={<Layers className="h-4 w-4" />} label="Architecture" value={model.config?.architectures?.[0] || "Unknown"} />
              <GridBox icon={<Cpu className="h-4 w-4" />} label="Parameters" value={model.params_b ? `${model.params_b.toFixed(1)}B` : "Unknown"} />
              <GridBox icon={<Calendar className="h-4 w-4" />} label="Last Updated" value={formatDate(model.lastModified)} />
            </div>
            
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Quick Deploy Snippet</div>
              <code className="block rounded-lg bg-slate-900 p-3 text-xs font-medium text-emerald-400 overflow-x-auto whitespace-pre">
                {`from transformers import AutoModelForCausalLM\nmodel = AutoModelForCausalLM.from_pretrained(\n  "${model.modelId}"\n)`}
              </code>
            </div>
          </div>

          {/* Right Column: VRAM Matrix */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 border-b border-slate-200 pb-2">
              VRAM Matrix
            </h4>
            
            <div className="rounded-2xl border border-slate-200 p-1 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-2 font-semibold text-slate-600 border-b border-slate-200">Precision</th>
                    <th className="px-4 py-2 font-semibold text-slate-600 border-b border-slate-200">Inference</th>
                    <th className="px-4 py-2 font-semibold text-slate-600 border-b border-slate-200">Fine-tuning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-700">FP16 / BF16</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatGb(model.vram_needed)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatGb(model.vram_needed ? model.vram_needed * 2.5 : null)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-700">INT8 (8-bit)</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatGb(model.vram_needed ? model.vram_needed / 2 : null)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatGb(model.vram_needed ? model.vram_needed * 1.5 : null)} <span className="text-xs ml-1">(LoRA)</span></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-700">INT4 (GGUF/AWQ)</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatGb(model.vram_needed ? model.vram_needed / 4 : null)}</td>
                    <td className="px-4 py-3 text-slate-400">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={`mt-4 flex items-center gap-3 rounded-xl border p-4 ${model.fits_vram ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
              {model.fits_vram ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              ) : (
                <AlertCircle className="h-6 w-6 text-rose-500" />
              )}
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {model.fits_vram ? "Fits your hardware profile" : "Exceeds VRAM budget"}
                </div>
                <div className="text-xs font-medium text-slate-600">
                  Based on target hardware: {hardwareLabel}
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : null}
    </div>
  );
}
