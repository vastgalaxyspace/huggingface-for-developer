import Link from 'next/link';
import { absoluteUrl, pageMetadata, SITE_NAME } from '../../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'Dhiraj - AI Model Deployment Author',
  description:
    'Author profile for Dhiraj, covering AI model selection, Hugging Face deployment, GPU sizing, quantization, and inference optimization on InnoAI.',
  path: '/authors/dhiraj',
  keywords: ['Dhiraj AI author', 'AI model deployment', 'Hugging Face guides', 'InnoAI author'],
  type: 'profile',
});

const authorSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Dhiraj',
  url: absoluteUrl('/authors/dhiraj'),
  worksFor: {
    '@type': 'Organization',
    name: SITE_NAME,
  },
  knowsAbout: [
    'AI model deployment',
    'Hugging Face models',
    'GPU VRAM sizing',
    'LLM quantization',
    'Inference optimization',
  ],
};

const focusAreas = [
  'Practical model selection for developers and product teams.',
  'GPU memory planning, quantization tradeoffs, and deployment readiness.',
  'Clear explanations of vLLM, tensor parallelism, KV cache, FlashAttention, and CUDA-oriented inference topics.',
  'Editorial review that separates upstream metadata from InnoAI analysis and recommendations.',
];

export default function AuthorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }} />
      <div className="shell-container py-12">
        <article className="space-y-8">
          <header className="editorial-panel rounded-[28px] px-6 py-10 sm:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Author</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
              Dhiraj
            </h1>
            <p className="mt-5 max-w-4xl text-[15px] leading-8 text-[var(--text-muted)]">
              Dhiraj writes and reviews InnoAI content about AI model selection, deployment tradeoffs, GPU sizing,
              quantization, and inference optimization. The editorial goal is to turn raw model metadata into practical
              decisions developers can verify on their own infrastructure.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-[var(--text-faint)]">
              <span>Focus: deployment-focused AI engineering</span>
              <span>Last reviewed: May 13, 2026</span>
            </div>
          </header>

          <section className="grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Editorial Focus</h2>
              <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--text-main)]">
                {focusAreas.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-6">
              <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Review Method</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--text-main)]">
                InnoAI pages combine upstream sources such as Hugging Face model cards, configuration files, papers,
                and runtime documentation with deterministic analysis from the site tools. Recommendations are framed
                as deployment guidance, not guarantees, because real latency, throughput, and quality depend on each
                team&apos;s prompts and serving stack.
              </p>
            </article>
          </section>

          <section className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Start with These Resources</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Link href="/guides/what-is-vllm" className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4 transition-colors hover:bg-white">
                <h3 className="text-sm font-black text-[var(--text-strong)]">What is vLLM?</h3>
                <p className="mt-2 text-xs leading-6 text-[var(--text-muted)]">Understand the serving engine behind many high-throughput LLM deployments.</p>
              </Link>
              <Link href="/guides/quantization-4bit-8bit-fp16" className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4 transition-colors hover:bg-white">
                <h3 className="text-sm font-black text-[var(--text-strong)]">Quantization Guide</h3>
                <p className="mt-2 text-xs leading-6 text-[var(--text-muted)]">Choose FP16, 8-bit, 4-bit, GGUF, AWQ, or GPTQ with fewer surprises.</p>
              </Link>
              <Link href="/editorial-policy" className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4 transition-colors hover:bg-white">
                <h3 className="text-sm font-black text-[var(--text-strong)]">Editorial Policy</h3>
                <p className="mt-2 text-xs leading-6 text-[var(--text-muted)]">Read how InnoAI researches, updates, and corrects technical content.</p>
              </Link>
            </div>
          </section>
        </article>
      </div>
    </>
  );
}
