"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppContext } from "../providers/AppContext";
import { getTutorialProgress, saveTutorialProgress } from "../../lib/tutorialProgress";

const TUTORIAL_ID = "rag";

function getTextFromNode(node) {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(getTextFromNode).join("");
  if (node?.props?.children) return getTextFromNode(node.props.children);
  return "";
}

function countSections(chapters) {
  return chapters.reduce((total, chapter) => total + (chapter.sections?.length || 0), 0);
}

function getSectionKey(chapter, section) {
  if (!chapter || !section) return "";
  return `${chapter.id}:${section.id}`;
}

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const code = getTextFromNode(children);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="relative mt-6 overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[#101828] shadow-sm">
      <div className="flex h-10 items-center justify-between border-b border-white/10 bg-[#182235] px-4">
        <div className="flex gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300 hover:text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 text-xs leading-6 text-slate-100">{children}</pre>
    </div>
  );
}

const markdownComponents = {
  h3: ({ children }) => <h3 className="mt-8 text-xl font-black text-[var(--text-strong)]">{children}</h3>,
  p: ({ children }) => <p className="mt-4 text-[15px] leading-8 text-[var(--text-muted)]">{children}</p>,
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-[15px] leading-8 text-[var(--text-muted)]">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-[15px] leading-8 text-[var(--text-muted)]">{children}</ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  table: ({ children }) => (
    <div className="mt-5 overflow-x-auto rounded-xl border border-[var(--border-soft)]">
      <table className="min-w-full divide-y divide-[var(--border-soft)] text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-[var(--panel-muted)] text-[var(--text-strong)]">{children}</thead>,
  th: ({ children }) => <th className="px-4 py-3 font-black">{children}</th>,
  td: ({ children }) => (
    <td className="border-t border-[var(--border-soft)] px-4 py-3 align-top text-[var(--text-muted)]">{children}</td>
  ),
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  code: ({ inline, children }) =>
    inline ? (
      <code className="rounded bg-[var(--panel-muted)] px-1.5 py-0.5 text-[0.9em] font-semibold text-[var(--text-strong)]">
        {children}
      </code>
    ) : (
      <code>{children}</code>
    ),
  strong: ({ children }) => <strong className="font-black text-[var(--text-strong)]">{children}</strong>,
};

export default function RagTutorialContent({ tutorial }) {
  const router = useRouter();
  const { auth } = useContext(AppContext);
  const chapters = useMemo(() => tutorial.chapters || [], [tutorial]);
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [readSections, setReadSections] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressReady, setProgressReady] = useState(false);
  const [progressError, setProgressError] = useState("");

  const chapter = chapters[activeChapter];
  const section = chapter?.sections?.[activeSection];
  const totalSections = countSections(chapters);
  const progressPercent = totalSections > 0 ? Math.round((readSections.length / totalSections) * 100) : 0;
  const flatSections = chapters.flatMap((item, chapterIndex) =>
    (item.sections || []).map((entry, sectionIndex) => ({
      chapterIndex,
      sectionIndex,
      chapter: item,
      section: entry,
    }))
  );
  const flatIndex = flatSections.findIndex(
    (item) => item.chapterIndex === activeChapter && item.sectionIndex === activeSection
  );
  const previous = flatSections[flatIndex - 1];
  const next = flatSections[flatIndex + 1];

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.user) return;

    let isMounted = true;

    async function fetchProgress() {
      setProgressLoading(true);
      const savedProgress = await getTutorialProgress(auth.user.uid, TUTORIAL_ID);
      if (!isMounted) return;

      setReadSections(Array.isArray(savedProgress?.readSections) ? savedProgress.readSections : []);
      setProgressLoading(false);
      setProgressReady(true);
    }

    fetchProgress();

    return () => {
      isMounted = false;
    };
  }, [auth.loading, auth.user]);

  const markSectionRead = useCallback(
    (targetChapter, targetSection) => {
      if (!auth.user || !targetChapter || !targetSection) return;

      const key = getSectionKey(targetChapter, targetSection);
      if (!key || readSections.includes(key)) return;

      const nextReadSections = [...readSections, key];
      setReadSections(nextReadSections);
      setProgressError("");

      saveTutorialProgress(auth.user.uid, TUTORIAL_ID, {
        tutorialId: TUTORIAL_ID,
        tutorialTitle: tutorial.title,
        readSections: nextReadSections,
        totalSections,
        progressPercent: totalSections > 0 ? Math.round((nextReadSections.length / totalSections) * 100) : 0,
        lastChapterId: targetChapter.id || null,
        lastSectionId: targetSection.id || null,
        startedAt: readSections.length === 0 ? new Date().toISOString() : undefined,
      }).catch((err) => {
        console.error("Error saving RAG tutorial progress:", err);
        setProgressError("Progress could not be saved right now.");
      });
    },
    [auth.user, readSections, totalSections, tutorial.title]
  );

  useEffect(() => {
    if (!progressReady) return;
    if (progressLoading) return;
    const timeout = window.setTimeout(() => {
      markSectionRead(chapter, section);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [chapter, markSectionRead, progressLoading, progressReady, section]);

  const handleSelectSection = (chapterIndex, sectionIndex) => {
    const targetChapter = chapters[chapterIndex];
    const targetSection = targetChapter?.sections?.[sectionIndex];
    if (!targetChapter || !targetSection) return;

    setActiveChapter(chapterIndex);
    setActiveSection(sectionIndex);
    markSectionRead(targetChapter, targetSection);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (auth.loading) {
    return (
      <div className="flex min-h-[calc(100vh-78px)] items-center justify-center bg-[var(--page-bg)] px-6 text-center">
        <div>
          <p className="section-kicker mb-3">RAG Tutorial</p>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Checking your account...</h1>
        </div>
      </div>
    );
  }

  if (!auth.user) {
    return (
      <div className="flex min-h-[calc(100vh-78px)] items-center justify-center bg-[var(--page-bg)] px-6 text-center">
        <div className="max-w-md rounded-[24px] border border-[var(--border-soft)] bg-white p-8 shadow-sm">
          <p className="section-kicker mb-3">RAG Tutorial</p>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Sign in to start the tutorial</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            Your reading progress is saved to your account so you can continue from any device.
          </p>
          <button
            type="button"
            onClick={() => router.push("/login?next=/ai-tutorials/rag")}
            className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--accent-strong)]"
          >
            Sign in to continue
          </button>
        </div>
      </div>
    );
  }

  if (progressLoading || !progressReady) {
    return (
      <div className="flex min-h-[calc(100vh-78px)] items-center justify-center bg-[var(--page-bg)] px-6 text-center">
        <div>
          <p className="section-kicker mb-3">RAG Tutorial</p>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Loading tutorial...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-main)] md:flex">
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--border-soft)] bg-white p-4 md:hidden">
        <Link href="/ai-tutorials" className="flex items-center gap-2 text-sm font-bold text-[var(--text-muted)]">
          <ArrowLeft className="h-4 w-4" />
          Tutorials
        </Link>
        <p className="max-w-[190px] truncate text-sm font-black text-[var(--text-strong)]">{chapter?.title}</p>
        <button
          type="button"
          onClick={() => setSidebarOpen((open) => !open)}
          className="rounded-lg border border-[var(--border-soft)] p-2 text-[var(--text-strong)]"
          aria-label="Toggle tutorial sections"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-full flex-col overflow-y-auto border-r border-[var(--border-soft)] bg-[var(--panel-bg)] transition-transform duration-300 md:sticky md:w-[310px] md:translate-x-0 lg:w-[340px] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="sticky top-0 z-10 border-b border-[var(--border-soft)] bg-[var(--panel-bg)] p-4">
          <Link
            href="/ai-tutorials"
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--accent)]"
          >
            <ArrowLeft className="h-4 w-4" />
            AI Tutorials
          </Link>
          <h2 className="mt-4 text-xl font-black tracking-tight text-[var(--text-strong)]">
            {tutorial.shortTitle || tutorial.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{tutorial.sidebarDescription}</p>
        </div>

        <div className="p-4 pb-20">
          <div className="mb-6 rounded-xl border border-[var(--border-soft)] bg-white p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--panel-muted)]">
              <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-[var(--text-muted)]">
              {readSections.length} of {totalSections} sections opened
            </p>
            {progressError ? <p className="mt-2 text-xs font-semibold text-red-700">{progressError}</p> : null}
          </div>

          <nav className="flex flex-col gap-6">
            {chapters.map((item, chapterIndex) => (
              <div key={item.id}>
                <p className="px-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--text-faint)]">
                  {item.number}. {item.title}
                </p>
                <p className="px-2 pb-2 pt-1 text-xs leading-5 text-[var(--text-muted)]">{item.description}</p>
                <div className="space-y-1">
                  {(item.sections || []).map((entry, sectionIndex) => {
                    const isActive = activeChapter === chapterIndex && activeSection === sectionIndex;
                    const isRead = readSections.includes(getSectionKey(item, entry));

                    return (
                      <button
                        type="button"
                        key={entry.id}
                        onClick={() => handleSelectSection(chapterIndex, sectionIndex)}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                          isActive
                            ? "border-[rgba(54,87,132,0.18)] bg-[var(--accent-soft)] font-bold text-[var(--accent)]"
                            : "border-transparent text-[var(--text-main)] hover:border-[var(--border-soft)] hover:bg-white"
                        }`}
                      >
                        <span>
                          {entry.number}. {entry.title}
                        </span>
                        {isRead ? <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[rgb(21,128,61)]" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="px-6 py-10 md:px-12 md:py-14 lg:px-20">
          <div className="mb-8 rounded-[22px] border border-[var(--border-soft)] bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">
              Chapter {chapter?.number}: {chapter?.title}
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-strong)] md:text-5xl">
              {section?.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--text-muted)]">
              {tutorial.heroDescription || tutorial.description}
            </p>
          </div>

          <article className="rounded-[22px] border border-[var(--border-soft)] bg-white px-6 py-7 shadow-sm md:px-9 md:py-9">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {section?.content || ""}
            </ReactMarkdown>
          </article>

          <div className="mt-8 flex flex-col gap-3 border-t border-[var(--border-soft)] pt-6 sm:flex-row sm:justify-between">
            {previous ? (
              <button
                type="button"
                onClick={() => handleSelectSection(previous.chapterIndex, previous.sectionIndex)}
                className="rounded-xl border border-[var(--border-soft)] bg-white p-4 text-left hover:bg-[var(--panel-muted)] sm:min-w-[220px]"
              >
                <span className="flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-[var(--text-faint)]">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </span>
                <span className="mt-1 block text-sm font-bold text-[var(--text-strong)]">{previous.section.title}</span>
              </button>
            ) : (
              <span />
            )}

            {next ? (
              <button
                type="button"
                onClick={() => handleSelectSection(next.chapterIndex, next.sectionIndex)}
                className="rounded-xl border border-[var(--border-soft)] bg-white p-4 text-left hover:bg-[var(--panel-muted)] sm:min-w-[220px] sm:text-right"
              >
                <span className="flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-[var(--text-faint)] sm:justify-end">
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
                <span className="mt-1 block text-sm font-bold text-[var(--accent)]">{next.section.title}</span>
              </button>
            ) : (
              <Link
                href="/ai-tutorials"
                className="rounded-xl bg-[var(--accent)] px-5 py-4 text-center text-sm font-black text-white hover:bg-[var(--accent-strong)]"
              >
                Finish tutorial
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
