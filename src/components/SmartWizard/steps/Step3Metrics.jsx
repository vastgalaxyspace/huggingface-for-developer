"use client";

import PrioritySlider from "../shared/PrioritySlider";

function ToggleBlock({ title, checked, onChange, offText, onText }) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/50 p-6 backdrop-blur-sm transition-all hover:border-slate-300">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{title}</div>
          <p className="mt-1 text-sm font-medium text-slate-600">{checked ? onText : offText}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`relative flex h-[28px] w-[52px] shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-in-out ${
            checked ? "bg-blue-600 shadow-[inset_0_1px_4px_rgba(0,0,0,0.2)]" : "bg-slate-200 shadow-[inset_0_1px_4px_rgba(0,0,0,0.1)]"
          }`}
        >
          <span
            className={`absolute left-1 h-[20px] w-[20px] transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
              checked ? "translate-x-[24px]" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

// SVG Radar Chart for visual feedback
function PriorityRadar({ metrics }) {
  const size = 160;
  const center = size / 2;
  const radius = 60;
  
  // 5 axes for the 5 metrics
  const axes = [
    { key: "accuracy", label: "Quality", angle: -Math.PI / 2 },
    { key: "speed", label: "Speed", angle: -Math.PI / 2 + (Math.PI * 2) / 5 },
    { key: "model_size", label: "Size", angle: -Math.PI / 2 + (Math.PI * 4) / 5 },
    { key: "cost", label: "Cost", angle: -Math.PI / 2 + (Math.PI * 6) / 5 },
    { key: "deployment", label: "Deploy", angle: -Math.PI / 2 + (Math.PI * 8) / 5 },
  ];

  // Calculate polygon points based on metric values (0-100)
  const points = axes.map((axis) => {
    const value = Math.max(metrics[axis.key], 10); // min 10% for visibility
    const r = (value / 100) * radius;
    return `${center + r * Math.cos(axis.angle)},${center + r * Math.sin(axis.angle)}`;
  });

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background webs */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => {
          const webPoints = axes.map((axis) => {
            const r = scale * radius;
            return `${center + r * Math.cos(axis.angle)},${center + r * Math.sin(axis.angle)}`;
          });
          return (
            <polygon
              key={scale}
              points={webPoints.join(" ")}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="0.5"
              strokeDasharray={scale === 1 ? "none" : "2 2"}
            />
          );
        })}
        
        {/* Axis lines */}
        {axes.map((axis) => (
          <line
            key={axis.key}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(axis.angle)}
            y2={center + radius * Math.sin(axis.angle)}
            stroke="#cbd5e1"
            strokeWidth="0.5"
          />
        ))}

        {/* The data polygon */}
        <polygon
          points={points.join(" ")}
          fill="rgba(37, 99, 235, 0.15)"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="transition-all duration-300 ease-out"
        />

        {/* Data points (dots) */}
        {axes.map((axis) => {
          const value = Math.max(metrics[axis.key], 10);
          const r = (value / 100) * radius;
          const cx = center + r * Math.cos(axis.angle);
          const cy = center + r * Math.sin(axis.angle);
          return (
            <circle
              key={`dot-${axis.key}`}
              cx={cx}
              cy={cy}
              r="3.5"
              fill="white"
              stroke="#2563eb"
              strokeWidth="1.5"
              className="transition-all duration-300 ease-out"
            />
          );
        })}

        {/* Axis labels */}
        {axes.map((axis) => {
          const labelRadius = radius + 22;
          const x = center + labelRadius * Math.cos(axis.angle);
          const y = center + labelRadius * Math.sin(axis.angle);
          return (
            <text
              key={`label-${axis.key}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-500 text-[10px] font-bold uppercase tracking-wider"
            >
              {axis.label}
            </text>
          );
        })}
      </svg>
      <div className="mt-8 text-center">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Profile Preview</div>
        <div className="mt-1 text-xs font-medium text-slate-500 max-w-[200px]">
          The engine will score models based on this shape.
        </div>
      </div>
    </div>
  );
}

export default function Step3Metrics({ state, updateMetrics }) {
  const priorities = [
    {
      key: "accuracy",
      label: "Accuracy / Quality",
      subtitle: "How important is best possible output?",
      leftLabel: "Not Important",
      rightLabel: "Crucial",
    },
    {
      key: "speed",
      label: "Speed / Latency",
      subtitle: "How critical is low response time?",
      leftLabel: "Not Important",
      rightLabel: "Crucial",
    },
    {
      key: "model_size",
      label: "Model Size",
      subtitle: "Prefer smaller, lighter models?",
      leftLabel: "Any Size OK",
      rightLabel: "Smallest Possible",
    },
    {
      key: "cost",
      label: "Cost Efficiency",
      subtitle: "Minimizing hardware/compute footprint?",
      leftLabel: "Performance First",
      rightLabel: "Cost First",
    },
    {
      key: "deployment",
      label: "Deployment & Trust",
      subtitle: "Well-documented, trusted models?",
      leftLabel: "Bleeding Edge",
      rightLabel: "Production Ready",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <section>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-500">
          Step 3
        </p>
        <h2 className="mb-6 text-xl font-black text-slate-900">What Matters Most?</h2>
        
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          {/* Sliders take up 2/3 */}
          <div className="flex-1 space-y-4">
            {priorities.map((priority) => (
              <PrioritySlider
                key={priority.key}
                label={priority.label}
                subtitle={priority.subtitle}
                value={state.metrics[priority.key]}
                onChange={(value) => updateMetrics({ [priority.key]: value })}
                leftLabel={priority.leftLabel}
                rightLabel={priority.rightLabel}
              />
            ))}
          </div>

          {/* Radar Chart takes up 1/3 (sticky on desktop) */}
          <div className="lg:sticky lg:top-8 lg:w-[280px] lg:shrink-0">
            <div className="rounded-3xl border border-slate-200/80 bg-white/50 p-6 backdrop-blur-sm shadow-sm hidden md:block">
              <PriorityRadar metrics={state.metrics} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/60 pt-10">
        <p className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Hard Filters</p>
        <div className="grid gap-6 md:grid-cols-2">
          
          <div className="rounded-3xl border border-slate-200/80 bg-white/50 p-6 backdrop-blur-sm pl-7 border-l-[3px] border-l-blue-500">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">License Required</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { id: "any", label: "Any License" },
                { id: "apache", label: "Apache 2.0" },
                { id: "mit", label: "MIT" },
                { id: "commercial_ok", label: "Commercial OK" },
                { id: "open_source", label: "Open Source Only" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateMetrics({ license: item.id })}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    state.metrics.license === item.id
                      ? "bg-slate-900 text-white shadow-md shadow-slate-300"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/50 p-6 backdrop-blur-sm pl-7 border-l-[3px] border-l-violet-500">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Minimum Quality Match
            </div>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Only show models scoring above <strong className="text-slate-900">{state.metrics.min_quality}%</strong>
            </p>
              <div className="relative pt-4 pb-1">
                <div className="relative mt-2 h-10 w-full rounded-full border border-slate-200/80 bg-white/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                  <div className="relative h-full w-full">
                    <div className="absolute left-[10px] right-[10px] top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
                    
                    <div
                      className="absolute left-[10px] top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-violet-500 transition-all duration-300 ease-out"
                      style={{ width: `calc(${state.metrics.min_quality}% * calc(100% - 20px) / 100)` }}
                    />

                    {[0, 25, 50, 75, 100].map((mark) => (
                      <div
                        key={mark}
                        className="pointer-events-none absolute top-1/2 h-[12px] w-[12px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-white transition-all duration-300"
                        style={{
                          left: `calc(10px + ${mark}% * calc(100% - 20px) / 100)`,
                          background: state.metrics.min_quality >= mark ? '#8b5cf6' : "#e2e8f0",
                        }}
                      />
                    ))}

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={state.metrics.min_quality}
                      onChange={(event) => updateMetrics({ min_quality: Number(event.target.value) })}
                      className="app-slider--overlay absolute left-0 top-0 h-full w-full bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              </div>
          </div>

          <ToggleBlock
            title="Fine-tuning"
            checked={state.metrics.needs_finetuning}
            onChange={(value) => updateMetrics({ needs_finetuning: value })}
            offText="Prefer pre-trained / instruct ready"
            onText="Must support PEFT / fine-tuning"
          />

          <ToggleBlock
            title="Quantization Acceptable"
            checked={state.metrics.quantization_ok}
            onChange={(value) => updateMetrics({ quantization_ok: value })}
            offText="Strict FP16 / FP32 only"
            onText="Accept INT4 / INT8 quantized models"
          />
        </div>
      </section>
    </div>
  );
}
