import { useState } from 'react';
import { Settings, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

const importanceColors = {
  critical: 'border-red-200 bg-red-50',
  high: 'border-amber-200 bg-amber-50',
  medium: 'border-blue-200 bg-blue-50',
  low: 'border-gray-200 bg-gray-50',
};

const importanceBadge = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-amber-100 text-amber-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-gray-100 text-gray-500',
};

const ParamCard = ({ param, value }) => {
  const [open, setOpen] = useState(false);
  const displayValue = value !== null && value !== undefined ? String(typeof value === 'object' ? JSON.stringify(value) : value) : 'Not specified';

  return (
    <div className={`rounded-xl border p-3.5 transition-shadow hover:shadow-sm ${importanceColors[param.importance] || importanceColors.low}`}>
      <div className="flex items-start justify-between cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[13px] font-bold text-[var(--text-strong)]">{param.label}</p>
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${importanceBadge[param.importance] || importanceBadge.low}`}>
              {param.importance}
            </span>
          </div>
          <p className="text-[14px] font-bold text-[var(--accent)]">{displayValue}</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-[var(--text-faint)]" /> : <ChevronDown className="h-4 w-4 text-[var(--text-faint)]" />}
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-[rgba(0,0,0,0.06)] space-y-2">
          <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">{param.explanation}</p>
          {param.devNote && (
            <div className="rounded-lg bg-[rgba(0,0,0,0.03)] p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                <p className="text-[11px] font-bold text-[var(--text-strong)]">Developer Note</p>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{param.devNote}</p>
            </div>
          )}
          {param.impact && <p className="text-[11px] text-[var(--text-faint)]"><strong>Impact:</strong> {param.impact}</p>}
          {param.example && <p className="text-[11px] text-[var(--text-faint)]"><strong>Example:</strong> {param.example}</p>}
        </div>
      )}
    </div>
  );
};

const ParametersSection = ({ parameterCategories, config }) => {
  const [expandedCat, setExpandedCat] = useState(null);

  if (!parameterCategories || !config) return null;

  const configKeys = Object.keys(config).filter(k => config[k] !== null && config[k] !== undefined);
  const totalParams = configKeys.length;
  const toggleCat = (cat) => setExpandedCat(expandedCat === cat ? null : cat);

  return (
    <section id="section-params" className="mb-10 fade-in-section scroll-mt-28">
      <div className="flex items-center gap-2 mb-1">
        <Settings className="h-5 w-5 text-[var(--accent)]" />
        <h2 className="text-[1.5rem] font-black tracking-tight text-[var(--text-strong)]">
          Model Parameters Explained
        </h2>
        <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--accent)]">{totalParams} params</span>
      </div>
      <p className="mb-5 text-[13px] text-[var(--text-faint)]">
        Every configuration parameter explained with developer context and deployment impact.
        Click any parameter to expand its explanation.
      </p>

      <div className="space-y-4">
        {Object.entries(parameterCategories).map(([category, params]) => {
          const isOpen = expandedCat === category || expandedCat === null;
          const relevantParams = params.filter(p => config[p.key] !== null && config[p.key] !== undefined);
          if (relevantParams.length === 0) return null;

          return (
            <div key={category} className="rounded-[22px] border border-[var(--border-soft)] bg-white overflow-hidden">
              <button
                onClick={() => toggleCat(category)}
                className="w-full flex items-center justify-between px-5 py-4 bg-[rgba(245,248,252,0.92)] hover:bg-[rgba(235,240,248,0.92)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <h4 className="text-[13px] font-bold text-[var(--text-strong)]">{category}</h4>
                  <span className="rounded-full bg-[rgba(0,0,0,0.06)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-faint)]">{relevantParams.length}</span>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-[var(--text-faint)]" /> : <ChevronDown className="h-4 w-4 text-[var(--text-faint)]" />}
              </button>

              {isOpen && (
                <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
                  {relevantParams.map(param => (
                    <ParamCard key={param.key} param={param} value={config[param.key]} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ParametersSection;
