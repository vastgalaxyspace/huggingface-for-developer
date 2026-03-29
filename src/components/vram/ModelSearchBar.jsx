"use client";

import { Loader2 } from "lucide-react";
import { POPULAR_MODELS, cn } from "./utils";

export default function ModelSearchBar({ value, onChange, onSubmit, loading, error }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Precision Tool</p>
      <div className="mt-4 flex flex-col gap-4">
        <label className="text-sm font-medium text-gray-900" htmlFor="model-id-input">
          HuggingFace Model ID
        </label>
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            id="model-id-input"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={loading}
            placeholder="e.g. meta-llama/Meta-Llama-3-8B"
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50",
              error ? "border-red-300" : "border-gray-200"
            )}
          />
          <button
            type="button"
            onClick={() => onSubmit(value)}
            disabled={loading}
            className="inline-flex min-w-[132px] items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Loading..." : "Calculate"}
          </button>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          {POPULAR_MODELS.map((model) => (
            <button
              key={model}
              type="button"
              disabled={loading}
              onClick={() => {
                onChange(model);
                onSubmit(model);
              }}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-100"
            >
              {model}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

