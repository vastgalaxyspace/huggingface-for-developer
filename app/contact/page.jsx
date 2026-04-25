import Link from 'next/link';
import { pageMetadata } from '../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'Contact InnoAI',
  description:
    'Contact InnoAI for product support, editorial corrections, partnerships, and feedback on AI model and GPU planning content.',
  path: '/contact',
  keywords: ['contact InnoAI', 'InnoAI support', 'editorial correction'],
});

export default function ContactPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@innoai.space';

  return (
    <div className="shell-container py-16">
      <div className="space-y-8">
        <div className="editorial-panel rounded-[28px] px-6 py-10 sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Contact</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)]">Contact InnoAI</h1>
          <div className="mt-6 space-y-5 text-[15px] leading-8 text-[var(--text-muted)]">
            <p>
              We welcome product feedback, data corrections, partnership requests, and editorial suggestions related to
              AI model analysis, benchmarking assumptions, and GPU planning content.
            </p>
            <p>
              Email:{' '}
              <a className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
            </p>
            <p>
              To help us respond quickly, include the page URL, model or tool name, and a short summary of your request.
              If you are reporting an issue, screenshots and expected behavior details are helpful.
            </p>
            <p>Typical response window: 2 to 5 business days.</p>
          </div>
        </div>

        <section className="grid gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[var(--text-strong)]">Editorial corrections</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              Send the exact page URL, the statement that looks wrong, and a supporting source or reproduction note if
              available.
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[var(--text-strong)]">Tool or data feedback</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              Include the tool name, expected behavior, actual behavior, and whether the problem is visual, data-related,
              or performance-related.
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[var(--text-strong)]">Partnership or business</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              Mention your company, the kind of collaboration you have in mind, and the specific page or product area
              it relates to.
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-6">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Helpful Links Before You Write</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            You can also explore the <Link href="/guides" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">Guides hub</Link>, review the
            <Link href="/about" className="ml-1 font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">About page</Link>, check our
            <Link href="/editorial-policy" className="ml-1 font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">Editorial Policy</Link>, or browse recent
            <Link href="/ai-updates" className="ml-1 font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">AI updates</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
