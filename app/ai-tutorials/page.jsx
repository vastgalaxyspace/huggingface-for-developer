import Link from 'next/link';
import { ArrowRight, BookOpen, BrainCircuit, Cloud, Code2, Cpu, Layers, ListChecks } from 'lucide-react';
import { pageMetadata } from '../../src/lib/seo';
import { getAllGuides } from '../../src/data/guidesContent';
import { getTutorialsFromFirestore } from '../../src/lib/tutorialsFirestore';

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: 'AI Tutorials',
  description:
    'Browse practical AI tutorials for inference, RAG, local AI assistants, prompting, model selection, and production deployment.',
  path: '/ai-tutorials',
  keywords: ['AI tutorials', 'LLM tutorials', 'RAG tutorial', 'AI inference tutorial', 'local AI assistant tutorial'],
});

const FEATURED_TUTORIALS = [
  {
    title: 'AI Inference Tutorial',
    description:
      'A chapter-based learning path for serving models, choosing hardware, understanding runtimes, and moving toward production inference.',
    href: '/ai-inference/tutorial',
    icon: Cloud,
    level: 'Foundational',
    readTime: 'Full course',
  },
  {
    title: 'Build a Local AI Assistant on an 8GB GPU',
    description:
      'Create a practical local assistant with conservative memory settings, clear scope, and realistic quality checks.',
    href: '/guides/build-local-ai-assistant-8gb',
    icon: BrainCircuit,
    level: 'Hands-on',
    readTime: '10 min read',
  },
  {
    title: 'Deploy a Small RAG App End-to-End',
    description:
      'Build a small retrieval app with clean ingestion, tuned retrieval, grounded answers, and production monitoring basics.',
    href: '/guides/deploy-small-rag-app',
    icon: Layers,
    level: 'Project',
    readTime: '10 min read',
  },
  {
    title: 'RAG Tutorial for AI Apps',
    description:
      'Learn the full retrieval-augmented generation workflow: ingest documents, chunk text, retrieve context, and generate grounded answers.',
    href: '/ai-tutorials/rag',
    icon: Layers,
    level: 'RAG Track',
    readTime: 'Step by step',
  },
  {
    title: 'GPU Tutorial for AI Developers',
    description:
      'Learn GPU hardware, memory hierarchy, execution, CUDA basics, and framework layers that shape AI performance.',
    href: '/gpu',
    icon: Cpu,
    level: 'GPU Track',
    readTime: '7 lessons',
  },
];

const ICONS = {
  bookOpen: BookOpen,
  brainCircuit: BrainCircuit,
  cloud: Cloud,
  code2: Code2,
  cpu: Cpu,
  layers: Layers,
  listChecks: ListChecks,
};

const normalizeRemoteTutorialCard = (tutorial) => ({
  title: tutorial.title,
  description: tutorial.description,
  href: tutorial.href || `/ai-tutorials/${tutorial.slug || tutorial.id}`,
  icon: ICONS[tutorial.icon] || BookOpen,
  level: tutorial.level || tutorial.category || 'Tutorial',
  readTime: tutorial.readTime || tutorial.duration || 'Read guide',
});

const mergeFeaturedTutorials = (fallbackTutorials, remoteTutorials) => {
  const featuredRemote = remoteTutorials
    .filter((tutorial) => tutorial.featured)
    .map(normalizeRemoteTutorialCard);

  const merged = new Map();
  [...featuredRemote, ...fallbackTutorials].forEach((tutorial) => {
    if (!merged.has(tutorial.href)) {
      merged.set(tutorial.href, tutorial);
    }
  });

  return Array.from(merged.values()).slice(0, 5);
};

const TUTORIAL_TRACKS = [
  {
    title: 'Start with inference',
    body: 'Learn how model serving works before choosing providers, GPUs, or deployment frameworks.',
    href: '/ai-inference/tutorial',
    icon: Cloud,
  },
  {
    title: 'Build real AI apps',
    body: 'Move from concepts to small projects such as local assistants, RAG apps, and prompt-driven workflows.',
    href: '/guides/deploy-small-rag-app',
    icon: Code2,
  },
  {
    title: 'Make better decisions',
    body: 'Use tutorials alongside model comparison, GPU planning, and deployment checklists.',
    href: '/guides/choose-ai-model-by-gpu-budget',
    icon: ListChecks,
  },
];

const GPU_TUTORIALS = [
  {
    title: 'Physical Hardware',
    description: 'Learn SMs, cores, Tensor cores, memory buses, and the board-level pieces that matter for AI.',
    href: '/gpu/learning/physical-hardware',
  },
  {
    title: 'Memory Hierarchy',
    description: 'Understand registers, shared memory, cache, VRAM, and why data movement dominates many workloads.',
    href: '/gpu/learning/memory-hierarchy',
  },
  {
    title: 'Execution Model',
    description: 'Study warps, blocks, grids, scheduling, occupancy, and how kernels actually run on the GPU.',
    href: '/gpu/learning/execution-model',
  },
  {
    title: 'CUDA Programming',
    description: 'Explore kernel design, memory access patterns, synchronization, and tuning basics.',
    href: '/gpu/learning/cuda-programming',
  },
  {
    title: 'Compilation Pipeline',
    description: 'Follow CUDA source through PTX, SASS, and final kernel binaries.',
    href: '/gpu/learning/compilation-pipeline',
  },
  {
    title: 'Driver Stack',
    description: 'Connect CUDA runtime, drivers, device control, and scheduling layers to production behavior.',
    href: '/gpu/learning/driver-stack',
  },
  {
    title: 'Libraries & Frameworks',
    description: 'See how CUDA libraries and AI frameworks map model work onto optimized GPU kernels.',
    href: '/gpu/learning/libraries-frameworks',
  },
];

export default async function AiTutorialsPage() {
  const firestoreTutorials = await getTutorialsFromFirestore();
  const featuredTutorials = mergeFeaturedTutorials(FEATURED_TUTORIALS, firestoreTutorials);
  const tutorialGuides = getAllGuides().filter((guide) => guide.category === 'Tutorials');
  const firestoreLibraryTutorials = firestoreTutorials
    .filter((tutorial) => tutorial.showInLibrary !== false)
    .map((tutorial) => ({
      slug: tutorial.slug || tutorial.id,
      title: tutorial.title,
      description: tutorial.description,
      readTime: tutorial.readTime || tutorial.duration || 'Read guide',
      href: tutorial.href || `/ai-tutorials/${tutorial.slug || tutorial.id}`,
    }));
  const libraryTutorials = [
    ...firestoreLibraryTutorials,
    ...tutorialGuides.map((guide) => ({
      ...guide,
      href: `/guides/${guide.slug}`,
    })),
  ].filter((tutorial, index, list) => list.findIndex((item) => item.href === tutorial.href) === index);

  return (
    <div className="shell-container py-10">
      <div className="space-y-8">
        <section className="editorial-panel overflow-hidden rounded-[24px] px-6 py-8 sm:px-10">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">AI Tutorials</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
              Practical AI tutorials for developers
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-8 text-[var(--text-muted)]">
              Learn AI through focused tutorials covering inference, local assistants, RAG apps, prompt workflows,
              model selection, and production deployment. This hub is ready to grow as you add more AI tutorials.
            </p>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {featuredTutorials.map((tutorial) => {
            const Icon = tutorial.icon;
            return (
              <Link
                key={tutorial.href}
                href={tutorial.href}
                className="group rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[var(--panel-muted)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    {tutorial.level}
                  </span>
                  <span className="rounded-full bg-[var(--panel-muted)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    {tutorial.readTime}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-black leading-tight text-[var(--text-strong)]">{tutorial.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{tutorial.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
                  Open tutorial
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </section>

        <section className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">GPU tutorial</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--text-strong)]">
                Learn GPUs for AI workloads
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
                Follow the GPU learning path when you want to understand VRAM limits, throughput, CUDA execution, and
                why different models behave differently on real hardware.
              </p>
            </div>
            <Link
              href="/gpu"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] px-4 py-3 text-sm font-bold text-[var(--accent)]"
            >
              Open GPU hub
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {GPU_TUTORIALS.map((tutorial) => (
              <Link
                key={tutorial.href}
                href={tutorial.href}
                className="group rounded-2xl bg-[var(--panel-muted)] p-5 transition hover:bg-[var(--accent-soft)]"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--accent)]">
                    <Cpu className="h-4.5 w-4.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-black leading-tight text-[var(--text-strong)]">
                      {tutorial.title}
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-[var(--text-muted)]">{tutorial.description}</span>
                    <span className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[var(--accent)]">
                      Start lesson
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {TUTORIAL_TRACKS.map((track) => {
            const Icon = track.icon;
            return (
              <Link
                key={track.title}
                href={track.href}
                className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm transition hover:border-[var(--border-strong)] hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--panel-muted)] text-[var(--accent)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="text-lg font-black text-[var(--text-strong)]">{track.title}</h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">{track.body}</p>
              </Link>
            );
          })}
        </section>

        <section className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">All AI tutorials</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--text-strong)]">
                Tutorial library
              </h2>
            </div>
            <Link
              href="/guides"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] px-4 py-3 text-sm font-bold text-[var(--accent)]"
            >
              View all guides
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {libraryTutorials.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group rounded-2xl bg-[var(--panel-muted)] p-5 transition hover:bg-[var(--accent-soft)]"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--accent)]">
                    <BookOpen className="h-4.5 w-4.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-black leading-tight text-[var(--text-strong)]">
                      {guide.title}
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-[var(--text-muted)]">{guide.description}</span>
                    <span className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[var(--accent)]">
                      {guide.readTime}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
