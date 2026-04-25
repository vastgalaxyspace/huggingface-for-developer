"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search, TrendingUp } from "lucide-react";
import { searchModels } from "../../services/huggingface";
import { POPULAR_MODELS, cn } from "./utils";

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
    <section ref={containerRef} className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Precision Tool</p>
      <div className="mt-4 flex flex-col gap-4">
        <label className="text-sm font-medium text-gray-900" htmlFor="model-id-input">
          Hugging Face Model ID
        </label>
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="model-id-input"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onSubmit(value);
              }}
              disabled={loading}
              placeholder="Type a model name, e.g. llama, qwen, mistral"
              className={cn(
                "w-full rounded-lg border py-2 pl-10 pr-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50",
                error ? "border-red-300" : "border-gray-200"
              )}
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
                      className="flex w-full items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50"
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
            onClick={() => onSubmit(value)}
            disabled={loading || !value.trim()}
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
              onClick={() => selectModel(model)}
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
