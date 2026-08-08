"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  METHODS,
  OPTIMIZERS,
  compareMethods,
  estimateFineTuneVram,
} from '../../utils/fineTuneCalculator';
import { CURATED_GPUS, CURATED_MODELS, canIRunGpuPath } from '../../data/canIRunData';

const SEQ_OPTIONS = [512, 1024, 2048, 4096, 8192, 16384];
const RANK_OPTIONS = [8, 16, 32, 64, 128];
const BATCH_OPTIONS = [1, 2, 4, 8, 16];

const STATUS_STYLE = {
  fits: 'bg-green-50 text-green-800 border-green-200',
  tight: 'bg-amber-50 text-amber-800 border-amber-200',
  no: 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_LABEL = {
  fits: 'Fits comfortably',
  tight: 'Tight — may OOM',
  no: 'Does not fit',
};

const ROW_LABELS = {
  weights: 'Base weights',
  gradients: 'Gradients',
  masterWeights: 'fp32 master weights',
  optimizerState: 'Optimizer state',
  activations: 'Activations',
  overhead: 'Runtime overhead',
};

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] leading-5 text-gray-400">{hint}</span> : null}
    </label>
  );
}

const selectClass =
  'mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 focus:border-[#274867] focus:outline-none';

export default function FineTuneCalculatorClient() {
  const [modelId, setModelId] = useState('meta-llama/Llama-3.1-8B-Instruct');
  const [gpuSlug, setGpuSlug] = useState('rtx-4090');
  const [method, setMethod] = useState('qlora');
  const [optimizer, setOptimizer] = useState('adamw');
  const [seqLen, setSeqLen] = useState(2048);
  const [batchSize, setBatchSize] = useState(1);
  const [loraRank, setLoraRank] = useState(16);
  const [loraTargetMlp, setLoraTargetMlp] = useState(false);
  const [gradientCheckpointing, setGradientCheckpointing] = useState(true);

  const model = useMemo(
    () => CURATED_MODELS.find((m) => m.id === modelId) || CURATED_MODELS[0],
    [modelId],
  );
  const gpu = useMemo(
    () => CURATED_GPUS.find((g) => g.slug === gpuSlug) || CURATED_GPUS[0],
    [gpuSlug],
  );

  const opts = useMemo(
    () => ({ method, optimizer, seqLen, batchSize, loraRank, loraTargetMlp, gradientCheckpointing }),
    [method, optimizer, seqLen, batchSize, loraRank, loraTargetMlp, gradientCheckpointing],
  );
  const estimate = useMemo(() => estimateFineTuneVram(model, opts), [model, opts]);
  // compareMethods overrides `method` per card, so the selected method is irrelevant here.
  const comparison = useMemo(() => compareMethods(model, gpu.vram, opts), [model, gpu.vram, opts]);

  const active = comparison.find((c) => c.method === method) || comparison[0];
  const isAdapter = method === 'lora' || method === 'qlora';
  const headroom = Number((gpu.vram - estimate.totalGB).toFixed(1));
  const cheapestFitting = comparison.find((c) => c.status !== 'no');

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Model">
            <select value={modelId} onChange={(e) => setModelId(e.target.value)} className={selectClass}>
              {CURATED_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} ({m.paramsB}B)
                </option>
              ))}
            </select>
          </Field>

          <Field label="GPU">
            <select value={gpuSlug} onChange={(e) => setGpuSlug(e.target.value)} className={selectClass}>
              {CURATED_GPUS.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.name} · {g.vram} GB
                </option>
              ))}
            </select>
          </Field>

          <Field label="Method">
            <select value={method} onChange={(e) => setMethod(e.target.value)} className={selectClass}>
              {METHODS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Sequence length" hint="Attention cost grows quadratically with this.">
            <select value={seqLen} onChange={(e) => setSeqLen(Number(e.target.value))} className={selectClass}>
              {SEQ_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.toLocaleString()} tokens
                </option>
              ))}
            </select>
          </Field>

          <Field label="Batch size" hint="Per device. Use gradient accumulation for a larger effective batch.">
            <select value={batchSize} onChange={(e) => setBatchSize(Number(e.target.value))} className={selectClass}>
              {BATCH_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Optimizer">
            <select value={optimizer} onChange={(e) => setOptimizer(e.target.value)} className={selectClass}>
              {OPTIMIZERS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          {isAdapter ? (
            <Field label="LoRA rank" hint="Higher rank means more capacity and more trainable parameters.">
              <select value={loraRank} onChange={(e) => setLoraRank(Number(e.target.value))} className={selectClass}>
                {RANK_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    r = {r}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}

          <div className="flex flex-col justify-end gap-3">
            {isAdapter ? (
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={loraTargetMlp}
                  onChange={(e) => setLoraTargetMlp(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Also adapt MLP layers
              </label>
            ) : null}
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={gradientCheckpointing}
                onChange={(e) => setGradientCheckpointing(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Gradient checkpointing
            </label>
          </div>
        </div>
      </section>

      {/* Verdict */}
      <section className={`rounded-2xl border p-6 shadow-sm md:p-8 ${STATUS_STYLE[active.status] || 'border-gray-200 bg-white'}`}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">
          {METHODS.find((m) => m.key === method)?.label} · {model.label} · {gpu.name}
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
          {estimate.totalGB} GB needed · {gpu.vram} GB available
        </h2>
        <p className="mt-3 text-sm font-bold uppercase tracking-[0.12em]">{STATUS_LABEL[active.status]}</p>
        <p className="mt-4 max-w-3xl text-sm leading-7 opacity-90">
          {active.status === 'no' ? (
            <>
              This configuration needs about {estimate.totalGB} GB, which is {Math.abs(headroom).toFixed(1)} GB more
              than the {gpu.name} has. You would need roughly {active.gpusNeeded} of these cards, a larger GPU, or a
              cheaper method
              {cheapestFitting && cheapestFitting.method !== method
                ? ` — ${cheapestFitting.label} fits at ${cheapestFitting.totalGB} GB.`
                : '.'}
            </>
          ) : (
            <>
              This leaves about {headroom} GB spare on the {gpu.name}.{' '}
              {active.status === 'tight'
                ? 'That is under 10% headroom, so expect out-of-memory errors once sequence length or batch size moves.'
                : 'Enough margin to raise batch size or sequence length somewhat before running out.'}
            </>
          )}
        </p>
        {isAdapter ? (
          <p className="mt-3 text-xs opacity-75">
            Training {estimate.trainableParams.toLocaleString()} adapter parameters — {estimate.trainablePercent}% of
            the model.
          </p>
        ) : null}
      </section>

      {/* Breakdown */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-black tracking-tight text-gray-900">Where the memory goes</h2>
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-[0.1em] text-gray-500">
              <tr>
                <th className="px-4 py-3">Component</th>
                <th className="px-4 py-3 whitespace-nowrap">Size</th>
                <th className="px-4 py-3 whitespace-nowrap">Share</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(estimate.breakdown).map(([key, value]) => {
                const pct = estimate.totalGB > 0 ? Math.round((value / estimate.totalGB) * 100) : 0;
                return (
                  <tr key={key} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-semibold text-gray-900">{ROW_LABELS[key]}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{value} GB</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                          <span className="block h-full rounded-full bg-[#274867]" style={{ width: `${pct}%` }} />
                        </span>
                        <span className="text-xs text-gray-500">{pct}%</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="px-4 py-3 font-black text-gray-900">Total</td>
                <td className="px-4 py-3 whitespace-nowrap font-black text-gray-900">{estimate.totalGB} GB</td>
                <td className="px-4 py-3" />
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Method comparison */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-black tracking-tight text-gray-900">All three methods on the {gpu.name}</h2>
        <p className="mt-2 text-sm leading-7 text-gray-600">
          Same model, same sequence length and batch size — only the training method changes.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {comparison.map((c) => (
            <div
              key={c.method}
              className={`rounded-xl border p-5 ${
                c.method === method ? 'border-[#274867] ring-1 ring-[#274867]' : 'border-gray-200'
              }`}
            >
              <p className="text-sm font-black text-gray-900">{c.label}</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-gray-900">{c.totalGB} GB</p>
              <p
                className={`mt-2 text-xs font-bold uppercase tracking-[0.1em] ${
                  c.status === 'fits' ? 'text-green-700' : c.status === 'tight' ? 'text-amber-700' : 'text-red-600'
                }`}
              >
                {c.status === 'no' ? `Needs ${c.gpusNeeded}x cards` : STATUS_LABEL[c.status]}
              </p>
              <p className="mt-3 text-xs leading-6 text-gray-500">{c.blurb}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm leading-7 text-gray-600">
          Not sure the model even fits for inference?{' '}
          <Link href={canIRunGpuPath(gpu.slug)} className="font-semibold text-[#23425f] hover:text-[#18324f]">
            See what the {gpu.name} runs
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
