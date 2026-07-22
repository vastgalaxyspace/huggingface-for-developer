import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { evaluateModelOnGpu, REFERENCE_CONTEXT } from '../../../src/utils/canIRunEngine';
import {
  CURATED_GPUS,
  CURATED_MODELS,
  canIRunGpuPath,
  canIRunPath,
  gpuBySlug,
} from '../../../src/data/canIRunData';
import { absoluteUrl, pageMetadata } from '../../../src/lib/seo';

// One hub page per curated GPU. This is the parent of every
// /can-i-run/{gpu}/{model} combo, so it is also how crawlers reach them.
export async function generateStaticParams() {
  return CURATED_GPUS.map((gpu) => ({ gpu: gpu.slug }));
}

export async function generateMetadata({ params }) {
  const { gpu: gpuSlug } = await params;
  const gpu = gpuBySlug(gpuSlug);
  if (!gpu) {
    return pageMetadata({
      title: 'Can I run this model on this GPU?',
      description: 'Check whether an AI model fits on a specific GPU across FP16, INT8, and 4-bit precision.',
      path: '/can-i-run',
    });
  }

  const path = canIRunGpuPath(gpuSlug);
  const title = `What AI Models Can You Run on the ${gpu.name}?`;
  const description = `Every LLM that fits the ${gpu.name} (${gpu.vram} GB), with the precision each one needs. VRAM breakdowns include weights and KV cache.`;

  return {
    ...pageMetadata({
      title,
      description,
      path,
      keywords: [
        `what can I run on ${gpu.name}`,
        `${gpu.name} LLM`,
        `best LLM for ${gpu.name}`,
        `${gpu.name} ${gpu.vram}GB AI models`,
        `${gpu.vram}GB VRAM models`,
      ],
      type: 'article',
    }),
    alternates: { canonical: absoluteUrl(path) },
    robots: { index: true, follow: true },
  };
}

// Split the curated models into the three verdict buckets for this card,
// largest model first so the most capable option is the headline.
function bucketModels(gpu) {
  const evaluated = CURATED_MODELS.map((model) => ({
    model,
    result: evaluateModelOnGpu(model, gpu.vram),
  })).sort((a, b) => b.model.paramsB - a.model.paramsB);

  return {
    full: evaluated.filter((e) => e.result.headline === 'yes-full'),
    quantized: evaluated.filter((e) => e.result.headline === 'yes-quantized'),
    no: evaluated.filter((e) => e.result.headline === 'no'),
  };
}

function buildFaq(gpu, buckets) {
  const runnable = buckets.full.length + buckets.quantized.length;
  const biggest = buckets.full[0] || buckets.quantized[0] || null;
  const biggestNo = buckets.no[0] || null;

  const faq = [
    {
      q: `What AI models can the ${gpu.name} run?`,
      a: `The ${gpu.name} has ${gpu.vram} GB of VRAM and runs ${runnable} of the ${CURATED_MODELS.length} models we track: ${buckets.full.length} at full FP16 precision and ${buckets.quantized.length} more once quantized to 8-bit or 4-bit.`,
    },
    {
      q: `What is the largest LLM the ${gpu.name} can run?`,
      a: biggest
        ? `${biggest.model.label} (${biggest.model.paramsB}B parameters) is the largest model that fits, using about ${
            biggest.result.rows.find((r) => r.precision === biggest.result.bestPrecision)?.totalGB
          } GB at ${biggest.result.rows.find((r) => r.precision === biggest.result.bestPrecision)?.label}.`
        : `No model in our curated set fits on a single ${gpu.name} at ${gpu.vram} GB, even at 4-bit.`,
    },
    {
      q: `Do I need quantization on the ${gpu.name}?`,
      a:
        buckets.quantized.length > 0
          ? `For larger models, yes. ${buckets.full.length} models run in full FP16, but ${buckets.quantized.length} only fit once you drop to INT8 or 4-bit using a GPTQ, AWQ, or GGUF build.`
          : `Every model that fits this card runs in full FP16, so quantization is optional and mainly useful for freeing memory for longer context.`,
    },
    {
      q: `Why does the VRAM number here differ from the model size?`,
      a: `Model weights are only part of the cost. Every estimate here also adds the KV cache, which stores attention keys and values for each token in the context window and grows as your prompt gets longer. These figures use a ${REFERENCE_CONTEXT.toLocaleString()}-token context and leave about 10% headroom for activations and fragmentation.`,
    },
  ];

  if (biggestNo) {
    faq.push({
      q: `Can the ${gpu.name} run ${biggestNo.model.label}?`,
      a: `No. Even at 4-bit, ${biggestNo.model.label} needs about ${
        biggestNo.result.rows[biggestNo.result.rows.length - 1].totalGB
      } GB, which is more than the ${gpu.vram} GB available. You would need roughly ${biggestNo.result.gpusNeeded}× ${gpu.name} with tensor parallelism, or a single larger card.`,
    });
  }

  return faq;
}

function ModelTable({ entries, gpu, emptyText }) {
  if (entries.length === 0) {
    return <p className="mt-4 text-sm leading-7 text-gray-500">{emptyText}</p>;
  }

  return (
    <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-[0.1em] text-gray-500">
          <tr>
            <th className="px-4 py-3">Model</th>
            <th className="px-4 py-3 whitespace-nowrap">Params</th>
            <th className="px-4 py-3 whitespace-nowrap">Precision</th>
            <th className="px-4 py-3 whitespace-nowrap">Total VRAM</th>
            <th className="px-4 py-3 whitespace-nowrap">% of {gpu.vram} GB</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {entries.map(({ model, result }) => {
            const row =
              result.rows.find((r) => r.precision === result.bestPrecision) ||
              result.rows[result.rows.length - 1];
            return (
              <tr key={model.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-semibold text-gray-900">{model.label}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{model.paramsB}B</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{row.label}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{row.totalGB} GB</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{row.utilization}%</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={canIRunPath(gpu.slug, model.id)}
                    className="text-xs font-bold uppercase tracking-[0.12em] text-[#23425f] hover:text-[#18324f]"
                  >
                    Details
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function GpuHubPage({ params }) {
  const { gpu: gpuSlug } = await params;
  const gpu = gpuBySlug(gpuSlug);
  if (!gpu) notFound();

  const buckets = bucketModels(gpu);
  const runnable = buckets.full.length + buckets.quantized.length;
  const faq = buildFaq(gpu, buckets);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const siblingGpus = CURATED_GPUS.filter((g) => g.slug !== gpu.slug && g.tier === gpu.tier).slice(0, 8);

  return (
    <div className="bg-gray-100 py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="shell-container space-y-6">
        <Link
          href="/can-i-run"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#274867]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All compatibility checks
        </Link>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            {gpu.tier} · {gpu.vendor} · {gpu.vram} GB VRAM
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
            What can you run on the {gpu.name}?
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
            The {gpu.name} has {gpu.vram} GB of VRAM. Of the {CURATED_MODELS.length} models we track, {runnable} run
            on this card — {buckets.full.length} at full FP16 precision and {buckets.quantized.length} once quantized.
            Every figure below counts model weights plus the KV cache at a{' '}
            {REFERENCE_CONTEXT.toLocaleString()}-token context.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-green-50 p-4">
              <p className="text-2xl font-black text-green-800">{buckets.full.length}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-green-700">Run in FP16</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-amber-50 p-4">
              <p className="text-2xl font-black text-amber-800">{buckets.quantized.length}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-amber-700">Need quantization</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-red-50 p-4">
              <p className="text-2xl font-black text-red-700">{buckets.no.length}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-red-600">Do not fit</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black tracking-tight text-gray-900">Runs at full FP16 precision</h2>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            These models fit without quantization, so you keep full output quality.
          </p>
          <ModelTable
            entries={buckets.full}
            gpu={gpu}
            emptyText={`No tracked model fits the ${gpu.name} in FP16 — every option needs quantization on ${gpu.vram} GB.`}
          />
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black tracking-tight text-gray-900">Runs with quantization</h2>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            These need an INT8 or 4-bit build (GPTQ, AWQ, or GGUF). Quality stays close to full precision for most
            chat work, but re-test structured output and tool calling before shipping.
          </p>
          <ModelTable
            entries={buckets.quantized}
            gpu={gpu}
            emptyText={`Nothing extra is unlocked by quantization here — everything that fits already runs in FP16.`}
          />
        </section>

        {buckets.no.length > 0 ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">Too large for this card</h2>
            <p className="mt-2 text-sm leading-7 text-gray-600">
              These exceed {gpu.vram} GB even at 4-bit. You would need multiple cards with tensor parallelism, a
              larger GPU, or a smaller model.
            </p>
            <ModelTable entries={buckets.no} gpu={gpu} emptyText="" />
          </section>
        ) : null}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black tracking-tight text-gray-900">How to read these numbers</h2>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            Whether a model runs on the {gpu.name} comes down to three memory costs measured against its {gpu.vram} GB.
            First the weights: parameter count times bytes per parameter — 2 bytes in FP16, 1 in INT8, roughly 0.5 at
            4-bit. Second the KV cache, which holds attention keys and values for every token in the context window
            and grows linearly with prompt length; it stays in FP16 even when the weights are quantized. Third, an
            allowance for activations, CUDA context, and fragmentation. A fit is only called comfortable when the
            total leaves about 10% headroom.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            The practical consequence is that the table above is a starting point, not a guarantee. A model listed as
            fitting at {REFERENCE_CONTEXT.toLocaleString()} tokens can still run out of memory once conversations get
            long or several requests run at once, because the KV cache term grows with both. If you plan to use long
            context or serve concurrent users, size with the{' '}
            <Link href="/gpu/tools/vram-calculator" className="font-semibold text-[#23425f] hover:text-[#18324f]">
              VRAM Calculator
            </Link>{' '}
            at your real context length before committing.
          </p>
        </section>

        {siblingGpus.length > 0 ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">Compare other {gpu.tier.toLowerCase()} GPUs</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {siblingGpus.map((g) => (
                <Link
                  key={g.slug}
                  href={canIRunGpuPath(g.slug)}
                  className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-[#23425f] hover:bg-[#f7faff]"
                >
                  <span>
                    {g.name}
                    <span className="block text-xs font-normal text-gray-400">{g.vram} GB</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        ) : null}

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
