import Link from 'next/link';
import { canIRunPath } from '../../data/canIRunData';
import { modelPath } from '../../lib/modelIndexing';

const VERDICT = {
  'yes-full': {
    badge: 'Yes — runs in full precision',
    tone: 'bg-green-50 text-green-800 border-green-200',
    dot: 'bg-green-500',
  },
  'yes-quantized': {
    badge: 'Yes — with quantization',
    tone: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  no: {
    badge: 'Not on a single card',
    tone: 'bg-red-50 text-red-800 border-red-200',
    dot: 'bg-red-500',
  },
};

const STATUS_PILL = {
  fits: 'bg-green-100 text-green-800',
  tight: 'bg-amber-100 text-amber-800',
  no: 'bg-red-100 text-red-700',
};

const STATUS_LABEL = { fits: 'Fits', tight: 'Tight', no: 'No' };

function buildAnswer(model, gpu, result) {
  const best = result.rows.find((r) => r.precision === result.bestPrecision);
  if (result.headline === 'yes-full') {
    return `Yes. ${model.label} fits on the ${gpu.name} (${gpu.vram} GB) in full FP16/BF16 precision, using about ${result.rows[0].totalGB} GB including a ${result.kvGB} GB KV cache at ${result.context.toLocaleString()} tokens. You have comfortable headroom for longer prompts and modest batching.`;
  }
  if (result.headline === 'yes-quantized') {
    return `Yes, with quantization. ${model.label} does not fit the ${gpu.name} (${gpu.vram} GB) in FP16, but it runs at ${best.label} using about ${best.totalGB} GB (${best.utilization}% of VRAM). Use a GPTQ, AWQ, or GGUF build to get there, and keep prompts moderate to leave room for the KV cache.`;
  }
  return `Not on a single ${gpu.name}. Even at 4-bit, ${model.label} needs about ${result.rows[result.rows.length - 1].totalGB} GB, which exceeds the card's ${gpu.vram} GB. You would need roughly ${result.gpusNeeded}× ${gpu.name} with tensor parallelism, a larger GPU, or a smaller model.`;
}

export default function CanIRunResult({ model, gpu, result, altGpus, altModels }) {
  const verdict = VERDICT[result.headline];

  return (
    <>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Compatibility check</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
          Can you run {model.label} on the {gpu.name}?
        </h1>

        <div className={`mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${verdict.tone}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${verdict.dot}`} />
          {verdict.badge}
        </div>

        <p className="mt-5 max-w-3xl text-sm leading-7 text-gray-700">{buildAnswer(model, gpu, result)}</p>
      </section>

      {/* Breakdown table */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-black tracking-tight text-gray-900">Memory breakdown</h2>
        <p className="mt-2 text-sm leading-7 text-gray-600">
          Weights plus a {result.kvGB} GB KV cache at {result.context.toLocaleString()} tokens, against the
          card&apos;s {gpu.vram} GB. Verdicts leave ~10% headroom for activations and fragmentation.
        </p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-[0.1em] text-gray-500">
              <tr>
                <th className="px-4 py-3">Precision</th>
                <th className="px-4 py-3">Weights</th>
                <th className="px-4 py-3">KV cache</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">% of {gpu.vram} GB</th>
                <th className="px-4 py-3">Fit</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row) => (
                <tr key={row.precision} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-900">{row.label}</span>
                    <span className="ml-2 text-xs text-gray-400">{row.note}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{row.weightGB} GB</td>
                  <td className="px-4 py-3 text-gray-700">{row.kvGB} GB</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{row.totalGB} GB</td>
                  <td className="px-4 py-3 text-gray-700">{row.utilization}%</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_PILL[row.status]}`}>
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-6 text-gray-500">
          Planning estimates, not a substitute for profiling. Real usage varies with the inference runtime,
          batch size, and how much context you actually use — the KV cache grows linearly with prompt length.
        </p>
      </section>

      {/* Cross-links: other GPUs / smaller models */}
      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black tracking-tight text-gray-900">GPUs that run {model.label}</h2>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            Cards where this model fits (at its best precision):
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {altGpus.length > 0 ? (
              altGpus.map((g) => (
                <Link key={g.slug} href={canIRunPath(g.slug, model.id)} className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-[#23425f] hover:bg-gray-200">
                  {g.name}
                </Link>
              ))
            ) : (
              <span className="text-sm text-gray-500">Needs a multi-GPU server.</span>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black tracking-tight text-gray-900">Models that fit the {gpu.name}</h2>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            Other popular models that run on this card:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {altModels.map((m) => (
              <Link key={m.id} href={canIRunPath(gpu.slug, m.id)} className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-[#23425f] hover:bg-gray-200">
                {m.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Deeper tools */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-black tracking-tight text-gray-900">Go deeper</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li><Link href="/gpu/tools/vram-calculator" className="font-semibold text-[#23425f] hover:text-[#18324f]">Try other context lengths in the VRAM Calculator →</Link></li>
          <li><Link href="/gpu/tools/gpu-picker" className="font-semibold text-[#23425f] hover:text-[#18324f]">Find the cheapest GPU that fits →</Link></li>
          <li><Link href={modelPath(model.id)} className="font-semibold text-[#23425f] hover:text-[#18324f]">{model.label} full model guide →</Link></li>
          <li><Link href="/guides/quantization-4bit-8bit-fp16" className="font-semibold text-[#23425f] hover:text-[#18324f]">Quantization: 4-bit vs 8-bit vs FP16 →</Link></li>
        </ul>
      </section>
    </>
  );
}
