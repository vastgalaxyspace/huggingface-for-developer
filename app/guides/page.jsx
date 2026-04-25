import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle, Cpu, Layers, ShieldCheck } from 'lucide-react';
import { pageMetadata } from '../../src/lib/seo';
import { getAllGuides } from '../../src/data/guidesContent';

export const metadata = pageMetadata({
  title: 'AI Guides and Tutorials',
  description:
    'Explore practical AI deployment guides on model selection, RAG, quantization, latency, and GPU-aware production workflows.',
  path: '/guides',
  keywords: ['AI guides', 'LLM tutorials', 'model selection guide', 'RAG tutorial'],
});

export default function GuidesPage() {
  const guides = getAllGuides();
  const totalGuides = guides.length;
  const featuredGuides = guides.slice(0, 3);
  const learningTracks = [
    {
      title: 'Model Selection',
      body: 'Start here when you need to choose between model families, licenses, context windows, and quality targets.',
      icon: BookOpen,
      href: '/guides/model-selection-mistakes',
    },
    {
      title: 'Hardware Planning',
      body: 'Use GPU-aware guides when VRAM, latency, and serving cost decide what you can actually deploy.',
      icon: Cpu,
      href: '/guides/choose-ai-model-by-gpu-budget',
    },
    {
      title: 'Production Workflow',
      body: 'Plan RAG, quantization, prompt structure, and rollout decisions with checklists built for real teams.',
      icon: Layers,
      href: '/guides/rag-vs-fine-tuning',
    },
  ];

  return (
    <div className="shell-container py-10">
      <div className="space-y-8">
        <div className="editorial-panel overflow-hidden rounded-[24px] px-6 py-8 sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Editorial Hub</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
                InnoAI Guides
              </h1>
              <p className="mt-4 max-w-3xl text-[15px] leading-8 text-[var(--text-muted)]">
                Practical AI decision guides for model selection, GPU planning, RAG architecture, quantization,
                prompting, and production inference. Each guide is written to help readers move from research to a
                concrete next step.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-[var(--text-faint)]">
                <span>{totalGuides} published guides</span>
                <span>Author and update details included</span>
                <span>Original checklists, FAQs, and internal tool links</span>
              </div>
            </div>
            <div className="rounded-[24px] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]">Quality signals</p>
                  <h2 className="text-lg font-black text-[var(--text-strong)]">Built for review and reuse</h2>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
                {[
                  'Clear update dates and author signals.',
                  'Practical checklists and decision frameworks.',
                  'Related tools linked from the reading path.',
                ].map((item) => (
                  <p key={item} className="flex gap-2">
                    <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-[rgb(21,128,61)]" />
                    <span>{item}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-5 md:grid-cols-3">
          {learningTracks.map((track) => {
            const Icon = track.icon;
            return (
              <Link
                key={track.title}
                href={track.href}
                className="group rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--panel-muted)] text-[var(--accent)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-lg font-black text-[var(--text-strong)]">{track.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{track.body}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
                  Start track
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </section>

        <section className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">Recommended first reads</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--text-strong)]">
                Start with the guides that prevent expensive deployment mistakes
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
                These pages are useful for new visitors because they explain how to avoid common traps before choosing
                models, buying GPUs, or committing to an architecture.
              </p>
            </div>
            <Link href="/editorial-policy" className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] px-4 py-3 text-sm font-bold text-[var(--accent)]">
              Editorial Policy
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {featuredGuides.map((guide) => (
              <Link key={guide.slug} href={`/guides/${guide.slug}`} className="rounded-2xl bg-[var(--panel-muted)] p-5 transition hover:bg-[var(--accent-soft)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]">{guide.category}</p>
                <h3 className="mt-2 text-base font-black leading-tight text-[var(--text-strong)]">{guide.title}</h3>
                <p className="mt-2 text-xs font-semibold text-[var(--text-muted)]">{guide.readTime} / Updated {guide.lastUpdated}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[var(--text-strong)]">What makes these guides useful</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              We focus on deployment tradeoffs, not just definitions. That means budget, VRAM, latency, licensing, and
              migration risk show up throughout the content.
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[var(--text-strong)]">What each page includes</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              Most guides include key takeaways, what-you-will-learn blocks, implementation checklists, FAQs, sources,
              and links to relevant tools and follow-up reading.
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[var(--text-strong)]">How content is maintained</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              We review and update important guides when model assumptions, pricing, or deployment recommendations
              materially change. See our <Link href="/editorial-policy" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">editorial policy</Link>.
            </p>
          </article>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {guides.map((guide) => (
            <article
              key={guide.slug}
              className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                {guide.category}
              </p>
              <h2 className="mt-2 text-xl font-black leading-tight text-[var(--text-strong)]">{guide.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{guide.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
                  {guide.difficulty}
                </span>
                <span className="rounded-full bg-[var(--panel-muted)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  By {guide.author}
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between text-xs font-semibold text-[var(--text-faint)]">
                <span>{guide.readTime}</span>
                <span>Updated {guide.lastUpdated}</span>
              </div>
              <Link
                href={`/guides/${guide.slug}`}
                className="mt-5 inline-flex items-center text-sm font-bold text-[var(--accent)] hover:text-[var(--accent-strong)]"
              >
                Read guide
              </Link>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
