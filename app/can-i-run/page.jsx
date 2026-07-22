import Link from 'next/link';
import CanIRunPicker from '../../src/components/can-i-run/CanIRunPicker';
import { evaluateModelOnGpu } from '../../src/utils/canIRunEngine';
import { CURATED_GPUS, CURATED_MODELS, canIRunGpuPath, canIRunPath } from '../../src/data/canIRunData';
import { pageMetadata } from '../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'Can I Run This AI Model on My GPU?',
  description:
    'Check whether a Hugging Face model fits on your GPU across FP16, INT8, and 4-bit precision, including the KV cache. Instant answers for popular models and cards.',
  path: '/can-i-run',
  keywords: ['can I run LLM on GPU', 'model GPU compatibility', 'LLM VRAM requirements', 'GPU model fit'],
});

const VERDICT_MARK = {
  'yes-full': { label: 'FP16', cls: 'bg-green-100 text-green-800' },
  'yes-quantized': { label: '4/8-bit', cls: 'bg-amber-100 text-amber-800' },
  no: { label: 'No', cls: 'bg-red-100 text-red-700' },
};

export default function CanIRunIndexPage() {
  // Small popular subset for the quick-answer matrix.
  const matrixGpus = CURATED_GPUS.filter((g) =>
    ['rtx-3060', 'rtx-4090', 'rtx-a6000', 'a100-80gb'].includes(g.slug),
  );

  return (
    <div className="bg-gray-100 py-8 md:py-12">
      <div className="shell-container space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Compatibility checker</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
            Can I run this AI model on my GPU?
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
            Pick a model and a GPU to get an instant, architecture-aware answer: whether it fits in full FP16,
            needs 8-bit or 4-bit quantization, or requires more than one card. Every estimate accounts for model
            weights plus the KV cache — the memory term most calculators ignore.
          </p>
          <div className="mt-6">
            <CanIRunPicker />
          </div>
        </section>

        {/* Quick-answer matrix */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black tracking-tight text-gray-900">Popular models at a glance</h2>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            Best precision each model fits at on common GPUs. Tap any cell for the full breakdown.
          </p>
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-[0.1em] text-gray-500">
                <tr>
                  <th className="px-4 py-3">Model</th>
                  {matrixGpus.map((g) => (
                    <th key={g.slug} className="px-4 py-3 whitespace-nowrap">{g.name}<span className="block text-[10px] font-normal text-gray-400">{g.vram} GB</span></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CURATED_MODELS.map((m) => (
                  <tr key={m.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{m.label}</td>
                    {matrixGpus.map((g) => {
                      const r = evaluateModelOnGpu(m, g.vram);
                      const mark = VERDICT_MARK[r.headline];
                      return (
                        <td key={g.slug} className="px-4 py-3">
                          <Link href={canIRunPath(g.slug, m.id)} className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${mark.cls} hover:opacity-80`}>
                            {mark.label}
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-6 text-gray-500">
            <span className="font-semibold text-green-700">FP16</span> = runs at full precision ·{' '}
            <span className="font-semibold text-amber-700">4/8-bit</span> = fits with quantization ·{' '}
            <span className="font-semibold text-red-600">No</span> = needs a bigger or additional GPU.
          </p>
        </section>

        {/* Per-GPU hubs. Also the crawl path into every model × GPU combo. */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black tracking-tight text-gray-900">Browse by GPU</h2>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            Pick your card to see every model it runs, and the precision each one needs.
          </p>
          {['Consumer', 'Workstation', 'Data center'].map((tier) => {
            const tierGpus = CURATED_GPUS.filter((g) => g.tier === tier);
            if (tierGpus.length === 0) return null;
            return (
              <div key={tier} className="mt-5">
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">{tier}</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {tierGpus.map((g) => (
                    <Link
                      key={g.slug}
                      href={canIRunGpuPath(g.slug)}
                      className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-[#23425f] hover:bg-[#f7faff]"
                    >
                      What runs on {g.name}
                      <span className="block text-xs font-normal text-gray-400">{g.vram} GB VRAM</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* Explainer for content depth + SEO */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black tracking-tight text-gray-900">How we decide if a model fits</h2>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            Whether a model runs on a GPU comes down to three memory costs measured against the card&apos;s VRAM. First,
            the model weights: parameter count times bytes per parameter — 2 bytes in FP16, 1 in INT8, and about 0.5
            in 4-bit. Second, the KV cache, which stores attention keys and values for every token in the context
            window and grows linearly with prompt length; it stays in FP16 even when the weights are quantized.
            Third, a runtime allowance for activations, CUDA context, and memory fragmentation. We add these up at a
            realistic context length and compare against the GPU, leaving roughly 10% headroom before calling a fit
            comfortable.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            The practical upshot for buyers and builders: quantization is the lever that turns a &quot;no&quot; into a
            &quot;yes&quot; on consumer cards, but it has limits — a 70B model still needs an 80 GB card even at 4-bit,
            while an 8B model runs comfortably on a 12 GB card once quantized. For exact numbers at your own context
            length and batch size, use the{' '}
            <Link href="/gpu/tools/vram-calculator" className="font-semibold text-[#23425f] hover:text-[#18324f]">VRAM Calculator</Link>, and to find the cheapest card that fits a given model, use the{' '}
            <Link href="/gpu/tools/gpu-picker" className="font-semibold text-[#23425f] hover:text-[#18324f]">GPU Picker</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
