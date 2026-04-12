import Link from 'next/link';
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

  return (
    <div className="shell-container py-10">
      <div className="max-w-6xl mx-auto">
        <div className="editorial-panel rounded-[24px] px-6 py-8 sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Editorial Hub</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
            InnoAI Guides
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-8 text-[var(--text-muted)]">
            This section focuses on practical AI decision-making for real deployments. Each guide includes
            implementation tradeoffs, checklists, and links to related tools in the InnoAI stack.
          </p>
        </div>

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
