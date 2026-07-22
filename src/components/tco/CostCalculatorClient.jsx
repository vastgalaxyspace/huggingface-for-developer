"use client";

import { useMemo, useState } from 'react';
import TCOSection from '../model/TCOSection';
import { calculateTCO } from '../../utils/tcoCalculator';
import { calculateVRAM } from '../../utils/vramCalculator';
import { CURATED_MODELS } from '../../data/canIRunData';

// Largest first so the picker opens on the models people are actually sizing budgets for.
const MODELS = [...CURATED_MODELS].sort((a, b) => b.paramsB - a.paramsB);

const TOKEN_PRESETS = [
  { label: '1M / month (hobby)', value: 1_000_000 },
  { label: '10M / month (small product)', value: 10_000_000 },
  { label: '100M / month (scaling)', value: 100_000_000 },
  { label: '1B / month (high volume)', value: 1_000_000_000 },
];

// calculateTCO only reads vramEstimates.fp16, so derive it from the curated spec the
// same way the can-i-run pages do — keeping every cost figure consistent with the
// VRAM verdicts shown elsewhere on the site.
function toModelData(model) {
  const vramEstimates = calculateVRAM(
    {
      num_hidden_layers: model.layers,
      num_attention_heads: model.heads,
      num_key_value_heads: model.kvHeads,
      head_dim: model.headDim,
      hidden_size: model.hiddenSize,
      max_position_embeddings: model.context,
    },
    { safetensorsTotal: model.paramsB * 1e9 },
  );
  return { vramEstimates };
}

export default function CostCalculatorClient() {
  const [modelId, setModelId] = useState(MODELS[0].id);
  const [tokensPerMonth, setTokensPerMonth] = useState(10_000_000);
  const [hoursPerDay, setHoursPerDay] = useState(24);
  const [monthlyActiveUsers, setMonthlyActiveUsers] = useState(10_000);

  const model = useMemo(() => MODELS.find((m) => m.id === modelId) || MODELS[0], [modelId]);

  const { tco, fp16 } = useMemo(() => {
    const modelData = toModelData(model);
    return {
      fp16: modelData.vramEstimates.fp16,
      tco: calculateTCO(modelData, {
        tokensPerMonth,
        hoursPerDay,
        daysPerMonth: 30,
        monthlyActiveUsers,
      }),
    };
  }, [model, tokensPerMonth, hoursPerDay, monthlyActiveUsers]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-black tracking-tight text-gray-900">Your deployment profile</h2>
        <p className="mt-2 text-sm leading-7 text-gray-600">
          Pick the model you plan to serve and the traffic you expect. Hardware cost is driven by the model&apos;s
          memory footprint; API cost is driven by token volume.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="tco-model" className="block text-sm font-semibold text-gray-800">
              Model
            </label>
            <select
              id="tco-model"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#23425f] focus:outline-none"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} ({m.paramsB}B)
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              Needs about <span className="font-semibold text-gray-700">{fp16} GB</span> in FP16 — this sets which
              GPU tier you are paying for.
            </p>
          </div>

          <div>
            <label htmlFor="tco-tokens" className="block text-sm font-semibold text-gray-800">
              Monthly token volume
            </label>
            <select
              id="tco-tokens"
              value={tokensPerMonth}
              onChange={(e) => setTokensPerMonth(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#23425f] focus:outline-none"
            >
              {TOKEN_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              Input plus output tokens across all requests in a month.
            </p>
          </div>

          <div>
            <label htmlFor="tco-hours" className="block text-sm font-semibold text-gray-800">
              GPU hours per day: <span className="font-black">{hoursPerDay}h</span>
            </label>
            <input
              id="tco-hours"
              type="range"
              min="1"
              max="24"
              step="1"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="mt-3 w-full"
            />
            <p className="mt-2 text-xs text-gray-500">
              Self-hosted and cloud GPUs bill whether or not they are busy. Fewer hours favors an API.
            </p>
          </div>

          <div>
            <label htmlFor="tco-mau" className="block text-sm font-semibold text-gray-800">
              Monthly active users: <span className="font-black">{monthlyActiveUsers.toLocaleString()}</span>
            </label>
            <input
              id="tco-mau"
              type="range"
              min="1000"
              max="1000000"
              step="1000"
              value={monthlyActiveUsers}
              onChange={(e) => setMonthlyActiveUsers(Number(e.target.value))}
              className="mt-3 w-full"
            />
            <p className="mt-2 text-xs text-gray-500">Used to flag license thresholds that apply at scale.</p>
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <TCOSection tco={tco} />
      </div>
    </div>
  );
}
