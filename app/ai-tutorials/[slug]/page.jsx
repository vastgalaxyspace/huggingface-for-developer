import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Database,
  FileText,
  Layers,
  ListChecks,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { pageMetadata } from '../../../src/lib/seo';
import { getTutorialFromFirestore } from '../../../src/lib/tutorialsFirestore';

export const dynamic = 'force-dynamic';

const ICONS = {
  bookOpen: BookOpen,
  checkCircle: CheckCircle,
  database: Database,
  fileText: FileText,
  layers: Layers,
  listChecks: ListChecks,
  search: Search,
  shieldCheck: ShieldCheck,
  sparkles: Sparkles,
};

const getIcon = (name, fallback = 'sparkles') => ICONS[name] || ICONS[fallback];

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tutorial = await getTutorialFromFirestore(slug);

  if (!tutorial) {
    return pageMetadata({
      title: 'Tutorial Not Found',
      description: 'The tutorial you requested could not be found.',
      path: `/ai-tutorials/${slug}`,
    });
  }

  return pageMetadata({
    title: tutorial.title,
    description: tutorial.description,
    path: tutorial.href || `/ai-tutorials/${slug}`,
    keywords: [tutorial.category || 'AI tutorial', 'AI tutorial', 'InnoAI'],
    type: 'article',
  });
}

export default async function FirestoreTutorialPage({ params }) {
  const { slug } = await params;
  const tutorial = await getTutorialFromFirestore(slug);

  if (!tutorial || tutorial.published === false) notFound();

  return (
    <div className="shell-container py-10">
      <article className="space-y-8">
        <section className="editorial-panel overflow-hidden rounded-[24px] px-6 py-8 sm:px-10">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
              {tutorial.eyebrow || tutorial.category || 'AI Tutorial'}
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
              {tutorial.title}
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-8 text-[var(--text-muted)]">
              {tutorial.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-[var(--text-faint)]">
              {(tutorial.badges || []).map((badge) => (
                <span key={badge}>{badge}</span>
              ))}
              {tutorial.readTime && <span>{tutorial.readTime}</span>}
              {tutorial.lastUpdated && <span>Updated {tutorial.lastUpdated}</span>}
            </div>
          </div>
        </section>

        {Array.isArray(tutorial.cards) && tutorial.cards.length > 0 && (
          <section className="grid gap-5 md:grid-cols-3">
            {tutorial.cards.map((card) => {
              const Icon = getIcon(card.icon, 'bookOpen');
              return (
                <article key={card.title} className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
                  <Icon className="h-6 w-6 text-[var(--accent)]" />
                  <h2 className="mt-4 text-lg font-black text-[var(--text-strong)]">{card.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{card.body}</p>
                </article>
              );
            })}
          </section>
        )}

        {Array.isArray(tutorial.sections) && tutorial.sections.length > 0 && (
          <section className="space-y-5">
            {tutorial.sections.map((section, index) => (
              <section key={section.heading || section.title || index} className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">
                  Section {index + 1}
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--text-strong)]">
                  {section.heading || section.title}
                </h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[var(--text-muted)]">
                  {section.content || section.body}
                </p>
              </section>
            ))}
          </section>
        )}

        {Array.isArray(tutorial.pipeline?.steps) && tutorial.pipeline.steps.length > 0 && (
          <section className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">
              {tutorial.pipeline.eyebrow || 'Pipeline'}
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--text-strong)]">
              {tutorial.pipeline.title || 'Tutorial steps'}
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tutorial.pipeline.steps.map((step, index) => {
                const Icon = getIcon(step.icon);
                return (
                  <article key={step.title} className="rounded-2xl bg-[var(--panel-muted)] p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--accent)]">
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--text-faint)]">
                        Step {index + 1}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-black text-[var(--text-strong)]">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{step.body}</p>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {Array.isArray(tutorial.checklist?.items) && tutorial.checklist.items.length > 0 && (
          <section className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">
              {tutorial.checklist.eyebrow || 'Checklist'}
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--text-strong)]">
              {tutorial.checklist.title || 'Implementation checklist'}
            </h2>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {tutorial.checklist.items.map((item) => (
                <p key={item} className="flex gap-3 rounded-2xl bg-[var(--panel-muted)] p-4 text-sm leading-7 text-[var(--text-muted)]">
                  <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-[rgb(21,128,61)]" />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </section>
        )}

        {Array.isArray(tutorial.nextSteps?.links) && tutorial.nextSteps.links.length > 0 && (
          <section className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">
                  {tutorial.nextSteps.eyebrow || 'Next steps'}
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--text-strong)]">
                  {tutorial.nextSteps.title || 'Continue learning'}
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {tutorial.nextSteps.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] px-4 py-3 text-sm font-bold text-[var(--accent)]"
                  >
                    {link.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
