import ScoreBreakdownTooltip from "./ScoreBreakdownTooltip";

function getStatus(result) {
  if (result.badges.includes("Outside Budget")) return "OUTSIDE BUDGET";
  if (result.multi_gpu_needed) return "MULTI-GPU";
  if (result.rank <= 3) return "RECOMMENDED";
  return "ALTERNATIVE";
}

function getScoreBarClass(score) {
  if (score > 75) return "bg-emerald-500";
  if (score >= 50) return "bg-yellow-400";
  return "bg-gray-400";
}

function getUsageBarClass(pct) {
  if (pct > 95) return "bg-red-400";
  if (pct >= 80) return "bg-yellow-400";
  return "bg-emerald-400";
}

export default function GpuResultCard({ result, perfMetric, perfLabel, compareSelected, compareDisabled, onToggleCompare }) {
  const status = getStatus(result);

  return (
    <article className={`group/card relative rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-md ${result.rank === 1 ? "shadow-md" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="rounded border border-emerald-400 px-2 py-0.5 text-xs font-bold text-emerald-700">#{result.rank}</span>
        <span className={`text-xs font-semibold uppercase tracking-widest ${status === "OUTSIDE BUDGET" ? "text-amber-600" : status === "MULTI-GPU" ? "text-orange-600" : "text-emerald-600"}`}>
          {status}
        </span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black text-gray-900">{result.gpu.name}</h3>
          <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium text-gray-400">
            <span>VRAM: {result.gpu.vram_gb}GB</span>
            <span>Perf: {Number(result.gpu[perfMetric]).toLocaleString()} {perfLabel}</span>
          </p>
          <p className="mt-1 text-sm text-gray-500">{result.description}</p>
        </div>
        <label className={`shrink-0 text-xs font-semibold text-gray-500 ${compareDisabled ? "opacity-50" : ""}`}>
          <input
            type="checkbox"
            className="mr-2 rounded border-gray-300 text-emerald-600"
            checked={compareSelected}
            disabled={compareDisabled}
            onChange={() => onToggleCompare(result.gpu.id)}
          />
          Compare
        </label>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-gray-500">
          VRAM: [{`${Math.round(result.vram_usage_pct)}%`}] {result.vram_needed_gb} GB / {result.gpu.vram_gb} GB ({Math.round(result.vram_usage_pct)}%)
        </p>
        <div className="mt-2 h-2 rounded-full bg-gray-100">
          <div className={`h-2 rounded-full ${getUsageBarClass(result.vram_usage_pct)}`} style={{ width: `${Math.min(result.vram_usage_pct, 100)}%` }} />
        </div>
      </div>

      <p className="mt-3 text-xs font-mono text-gray-400">
        ~{result.tokens_per_second} tok/s | Max batch: {result.max_batch_estimate} | Fits in {result.fits_precision_label}
      </p>
      {result.multi_gpu_needed ? (
        <p className="mt-2 text-sm font-semibold text-orange-600">Needs {result.multi_gpu_needed}x for this model</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {result.badges.filter((badge) => badge !== "Outside Budget").map((badge) => (
          <span key={badge} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
            {badge}
          </span>
        ))}
      </div>

      <div className="relative mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div className={`h-full rounded-full ${getScoreBarClass(result.total_score)}`} style={{ width: `${Math.min(result.total_score, 100)}%` }} />
        </div>
        <ScoreBreakdownTooltip result={result} />
      </div>
    </article>
  );
}
