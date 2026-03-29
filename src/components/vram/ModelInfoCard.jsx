"use client";

import { formatNumber, formatParams, getPrecisionBadgeClasses, toTitleCase } from "./utils";

const Field = ({ label, value, badgeClassName }) => (
  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
    {badgeClassName ? (
      <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${badgeClassName}`}>{value}</span>
    ) : (
      <p className="mt-3 text-sm font-semibold text-gray-900">{value}</p>
    )}
  </div>
);

export default function ModelInfoCard({ model }) {
  if (!model) {
    return null;
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Model Details</p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">Resolved model information</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Model ID" value={model.modelId} />
        <Field label="Architecture" value={toTitleCase(model.architecture)} />
        <Field label="Total Parameters" value={formatParams(model.parameters)} />
        <Field label="Layers" value={formatNumber(model.layers)} />
        <Field label="Attention Heads" value={formatNumber(model.attentionHeads)} />
        <Field label="KV Heads" value={formatNumber(model.kvHeads)} />
        <Field label="Hidden Size" value={formatNumber(model.hiddenSize)} />
        <Field label="Max Sequence Length" value={formatNumber(model.maxSequenceLength)} />
        <Field label="Detected Precision" value={model.precision} badgeClassName={getPrecisionBadgeClasses(model.precision)} />
        <Field label="Library" value={toTitleCase(model.library)} />
      </div>
    </section>
  );
}

