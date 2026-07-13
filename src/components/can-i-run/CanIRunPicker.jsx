"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { CURATED_GPUS, CURATED_MODELS, canIRunPath } from '../../data/canIRunData';

export default function CanIRunPicker() {
  const router = useRouter();
  const [modelId, setModelId] = useState(CURATED_MODELS[1].id);
  const [gpuSlug, setGpuSlug] = useState(CURATED_GPUS[0].slug);

  const go = () => router.push(canIRunPath(gpuSlug, modelId));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Model</span>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 focus:border-[#274867] focus:outline-none"
          >
            {CURATED_MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">GPU</span>
          <select
            value={gpuSlug}
            onChange={(e) => setGpuSlug(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 focus:border-[#274867] focus:outline-none"
          >
            {CURATED_GPUS.map((g) => (
              <option key={g.slug} value={g.slug}>{g.name} · {g.vram} GB</option>
            ))}
          </select>
        </label>

        <button
          onClick={go}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#274867] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#18324f]"
        >
          Check <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
