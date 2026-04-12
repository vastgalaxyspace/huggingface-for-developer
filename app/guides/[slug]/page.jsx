import Link from 'next/link';
import { notFound } from 'next/navigation';
import { pageMetadata } from '../../../src/lib/seo';
import { getAllGuides, getGuideBySlug } from '../../../src/data/guidesContent';

export async function generateStaticParams() {
  return getAllGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) {
    return pageMetadata({
      title: 'Guide Not Found',
      description: 'The guide you requested could not be found.',
      path: `/guides/${slug}`,
    });
  }

  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    keywords: [guide.category, 'AI guide', 'InnoAI'],
    type: 'article',
  });
}

export default async function GuideDetailPage({ params }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();
  const publishedDate = '2026-04-12';

  return (
    <div className="shell-container py-10">
      <article className="mx-auto max-w-4xl">
        <div className="editorial-panel rounded-[24px] px-6 py-8 sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">{guide.category}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
            {guide.title}
          </h1>
          <p className="mt-5 text-[15px] leading-8 text-[var(--text-muted)]">{guide.description}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-[var(--text-faint)]">
            <span>{guide.readTime}</span>
            <span>Published: {publishedDate}</span>
            <span>Last updated: {guide.lastUpdated}</span>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Author and Review</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
            <p>
              Author: InnoAI Editorial Team
            </p>
            <p>
              Review process: Content is reviewed for technical clarity, deployment realism, and consistency with
              currently published product pages and tools.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Key Takeaways</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
            {guide.keyTakeaways.map((point) => (
              <li key={point}>- {point}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 space-y-6">
          {guide.sections.map((section) => (
            <div key={section.heading} className="rounded-2xl border border-[var(--border-soft)] bg-white p-6">
              <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">{section.heading}</h2>
              <p className="mt-4 text-sm leading-8 text-[var(--text-muted)]">{section.content}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Implementation Checklist</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
            {guide.checklist.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">FAQ</h2>
          <div className="mt-4 space-y-5">
            {guide.faq.map((entry) => (
              <div key={entry.q}>
                <h3 className="text-base font-bold text-[var(--text-strong)]">{entry.q}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{entry.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Related Guides</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {guide.related.map((slug) => (
              <Link
                key={slug}
                href={`/guides/${slug}`}
                className="rounded-xl border border-[var(--border-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
              >
                {slug.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-6">
          <h2 className="text-xl font-black tracking-tight text-[var(--text-strong)]">Editorial Disclaimer</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            This guide is for informational and educational purposes only. Validate assumptions against your own
            workload, compliance requirements, and production environment before implementation.
          </p>
        </section>

        <div className="mt-8">
          <Link href="/guides" className="text-sm font-bold text-[var(--accent)] hover:text-[var(--accent-strong)]">
            Back to all guides
          </Link>
        </div>
      </article>
    </div>
  );
}
