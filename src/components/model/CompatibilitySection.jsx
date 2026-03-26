import { Puzzle, CheckCircle, XCircle, Box, Zap, Terminal, Rocket, Layers } from 'lucide-react';

const frameworkIcons = {
  transformers: <Layers className="h-4 w-4 text-amber-600" />,
  vllm: <Zap className="h-4 w-4 text-blue-500" />,
  ollama: <Box className="h-4 w-4 text-emerald-500" />,
  llamacpp: <Terminal className="h-4 w-4 text-gray-600" />,
  tensorrt: <Rocket className="h-4 w-4 text-green-600" />,
};

const confidenceColor = (c) => {
  if (c >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (c >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

const CompatibilitySection = ({ compatibility }) => {
  if (!compatibility) return null;
  const { frameworks, features } = compatibility;

  return (
    <section id="section-compatibility" className="mb-14">
      <div className="flex items-center gap-2 mb-1">
        <Puzzle className="h-5 w-5 text-[var(--accent)]" />
        <h2 className="text-[1.6rem] font-black tracking-tight text-[var(--text-strong)]">Framework Compatibility</h2>
      </div>
      <p className="mb-5 text-[13px] text-[var(--text-faint)]">Compatibility with popular inference frameworks and tools</p>

      {frameworks && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {Object.entries(frameworks).map(([key, fw]) => (
            <div key={key} className="rounded-[18px] border border-[var(--border-soft)] bg-white p-4 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {frameworkIcons[key] || <Layers className="h-4 w-4 text-gray-500" />}
                  <h4 className="text-[13px] font-bold text-[var(--text-strong)]">{fw.name}</h4>
                </div>
                {fw.compatible
                  ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                  : <XCircle className="h-4 w-4 text-red-400" />}
              </div>
              <div className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${confidenceColor(fw.confidence)}`}>
                {fw.confidence}% confidence
              </div>
              {fw.notes && (
                <ul className="mt-3 space-y-1">
                  {fw.notes.slice(0, 3).map((n, i) => (
                    <li key={i} className="text-[11px] text-[var(--text-muted)] flex items-start gap-1.5">
                      <span className="mt-1.5 block h-1 w-1 rounded-full bg-[var(--text-faint)]" />{n}
                    </li>
                  ))}
                </ul>
              )}
              {fw.installCmd && (
                <code className="mt-3 block rounded-lg bg-[#0f172a] px-3 py-2 text-[10px] text-[#e2e8f0] overflow-x-auto">{fw.installCmd}</code>
              )}
            </div>
          ))}
        </div>
      )}

      {features && (
        <div className="rounded-[22px] border border-[var(--border-soft)] bg-white p-5">
          <h4 className="mb-4 text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">Advanced Features</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(features).map(([key, feat]) => (
              <div key={key} className={`flex items-start gap-2 rounded-xl border p-3 ${feat.supported ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
                {feat.supported ? <CheckCircle className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" /> : <XCircle className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />}
                <div>
                  <p className="text-[12px] font-bold text-[var(--text-strong)]">{feat.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">{feat.benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default CompatibilitySection;
