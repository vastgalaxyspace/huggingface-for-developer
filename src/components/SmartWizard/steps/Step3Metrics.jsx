"use client";

import PrioritySlider from "../shared/PrioritySlider";

function ToggleBlock({ title, checked, onChange, offText, onText }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400">{title}</div>
          <p className="mt-2 text-sm text-gray-500">{checked ? onText : offText}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            checked ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          {checked ? "On" : "Off"}
        </button>
      </div>
    </div>
  );
}

export default function Step3Metrics({ state, updateMetrics }) {
  const priorities = [
    {
      key: "accuracy",
      label: "Accuracy / Quality",
      subtitle: "How important is the best possible output quality?",
      leftLabel: "Fast & Small",
      rightLabel: "Best Quality",
    },
    {
      key: "speed",
      label: "Speed / Latency",
      subtitle: "How critical is low response time?",
      leftLabel: "Quality First",
      rightLabel: "Speed First",
    },
    {
      key: "model_size",
      label: "Model Size",
      subtitle: "Prefer smaller, lighter models?",
      leftLabel: "Any Size",
      rightLabel: "Smallest Possible",
    },
    {
      key: "cost",
      label: "Cost Efficiency",
      subtitle: "How important is minimizing GPU/compute cost?",
      leftLabel: "Performance First",
      rightLabel: "Minimize Cost",
    },
    {
      key: "deployment",
      label: "Ease of Deployment",
      subtitle: "Prefer models with good tooling and documentation?",
      leftLabel: "Don't Care",
      rightLabel: "Easy Deploy",
    },
  ];

  const topPriority = priorities.reduce((best, item) =>
    state.metrics[item.key] > state.metrics[best.key] ? item : best,
  );

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <section>
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-gray-400">
          What Matters Most To You?
        </p>
        <p className="mb-6 text-sm text-gray-500">Drag sliders to set your priorities.</p>
        <div className="space-y-4">
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
        <p className="mt-4 text-sm text-gray-500">
          Your top priority: <span className="font-semibold text-gray-900">{topPriority.label}</span>
        </p>
      </section>

      <section>
        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">Preferences</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">License Type</div>
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
                  className={`rounded-full px-3 py-2 text-sm font-medium ${
                    state.metrics.license === item.id
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Minimum Quality Threshold
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Only show models with quality score above {state.metrics.min_quality}%
            </p>
            <div className="mt-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
              <span>0%</span>
              <span>Drag to adjust</span>
              <span>100%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={state.metrics.min_quality}
              onChange={(event) => updateMetrics({ min_quality: Number(event.target.value) })}
              aria-label="Minimum quality threshold"
              className="sr-only"
            />
            <div className="relative mt-2 h-8">
              <div className="absolute left-0 right-0 top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-slate-200" />
              <div
                className="absolute left-0 top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-[var(--accent)]"
                style={{ width: `${state.metrics.min_quality}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={state.metrics.min_quality}
                onChange={(event) => updateMetrics({ min_quality: Number(event.target.value) })}
                aria-label="Minimum quality threshold"
                className="smart-slider absolute inset-0 h-8 w-full appearance-none bg-transparent"
              />
            </div>
          </div>

          <ToggleBlock
            title="Fine-tuning"
            checked={state.metrics.needs_finetuning}
            onChange={(value) => updateMetrics({ needs_finetuning: value })}
            offText="Use pre-trained model as-is"
            onText="Must support fine-tuning / PEFT"
          />

          <ToggleBlock
            title="Quantization"
            checked={state.metrics.quantization_ok}
            onChange={(value) => updateMetrics({ quantization_ok: value })}
            offText="Full precision only (fp16/fp32)"
            onText="Accept INT8/INT4 quantized models"
          />
        </div>
      </section>
    </div>
  );
}
