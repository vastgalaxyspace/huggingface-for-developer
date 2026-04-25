import Link from 'next/link';
import AIUpdatesList from '../../src/components/ai-updates/AIUpdatesList';
import { pageMetadata } from '../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'AI Updates',
  description:
    'Track selected AI model, tooling, and infrastructure updates with a clean editorial feed for developers.',
  path: '/ai-updates',
  keywords: ['AI updates', 'model news', 'open-source AI', 'Hugging Face updates'],
});

export default function AIUpdatesPage() {
  return (
    <div className="shell-container py-10">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-[var(--border-soft)] pb-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)]">AI Updates</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
            Clean AI update feed
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-8 text-[var(--text-muted)]">
            A focused feed of AI model, tooling, research, and infrastructure changes worth reviewing. Use it to spot
            updates, then move into comparison or GPU planning when something affects your stack.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/compare" className="text-[var(--accent)] hover:text-[var(--accent-strong)]">
              Compare models
            </Link>
            <Link href="/guides" className="text-[var(--accent)] hover:text-[var(--accent-strong)]">
              Read guides
            </Link>
            <Link href="/editorial-policy" className="text-[var(--accent)] hover:text-[var(--accent-strong)]">
              Editorial policy
            </Link>
          </div>
        </header>

        <div className="mt-8">
          <AIUpdatesList />
        </div>
      </div>
    </div>
  );
}
