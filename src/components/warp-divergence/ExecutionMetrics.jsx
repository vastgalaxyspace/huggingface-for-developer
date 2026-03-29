"use client";

function getEfficiencyTone(efficiency) {
  if (efficiency === 100) return { text: "Perfect - no divergence", color: "text-green-600" };
  if (efficiency >= 75) return { text: "Good - minimal divergence", color: "text-green-500" };
  if (efficiency >= 50) return { text: "Moderate divergence", color: "text-yellow-500" };
  if (efficiency >= 25) return { text: "High divergence", color: "text-orange-500" };
  return { text: "Severe divergence", color: "text-red-500" };
}

export default function ExecutionMetrics({ analysis, expression, onCopy, copyStatus }) {
  const tone = getEfficiencyTone(analysis.efficiency);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">DETAILED METRICS</p>
          {copyStatus ? <p className="mt-1 text-xs text-gray-500">{copyStatus}</p> : null}
        </div>
        <button type="button" onClick={onCopy} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-600">
          Copy Metrics
        </button>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-3">
        <div className="space-y-2 text-sm text-gray-600">
          <p><span className="font-semibold text-gray-900">Efficiency Ratio:</span> <span className={tone.color}>{analysis.efficiency}%</span></p>
          <p><span className="font-semibold text-gray-900">Active Threads:</span> {analysis.active_count} / 32</p>
          <p><span className="font-semibold text-gray-900">Wasted Slots:</span> {analysis.wasted_slots}</p>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <p><span className="font-semibold text-gray-900">Execution Passes:</span> {analysis.num_passes}</p>
          <p><span className="font-semibold text-gray-900">Serialization Overhead:</span> {analysis.serialization_overhead}%</p>
          <p><span className="font-semibold text-gray-900">Threads Taking If-Branch:</span> {analysis.true_threads.length}</p>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <p><span className="font-semibold text-gray-900">Threads Taking Else-Branch:</span> {analysis.false_threads.length}</p>
          <p><span className="font-semibold text-gray-900">Branch Imbalance:</span> {analysis.branch_imbalance}%</p>
          <p><span className="font-semibold text-gray-900">Recommended Fix:</span> {analysis.recommended_fix}</p>
        </div>
      </div>

      <p className={`mt-5 text-sm font-semibold ${tone.color}`}>{tone.text}</p>
      <p className="mt-2 text-xs font-mono text-gray-400">Condition: {expression}</p>
    </div>
  );
}
