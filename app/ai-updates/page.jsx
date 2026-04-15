import { Zap } from 'lucide-react';
import Link from 'next/link';
import AIUpdatesList from '../../src/components/ai-updates/AIUpdatesList';
import { pageMetadata } from '../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'AI Updates & Technology News',
  description:
    'Track AI updates, model launches, and ecosystem changes relevant to developers building with modern open-source AI tools.',
  path: '/ai-updates',
  keywords: ['AI updates', 'model news', 'open-source AI', 'Hugging Face updates'],
});

export default function AIUpdatesPage() {
  return (
    <div className="shell-container py-6">
      <div>
        <div className="mb-6 border-b border-[var(--border-soft)] pb-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight text-[var(--text-strong)] flex items-center gap-2 whitespace-nowrap">
            <Zap className="h-5 w-5 text-blue-600" /> AI Updates
          </h1>
          <span className="hidden sm:block text-[var(--border-soft)] text-lg">|</span>
          <p className="text-[var(--text-muted)] text-sm">
            Stay informed about the latest breakthroughs in artificial intelligence.
          </p>
        </div>

        <AIUpdatesList />

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-5">
            <h2 className="text-lg font-black tracking-tight text-[var(--text-strong)]">How to Use This Feed</h2>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--text-muted)]">
              <li>- Track release relevance by category, not hype.</li>
              <li>- Validate claims against your actual workload.</li>
              <li>- Convert major updates into compare-and-test tasks.</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-5">
            <h2 className="text-lg font-black tracking-tight text-[var(--text-strong)]">Turn News into Decisions</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              Use each important update as an input for model selection, cost planning, and GPU sizing rather than a
              standalone headline.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/compare" className="rounded-lg border border-[var(--border-soft)] bg-white px-3 py-2 text-xs font-bold text-[var(--accent)]">
                Compare Models
              </Link>
              <Link href="/recommender" className="rounded-lg border border-[var(--border-soft)] bg-white px-3 py-2 text-xs font-bold text-[var(--accent)]">
                Open Recommender
              </Link>
              <Link href="/gpu/tools/vram-calculator" className="rounded-lg border border-[var(--border-soft)] bg-white px-3 py-2 text-xs font-bold text-[var(--accent)]">
                Estimate VRAM
              </Link>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
