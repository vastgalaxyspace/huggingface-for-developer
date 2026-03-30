"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";

function formatDate(dateString) {
  if (!dateString) return "Unknown";
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

export default function ModelDetailsExpand({ model, hardwareLabel }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-gray-200 pt-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900"
      >
        View Details
        {open ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
      </button>

      {open ? (
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <div className="space-y-2 text-sm text-gray-600">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Full Model ID
              </div>
              <div className="mt-1 break-all rounded-xl bg-gray-50 px-3 py-2 text-gray-800">
                {model.modelId}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Architecture
              </div>
              <div className="mt-1">{model.config?.architectures?.join(", ") || "Unknown"}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Context Length
              </div>
              <div className="mt-1">
                {model.config?.max_position_embeddings?.toLocaleString() || "Unknown"}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Last Updated
              </div>
              <div className="mt-1">{formatDate(model.lastModified)}</div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
              VRAM Breakdown
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <div>Inference fp16: {formatGb(model.vram_needed)}</div>
              <div>Inference int8: {formatGb(model.vram_needed ? model.vram_needed / 2 : null)}</div>
              <div>Inference int4: {formatGb(model.vram_needed ? model.vram_needed / 4 : null)}</div>
              <div>Fine-tuning (LoRA): {formatGb(model.vram_needed ? model.vram_needed * 1.35 : null)}</div>
              <div className="mt-3 inline-flex items-center font-semibold text-gray-800">
                Fits on your {hardwareLabel}:
                {model.fits_vram ? (
                  <Check className="ml-2 h-4 w-4 text-emerald-600" />
                ) : (
                  <X className="ml-2 h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href={`https://huggingface.co/${model.modelId}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Open Model Page
              </a>
              <a
                href={`https://huggingface.co/${model.modelId}#model-card`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                View Model Card
              </a>
              <a
                href={`https://huggingface.co/spaces?search=${encodeURIComponent(model.modelId)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Try in Spaces
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
