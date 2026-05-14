import { getTrendingModels } from '../src/services/huggingface';
import { enrichModelData } from '../src/utils/modelUtils';
import HomePageClient from "../src/components/routes/HomePageClient";
import Link from 'next/link';

const editorialSections = [
  {
    title: 'What Hugging Face Models Are',
    body:
      'Hugging Face is a public ecosystem for model cards, weights, tokenizer files, configuration files, datasets, and community discussion. For developers, the useful part is not just the download button. A model repository can reveal the architecture family, supported task, license, precision, context length, tokenizer behavior, and sometimes benchmark or training notes. InnoAI reads these signals as deployment clues. A model with a clear config, active downloads, permissive license, and realistic memory footprint is easier to evaluate than a model that only has a name and a vague description. The right workflow is to treat Hugging Face as the source of upstream metadata, then combine that metadata with your own latency, quality, and cost tests.',
  },
  {
    title: 'How to Choose AI Models',
    body:
      'Model selection should start with the job, not the leaderboard. A retrieval assistant, code review bot, customer support classifier, document summarizer, and local desktop assistant all stress different parts of a model. First define task type, expected context length, privacy requirements, latency target, monthly token volume, and acceptable infrastructure cost. Then shortlist models by architecture, license, size, and serving path. A smaller model that fits one GPU and answers reliably may beat a larger model that needs multi-GPU serving and constant prompt repair. Use benchmark claims as a screening tool, but make the final choice with examples from your own users and data.',
  },
  {
    title: 'Best Open-Source LLM Categories',
    body:
      'Open models are best understood as categories. Compact instruction models are useful for local assistants, extraction, routing, and classification. Mid-size general models often provide the best balance for startup products because they can serve chat, summarization, and coding tasks without the cost of the largest systems. Reasoning models are valuable when multi-step correctness matters, but they can be slower and more expensive to serve. Mixture-of-experts models can offer strong active-parameter efficiency, yet deployment depends heavily on runtime support. Code-specialized models should be tested on real repositories because style, tool usage, and framework knowledge matter more than generic pass rates.',
  },
  {
    title: 'GPU Deployment Guide',
    body:
      'GPU deployment starts with memory, then moves to throughput. The base weights are only part of the footprint. KV cache grows with sequence length, batch size, number of layers, hidden size, and precision. Runtime overhead, CUDA graphs, paged attention, tensor parallelism, and quantization all change the final deployment profile. Consumer cards can be excellent for prototypes and smaller quantized models, while A100, H100, H200, L40S, and similar data-center GPUs are better suited for high concurrency and long-context workloads. Before renting hardware, estimate FP16, 8-bit, and 4-bit footprints, then leave margin for cache and serving overhead.',
  },
  {
    title: 'Quantization Explained',
    body:
      'Quantization reduces memory by storing weights with fewer bits. FP16 or BF16 is the usual quality baseline. INT8 often preserves quality well while lowering memory. 4-bit formats can make large models practical on smaller GPUs, but every workload should be tested because math, code, structured output, and safety behavior can change. GGUF is popular for llama.cpp and local CPU/GPU workflows. AWQ and GPTQ are common for GPU inference when kernels and model variants are available. Quantization is not a universal upgrade; it is a tradeoff between fit, speed, quality, ecosystem support, and operational simplicity.',
  },
  {
    title: 'Inference Optimization',
    body:
      'Once a model is selected, inference optimization decides whether it can become a product. vLLM, PagedAttention, FlashAttention, batching, KV cache management, speculative decoding, and CUDA graph capture all target different bottlenecks. Some improve memory efficiency, some reduce launch overhead, and some increase request throughput. The safest path is to measure time to first token, tokens per second, p95 latency, GPU memory, and output quality before and after each optimization. InnoAI tools are designed to make that process concrete: estimate VRAM, compare models, choose GPUs, and then read the deeper guides when the bottleneck becomes specific.',
  },
];

const guideLinks = [
  ['/guides/what-is-vllm', 'What is vLLM'],
  ['/guides/what-is-quantization', 'What is quantization'],
  ['/guides/tensor-parallelism', 'Tensor parallelism'],
  ['/guides/kv-cache-optimization', 'KV cache optimization'],
  ['/guides/flashattention', 'FlashAttention'],
  ['/guides/moe-routing', 'MoE routing'],
];

function HomeEditorial() {
  return (
    <article className="shell-container pb-12">
      <section className="editorial-panel rounded-[28px] px-6 py-10 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">AI Model Deployment Guide</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
          Choose Hugging Face Models with Real Deployment Context
        </h1>
        <p className="mt-5 max-w-4xl text-[15px] leading-8 text-[var(--text-muted)]">
          InnoAI combines Hugging Face model discovery with practical editorial guidance about architecture, GPU memory,
          quantization, inference runtimes, and production tradeoffs. Use the tools above to explore models, then use
          the sections below to understand what the numbers mean before choosing a model for a real application.
        </p>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          {editorialSections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">{section.title}</h2>
              <p className="mt-4 text-sm leading-8 text-[var(--text-main)]">{section.body}</p>
            </section>
          ))}

          <section className="overflow-x-auto rounded-2xl border border-[var(--border-soft)] bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--panel-muted)] text-xs uppercase tracking-[0.12em] text-[var(--text-faint)]">
                <tr>
                  <th className="px-4 py-3">Decision</th>
                  <th className="px-4 py-3">Best Starting Point</th>
                  <th className="px-4 py-3">Related Tool</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Can this model fit my GPU?', 'Estimate FP16, INT8, and INT4 memory before testing.', '/gpu/tools/vram-calculator'],
                  ['Which GPU should I buy or rent?', 'Match VRAM, budget, and workload concurrency.', '/gpu/tools/gpu-picker'],
                  ['Which model should I shortlist?', 'Compare task, license, architecture, and deployment score.', '/recommender'],
                  ['How do finalists differ?', 'Compare context, parameters, license, VRAM, and usage path.', '/compare'],
                ].map(([decision, answer, href]) => (
                  <tr key={decision} className="border-t border-[var(--border-soft)]">
                    <td className="px-4 py-3 font-semibold text-[var(--text-strong)]">{decision}</td>
                    <td className="px-4 py-3 text-[var(--text-main)]">{answer}</td>
                    <td className="px-4 py-3">
                      <Link href={href} className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-6">
            <h2 className="text-xl font-black tracking-tight text-[var(--text-strong)]">Core Guides</h2>
            <nav className="mt-4 space-y-2">
              {guideLinks.map(([href, label]) => (
                <Link key={href} href={href} className="block rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                  {label}
                </Link>
              ))}
            </nav>
          </section>
          <section className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black tracking-tight text-[var(--text-strong)]">Trust Signals</h2>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--text-main)]">
              <li>- Server-rendered editorial content for crawlers and readers.</li>
              <li>- Author and editorial policy pages for review context.</li>
              <li>- Internal links from tools to guides and model pages.</li>
              <li>- Sources from Hugging Face, runtime docs, and deployment references.</li>
            </ul>
            <Link href="/authors/dhiraj" className="mt-4 inline-flex font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
              View author profile
            </Link>
          </section>
        </aside>
      </div>
    </article>
  );
}

export default async function Home() {
  const trending = await getTrendingModels(150);
  const popularModels = trending.map(enrichModelData);
  
  return (
    <>
      <HomePageClient initialModels={popularModels} />
      <HomeEditorial />
    </>
  );
}
