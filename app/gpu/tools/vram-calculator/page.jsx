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
      <div className="shell-container">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <Link href="/gpu" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#274867]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to GPU
          </Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-gray-400">Precision Tool</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">VRAM Calculator</h1>
          <p className="mt-4 max-w-[760px] text-sm leading-7 text-gray-600">
            Estimate memory footprint by model size, precision, sequence length, and batch configuration.
          </p>
        </section>
        <VramCalculatorClient />
      </div>
    </div>
  );
}
