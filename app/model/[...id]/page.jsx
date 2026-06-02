import { fetchCompleteModelData } from '../../../src/services/huggingface';
import ModelDetailClient from '../../../src/components/model/ModelDetailClient';
import { absoluteUrl, pageMetadata } from '../../../src/lib/seo';
import { isModelIndexable, modelPath } from '../../../src/lib/modelIndexing';
import { buildModelEditorial, buildModelSchemas } from '../../../src/lib/modelEditorial';
import { parseCompleteModel } from '../../../src/utils/dataParser';
import { calculateVRAM } from '../../../src/utils/vramCalculator';
import { getLicenseInfo } from '../../../src/utils/licenseChecker';
import Link from 'next/link';

const extractConfigFromMetadata = (metadata) => {
  if (!metadata) return null;
  const apiConfig = metadata.config;
  if (apiConfig && typeof apiConfig === 'object' && Object.keys(apiConfig).length > 2) return apiConfig;
  const ti = metadata.transformersInfo;
  if (!ti) return null;
  return {
    model_type: ti.auto_model || ti.pipeline_tag || metadata.pipeline_tag || 'unknown',
    architectures: ti.auto_model ? [ti.auto_model] : [],
  };
};

const buildServerModelData = (rawData) => {
  const parsedData = parseCompleteModel(rawData);
  const safetensorsTotal = rawData.metadata?.safetensors?.total || null;
  const configForVram = parsedData.config || extractConfigFromMetadata(rawData.metadata);
  const vramEstimates = configForVram ? calculateVRAM(configForVram, { safetensorsTotal }) : null;
  const licenseInfo = getLicenseInfo(
    rawData.metadata.cardData?.license ||
    rawData.metadata.tags?.find((tag) => tag.includes('license'))
  );

  return {
    ...parsedData,
    config: parsedData.config || configForVram,
    vramEstimates,
    licenseInfo,
    rawData,
  };
};

export async function generateMetadata({ params }) {
  const unwrapParams = await params;
  const idArray = unwrapParams.id || [];
  const modelId = idArray.join('/');
  const encodedPath = `/model/${idArray.map(encodeURIComponent).join('/')}`;
  const indexable = isModelIndexable(modelId);

  try {
    const rawData = await fetchCompleteModelData(modelId);
    const author = rawData.metadata?.author || rawData.metadata?.modelId?.split('/')?.[0] || 'Hugging Face';
    const publishedTime = rawData.metadata?.lastModified || rawData.metadata?.createdAt || undefined;

    return {
      ...pageMetadata({
        title: `${modelId} Hardware, VRAM, and Deployment Guide`,
        description: `Analyze ${modelId} by ${author}. Review VRAM requirements, architecture details, licensing, and deployment recommendations.`,
        path: encodedPath,
        keywords: [modelId, `${modelId} VRAM`, `${modelId} hardware requirements`],
        type: 'article',
      }),
      openGraph: {
        ...pageMetadata({
          title: `${modelId} Hardware, VRAM, and Deployment Guide`,
          description: `Analyze ${modelId} by ${author}. Review VRAM requirements, architecture details, licensing, and deployment recommendations.`,
          path: encodedPath,
          type: 'article',
        }).openGraph,
        publishedTime,
        authors: [author],
      },
      twitter: {
        ...pageMetadata({
          title: `${modelId} Hardware, VRAM, and Deployment Guide`,
          description: `Analyze ${modelId} by ${author}. Review VRAM requirements, architecture details, licensing, and deployment recommendations.`,
          path: encodedPath,
        }).twitter,
      },
      alternates: {
        canonical: absoluteUrl(encodedPath),
      },
      robots: {
        index: indexable,
        follow: true,
      },
    };
  } catch {
    return {
      ...pageMetadata({
      title: `${modelId} Model Overview`,
      description: `Explore the AI model ${modelId} on InnoAI with hardware guidance, metadata, and deployment context.`,
      path: encodedPath,
      keywords: [modelId, 'Hugging Face model analysis'],
      type: 'article',
      }),
      robots: {
        index: indexable,
        follow: true,
      },
    };
  }
}

function ModelEditorialArticle({ editorial, modelData }) {
  const updated = modelData?.lastModified || modelData?.rawData?.metadata?.lastModified || modelData?.rawData?.fetchedAt;
  const relatedModels = [
    'deepseek-ai/DeepSeek-R1',
    'Qwen/Qwen3-32B',
    'google/gemma-3-27b-it',
    'meta-llama/Llama-4-Scout-17B-16E-Instruct',
  ].filter((id) => id !== editorial.modelId);

  return (
    <article className="mb-8 rounded-[28px] border border-[var(--border-soft)] bg-white px-6 py-8 shadow-[0_18px_48px_rgba(48,67,95,0.08)] sm:px-10">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Model Deployment Guide</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
          {editorial.modelId} Hardware, Architecture, and Deployment Guide
        </h1>
        <p className="mt-5 max-w-4xl text-[15px] leading-8 text-[var(--text-muted)]">{editorial.summary}</p>
        <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-[var(--text-faint)]">
          <Link href="/authors/dhiraj" className="text-[var(--accent)] hover:text-[var(--accent-strong)]">By Dhiraj</Link>
          <span>Last updated: {updated ? new Date(updated).toLocaleDateString('en-US') : 'Metadata refresh pending'}</span>
          <Link href="/editorial-policy" className="text-[var(--accent)] hover:text-[var(--accent-strong)]">Editorial policy</Link>
        </div>
      </header>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {[
          ['Overview', editorial.summary],
          ['Architecture', editorial.architecture],
          ['Hardware Requirements', editorial.hardware],
          ['Deployment Advice', editorial.deployment],
          ['Quantization Guidance', editorial.quantization],
          ['Comparison Notes', editorial.comparison],
        ].map(([title, body]) => (
          <section key={title} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-5">
            <h2 className="text-xl font-black tracking-tight text-[var(--text-strong)]">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-main)]">{body}</p>
          </section>
        ))}
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-[var(--border-soft)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--panel-muted)] text-xs uppercase tracking-[0.12em] text-[var(--text-faint)]">
            <tr>
              <th className="px-4 py-3">Deployment Question</th>
              <th className="px-4 py-3">Practical Answer</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[var(--border-soft)]">
              <td className="px-4 py-3 font-semibold">Best first hardware check</td>
              <td className="px-4 py-3">Compare FP16, INT8, and INT4 estimates against available VRAM with room for KV cache.</td>
            </tr>
            <tr className="border-t border-[var(--border-soft)]">
              <td className="px-4 py-3 font-semibold">When to use tensor parallelism</td>
              <td className="px-4 py-3">Use it when the model plus runtime overhead does not fit one GPU or latency improves with sharding.</td>
            </tr>
            <tr className="border-t border-[var(--border-soft)]">
              <td className="px-4 py-3 font-semibold">When to quantize</td>
              <td className="px-4 py-3">Quantize after creating a full-precision quality baseline and rerunning representative prompts.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <aside className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-5">
          <h2 className="text-lg font-black tracking-tight text-[var(--text-strong)]">Sources and Verification</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-main)]">{editorial.trust}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href={`https://huggingface.co/${editorial.modelId}`} className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">Hugging Face model card</a></li>
            <li><Link href="/gpu/tools/vram-calculator" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">InnoAI VRAM calculator</Link></li>
            <li><Link href="/gpu/tools/gpu-picker" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">InnoAI GPU picker</Link></li>
          </ul>
        </div>
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-5">
          <h2 className="text-lg font-black tracking-tight text-[var(--text-strong)]">Related Models and Guides</h2>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {relatedModels.map((id) => (
              <Link key={id} href={modelPath(id)} className="rounded-full bg-white px-3 py-1 font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                {id}
              </Link>
            ))}
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <Link href="/guides/quantization-4bit-8bit-fp16" className="block font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">Quantization guide</Link>
            <Link href="/guides/tensor-parallelism" className="block font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">Tensor parallelism guide</Link>
            <Link href="/compare" className="block font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">Compare shortlisted models</Link>
          </div>
        </div>
      </aside>
    </article>
  );
}

export default async function Page({ params }) {
  const unwrapParams = await params;
  const idArray = unwrapParams.id || [];
  const modelId = idArray.join('/');
  let initialModelData = null;
  let editorial = null;
  let schemas = [];

  try {
    const rawData = await fetchCompleteModelData(modelId);
    initialModelData = buildServerModelData(rawData);
    editorial = buildModelEditorial(initialModelData);
    schemas = buildModelSchemas(editorial, initialModelData);
  } catch (error) {
    console.warn(`Server model editorial unavailable for ${modelId}`, error);
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`${schema['@type']}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <div className="shell-container py-8">
        {editorial ? <ModelEditorialArticle editorial={editorial} modelData={initialModelData} /> : null}
        <ModelDetailClient modelId={modelId} initialModelData={initialModelData} />
      </div>
    </>
  );
}
