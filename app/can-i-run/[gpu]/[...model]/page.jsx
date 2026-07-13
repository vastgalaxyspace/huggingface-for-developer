import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import CanIRunResult from '../../../../src/components/can-i-run/CanIRunResult';
import { evaluateModelOnGpu } from '../../../../src/utils/canIRunEngine';
import {
  CURATED_GPUS,
  CURATED_MODELS,
  canIRunPath,
  gpuBySlug,
  isCuratedCombo,
  modelById,
} from '../../../../src/data/canIRunData';
import { absoluteUrl, pageMetadata } from '../../../../src/lib/seo';

// Pre-render every curated combo at build time; index only those.
export async function generateStaticParams() {
  return CURATED_GPUS.flatMap((gpu) =>
    CURATED_MODELS.map((model) => ({
      gpu: gpu.slug,
      model: model.id.split('/'),
    })),
  );
}

function resolve(paramsIn) {
  const gpuSlug = paramsIn.gpu;
  const modelId = (paramsIn.model || []).map(decodeURIComponent).join('/');
  return { gpuSlug, modelId, gpu: gpuBySlug(gpuSlug), model: modelById(modelId) };
}

export async function generateMetadata({ params }) {
  const p = await params;
  const { gpu, model, gpuSlug, modelId } = resolve(p);
  if (!gpu || !model) {
    return pageMetadata({
      title: 'Can I run this model on this GPU?',
      description: 'Check whether an AI model fits on a specific GPU across FP16, INT8, and 4-bit precision.',
      path: '/can-i-run',
    });
  }
  const path = canIRunPath(gpuSlug, modelId);
  const title = `Can You Run ${model.label} on the ${gpu.name}?`;
  const description = `Does ${model.label} fit on the ${gpu.name} (${gpu.vram} GB)? See the VRAM breakdown across FP16, INT8, and 4-bit precision, including KV cache.`;
  return {
    ...pageMetadata({
      title,
      description,
      path,
      keywords: [`${model.label} ${gpu.name}`, `run ${model.label} on ${gpu.name}`, `${gpu.name} VRAM`, `${model.label} requirements`],
      type: 'article',
    }),
    alternates: { canonical: absoluteUrl(path) },
    robots: { index: true, follow: true },
  };
}

function buildFaq(model, gpu, result) {
  const best = result.rows.find((r) => r.precision === result.bestPrecision);
  const fitAnswer =
    result.headline === 'yes-full'
      ? `Yes. In FP16 it uses about ${result.rows[0].totalGB} GB, which fits the ${gpu.name}'s ${gpu.vram} GB.`
      : result.headline === 'yes-quantized'
        ? `Not in FP16, but yes at ${best.label}, where it uses about ${best.totalGB} GB versus the card's ${gpu.vram} GB.`
        : `No. Even 4-bit needs about ${result.rows[result.rows.length - 1].totalGB} GB, more than the ${gpu.vram} GB available.`;

  return [
    {
      q: `Can the ${gpu.name} run ${model.label}?`,
      a: fitAnswer,
    },
    {
      q: `How much VRAM does ${model.label} need?`,
      a: `Approximately ${result.rows[0].weightGB} GB in FP16, ${result.rows[1].weightGB} GB in INT8, and ${result.rows[2].weightGB} GB in 4-bit for the weights, plus a KV cache of about ${result.kvGB} GB at ${result.context.toLocaleString()} tokens.`,
    },
    {
      q: `Does quantization let ${model.label} fit on the ${gpu.name}?`,
      a:
        result.headline === 'no'
          ? `Not on a single ${gpu.name} — even 4-bit exceeds ${gpu.vram} GB. You would need multiple GPUs or a larger card.`
          : `Yes. Dropping to ${best.label} brings total usage to about ${best.totalGB} GB, which fits the ${gpu.vram} GB card with headroom for the KV cache.`,
    },
    {
      q: `What happens to memory with longer context?`,
      a: `The KV cache grows linearly with prompt length. At ${result.context.toLocaleString()} tokens it is about ${result.kvGB} GB here; doubling the context roughly doubles that term, so long-context use can push a tight fit over the edge.`,
    },
  ];
}

export default async function Page({ params }) {
  const p = await params;
  const { gpu, model, gpuSlug, modelId } = resolve(p);

  // Only curated combos are supported as full pages.
  if (!gpu || !model || !isCuratedCombo(gpuSlug, modelId)) {
    notFound();
  }

  const result = evaluateModelOnGpu(model, gpu.vram);

  // Cross-links: which GPUs run this model, and which models fit this GPU.
  const altGpus = CURATED_GPUS.filter((g) => {
    if (g.slug === gpu.slug) return false;
    const r = evaluateModelOnGpu(model, g.vram);
    return r.headline !== 'no';
  }).slice(0, 6);

  const altModels = CURATED_MODELS.filter((m) => {
    if (m.id === model.id) return false;
    const r = evaluateModelOnGpu(m, gpu.vram);
    return r.headline !== 'no';
  }).slice(0, 6);

  const faq = buildFaq(model, gpu, result);
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
        <Link href="/can-i-run" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#274867]">
          <ArrowLeft className="h-3.5 w-3.5" /> All compatibility checks
        </Link>

        <CanIRunResult model={model} gpu={gpu} result={result} altGpus={altGpus} altModels={altModels} />

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
