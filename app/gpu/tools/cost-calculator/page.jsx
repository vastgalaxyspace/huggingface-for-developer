import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CostCalculatorClient from '../../../../src/components/tco/CostCalculatorClient';
import { pageMetadata } from '../../../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'LLM Inference Cost Calculator: API vs Cloud GPU vs Self-Hosted',
  description:
    'Estimate what it costs to run an open LLM. Compare managed API pricing against renting a cloud GPU and self-hosting your own hardware, including break-even points.',
  path: '/gpu/tools/cost-calculator',
  keywords: [
    'LLM cost calculator',
    'AI inference cost',
    'self-hosting vs API cost',
    'cloud GPU cost per month',
    'LLM total cost of ownership',
  ],
});

const faq = [
  {
    q: 'Is self-hosting an LLM cheaper than using an API?',
    a: 'Only above a break-even token volume. API cost scales linearly with usage and carries no infrastructure work, while self-hosting is mostly a fixed cost you pay whether the GPU is busy or idle. Below the break-even point, and for spiky traffic, a managed API is usually cheaper once engineering time is counted.',
  },
  {
    q: 'Why is the GPU not the biggest line item in self-hosting?',
    a: 'Because people are. A GPU is a one-off purchase amortized over about three years, but on-call, upgrades, and MLOps time recur every month. In this model, partial engineering headcount typically outweighs the hardware within the first year.',
  },
  {
    q: 'How accurate are these numbers?',
    a: 'They are planning estimates, not quotes. Per-token pricing varies widely by model size and by your input/output ratio, and cloud GPU rates differ several-fold between hyperscalers and specialist providers. Use the shape of the comparison and the break-even point, then confirm against current provider pricing before committing budget.',
  },
  {
    q: 'What drives the hardware tier I need?',
    a: "The model's memory footprint. Weights in FP16 are roughly two bytes per parameter, plus the KV cache that grows with context length. Quantizing to 8-bit or 4-bit can drop you to a cheaper GPU tier, which is often the single largest cost lever available.",
  },
];

export default function CostCalculatorPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <div className="bg-gray-100 py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="shell-container space-y-6">
        <Link
          href="/gpu"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#274867]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to GPU
        </Link>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Cost tool</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
            LLM inference cost calculator
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
            Three ways to serve an open model — a managed API, a rented cloud GPU, or your own hardware — priced side
            by side over three years. The comparison includes the costs teams usually forget: setup, maintenance,
            power, and the engineering time to keep it running.
          </p>
        </section>

        <CostCalculatorClient />

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black tracking-tight text-gray-900">How to read this comparison</h2>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            The three options fail in different directions. A managed API costs nothing when idle and everything at
            scale, because you pay per token forever. A cloud GPU flips that: the meter runs on time, not tokens, so
            it rewards steady utilization and punishes bursty traffic — an instance at 5% utilization still bills for
            100% of the hour. Self-hosting has the lowest marginal cost per token but the highest fixed cost and the
            longest payback, and it only wins when volume is both high and predictable.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            The break-even figures are the part worth acting on. If your volume sits far below the crossover point,
            the decision is already made — use an API and spend the engineering time elsewhere. If you are near it,
            remember that the estimate assumes your GPU stays busy; halve the utilization and the crossover moves
            substantially. Before committing, confirm the memory footprint of your exact model and context length in
            the{' '}
            <Link href="/gpu/tools/vram-calculator" className="font-semibold text-[#23425f] hover:text-[#18324f]">
              VRAM Calculator
            </Link>
            , check which card actually fits with{' '}
            <Link href="/can-i-run" className="font-semibold text-[#23425f] hover:text-[#18324f]">
              Can I Run It
            </Link>
            , and read{' '}
            <Link href="/guides/open-vs-closed-models" className="font-semibold text-[#23425f] hover:text-[#18324f]">
              Open vs Closed Models
            </Link>{' '}
            for the governance side of the same decision.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-black tracking-tight text-gray-900">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-gray-200">
            {faq.map((item) => (
              <div key={item.q} className="py-5 first:pt-0 last:pb-0">
                <h3 className="text-base font-black text-gray-900">{item.q}</h3>
                <p className="mt-2 text-sm leading-7 text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
