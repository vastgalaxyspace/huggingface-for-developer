"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Settings, BookOpen, ChevronLeft, ArrowLeft, Menu, X } from 'lucide-react';
import { TUTORIAL_CHAPTERS } from '../../../src/data/inference-tutorial-data';

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
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Derive the active objects
  const chapter = TUTORIAL_CHAPTERS[activeChapter];
  const section = chapter?.sections[activeSection];

  // Auto-close sidebar on mobile after selection
  const handleSelectSection = (cIdx, sIdx) => {
    setActiveChapter(cIdx);
    setActiveSection(sIdx);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            <h2 className="font-bold text-[var(--text-strong)] text-[1.1rem] tracking-tight">AI Inference <span className="text-[var(--text-muted)] font-normal ml-0.5">Tutorial</span></h2>
          </div>

          <nav className="flex flex-col gap-6">
            {TUTORIAL_CHAPTERS.map((ch, cIndex) => (
              <div key={ch.id}>
                <div className="text-xs font-bold text-[var(--text-faint)] uppercase tracking-widest mb-3 pl-2">
                  {ch.number}. {ch.title}
                </div>
                <div className="flex flex-col gap-1">
                  {ch.sections.map((sec, sIndex) => {
                    const isActive = activeChapter === cIndex && activeSection === sIndex;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => handleSelectSection(cIndex, sIndex)}
                        className={`text-left px-3 py-2 rounded-lg text-[0.88rem] transition-colors ${
                          isActive
                            ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold border border-[rgba(54,87,132,0.15)]'
                            : 'text-[var(--text-main)] hover:bg-[var(--panel-muted)] hover:text-[var(--text-strong)] border border-transparent'
                        }`}
                      >
                        {sec.title}
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
        <div className="max-w-4xl mx-auto px-6 py-10 md:py-16 md:px-12 lg:px-20">
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
                        handleSelectSection(prevChap, TUTORIAL_CHAPTERS[prevChap].sections.length - 1);
                      }
                    }}
                    className="flex flex-col items-start p-4 hover:bg-[var(--panel-muted)] rounded-xl transition-colors min-w-[120px] border border-transparent hover:border-[var(--border-soft)]"
                  >
                    <span className="text-xs font-bold text-[var(--text-muted)] mb-1 flex items-center gap-1">
                      <ChevronLeft className="w-3 h-3" /> PREVIOUS
                    </span>
                    <span className="text-[var(--text-strong)] font-medium text-sm text-left line-clamp-1">
                      {activeSection > 0 
                        ? TUTORIAL_CHAPTERS[activeChapter].sections[activeSection - 1].title
                        : TUTORIAL_CHAPTERS[activeChapter - 1].sections[TUTORIAL_CHAPTERS[activeChapter - 1].sections.length - 1].title}
                    </span>
                  </button>
                ) : (
                  <div></div>
                )}

                {/* Next Button */}
                {(activeSection < chapter.sections.length - 1) || (activeChapter < TUTORIAL_CHAPTERS.length - 1) ? (
                  <button
                    onClick={() => {
                      if (activeSection < chapter.sections.length - 1) {
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
                      {activeSection < chapter.sections.length - 1
                        ? chapter.sections[activeSection + 1].title
                        : TUTORIAL_CHAPTERS[activeChapter + 1].sections[0].title}
                    </span>
                  </button>
                ) : (
                  <Link
                    href="/ai-inference"
                    className="flex bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-white px-6 py-3 rounded-full font-bold transition-colors text-sm"
                  >
                    Finish Tutorial
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
