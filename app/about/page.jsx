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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-strong)] mb-6">
          About Us
        </h1>
        <p className="text-lg leading-8 text-[var(--text-muted)] mb-12">
          InnoAI exists to help developers, builders, and ML teams make better model and infrastructure decisions with
          practical tools and clear technical explanations. We focus on applied guidance that bridges benchmark data
          and real deployment constraints.
        </p>

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
              Who This Site Is For
            </h2>
            <p className="text-[var(--text-muted)] leading-8">
              InnoAI is designed for AI developers, startup teams, technical writers, and researchers who need to
              compare model options quickly and make deployment decisions with better confidence. If you are choosing
              between model families, hardware tiers, or inference strategies, this site is built for your workflow.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

