import { evaluateAcrossGpus } from '../../utils/canIRunEngine';
import { CURATED_GPUS } from '../../data/canIRunData';

const HEADLINE = {
  'yes-full': { label: 'FP16', cls: 'bg-green-100 text-green-800', text: 'Runs at full precision' },
  'yes-quantized': { label: 'Quantized', cls: 'bg-amber-100 text-amber-800', text: 'Fits with 8-bit or 4-bit' },
  no: { label: 'No', cls: 'bg-red-100 text-red-700', text: 'Needs a larger or additional GPU' },
};

const PRECISION_LABEL = { fp16: 'FP16', int8: 'INT8', int4: '4-bit' };

// Computes, per model, which popular GPUs can run it — genuine per-model value derived
// from the model's real VRAM estimates and architecture-aware KV cache.
export default function ModelGpuCompatibility({ modelData }) {
  const vramEstimates = modelData?.vramEstimates;
  const config = modelData?.config;
  if (!vramEstimates || !vramEstimates.fp16) return null;

  const results = evaluateAcrossGpus({ vramEstimates, config }, CURATED_GPUS);
  if (results.length === 0) return null;

  const kvGB = results[0].kvGB;

  return (
    <section className="mb-8 rounded-[28px] border border-[var(--border-soft)] bg-white px-6 py-8 shadow-[0_18px_48px_rgba(48,67,95,0.08)] sm:px-10">
      <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)] sm:text-3xl">
        Which GPUs can run this model?
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
        Fit across common consumer, workstation, and data-center GPUs, based on this model&apos;s weight memory plus a{' '}
        {kvGB} GB KV cache at 4,096 tokens. &quot;Quantized&quot; means it does not fit in FP16 but runs at 8-bit or
        4-bit; verdicts leave ~10% headroom for activations.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--border-soft)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--panel-muted)] text-xs uppercase tracking-[0.12em] text-[var(--text-faint)]">
            <tr>
              <th className="px-4 py-3">GPU</th>
              <th className="px-4 py-3">VRAM</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Best precision</th>
              <th className="px-4 py-3">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {results.map(({ gpu, headline, bestPrecision }) => {
              const mark = HEADLINE[headline];
              return (
                <tr key={gpu.slug} className="border-t border-[var(--border-soft)]">
                  <td className="px-4 py-3 font-semibold text-[var(--text-strong)] whitespace-nowrap">{gpu.name}</td>
                  <td className="px-4 py-3 text-[var(--text-main)]">{gpu.vram} GB</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{gpu.tier}</td>
                  <td className="px-4 py-3 text-[var(--text-main)]">
                    {bestPrecision ? PRECISION_LABEL[bestPrecision] : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold ${mark.cls}`}>
                      {mark.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-6 text-[var(--text-faint)]">
        Planning estimates — real usage depends on the inference runtime, batch size, and context length. The KV
        cache grows linearly with prompt length, so long-context serving needs more headroom than shown here.
      </p>
    </section>
  );
}
