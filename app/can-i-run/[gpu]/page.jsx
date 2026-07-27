import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { evaluateModelOnGpu, REFERENCE_CONTEXT } from '../../../src/utils/canIRunEngine';
import {
  CURATED_GPUS,
  CURATED_MODELS,
  canIRunGpuPath,
  gpuBySlug,
  modelAnchor,
} from '../../../src/data/canIRunData';
import { absoluteUrl, pageMetadata } from '../../../src/lib/seo';

// One page per curated GPU, and the only page in this section. Each carries the
// complete model x precision matrix for that card, so the answer to "can I run X
// on this GPU?" is a row here rather than a separate near-identical URL.
export async function generateStaticParams() {
  return CURATED_GPUS.map((gpu) => ({ gpu: gpu.slug }));
}

// Context lengths used by the headroom table. A fit at 4K frequently becomes an
// OOM at 32K because the KV cache term grows linearly with prompt length, which
// is the single most common surprise when sizing a card.
const CONTEXT_STEPS = [4096, 16384, 32768];

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

/**
 * Evaluate every curated model against this card and derive the analysis the page
 * needs: verdict buckets, the two capacity cliffs, and long-context headroom.
 */
function analyse(gpu) {
  const evaluated = CURATED_MODELS.map((model) => ({
    model,
    result: evaluateModelOnGpu(model, gpu.vram),
  })).sort((a, b) => b.model.paramsB - a.model.paramsB);

  const buckets = {
    full: evaluated.filter((e) => e.result.headline === 'yes-full'),
    quantized: evaluated.filter((e) => e.result.headline === 'yes-quantized'),
    no: evaluated.filter((e) => e.result.headline === 'no'),
  };

  // Two cliffs matter when sizing a card: the point where full precision stops
  // being an option, and the point where the card stops working at all.
  const cliffs = {
    largestFp16: buckets.full[0] || null,
    largestAny: buckets.full[0] || buckets.quantized[0] || null,
    smallestFailure: buckets.no.length ? buckets.no[buckets.no.length - 1] : null,
  };

  // Long-context headroom for the biggest models that fit, where the KV cache
  // growth actually bites. Smaller models rarely change verdict across contexts.
  const runnable = [...buckets.full, ...buckets.quantized].sort(
    (a, b) => b.model.paramsB - a.model.paramsB,
  );
  const headroom = runnable.slice(0, 6).map(({ model, result }) => ({
    model,
    bestPrecision: result.bestPrecision,
    steps: CONTEXT_STEPS.map((ctx) => {
      const r = evaluateModelOnGpu(model, gpu.vram, ctx);
      const row = r.rows.find((x) => x.precision === result.bestPrecision) || r.rows[r.rows.length - 1];
      return { ctx, totalGB: row.totalGB, status: row.status };
    }),
  }));

  return { evaluated, buckets, cliffs, headroom };
}

function buildFaq(gpu, buckets, cliffs) {
  const runnable = buckets.full.length + buckets.quantized.length;
  const { largestAny, largestFp16, smallestFailure } = cliffs;

  const faq = [
    {
      q: `What AI models can the ${gpu.name} run?`,
      a: `The ${gpu.name} has ${gpu.vram} GB of VRAM and runs ${runnable} of the ${CURATED_MODELS.length} models we track: ${buckets.full.length} at full FP16 precision and ${buckets.quantized.length} more once quantized to 8-bit or 4-bit.`,
    },
    {
      q: `What is the largest LLM the ${gpu.name} can run?`,
      a: largestAny
        ? `${largestAny.model.label} (${largestAny.model.paramsB}B parameters) is the largest model that fits, using about ${
            largestAny.result.rows.find((r) => r.precision === largestAny.result.bestPrecision)?.totalGB
          } GB at ${largestAny.result.rows.find((r) => r.precision === largestAny.result.bestPrecision)?.label}.`
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
      q: `Where does the ${gpu.name} stop keeping up?`,
      a: largestFp16
        ? `Full precision runs out after ${largestFp16.model.label} at ${largestFp16.model.paramsB}B parameters. ${
            smallestFailure
              ? `The card stops working entirely at ${smallestFailure.model.label} (${smallestFailure.model.paramsB}B), which needs about ${smallestFailure.result.rows[smallestFailure.result.rows.length - 1].totalGB} GB even at 4-bit.`
              : `Everything larger still fits once quantized.`
          }`
        : `Nothing in the tracked set runs in FP16 on ${gpu.vram} GB, so quantization is mandatory on this card.`,
    },
    {
      q: `Why does the VRAM number here differ from the model size?`,
      a: `Model weights are only part of the cost. Every estimate here also adds the KV cache, which stores attention keys and values for each token in the context window and grows as your prompt gets longer. These figures use a ${REFERENCE_CONTEXT.toLocaleString()}-token context and leave about 10% headroom for activations and fragmentation.`,
    },
    {
      q: `Will these models still fit at 32K context?`,
      a: `Not always. The weights stay constant but the KV cache scales linearly with context, so a model sitting near the limit at ${REFERENCE_CONTEXT.toLocaleString()} tokens can exceed ${gpu.vram} GB well before 32K. The long-context table above recomputes the largest fitting models at 4K, 16K, and 32K so you can see which ones lose their headroom first.`,
    },
  ];

  if (smallestFailure) {
    faq.push({
      q: `Can the ${gpu.name} run ${smallestFailure.model.label}?`,
      a: `No. Even at 4-bit, ${smallestFailure.model.label} needs about ${
        smallestFailure.result.rows[smallestFailure.result.rows.length - 1].totalGB
      } GB, which is more than the ${gpu.vram} GB available. You would need roughly ${smallestFailure.result.gpusNeeded}× ${gpu.name} with tensor parallelism, or a single larger card.`,
    });
  }

  return faq;
}

const STATUS_CELL = {
  fits: 'bg-green-50 text-green-800',
  tight: 'bg-amber-50 text-amber-800',
  no: 'bg-red-50 text-red-700',
};

const STATUS_WORD = { fits: 'fits', tight: 'tight', no: 'over' };

/**
 * The full model x precision matrix. This is the page's centrepiece: it carries
 * every answer the retired per-combo pages used to give, on one screen, so the
 * numbers can be compared across models instead of one URL at a time.
 */
function PrecisionMatrix({ evaluated }) {
  return (
    <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-[0.1em] text-gray-500">
          <tr>
            <th className="px-4 py-3">Model</th>
            <th className="px-4 py-3 whitespace-nowrap">Params</th>
            <th className="px-4 py-3 whitespace-nowrap">FP16</th>
            <th className="px-4 py-3 whitespace-nowrap">INT8</th>
            <th className="px-4 py-3 whitespace-nowrap">4-bit</th>
            <th className="px-4 py-3 whitespace-nowrap">KV @ {(REFERENCE_CONTEXT / 1024).toFixed(0)}K</th>
            <th className="px-4 py-3 whitespace-nowrap">Verdict</th>
          </tr>
        </thead>
        <tbody>
          {evaluated.map(({ model, result }) => (
            <tr key={model.id} id={modelAnchor(model.id)} className="scroll-mt-24 border-t border-gray-100">
              <td className="px-4 py-3 font-semibold text-gray-900">{model.label}</td>
              <td className="px-4 py-3 whitespace-nowrap text-gray-600">{model.paramsB}B</td>
              {result.rows.map((row) => (
                <td key={row.precision} className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-block rounded px-2 py-1 text-xs font-bold ${STATUS_CELL[row.status]}`}>
                    {row.totalGB} GB
                  </span>
                </td>
              ))}
              <td className="px-4 py-3 whitespace-nowrap text-gray-600">{result.kvGB} GB</td>
              <td className="px-4 py-3 whitespace-nowrap text-xs font-bold uppercase tracking-[0.1em]">
                {result.headline === 'yes-full' ? (
                  <span className="text-green-700">Runs in FP16</span>
                ) : result.headline === 'yes-quantized' ? (
                  <span className="text-amber-700">
                    Needs {result.rows.find((r) => r.precision === result.bestPrecision)?.label}
                  </span>
                ) : (
                  <span className="text-red-600">Needs {result.gpusNeeded}× cards</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function GpuHubPage({ params }) {
  const { gpu: gpuSlug } = await params;
  const gpu = gpuBySlug(gpuSlug);
  if (!gpu) notFound();

  const { evaluated, buckets, cliffs, headroom } = analyse(gpu);
  const runnable = buckets.full.length + buckets.quantized.length;
  const faq = buildFaq(gpu, buckets, cliffs);

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
          <h2 className="text-2xl font-black tracking-tight text-gray-900">
            Every model on the {gpu.name}, at every precision
          </h2>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            Total VRAM for each model at FP16, INT8, and 4-bit, including the KV cache at{' '}
            {REFERENCE_CONTEXT.toLocaleString()} tokens. Green fits with headroom, amber fits but leaves under 10%
            spare, red exceeds the card&apos;s {gpu.vram} GB. Models are ordered largest first, so the row where the
            colours change is the capacity limit of this card.
          </p>
          <PrecisionMatrix evaluated={evaluated} />
          <p className="mt-4 text-xs leading-6 text-gray-500">
            Weights scale with precision — roughly 2 bytes per parameter at FP16, 1 at INT8, 0.5 at 4-bit — but the KV
            cache column does not. It stays in FP16 regardless of how the weights are quantized, which is why 4-bit
            stops helping once the cache alone approaches the card&apos;s capacity.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black tracking-tight text-gray-900">Where this card hits its limit</h2>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            {cliffs.largestFp16 ? (
              <>
                Full precision on the {gpu.name} runs out after{' '}
                <strong className="font-semibold text-gray-900">{cliffs.largestFp16.model.label}</strong> at{' '}
                {cliffs.largestFp16.model.paramsB}B parameters, which uses about{' '}
                {cliffs.largestFp16.result.rows[0].totalGB} GB of the available {gpu.vram} GB. That is the first cliff,
                and it is the one that costs you output quality rather than the ability to run at all.
              </>
            ) : (
              <>
                No model in the tracked set runs in FP16 on {gpu.vram} GB, so quantization is not optional on this card
                — it is the entry requirement. Plan on a GPTQ, AWQ, or GGUF build from the start.
              </>
            )}{' '}
            {cliffs.smallestFailure ? (
              <>
                The second cliff is harder. {cliffs.smallestFailure.model.label} needs roughly{' '}
                {cliffs.smallestFailure.result.rows[cliffs.smallestFailure.result.rows.length - 1].totalGB} GB even at
                4-bit, past the point where quantization can rescue it. Below that size you are choosing a precision;
                above it you are choosing a different card, or roughly {cliffs.smallestFailure.result.gpusNeeded} of
                these with tensor parallelism.
              </>
            ) : (
              <>
                There is no hard cliff here: every model in the tracked set fits this card at some precision, so the
                only decision left is how much quality you are willing to trade for memory.
              </>
            )}
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            The practical reading is that VRAM is a step function, not a slider. Between the two cliffs, dropping from
            FP16 to INT8 costs very little measurable quality on most chat and summarization work, and 4-bit is usually
            acceptable too — but structured output, tool calling, and code generation degrade first and degrade
            quietly, so re-run your own evaluations after quantizing rather than trusting the benchmark deltas.
          </p>
        </section>

        {headroom.length > 0 ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">What happens at longer context</h2>
            <p className="mt-2 text-sm leading-7 text-gray-600">
              The table above assumes a {REFERENCE_CONTEXT.toLocaleString()}-token prompt. Weights do not change with
              context but the KV cache grows linearly with it, so a model that fits comfortably on a short prompt can
              run out of memory in a long conversation. These are the largest models that fit the {gpu.name},
              recomputed at their best precision as context grows.
            </p>
            <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-[0.1em] text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Model</th>
                    {CONTEXT_STEPS.map((ctx) => (
                      <th key={ctx} className="px-4 py-3 whitespace-nowrap">
                        {(ctx / 1024).toFixed(0)}K tokens
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {headroom.map(({ model, steps }) => (
                    <tr key={model.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-semibold text-gray-900">{model.label}</td>
                      {steps.map((step) => (
                        <td key={step.ctx} className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-block rounded px-2 py-1 text-xs font-bold ${STATUS_CELL[step.status]}`}
                          >
                            {step.totalGB} GB · {STATUS_WORD[step.status]}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              Any row that turns amber or red before the last column is a model you can demo but cannot ship on this
              card at that context. Two levers help before you buy more hardware: switch to a model with grouped-query
              attention, which cuts the cache by the ratio of attention heads to key-value heads, or cap the served
              context below the model&apos;s maximum. Batching works against you here — every concurrent request
              carries its own cache, so serving four users at 8K costs roughly the same as one user at 32K.
            </p>
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
            These are architecture-aware estimates, not benchmarks. Each model&apos;s layer count, key-value head
            count, and head dimension are read from its published config rather than assumed from parameter count,
            which matters because two 7B models with different attention layouts can differ by several gigabytes of
            cache. What the estimates cannot capture is runtime overhead: vLLM preallocates a large block of VRAM by
            design, llama.cpp can offload part of the model to system RAM, and driver and framework versions each take
            their own cut. Treat a comfortable fit as a green light and a tight fit as something to verify on the
            actual card before committing.
          </p>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            For numbers at your own context length, batch size, and quantization scheme, use the{' '}
            <Link href="/gpu/tools/vram-calculator" className="font-semibold text-[#23425f] hover:text-[#18324f]">
              VRAM Calculator
            </Link>
            . To work the problem the other way — starting from a model and finding the cheapest card that runs it —
            use the{' '}
            <Link href="/gpu/tools/gpu-picker" className="font-semibold text-[#23425f] hover:text-[#18324f]">
              GPU Picker
            </Link>
            .
          </p>
        </section>

        {siblingGpus.length > 0 ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">
              Compare other {gpu.tier.toLowerCase()} GPUs
            </h2>
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
