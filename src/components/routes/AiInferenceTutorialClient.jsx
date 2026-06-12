"use client";
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, ChevronRight, ChevronLeft, ArrowLeft, Menu, X } from 'lucide-react';
import { AppContext } from '../providers/AppContext';
import { getTutorialFromFirestore } from '../../lib/tutorialsFirestore';
import { getTutorialProgress, saveTutorialProgress } from '../../lib/tutorialProgress';

const TUTORIAL_ID = 'ai-inference';

const getSectionKey = (chapter, section, chapterIndex, sectionIndex) =>
  `${chapter?.id || chapterIndex}:${section?.id || sectionIndex}`;

const countSections = (chapters) =>
  chapters.reduce((total, chapter) => total + (chapter.sections || []).length, 0);

/* ── tiny markdown-ish renderer ── */
function renderContent(text) {
  if (!text) return null;
  return text.split('\n\n').map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Heading (**Text**)
    if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('\n')) {
      return (
        <h3 key={i} className="mt-8 mb-4 text-xl font-bold text-[var(--text-strong)] tracking-tight">
          {trimmed.slice(2, -2)}
        </h3>
      );
    }

    // Table
    if (trimmed.startsWith('|') && trimmed.includes('\n|') && trimmed.includes('---')) {
      const lines = trimmed.split('\n');
      const headerLine = lines[0];
      const bodyLines = lines.slice(2);
      
      const parseRow = (rowStr) => rowStr.split('|').map(c => c.trim()).filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);
      
      return (
        <div key={i} className="my-8 overflow-x-auto rounded-xl border border-[var(--border-soft)] shadow-sm bg-[var(--panel-bg)]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--panel-muted)] border-b border-[var(--border-soft)]">
              <tr>
                {parseRow(headerLine).map((cell, cIdx) => (
                  <th key={cIdx} className="px-5 py-3.5 font-bold text-[0.85rem] text-[var(--text-strong)] uppercase tracking-wider">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)] text-sm text-[var(--text-main)] bg-[var(--page-bg)]">
              {bodyLines.map((row, rowIdx) => {
                if (!row.trim()) return null;
                return (
                  <tr key={rowIdx} className="hover:bg-[var(--panel-muted)]/30 transition-colors">
                    {parseRow(row).map((cell, cIdx) => (
                      <td key={cIdx} className="px-5 py-4 leading-relaxed font-medium">
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    // Bullet list
    if (trimmed.startsWith('- ')) {
      const items = trimmed.split('\n').filter((l) => l.trim());
      return (
        <ul key={i} className="my-4 ml-6 flex flex-col gap-2 list-disc text-[var(--text-main)]">
          {items.map((item, j) => {
            const content = item
              .replace(/^-\s+/, '')
              .replace(/\*\*(.+?)\*\*/g, '<b class="text-[var(--text-strong)] font-semibold">$1</b>')
              .replace(/`(.+?)`/g, '<code class="bg-[var(--panel-muted)] text-[var(--text-strong)] border border-[var(--border-soft)] px-1.5 py-[1px] rounded font-mono text-[0.85em]">$1</code>');
            return <li key={j} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />;
          })}
        </ul>
      );
    }

    // Paragraph
    const html = trimmed
      .replace(/\*\*(.+?)\*\*/g, '<b class="text-[var(--text-strong)] font-semibold">$1</b>')
      .replace(/`(.+?)`/g, '<code class="bg-[var(--panel-muted)] text-[var(--text-strong)] border border-[var(--border-soft)] px-1.5 py-[1px] rounded font-mono text-[0.85em]">$1</code>')
      .replace(/\n/g, '<br/>');
    return (
      <p key={i} className="my-4 text-[var(--text-main)] leading-relaxed text-[1.05rem]" dangerouslySetInnerHTML={{ __html: html }} />
    );
  });
}

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative my-6 rounded-xl overflow-hidden border border-[var(--border-soft)] shadow-sm">
      <div className="absolute top-0 left-0 w-full h-10 bg-[var(--panel-muted)] border-b border-[var(--border-soft)] flex items-center justify-between px-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[var(--border-strong)]"></div>
          <div className="w-3 h-3 rounded-full bg-[var(--border-strong)]"></div>
          <div className="w-3 h-3 rounded-full bg-[var(--border-strong)]"></div>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-5 pt-14 bg-white text-[var(--text-main)] text-[0.85rem] leading-relaxed overflow-x-auto font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function TutorialPage() {
  const router = useRouter();
  const { auth } = useContext(AppContext);
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [progressError, setProgressError] = useState('');
  const [readSections, setReadSections] = useState([]);
  const [tutorial, setTutorial] = useState({
    title: 'AI Inference Tutorial',
    chapters: [],
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchTutorial() {
      const remoteTutorial = await getTutorialFromFirestore(TUTORIAL_ID);
      if (!isMounted) return;

      if (Array.isArray(remoteTutorial?.chapters) && remoteTutorial.chapters.length > 0) {
        setTutorial({
          title: remoteTutorial.title || 'AI Inference Tutorial',
          chapters: remoteTutorial.chapters,
        });
        setActiveChapter(0);
        setActiveSection(0);
        setLoadError('');
      } else {
        setLoadError('Tutorial content is not available in Firestore yet.');
      }

      setIsLoading(false);
    }

    fetchTutorial();

    return () => {
      isMounted = false;
    };
  }, []);

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
    }

    fetchProgress();

    return () => {
      isMounted = false;
    };
  }, [auth.loading, auth.user]);

  // Derive the active objects
  const chapters = tutorial.chapters;
  const chapter = chapters[activeChapter];
  const chapterSections = chapter?.sections || [];
  const section = chapterSections[activeSection];
  const totalSections = useMemo(() => countSections(chapters), [chapters]);
  const readCount = readSections.length;
  const progressPercent = totalSections > 0 ? Math.round((readCount / totalSections) * 100) : 0;

  const markSectionRead = useCallback((targetChapter, targetSection, chapterIndex, sectionIndex) => {
    if (!auth.user || !targetSection) return;

    const sectionKey = getSectionKey(targetChapter, targetSection, chapterIndex, sectionIndex);
    if (readSections.includes(sectionKey)) return;

    const nextReadSections = [...readSections, sectionKey];
    setReadSections(nextReadSections);
    setProgressError('');

    saveTutorialProgress(auth.user.uid, TUTORIAL_ID, {
      tutorialId: TUTORIAL_ID,
      tutorialTitle: tutorial.title,
      readSections: nextReadSections,
      totalSections,
      progressPercent: totalSections > 0 ? Math.round((nextReadSections.length / totalSections) * 100) : 0,
      lastChapterId: targetChapter?.id || null,
      lastSectionId: targetSection?.id || null,
      startedAt: readSections.length === 0 ? new Date().toISOString() : undefined,
    }).catch((err) => {
      console.error('Error saving tutorial progress:', err);
      setProgressError('Progress could not be saved right now.');
    });
  }, [auth.user, readSections, totalSections, tutorial.title]);

  useEffect(() => {
    if (progressLoading) return;
    const timeout = window.setTimeout(() => {
      markSectionRead(chapter, section, activeChapter, activeSection);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [
    activeChapter,
    activeSection,
    chapter,
    markSectionRead,
    progressLoading,
    section,
  ]);

  // Auto-close sidebar on mobile after selection
  const handleSelectSection = (cIdx, sIdx) => {
    setActiveChapter(cIdx);
    setActiveSection(sIdx);
    markSectionRead(chapters[cIdx], chapters[cIdx]?.sections?.[sIdx], cIdx, sIdx);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLastSection = activeSection >= chapterSections.length - 1 && activeChapter >= chapters.length - 1;

  if (auth.loading) {
    return (
      <div className="flex min-h-[calc(100vh-78px)] items-center justify-center bg-[var(--page-bg)] px-6 text-center">
        <div>
          <p className="section-kicker mb-3">AI Inference Tutorial</p>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Checking your account...</h1>
        </div>
      </div>
    );
  }

  if (!auth.user) {
    return (
      <div className="flex min-h-[calc(100vh-78px)] items-center justify-center bg-[var(--page-bg)] px-6 text-center">
        <div className="max-w-md rounded-[24px] border border-[var(--border-soft)] bg-white p-8 shadow-sm">
          <p className="section-kicker mb-3">AI Inference Tutorial</p>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Sign in to start the tutorial</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            Your reading progress, quiz result, and certificate are saved to your account.
          </p>
          <button
            type="button"
            onClick={() => router.push('/login?next=/ai-inference/tutorial')}
            className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--accent-strong)]"
          >
            Sign in to continue
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || progressLoading) {
    return (
      <div className="flex min-h-[calc(100vh-78px)] items-center justify-center bg-[var(--page-bg)] px-6 text-center">
        <div>
          <p className="section-kicker mb-3">AI Inference Tutorial</p>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Loading tutorial...</h1>
        </div>
      </div>
    );
  }

  if (loadError || !section) {
    return (
      <div className="flex min-h-[calc(100vh-78px)] items-center justify-center bg-[var(--page-bg)] px-6 text-center">
        <div className="max-w-lg">
          <p className="section-kicker mb-3">AI Inference Tutorial</p>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-strong)]">Tutorial content unavailable</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            {loadError || 'No tutorial sections were found in Firestore.'}
          </p>
          <Link
            href="/ai-inference"
            className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--accent-strong)]"
          >
            Back to AI Inference
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-main)] flex flex-col md:flex-row">
      {/* Mobile Header / Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[var(--border-soft)] bg-white sticky top-0 z-50">
        <Link href="/ai-inference" className="text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold text-sm">Back</span>
        </Link>
        <div className="font-bold text-[var(--text-strong)] truncate max-w-[200px]">
          {chapter?.title}
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[var(--text-strong)] p-2">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Left Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-40 h-screen w-full md:w-[280px] lg:w-[320px] 
          bg-[var(--panel-bg)] overflow-y-auto flex flex-col
          transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-[var(--border-soft)]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 flex items-center justify-between border-b border-[var(--border-soft)] sticky top-0 bg-[var(--panel-bg)] z-10">
          <Link
            href="/ai-inference"
            className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            AI Inference
          </Link>
        </div>

        <div className="p-4 pb-20">
          <div className="flex items-center gap-3 mb-8 pl-2">
            <h2 className="font-bold text-[var(--text-strong)] text-[1.1rem] tracking-tight">{tutorial.title}</h2>
          </div>

          <div className="mb-8 rounded-xl border border-[var(--border-soft)] bg-white p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--panel-muted)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-[var(--text-muted)]">
              {readCount} of {totalSections} sections read
            </p>
            {progressError ? (
              <p className="mt-2 text-xs font-semibold text-red-700">{progressError}</p>
            ) : null}
          </div>

          <nav className="flex flex-col gap-6">
            {chapters.map((ch, cIndex) => (
              <div key={ch.id}>
                <div className="text-xs font-bold text-[var(--text-faint)] uppercase tracking-widest mb-3 pl-2">
                  {ch.number}. {ch.title}
                </div>
                <div className="flex flex-col gap-1">
                  {(ch.sections || []).map((sec, sIndex) => {
                    const isActive = activeChapter === cIndex && activeSection === sIndex;
                    const isRead = readSections.includes(getSectionKey(ch, sec, cIndex, sIndex));
                    return (
                      <button
                        key={sec.id}
                        onClick={() => handleSelectSection(cIndex, sIndex)}
                        className={`flex items-center justify-between gap-3 text-left px-3 py-2 rounded-lg text-[0.88rem] transition-colors ${
                          isActive
                            ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold border border-[rgba(54,87,132,0.15)]'
                            : 'text-[var(--text-main)] hover:bg-[var(--panel-muted)] hover:text-[var(--text-strong)] border border-transparent'
                        }`}
                      >
                        <span>{sec.title}</span>
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

      {/* Right Content Area */}
      <main className="flex-1 min-w-0 bg-[var(--page-bg)]">
        <div className="w-full px-6 py-10 md:py-16 md:px-12 lg:px-20">
          {section && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-4 text-[var(--text-muted)] font-semibold tracking-wide text-sm uppercase flex items-center gap-2">
                Chapter {chapter.number}: {chapter.title}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-strong)] mb-8 tracking-tight">
                {section.title}
              </h1>

              <div className="prose max-w-none text-[var(--text-main)]">
                {renderContent(section.content)}
                {section.code && <CodeBlock code={section.code} />}
              </div>

              {isLastSection ? (
                <div className="mt-12 rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Final test</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--text-strong)]">
                    AI Inference MCQ
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                    The final test is now on a separate page with 10 MCQ questions. Your current progress is {progressPercent}%.
                  </p>
                  <Link
                    href="/ai-inference/tutorial/test"
                    className="mt-5 inline-flex rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-strong)]"
                  >
                    Open final test
                  </Link>
                </div>
              ) : null}

              {/* Navigation Footer */}
              <div className="mt-16 pt-8 border-t border-[var(--border-soft)] flex justify-between items-center">
                {/* Prev Button */}
                {activeSection > 0 || activeChapter > 0 ? (
                  <button
                    onClick={() => {
                      if (activeSection > 0) {
                        handleSelectSection(activeChapter, activeSection - 1);
                      } else {
                        const prevChap = activeChapter - 1;
                        handleSelectSection(prevChap, (chapters[prevChap].sections || []).length - 1);
                      }
                    }}
                    className="flex flex-col items-start p-4 hover:bg-[var(--panel-muted)] rounded-xl transition-colors min-w-[120px] border border-transparent hover:border-[var(--border-soft)]"
                  >
                    <span className="text-xs font-bold text-[var(--text-muted)] mb-1 flex items-center gap-1">
                      <ChevronLeft className="w-3 h-3" /> PREVIOUS
                    </span>
                    <span className="text-[var(--text-strong)] font-medium text-sm text-left line-clamp-1">
                      {activeSection > 0 
                        ? chapters[activeChapter].sections[activeSection - 1].title
                        : chapters[activeChapter - 1].sections[(chapters[activeChapter - 1].sections || []).length - 1].title}
                    </span>
                  </button>
                ) : (
                  <div></div>
                )}

                {/* Next Button */}
                {!isLastSection ? (
                  <button
                    onClick={() => {
                      if (activeSection < chapterSections.length - 1) {
                        handleSelectSection(activeChapter, activeSection + 1);
                      } else {
                        handleSelectSection(activeChapter + 1, 0);
                      }
                    }}
                    className="flex flex-col items-end p-4 hover:bg-[var(--panel-muted)] rounded-xl transition-colors min-w-[120px] border border-transparent hover:border-[var(--border-soft)]"
                  >
                    <span className="text-xs font-bold text-[var(--text-muted)] mb-1 flex items-center gap-1 uppercase tracking-wider">
                      NEXT <ChevronRight className="w-3 h-3" />
                    </span>
                    <span className="text-[var(--accent)] font-semibold text-sm text-right line-clamp-1">
                      {activeSection < chapterSections.length - 1
                        ? chapterSections[activeSection + 1].title
                        : chapters[activeChapter + 1].sections[0].title}
                    </span>
                  </button>
                ) : (
                  <Link
                    href="/ai-inference/tutorial/test"
                    className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--accent-strong)]"
                  >
                    Take final test
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
