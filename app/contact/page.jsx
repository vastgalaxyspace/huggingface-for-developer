import Link from 'next/link';
import { pageMetadata } from '../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'Contact InnoAI',
  description:
    'Contact InnoAI for product questions, partnership inquiries, SEO feedback, or corrections related to model data and GPU tools.',
  path: '/contact',
  keywords: ['contact InnoAI', 'InnoAI support', 'SEO feedback'],
});

export default function ContactPage() {
  return (
    <div className="shell-container py-16">
      <div className="editorial-panel rounded-[28px] px-6 py-10 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Contact</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)]">Contact InnoAI</h1>
        <div className="mt-6 max-w-3xl space-y-5 text-[15px] leading-8 text-[var(--text-muted)]">
          <p>
            For product questions, partnership inquiries, SEO feedback, or corrections related to model data and GPU
            tooling, reach out through your preferred support channel.
          </p>
          <p>
            The fastest way to help us respond is to include the page URL, the model or tool involved, and a short
            description of the issue or request.
          </p>
          <p>
            You can also continue exploring from the <Link href="/" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">homepage</Link>, review the
            <Link href="/about" className="ml-1 font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">About page</Link>, or check recent
            <Link href="/ai-updates" className="ml-1 font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">AI updates</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
