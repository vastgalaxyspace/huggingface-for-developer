"use client";

import { OPTIMIZER_OPTIONS, PARALLELISM_OPTIONS, PRECISION_OPTIONS, clamp, formatParams } from "./utils";

const sectionLabel = "text-xs font-semibold uppercase tracking-widest text-gray-400";
const inputClassName =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900";

const ToggleGroup = ({ options, value, onChange }) => (
  <div className="inline-flex rounded-lg bg-gray-100 p-1">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={`rounded-md px-4 py-2 text-sm font-medium transition ${
          value === option.value ? "bg-gray-900 text-white" : "text-gray-600"
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const Field = ({ label, children, hint }) => (
  <label className="block space-y-2">
    <span className="text-sm font-medium text-gray-900">{label}</span>
    {children}
    {hint ? <span className="block text-xs text-gray-500">{hint}</span> : null}
  </label>
);

export default function ConfigPanel({ model, manualConfig, runtimeConfig, onManualChange, onRuntimeChange }) {
  if (!model) {
    return null;
  }

  const sliderMax = Math.max(512, model.maxSequenceLength || 32768);
  const missing = model.missingConfigFields || {};

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-8">
        <div>
          <p className={sectionLabel}>Precision</p>
          <div className="mt-4 space-y-4">
            <Field label="Model Precision">
              <select value={runtimeConfig.precision} onChange={(event) => onRuntimeChange("precision", event.target.value)} className={inputClassName}>
                {PRECISION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.bytes} bytes/param
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div>
          <p className={sectionLabel}>Runtime</p>
          <div className="mt-4 space-y-4">
            <Field label="Mode">
              <ToggleGroup
                options={[
                  { value: "inference", label: "Inference" },
                  { value: "training", label: "Training" }
                ]}
                value={runtimeConfig.mode}
                onChange={(value) => onRuntimeChange("mode", value)}
              />
            </Field>

            <Field label="Context Length (tokens)">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <input
                    type="range"
                    min={512}
                    max={sliderMax}
                    step={128}
                    value={clamp(runtimeConfig.sequenceLength, 512, sliderMax)}
                    onChange={(event) => onRuntimeChange("sequenceLength", Number(event.target.value))}
                    className="w-full accent-gray-900"
                  />
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-900">
                    {runtimeConfig.sequenceLength.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Range: 512 to {sliderMax.toLocaleString()} tokens</p>
              </div>
            </Field>

            <Field label="Batch Size">
              <input
                type="number"
                min={1}
                max={256}
                value={runtimeConfig.batchSize}
                onChange={(event) => onRuntimeChange("batchSize", clamp(Number(event.target.value) || 1, 1, 256))}
                className={inputClassName}
              />
            </Field>

            {runtimeConfig.mode === "training" ? (
              <div className="grid gap-4">
                <Field label="Optimizer">
                  <select value={runtimeConfig.optimizer} onChange={(event) => onRuntimeChange("optimizer", event.target.value)} className={inputClassName}>
                    {OPTIMIZER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="grid gap-3">
                  <label className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Gradient Checkpointing</p>
                      <p className="text-xs text-gray-500">Reduces activation memory by roughly 4x.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={runtimeConfig.gradientCheckpointing}
                      onChange={(event) => onRuntimeChange("gradientCheckpointing", event.target.checked)}
                      className="h-4 w-4 accent-gray-900"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Mixed Precision AMP</p>
                      <p className="text-xs text-gray-500">Keeps weights fp16 while optimizer states remain fp32.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={runtimeConfig.mixedPrecisionAmp}
                      onChange={(event) => onRuntimeChange("mixedPrecisionAmp", event.target.checked)}
                      className="h-4 w-4 accent-gray-900"
                    />
                  </label>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <p className={sectionLabel}>Hardware</p>
          <div className="mt-4 grid gap-4">
            <Field label="Number of GPUs">
              <input
                type="number"
                min={1}
                max={32}
                value={runtimeConfig.numGpus}
                onChange={(event) => onRuntimeChange("numGpus", clamp(Number(event.target.value) || 1, 1, 32))}
                className={inputClassName}
              />
            </Field>

            <Field label="Parallelism Strategy">
              <select value={runtimeConfig.parallelismStrategy} onChange={(event) => onRuntimeChange("parallelismStrategy", event.target.value)} className={inputClassName}>
                {PARALLELISM_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <label className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Include Framework Overhead</p>
                <p className="text-xs text-gray-500">Adds max(1 GB, subtotal x 0.12) to the estimate.</p>
              </div>
              <input
                type="checkbox"
                checked={runtimeConfig.includeFrameworkOverhead}
                onChange={(event) => onRuntimeChange("includeFrameworkOverhead", event.target.checked)}
                className="h-4 w-4 accent-gray-900"
              />
            </label>
          </div>
        </div>

        {Object.values(missing).some(Boolean) ? (
          <div>
            <p className={sectionLabel}>Manual Inputs</p>
            <div className="mt-4 grid gap-4">
              {missing.parameters ? (
                <Field label="Total Parameters" hint={`Enter raw parameter count. Example: ${formatParams(8030000000)}`}>
                  <input
                    type="number"
                    min={1}
                    value={manualConfig.parameters}
                    onChange={(event) => onManualChange("parameters", event.target.value)}
                    className={inputClassName}
                    placeholder="8030000000"
                  />
                </Field>
              ) : null}

              {missing.layers ? (
                <Field label="Layers">
                  <input type="number" min={1} value={manualConfig.layers} onChange={(event) => onManualChange("layers", event.target.value)} className={inputClassName} />
                </Field>
              ) : null}

              {missing.attentionHeads ? (
                <Field label="Attention Heads">
                  <input type="number" min={1} value={manualConfig.attentionHeads} onChange={(event) => onManualChange("attentionHeads", event.target.value)} className={inputClassName} />
                </Field>
              ) : null}

              {missing.kvHeads ? (
                <Field label="KV Heads">
                  <input type="number" min={1} value={manualConfig.kvHeads} onChange={(event) => onManualChange("kvHeads", event.target.value)} className={inputClassName} />
                </Field>
              ) : null}

              {missing.hiddenSize ? (
                <Field label="Hidden Size">
                  <input type="number" min={1} value={manualConfig.hiddenSize} onChange={(event) => onManualChange("hiddenSize", event.target.value)} className={inputClassName} />
                </Field>
              ) : null}

              {!model.configAvailable ? (
                <Field label="Max Sequence Length">
                  <input
                    type="number"
                    min={512}
                    value={manualConfig.maxSequenceLength}
                    onChange={(event) => onManualChange("maxSequenceLength", event.target.value)}
                    className={inputClassName}
                    placeholder="32768"
                  />
                </Field>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
