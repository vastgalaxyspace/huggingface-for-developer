import Link from 'next/link';
import { notFound } from 'next/navigation';
import { absoluteUrl, pageMetadata, SITE_NAME } from '../../../src/lib/seo';
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
  const guidePath = `/guides/${guide.slug}`;
  const guideUrl = absoluteUrl(guidePath);
  const publishedIso = new Date(guide.publishedDate || guide.lastUpdated).toISOString();
  const updatedIso = new Date(guide.lastUpdated).toISOString();

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: publishedIso,
    dateModified: updatedIso,
    author: {
      '@type': 'Organization',
      name: guide.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    mainEntityOfPage: guideUrl,
    articleSection: guide.category,
    keywords: [guide.category, 'AI guide', 'deployment guide'],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Guides',
        item: absoluteUrl('/guides'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: guide.title,
        item: guideUrl,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faq.map((entry) => ({
      '@type': 'Question',
      name: entry.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.a,
      },
    })),
  };

  const journeyLinks = [
    {
      href: '/compare',
      title: 'Compare shortlisted models',
      body: 'Validate architecture, context, and adoption signals side by side.',
    },
    {
      href: '/recommender',
      title: 'Get a personalized recommendation',
      body: 'Match model options to your budget, hardware, and deployment goals.',
    },
    {
      href: '/gpu/tools/vram-calculator',
      title: 'Estimate deployment memory',
      body: 'Calculate VRAM needs before production rollout and avoid sizing mistakes.',
    },
  ];

  return (
    <div className="shell-container py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <article className="w-full">
        <div className="editorial-panel rounded-[24px] px-6 py-8 sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">{guide.category}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
            {guide.title}
          </h1>
          <p className="mt-5 text-[15px] leading-8 text-[var(--text-muted)]">{guide.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
              {guide.difficulty}
            </span>
            <span className="rounded-full bg-[var(--panel-muted)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Quality {guide.qualityVersion}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-[var(--text-faint)]">
            <span>Author: {guide.author}</span>
            <span>Reviewed by: {guide.reviewedBy}</span>
            <span>{guide.readTime}</span>
            <span>Published: {guide.publishedDate}</span>
            <span>Last updated: {guide.lastUpdated}</span>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">What You Will Learn</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
            {guide.whatYouWillLearn.map((point) => (
              <li key={point}>- {point}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Author and Review</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
            <p>Author: {guide.author}</p>
            <p>Technical review: {guide.reviewedBy}</p>
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

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Sources and Methodology</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            This guide combines public model metadata with practical deployment heuristics used in InnoAI tools.
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--text-muted)]">
            {guide.sources.map((source) => {
              const isExternal = source.href.startsWith('http');
              if (isExternal) {
                return (
                  <li key={source.href}>
                    <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                      {source.label}
                    </a>
                  </li>
                );
              }

              return (
                <li key={source.href}>
                  <Link href={source.href} className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                    {source.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Continue Your Journey</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {journeyLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] p-4 transition-colors hover:border-[var(--border-strong)] hover:bg-white"
              >
                <h3 className="text-sm font-black tracking-tight text-[var(--text-strong)]">{item.title}</h3>
                <p className="mt-2 text-xs leading-6 text-[var(--text-muted)]">{item.body}</p>
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
