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
          <h2 className="text-2xl font-black tracking-tight text-gray-900">How these numbers are calculated</h2>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            Each option is built from a different formula, which is why they cross over rather than scale together.
          </p>

          <h3 className="mt-6 text-lg font-black text-gray-900">1. Managed API</h3>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            Monthly cost is simply <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">(tokens ÷ 1,000) ×
            rate</code>. The rate is not fixed: serverless hosts charge by model size, so we derive a parameter count
            from the FP16 footprint (roughly <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">params ≈ VRAM
            ÷ 2.3</code>, allowing two bytes per parameter plus about 15% overhead) and step the rate across the
            observed 2026 range — from $0.0001 per 1K tokens under 5B parameters to $0.00104 at 70B-class. Hugging
            Face Inference is modelled at 2× that base and Replicate at 2.5×, with a frontier closed API at $0.0036
            per 1K tokens for contrast. There is no setup or maintenance line, because there is no infrastructure.
          </p>

          <h3 className="mt-6 text-lg font-black text-gray-900">2. Rented cloud GPU</h3>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            Here the meter runs on time, not tokens: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">hourly
            rate × hours per day × days per month</code>, plus a one-off setup cost and a recurring monthly
            maintenance line. The calculator picks the cheapest instance whose GPU actually holds the model — a T4 at
            $0.526/hr up to 12 GB, an L4 at $0.85/hr or A10G at $1.006/hr up to 20 GB, an A100 at $4.098/hr up to
            35 GB. Because the term is hours rather than tokens, an instance sitting idle costs exactly as much as one
            saturated with traffic.
          </p>

          <h3 className="mt-6 text-lg font-black text-gray-900">3. Self-hosted hardware</h3>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            This is the only option with real capital cost, and it has four terms: hardware selected by VRAM
            requirement and depreciated over 36 months; supporting infrastructure at a flat $2,800 for chassis,
            networking, UPS, and cooling; recurring running costs of power plus connectivity, maintenance, and backup;
            and personnel. Power is metered honestly at{' '}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">(watts ÷ 1,000) × 24 × 30 × $0.12/kWh</code>.
            Personnel assumes a quarter of a DevOps engineer at $120,000 and a tenth of an MLOps engineer at
            $140,000 — about $3,667 a month, and almost always the dominant term.
          </p>

          <h2 className="mt-10 text-2xl font-black tracking-tight text-gray-900">A worked example</h2>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            Take Llama 3 8B at roughly 16 GB in FP16, serving 50 million tokens a month — a real but modest internal
            workload. On the API path, 16 GB implies about 7B parameters, so the rate is $0.0002 per 1K tokens:
            50,000 thousand-token units × $0.0002 = <strong className="font-semibold text-gray-900">$10 a month</strong>,
            or $120 for the year.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            On a rented L4 running around the clock, 720 hours × $0.85 = $612 a month. Add $500 a month of maintenance
            and $200 of setup and year one lands at{' '}
            <strong className="font-semibold text-gray-900">$13,544</strong>.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            Self-hosting looks cheapest on hardware and is not close overall. A 16 GB card costs $600 and draws 160 W,
            so power is about $14 a month; with connectivity, maintenance, and backup the running total is $364 a
            month. Add $2,800 of infrastructure and $44,000 of partial headcount and year one is{' '}
            <strong className="font-semibold text-gray-900">$51,768</strong> — over four hundred times the API bill,
            and the GPU is 1% of it.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            That is the whole lesson of the tool. At this volume the decision is not close, and it does not become
            close by buying a cheaper card. Self-hosting starts winning when token volume climbs far enough that the
            per-token API line overtakes a fixed staffing cost you were going to pay anyway — which is why teams that
            already run infrastructure reach that point much sooner than teams that would be staffing up for it.
          </p>

          <h2 className="mt-10 text-2xl font-black tracking-tight text-gray-900">What this model does not capture</h2>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            These are planning estimates, and four limits are worth stating plainly. First, per-token pricing moves
            constantly and varies several-fold between providers; the rates here were current in July 2026 and your
            input/output ratio shifts the effective cost further. Second, the model assumes steady utilization —
            bursty traffic makes the rented-GPU column look far worse in reality than it does here, and a reserved or
            spot instance makes it look better. Third, the personnel figures are US-market salaries at an assumed
            split; a team already carrying that headcount should read the self-hosted column as marginal cost, not
            total. Fourth, nothing here prices latency, data residency, or the risk of a provider deprecating a model
            underneath you — for many teams those decide the question before cost does.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            Use the shape of the comparison and the break-even point rather than the absolute figures, then confirm
            against current provider pricing before committing budget.
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
