import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import VramCalculatorClient from '../../../../src/components/vram/VramCalculatorClient';
import { pageMetadata } from '../../../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'VRAM Calculator',
  description:
    'Estimate GPU memory needs from model size, precision, sequence length, and batch configuration before deployment.',
  path: '/gpu/tools/vram-calculator',
  keywords: ['VRAM calculator', 'GPU memory estimator', 'LLM memory requirements'],
});

export default function VramCalculatorPage() {
  return (
    <div className="min-h-[calc(100vh-78px)] bg-gray-100 py-8 md:py-12">
      <div className="shell-container space-y-6">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <Link href="/gpu" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#274867]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to GPU
          </Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-gray-400">Precision Tool</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">VRAM Calculator</h1>
          <p className="mt-4 max-w-[760px] text-sm leading-7 text-gray-600">
            Estimate memory footprint by model size, precision, sequence length, and batch configuration before you
            commit to a deployment or local setup.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-gray-500">
            <span>Weights + KV cache + overhead</span>
            <span>Useful for local inference and server planning</span>
            <span>Best used before renting GPUs or scaling prompts</span>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">How to use this calculator</h2>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-gray-600">
              <li>1. Search for the model you actually plan to run, not a nearby family member.</li>
              <li>2. Test multiple precisions because FP16, INT8, and INT4 can change feasibility completely.</li>
              <li>3. Increase sequence length and batch size to reflect real usage, not just demo prompts.</li>
              <li>4. Leave headroom for runtime overhead instead of targeting a perfect 100% GPU fill.</li>
            </ol>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-slate-50 p-6">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">What teams often miss</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-gray-600">
              <p>
                Weight size alone is not the whole story. Longer context windows, KV cache growth, framework overhead,
                and concurrency can turn a model that “fits” on paper into one that fails in real usage.
              </p>
              <p>
                If you need a hardware recommendation after this estimate, continue to the{' '}
                <Link href="/gpu/tools/gpu-picker" className="font-semibold text-[#274867] hover:text-[#18324f]">
                  GPU picker
                </Link>.
              </p>
            </div>
          </article>
        </section>

        <VramCalculatorClient />

        <section className="grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black tracking-tight text-gray-900">Best next check</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              Compare the winning estimate against real GPU options so you can see whether the fit is consumer,
              workstation, or server-class.
            </p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black tracking-tight text-gray-900">Use this before buying</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              This tool is most valuable before hardware purchase, cloud reservation, or self-hosting commitments. It
              helps avoid choosing a model that quietly exceeds your real memory budget.
            </p>
          </article>
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black tracking-tight text-gray-900">Related guide</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              For deeper deployment context, read{' '}
              <Link href="/guides/best-models-low-vram" className="font-semibold text-[#274867] hover:text-[#18324f]">
                Best Models for Low VRAM
              </Link>{' '}
              and{' '}
              <Link href="/guides/quantization-4bit-8bit-fp16" className="font-semibold text-[#274867] hover:text-[#18324f]">
                Precision Strategy
              </Link>.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
