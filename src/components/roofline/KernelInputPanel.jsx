"use client";

import { ChevronDown, Plus, Sparkles, Trash2 } from "lucide-react";
import { KERNEL_COLORS, formatCompactNumber } from "../../hooks/useRooflineModel";

const FLOP_UNITS = [
  { id: "flop", label: "FLOPs", scale: 1 },
  { id: "kflop", label: "KFLOPs", scale: 1e3 },
  { id: "mflop", label: "MFLOPs", scale: 1e6 },
  { id: "gflop", label: "GFLOPs", scale: 1e9 },
  { id: "tflop", label: "TFLOPs", scale: 1e12 },
];

const BYTE_UNITS = [
  { id: "byte", label: "Bytes", scale: 1 },
  { id: "kb", label: "KB", scale: 1e3 },
  { id: "mb", label: "MB", scale: 1e6 },
  { id: "gb", label: "GB", scale: 1e9 },
  { id: "tb", label: "TB", scale: 1e12 },
];

const TIME_UNITS = [
  { id: "us", label: "μs", scale: 1 / 1000 },
  { id: "ms", label: "ms", scale: 1 },
  { id: "s", label: "s", scale: 1000 },
];

const ELEM_BYTES = [
  { id: "fp16", label: "FP16/BF16 (2B)", value: 2 },
  { id: "fp32", label: "FP32 (4B)", value: 4 },
  { id: "fp64", label: "FP64 (8B)", value: 8 },
  { id: "int8", label: "INT8 (1B)", value: 1 },
];

const quickPresets = [
  { id: "sgemm", label: "cuBLAS SGEMM", ai: 10.2, performanceFactor: 0.6 },
  { id: "flashattention", label: "FlashAttention", ai: 1.5, performanceFactor: 0.42 },
  { id: "gelu", label: "GELU Activation", ai: 0.5, performanceFactor: 0.18 },
  { id: "layernorm", label: "Layer Norm", ai: 0.8, performanceFactor: 0.22 },
  { id: "conv2d", label: "Conv2D", ai: 3.0, performanceFactor: 0.34 },
  { id: "reduction", label: "Reduction", ai: 0.25, performanceFactor: 0.12 },
];

function getScale(units, id) {
  return units.find((unit) => unit.id === id)?.scale || 1;
}

function toBaseValue(value, unitId, units) {
  const safe = Number(value) || 0;
  return safe * getScale(units, unitId);
}

function fromBaseValue(value, unitId, units) {
  return value / getScale(units, unitId);
}

function numberInput(value) {
  return Number.isFinite(value) && value > 0 ? value : "";
}

function computePresetMetrics(type, fields) {
  const bytesPerElem = Number(fields.bytesPerElem) || 2;
  if (type === "gemm") {
    const m = Number(fields.m) || 0;
    const n = Number(fields.n) || 0;
    const k = Number(fields.k) || 0;
    const flops = 2 * m * n * k;
    const bytes = bytesPerElem * (m * k + k * n + m * n) * 2;
    return { flops, bytes };
  }
  if (type === "convolution") {
    const batch = Number(fields.batch) || 0;
    const cin = Number(fields.cin) || 0;
    const cout = Number(fields.cout) || 0;
    const height = Number(fields.height) || 0;
    const width = Number(fields.width) || 0;
    const kh = Number(fields.kh) || 0;
    const kw = Number(fields.kw) || 0;
    const hOut = Math.max(1, height - kh + 1);
    const wOut = Math.max(1, width - kw + 1);
    const flops = 2 * batch * cout * hOut * wOut * cin * kh * kw;
    const input = batch * cin * height * width;
    const filter = cout * cin * kh * kw;
    const output = batch * cout * hOut * wOut;
    const bytes = bytesPerElem * (input + filter + output);
    return { flops, bytes };
  }
  if (type === "elementwise") {
    const elements = Number(fields.elements) || 0;
    const opsPerElement = Number(fields.opsPerElement) || 0;
    const flops = elements * opsPerElement;
    const bytes = elements * bytesPerElem * 2;
    return { flops, bytes };
  }
  if (type === "reduction") {
    const elements = Number(fields.elements) || 0;
    const flops = elements;
    const bytes = elements * bytesPerElem * 2;
    return { flops, bytes };
  }
  if (type === "attention") {
    const seqLen = Number(fields.seqLen) || 0;
    const numHeads = Number(fields.numHeads) || 0;
    const headDim = Number(fields.headDim) || 0;
    const batchSize = Number(fields.batchSize) || 0;
    const flops = 4 * batchSize * seqLen * seqLen * numHeads * headDim;
    const tensor = batchSize * seqLen * numHeads * headDim;
    const bytes = bytesPerElem * tensor * 4;
    return { flops, bytes };
  }
  if (type === "custom") {
    const ai = Number(fields.ai) || 0;
    const gflops = Number(fields.gflops) || 0;
    const timeMs = 1;
    const flops = gflops * 1e9 * (timeMs / 1000);
    const bytes = ai > 0 ? flops / ai : 0;
    return { flops, bytes, timeMs };
  }
  return { flops: 0, bytes: 0 };
}

function FieldLabel({ children }) {
  return <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{children}</label>;
}

function ValueTile({ label, value, suffix }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-black text-gray-900">{value}</span>
        <span className="pb-1 text-xs text-gray-400">{suffix}</span>
      </div>
    </div>
  );
}

function NumericField({ label, value, onChange }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input value={value} onChange={onChange} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
    </div>
  );
}

function UnitInputRow({ value, placeholder, onValueChange, unitValue, onUnitChange, units, unitWidth = "w-32" }) {
  return (
    <div className="mt-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
      <input
        value={value}
        placeholder={placeholder}
        onChange={onValueChange}
        className="min-w-0 rounded-xl border border-gray-200 px-4 py-3 text-sm"
      />
      <select
        value={unitValue}
        onChange={onUnitChange}
        className={`${unitWidth} shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm`}
      >
        {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.label}</option>)}
      </select>
    </div>
  );
}

export default function KernelInputPanel({
  gpu,
  primaryRoofline,
  kernels,
  draftState,
  onChangeDraftState,
  onPlotKernel,
  onQuickPreset,
  onAddCurrentKernel,
  onRenameKernel,
  onRemoveKernel,
}) {
  const directFlops = toBaseValue(draftState.direct.flopsValue, draftState.direct.flopsUnit, FLOP_UNITS);
  const directBytes = toBaseValue(draftState.direct.bytesValue, draftState.direct.bytesUnit, BYTE_UNITS);
  const directTimeMs = toBaseValue(draftState.direct.timeValue, draftState.direct.timeUnit, TIME_UNITS);
  const directAI = directBytes > 0 ? directFlops / directBytes : 0;
  const directPerf = directTimeMs > 0 ? directFlops / (directTimeMs / 1000) / 1e9 : 0;

  const presetMetrics = computePresetMetrics(draftState.modePreset, draftState.presetFields[draftState.modePreset]);
  const presetTimeMs = presetMetrics.timeMs || 1;
  const presetAI = presetMetrics.bytes > 0 ? presetMetrics.flops / presetMetrics.bytes : 0;
  const presetPerf = presetMetrics.flops > 0 ? presetMetrics.flops / (presetTimeMs / 1000) / 1e9 : 0;
  const computed = draftState.mode === "direct"
    ? { flops: directFlops, bytes: directBytes, timeMs: directTimeMs, ai: directAI, perf: directPerf }
    : { flops: presetMetrics.flops, bytes: presetMetrics.bytes, timeMs: presetTimeMs, ai: presetAI, perf: presetPerf };

  const canPlot = computed.flops > 0 && computed.bytes > 0 && computed.timeMs > 0;
  const updateDirect = (field, value) => onChangeDraftState({ ...draftState, direct: { ...draftState.direct, [field]: value } });
  const updatePresetFields = (field, value) => onChangeDraftState({
    ...draftState,
    presetFields: {
      ...draftState.presetFields,
      [draftState.modePreset]: {
        ...draftState.presetFields[draftState.modePreset],
        [field]: value,
      },
    },
  });

  const syncDirectFromPreset = () => {
    onChangeDraftState({
      ...draftState,
      direct: {
        ...draftState.direct,
        flopsUnit: "gflop",
        flopsValue: numberInput(fromBaseValue(presetMetrics.flops, "gflop", FLOP_UNITS)),
        bytesUnit: "mb",
        bytesValue: numberInput(fromBaseValue(presetMetrics.bytes, "mb", BYTE_UNITS)),
        timeUnit: "ms",
        timeValue: numberInput(presetTimeMs),
      },
    });
  };

  const fields = draftState.presetFields[draftState.modePreset];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Kernel Input</p>
          <h3 className="mt-2 text-3xl font-black text-gray-900">Kernel Metrics</h3>
        </div>
        <button
          type="button"
          onClick={() => onChangeDraftState({ ...draftState, collapsed: !draftState.collapsed })}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-700 transition-all duration-150 hover:border-gray-900"
        >
          {draftState.collapsed ? "Expand" : "Collapse"}
          <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${draftState.collapsed ? "-rotate-90" : ""}`} />
        </button>
      </div>

      {!draftState.collapsed ? (
        <div className="mt-6 space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Quick Presets</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onQuickPreset(preset)}
                  className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-700 transition-all duration-150 hover:border-gray-900"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "direct", label: "Direct Metrics" },
              { id: "preset", label: "Kernel Type Preset" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onChangeDraftState({ ...draftState, mode: option.id })}
                className={`rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-150 ${
                  draftState.mode === option.id ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {draftState.mode === "direct" ? (
            <div className="space-y-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Kernel Metrics</p>
              <div className="grid gap-4 xl:grid-cols-3">
                <div>
                  <FieldLabel>Total FLOPs</FieldLabel>
                  <UnitInputRow
                    value={draftState.direct.flopsValue}
                    placeholder="e.g. 1.5"
                    onValueChange={(event) => updateDirect("flopsValue", event.target.value)}
                    unitValue={draftState.direct.flopsUnit}
                    onUnitChange={(event) => updateDirect("flopsUnit", event.target.value)}
                    units={FLOP_UNITS}
                    unitWidth="w-32"
                  />
                </div>
                <div>
                  <FieldLabel>Memory Traffic</FieldLabel>
                  <UnitInputRow
                    value={draftState.direct.bytesValue}
                    placeholder="e.g. 400"
                    onValueChange={(event) => updateDirect("bytesValue", event.target.value)}
                    unitValue={draftState.direct.bytesUnit}
                    onUnitChange={(event) => updateDirect("bytesUnit", event.target.value)}
                    units={BYTE_UNITS}
                    unitWidth="w-28"
                  />
                </div>
                <div>
                  <FieldLabel>Kernel Time</FieldLabel>
                  <UnitInputRow
                    value={draftState.direct.timeValue}
                    placeholder="e.g. 2.5"
                    onValueChange={(event) => updateDirect("timeValue", event.target.value)}
                    unitValue={draftState.direct.timeUnit}
                    onUnitChange={(event) => updateDirect("timeUnit", event.target.value)}
                    units={TIME_UNITS}
                    unitWidth="w-24"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <FieldLabel>Kernel Type</FieldLabel>
                  <select value={draftState.modePreset} onChange={(event) => onChangeDraftState({ ...draftState, modePreset: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                    <option value="gemm">GEMM (Matrix Multiply)</option>
                    <option value="convolution">Convolution</option>
                    <option value="elementwise">Element-wise</option>
                    <option value="reduction">Reduction</option>
                    <option value="attention">Self-Attention</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <button type="button" onClick={syncDirectFromPreset} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-700 transition-all duration-150 hover:border-gray-900">
                  <Sparkles className="h-4 w-4" />
                  Fill Direct Metrics
                </button>
              </div>

              {draftState.modePreset === "gemm" ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {["m", "n", "k"].map((field) => <NumericField key={field} label={field.toUpperCase()} value={fields[field]} onChange={(event) => updatePresetFields(field, event.target.value)} />)}
                  <div>
                    <FieldLabel>Precision</FieldLabel>
                    <select value={fields.bytesPerElem} onChange={(event) => updatePresetFields("bytesPerElem", event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                      {ELEM_BYTES.map((option) => <option key={option.id} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                </div>
              ) : null}

              {draftState.modePreset === "convolution" ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["batch", "Batch"],
                    ["cin", "C_in"],
                    ["cout", "C_out"],
                    ["height", "H"],
                    ["width", "W"],
                    ["kh", "KH"],
                    ["kw", "KW"],
                  ].map(([field, label]) => <NumericField key={field} label={label} value={fields[field]} onChange={(event) => updatePresetFields(field, event.target.value)} />)}
                  <div>
                    <FieldLabel>Precision</FieldLabel>
                    <select value={fields.bytesPerElem} onChange={(event) => updatePresetFields("bytesPerElem", event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                      {ELEM_BYTES.map((option) => <option key={option.id} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                </div>
              ) : null}

              {draftState.modePreset === "elementwise" ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <NumericField label="Tensor Size" value={fields.elements} onChange={(event) => updatePresetFields("elements", event.target.value)} />
                  <NumericField label="Ops / Element" value={fields.opsPerElement} onChange={(event) => updatePresetFields("opsPerElement", event.target.value)} />
                  <div>
                    <FieldLabel>Precision</FieldLabel>
                    <select value={fields.bytesPerElem} onChange={(event) => updatePresetFields("bytesPerElem", event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                      {ELEM_BYTES.map((option) => <option key={option.id} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                </div>
              ) : null}

              {draftState.modePreset === "reduction" ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <NumericField label="Tensor Size" value={fields.elements} onChange={(event) => updatePresetFields("elements", event.target.value)} />
                  <NumericField label="Reduction Dim" value={fields.reductionDim} onChange={(event) => updatePresetFields("reductionDim", event.target.value)} />
                  <div>
                    <FieldLabel>Precision</FieldLabel>
                    <select value={fields.bytesPerElem} onChange={(event) => updatePresetFields("bytesPerElem", event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                      {ELEM_BYTES.map((option) => <option key={option.id} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                </div>
              ) : null}

              {draftState.modePreset === "attention" ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  {[
                    ["seqLen", "Seq Len"],
                    ["numHeads", "Heads"],
                    ["headDim", "Head Dim"],
                    ["batchSize", "Batch"],
                  ].map(([field, label]) => <NumericField key={field} label={label} value={fields[field]} onChange={(event) => updatePresetFields(field, event.target.value)} />)}
                  <div>
                    <FieldLabel>Precision</FieldLabel>
                    <select value={fields.bytesPerElem} onChange={(event) => updatePresetFields("bytesPerElem", event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                      {ELEM_BYTES.map((option) => <option key={option.id} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                </div>
              ) : null}

              {draftState.modePreset === "custom" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <NumericField label="AI Value" value={fields.ai} onChange={(event) => updatePresetFields("ai", event.target.value)} />
                  <NumericField label="Achieved GFLOP/s" value={fields.gflops} onChange={(event) => updatePresetFields("gflops", event.target.value)} />
                </div>
              ) : null}

              {draftState.modePreset === "elementwise" ? <p className="text-sm text-gray-500">Always memory bound. Typical AI is around 0.5-2 FLOP/B.</p> : null}
              {draftState.modePreset === "reduction" ? <p className="text-sm text-gray-500">Reductions are usually memory bound with AI around 0.5-1 FLOP/B.</p> : null}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <ValueTile label="Arithmetic Intensity" value={formatCompactNumber(computed.ai, 2)} suffix="FLOP/B" />
            <ValueTile label="Achieved Performance" value={formatCompactNumber(computed.perf, 2)} suffix="GFLOP/s" />
          </div>

          <button
            type="button"
            onClick={() => onPlotKernel({
              name: draftState.kernelName || `${gpu.shortName} Kernel`,
              flops: computed.flops,
              bytes: computed.bytes,
              timeMs: computed.timeMs,
            })}
            disabled={!canPlot}
            className="w-full rounded-xl bg-[#12243b] px-4 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all duration-150 hover:bg-[#0d1c2d] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Plot Kernel
          </button>

          <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Multi-Kernel Section</p>
                <p className="mt-2 text-sm text-gray-500">Add up to five kernels and compare them against the same active rooflines.</p>
              </div>
              <button
                type="button"
                disabled={!canPlot || kernels.length >= 5}
                onClick={() => onAddCurrentKernel({
                  name: `Kernel ${kernels.length + 1}`,
                  flops: computed.flops,
                  bytes: computed.bytes,
                  timeMs: computed.timeMs,
                })}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-700 transition-all duration-150 hover:border-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add Another Kernel
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {kernels.map((kernel, index) => (
                <div key={kernel.id} className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-[minmax(0,1.4fr)_0.7fr_0.7fr_auto_auto] md:items-center">
                  <input
                    value={kernel.name}
                    onChange={(event) => onRenameKernel(kernel.id, event.target.value)}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900"
                  />
                  <div className="text-sm text-gray-600">AI: {formatCompactNumber(kernel.arithmetic_intensity, 2)}</div>
                  <div className="text-sm text-gray-600">Perf: {formatCompactNumber(kernel.achieved_gflops, 2)}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: kernel.color || KERNEL_COLORS[index % KERNEL_COLORS.length] }} />
                    color
                  </div>
                  <button type="button" onClick={() => onRemoveKernel(kernel.id)} className="inline-flex justify-center rounded-xl border border-gray-200 p-2 text-gray-500 transition-all duration-150 hover:border-red-300 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {!kernels.length ? <p className="text-sm text-gray-500">No kernels plotted yet.</p> : null}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-500">
            GPU note: {gpu.note || `HBM bandwidth ${formatCompactNumber(primaryRoofline.bandwidth, 0)} GB/s with ridge point at ${formatCompactNumber(primaryRoofline.ridge_point_x, 2)} FLOP/B.`}
          </div>
        </div>
      ) : null}
    </div>
  );
}
