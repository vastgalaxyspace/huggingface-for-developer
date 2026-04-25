import Link from 'next/link';
import { pageMetadata } from '../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'Editorial Policy',
  description:
    'Read how InnoAI researches, reviews, updates, and corrects AI model, infrastructure, and deployment content.',
  path: '/editorial-policy',
  keywords: ['InnoAI editorial policy', 'content standards', 'AI guide methodology'],
});

const principles = [
  {
    title: 'Original analysis first',
    body:
      'We aim to publish practical analysis that helps users make deployment and product decisions. We do not treat release notes, benchmark screenshots, or model cards as enough on their own.',
  },
  {
    title: 'Operational usefulness over hype',
    body:
      'We prioritize what matters in real usage: latency, VRAM, licensing, cost, reliability, context behavior, and maintenance overhead. We avoid declaring universal winners when tradeoffs are workload-specific.',
  },
  {
    title: 'Sources with context',
    body:
      'When we reference public claims, papers, provider docs, or model metadata, we link to the source and add practical interpretation. Source links support the analysis; they do not replace it.',
  },
  {
    title: 'Updates and corrections',
    body:
      'We revise pages when model assumptions, pricing, hardware realities, or deployment guidance materially change. Readers can report corrections through the contact page.',
  },
];

const reviewFlow = [
  'Define the user problem the page should help solve.',
  'Collect model, tooling, or infrastructure inputs from primary sources.',
  'Add practical interpretation, checklists, and decision guidance.',
  'Review for clarity, internal consistency, and product usefulness.',
  'Update timestamps, sources, and related internal links before publishing.',
];

const notAdvice = [
  'Legal or regulatory advice',
  'Medical or healthcare guidance',
  'Investment or financial advice',
  'Guarantees of performance on every workload',
];

export default function EditorialPolicyPage() {
  return (
    <div className="shell-container py-12">
      <div className="space-y-8">
        <section className="editorial-panel rounded-[28px] px-6 py-10 sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Trust & Standards</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
            Editorial Policy
          </h1>
          <p className="mt-5 max-w-4xl text-[15px] leading-8 text-[var(--text-muted)]">
            InnoAI publishes practical content for developers, ML engineers, researchers, and product teams working on
            AI model selection and deployment. This page explains how we research, review, and maintain that content so
            readers can understand the standard behind the site.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-[var(--text-faint)]">
            <span>Last reviewed: April 22, 2026</span>
            <span>Applies to guides, tool pages, comparisons, and update commentary</span>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {principles.map((item) => (
            <article key={item.title} className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black tracking-tight text-[var(--text-strong)]">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">How We Review a Page</h2>
          <ol className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
            {reviewFlow.map((item, index) => (
              <li key={item}>
                {index + 1}. {item}
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
          <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Update and Correction Policy</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--text-muted)]">
              <p>
                We update content when a material change affects user decisions. Examples include major model releases,
                license changes, large pricing shifts, deployment-runtime changes, or improvements to our own tools that
                alter the recommended workflow.
              </p>
              <p>
                If a reader spots an issue, we want the specific page URL, the statement in question, and a supporting
                source or reproduction note when possible. Correction requests can be sent through the{' '}
                <Link href="/contact" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                  contact page
                </Link>.
              </p>
              <p>
                Significant editorial pages and guides include published or last-updated dates so readers can judge how
                current a recommendation is.
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-6">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">What Our Content Is Not</h2>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--text-muted)]">
              {notAdvice.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Related Pages</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Link href="/about" className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4 transition-colors hover:bg-white">
              <h3 className="text-sm font-black text-[var(--text-strong)]">About InnoAI</h3>
              <p className="mt-2 text-xs leading-6 text-[var(--text-muted)]">Mission, audience, and how the product is maintained.</p>
            </Link>
            <Link href="/guides" className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4 transition-colors hover:bg-white">
              <h3 className="text-sm font-black text-[var(--text-strong)]">Guides Hub</h3>
              <p className="mt-2 text-xs leading-6 text-[var(--text-muted)]">Original editorial guides with checklists, FAQs, and internal tools.</p>
            </Link>
            <Link href="/ai-updates" className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4 transition-colors hover:bg-white">
              <h3 className="text-sm font-black text-[var(--text-strong)]">AI Updates</h3>
              <p className="mt-2 text-xs leading-6 text-[var(--text-muted)]">Timely updates framed as practical decisions instead of raw headlines.</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
