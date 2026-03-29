"use client";

import { Loader2 } from "lucide-react";

const QUICK_MODELS = [
  ["LLaMA 3 8B", "meta-llama/Meta-Llama-3-8B"],
  ["Mistral 7B", "mistralai/Mistral-7B-v0.1"],
  ["Qwen2 72B", "Qwen/Qwen2-72B-Instruct"],
  ["Mixtral 8x7B", "mistralai/Mixtral-8x7B-v0.1"],
  ["Gemma 2 27B", "google/gemma-2-27b"],
  ["Phi-3 Mini", "microsoft/Phi-3-mini-4k-instruct"],
  ["FLUX.1", "black-forest-labs/FLUX.1-dev"],
  ["Whisper Large", "openai/whisper-large-v3"],
  ["LLaMA 3 70B", "meta-llama/Meta-Llama-3-70B"],
];

export default function ModelSearchBar({ value, onChange, onSubmit, loading, error }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 ease-in-out">
      <label className="text-xs font-bold uppercase tracking-widest text-emerald-800">HUGGINGFACE MODEL</label>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={loading}
          placeholder="e.g. meta-llama/Meta-Llama-3-8B"
          className={`flex-1 rounded-lg border bg-white px-4 py-3 text-sm text-gray-700 outline-none transition ${
            error ? "border-red-400" : "border-gray-200 focus:border-emerald-400"
          } ${loading ? "cursor-not-allowed bg-gray-50" : ""}`}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSubmit();
          }}
        />
        <button
          type="button"
          disabled={loading || !value.trim()}
          onClick={() => onSubmit(value)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold uppercase tracking-widest text-white disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          GO
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {QUICK_MODELS.map(([label, modelId]) => (
          <button
            key={modelId}
            type="button"
            onClick={() => {
              onChange(modelId);
              onSubmit(modelId);
            }}
            className="shrink-0 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
