import { useState } from 'react';
import { Code, Copy, Check, Layers, Zap, Box, Terminal, Globe } from 'lucide-react';

const frameworkIcons = {
  transformers: <Layers className="h-3.5 w-3.5" />,
  vllm: <Zap className="h-3.5 w-3.5" />,
  ollama: <Box className="h-3.5 w-3.5" />,
  llamacpp: <Terminal className="h-3.5 w-3.5" />,
  curl: <Globe className="h-3.5 w-3.5" />,
};

const CodeSnippetsSection = ({ codeSnippets, frameworks, modelId }) => {
  const [activeTab, setActiveTab] = useState('transformers');
  const [copied, setCopied] = useState(false);

  if (!codeSnippets || !frameworks) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="section-code" className="mb-14">
      <div className="flex items-center gap-2 mb-1">
        <Code className="h-5 w-5 text-[var(--accent)]" />
        <h2 className="text-[1.6rem] font-black tracking-tight text-[var(--text-strong)]">Usage Examples</h2>
        <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--accent)]">{frameworks.length} snippets</span>
      </div>
      <p className="mb-5 text-[13px] text-[var(--text-faint)]">Ready-to-use code snippets for {modelId}</p>

      <div className="overflow-hidden rounded-[22px] border border-[var(--border-soft)] bg-white shadow-[0_10px_24px_rgba(59,83,114,0.05)]">
        <div className="flex flex-wrap border-b border-[var(--border-soft)] bg-[rgba(245,248,252,0.6)]">
          {frameworks.map(fw => (
            <button
              key={fw.id}
              onClick={() => setActiveTab(fw.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-[12px] font-bold transition-colors ${
                activeTab === fw.id
                  ? 'border-b-2 border-[var(--accent)] text-[var(--accent)] bg-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[rgba(0,0,0,0.02)]'
              }`}
            >
              {frameworkIcons[fw.id] || <Code className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{fw.name}</span>
              <span className="sm:hidden">{fw.id}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-5 py-3">
          <p className="text-[11px] font-bold text-[var(--text-muted)]">
            {frameworks.find(f => f.id === activeTab)?.description}
          </p>
          <button
            onClick={() => handleCopy(codeSnippets[activeTab] || '')}
            className="flex items-center gap-1.5 rounded-lg bg-[rgba(0,0,0,0.04)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] transition-colors hover:bg-[rgba(0,0,0,0.08)] hover:text-[var(--text-strong)]"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>
        <div className="overflow-x-auto bg-[#0f172a] p-5">
          <pre className="text-[12px] leading-relaxed text-[#e2e8f0]">
            <code>{codeSnippets[activeTab] || '// No snippet available for this framework'}</code>
          </pre>
        </div>
      </div>
    </section>
  );
};

export default CodeSnippetsSection;
