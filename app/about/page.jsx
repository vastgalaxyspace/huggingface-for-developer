import Link from 'next/link';
import { pageMetadata } from '../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'About InnoAI',
  description:
    'Learn about InnoAI, our mission, editorial standards, and how we build practical AI model analysis content and tools for real deployment decisions.',
  path: '/about',
  keywords: ['about InnoAI', 'AI model explorer', 'editorial policy', 'AI tooling mission'],
});

export default function AboutPage() {
  return (
    <div className="shell-container py-12">
      <div className="space-y-8">
        <section className="editorial-panel rounded-[28px] px-6 py-10 sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">About InnoAI</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[var(--text-strong)] mb-6">
            A practical AI research and deployment workspace
          </h1>
          <p className="max-w-4xl text-lg leading-8 text-[var(--text-muted)]">
            InnoAI exists to help developers, builders, and ML teams make better model and infrastructure decisions
            with practical tools and clear technical explanations. We focus on applied guidance that bridges benchmark
            data and real deployment constraints.
          </p>
        </section>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[var(--text-strong)]">What we optimize for</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              Clear decisions around model fit, GPU sizing, latency, cost, and licensing.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[var(--text-strong)]">How we publish</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              Original guidance, tool-assisted workflows, and source-linked analysis instead of thin summaries.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[var(--text-strong)]">Who it serves</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              Developers, startup teams, researchers, and ML operators choosing what to ship next.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-[var(--text-strong)] mb-4">
              Our Mission
            </h2>
            <p className="text-[var(--text-muted)] leading-8">
              AI model choices now involve cost, latency, hardware limits, model licensing, and quality tradeoffs. Our
              mission is to make these tradeoffs easier to understand by combining interactive tools with structured
              educational content. We prioritize clarity, reproducibility, and practical usage patterns over hype.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text-strong)] mb-4">
              What We Publish
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm flex flex-col items-start hover:shadow-md transition-shadow">
                <h3 className="font-bold text-[var(--text-strong)] mb-2">Interactive Decision Tools</h3>
                <p className="text-sm text-[var(--text-muted)] leading-7">
                  We build utilities like model comparison views, recommendation workflows, and GPU planning tools to
                  support model selection and deployment planning.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm flex flex-col items-start hover:shadow-md transition-shadow">
                <h3 className="font-bold text-[var(--text-strong)] mb-2">Guides and Tutorials</h3>
                <p className="text-sm text-[var(--text-muted)] leading-7">
                  We publish implementation guides and comparison frameworks that help readers evaluate AI systems with
                  realistic constraints and repeatable methods.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text-strong)] mb-4">
              Editorial Principles
            </h2>
            <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-6">
              <ul className="space-y-3 text-sm leading-7 text-[var(--text-muted)]">
                <li>- We prioritize practical, user-first explanations over generic summaries.</li>
                <li>- We update content when model releases or deployment assumptions materially change.</li>
                <li>- We separate informational guidance from legal, financial, or compliance advice.</li>
                <li>- We include links across related tools and guides to support deeper learning paths.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text-strong)] mb-4">
              How We Maintain Content Quality
            </h2>
            <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-6">
              <div className="space-y-4 text-sm leading-7 text-[var(--text-muted)]">
                <p>
                  We aim to make pages useful enough that a developer can move from reading to action. That means
                  publishing practical checklists, decision frameworks, and internal links to the tools required to
                  test a recommendation.
                </p>
                <p>
                  Important guides include author and review details, update dates, and source references. We also
                  maintain an{' '}
                  <a href="/editorial-policy" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                    editorial policy
                  </a>{' '}
                  that explains how pages are researched, reviewed, and corrected.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text-strong)] mb-4">
              Who This Site Is For
            </h2>
            <p className="text-[var(--text-muted)] leading-8">
              InnoAI is designed for AI developers, startup teams, technical writers, and researchers who need to
              compare model options quickly and make deployment decisions with better confidence. If you are choosing
              between model families, hardware tiers, or inference strategies, this site is built for your workflow.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text-strong)] mb-4">
              Where to Start
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/guides" className="rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-sm transition hover:shadow-md">
                <h3 className="font-bold text-[var(--text-strong)]">Read Guides</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                  Use our deeper editorial pages if you are still deciding architecture, hardware, or workflow.
                </p>
              </Link>
              <Link href="/compare" className="rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-sm transition hover:shadow-md">
                <h3 className="font-bold text-[var(--text-strong)]">Compare Models</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                  Validate shortlist candidates with side-by-side technical and deployment information.
                </p>
              </Link>
              <Link href="/gpu/tools/vram-calculator" className="rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-sm transition hover:shadow-md">
                <h3 className="font-bold text-[var(--text-strong)]">Estimate VRAM</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                  Check memory feasibility early so recommendations stay grounded in real hardware constraints.
                </p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

