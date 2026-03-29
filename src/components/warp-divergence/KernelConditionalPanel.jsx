"use client";

const QUICK_EXAMPLES = [
  "x % 2 == 0",
  "x < 16",
  "x % 3 == 0",
  "x < 8",
  "x == 0",
  "x >= 8 && x < 24",
  "x % 4 == 0",
  "x >= 0",
];

function getEfficiencyColor(efficiency) {
  if (efficiency >= 75) return "text-green-600";
  if (efficiency >= 50) return "text-yellow-500";
  return "text-red-500";
}

export default function KernelConditionalPanel({
  expression,
  validation,
  analysis,
  onExpressionChange,
  onEvaluate,
  onQuickExample,
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">KERNEL CONDITIONAL</p>
        <div className="mt-4 space-y-4">
          <input
            value={expression}
            onChange={(event) => onExpressionChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onEvaluate();
            }}
            placeholder="if (threadIdx.x % 2 == 0)"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-sm text-gray-800 outline-none"
          />

          <button
            type="button"
            onClick={onEvaluate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all duration-300 ease-in-out hover:bg-gray-700"
          >
            <span>{">"}</span>
            EVALUATE PATH
          </button>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">QUICK EXAMPLES</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => onQuickExample(example)}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className={`text-sm font-medium ${validation.valid ? "text-green-600" : "text-red-500"}`}>
              {validation.valid ? "Valid expression" : validation.error}
            </p>
            {validation.warning ? <p className="mt-1 text-sm text-yellow-600">{validation.warning}</p> : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">EXECUTION METRICS</p>
        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-500">Efficiency Ratio</p>
          <p className={`mt-2 text-4xl font-black ${getEfficiencyColor(analysis.efficiency)}`}>{analysis.efficiency}%</p>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-gray-600">
            <p><span className="font-semibold text-gray-900">Active Threads:</span> {analysis.active_count}/32</p>
            <p><span className="font-semibold text-gray-900">Waiting Threads:</span> {analysis.waiting_count}/32</p>
            <p><span className="font-semibold text-gray-900">Passes:</span> {analysis.num_passes}</p>
            <p><span className="font-semibold text-gray-900">Overhead:</span> {analysis.serialization_overhead}% serialization</p>
          </div>
        </div>
      </div>
    </div>
  );
}
