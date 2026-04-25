"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search, TrendingUp } from "lucide-react";
import { searchModels } from "../../services/huggingface";

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

function formatNumber(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return "0";
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1)}M`;
  if (number >= 1_000) return `${(number / 1_000).toFixed(1)}K`;
  return String(number);
}

export default function ModelSearchBar({ value, onChange, onSubmit, loading, error }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchModels(query, 8);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    const handleClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectModel = (modelId) => {
    onChange(modelId);
    setShowSuggestions(false);
    onSubmit(modelId);
  };

  return (
    <div ref={containerRef} className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 ease-in-out">
      <label className="text-xs font-bold uppercase tracking-widest text-emerald-800">HUGGINGFACE MODEL</label>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            disabled={loading}
            placeholder="Type a model name, e.g. llama, qwen, mistral"
            className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-sm text-gray-700 outline-none transition ${
              error ? "border-red-400" : "border-gray-200 focus:border-emerald-400"
            } ${loading ? "cursor-not-allowed bg-gray-50" : ""}`}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSubmit(value);
            }}
          />
          {showSuggestions ? (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
              <div className="border-b border-gray-100 px-4 py-2 text-xs font-semibold text-gray-500">
                {searching ? "Searching..." : "Select a Hugging Face model"}
              </div>
              <div className="max-h-80 overflow-auto">
                {suggestions.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => selectModel(model.id)}
                    className="flex w-full items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 text-left last:border-b-0 hover:bg-emerald-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-gray-900">{model.id}</span>
                      <span className="mt-1 block truncate text-xs text-gray-500">{model.pipeline_tag || "model"}</span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-gray-500">
                      <TrendingUp className="h-3 w-3" />
                      {formatNumber(model.downloads)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
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
              selectModel(modelId);
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
