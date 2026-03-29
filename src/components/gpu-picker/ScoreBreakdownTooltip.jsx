function BreakdownRow({ label, value }) {
  return (
    <div className="grid grid-cols-[88px_1fr_44px] items-center gap-3 text-[11px] text-gray-200">
      <span>{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
      <span className="text-right tabular-nums">{Math.round(value * 100)}%</span>
    </div>
  );
}

export default function ScoreBreakdownTooltip({ result }) {
  const { gpu, sub_scores: subScores, total_score: totalScore, bottleneck, vram_needed_gb: requiredVram } = result;

  return (
    <div className="pointer-events-none absolute left-0 top-full z-20 mt-3 hidden w-[320px] rounded-xl bg-gray-900 p-4 text-white shadow-xl group-hover/card:block">
      <p className="text-sm font-bold">Score Breakdown - {gpu.name}</p>
      <div className="mt-4 space-y-2.5">
        <BreakdownRow label="VRAM Fit" value={subScores.vram_fit} />
        <BreakdownRow label="Performance" value={subScores.performance} />
        <BreakdownRow label="Budget Fit" value={subScores.budget_fit} />
        <BreakdownRow label="Ecosystem" value={subScores.ecosystem} />
        <BreakdownRow label="Availability" value={subScores.availability} />
      </div>
      <div className="my-3 h-px bg-white/10" />
      <div className="grid grid-cols-[88px_1fr_44px] items-center gap-3 text-[11px] font-semibold">
        <span>TOTAL SCORE</span>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-emerald-300" style={{ width: `${Math.min(totalScore, 100)}%` }} />
        </div>
        <span className="text-right tabular-nums">{Math.round(totalScore)}/100</span>
      </div>
      <p className="mt-4 text-[11px] text-gray-300">Required VRAM: {requiredVram} GB | GPU VRAM: {gpu.vram_gb} GB</p>
      <p className="mt-1 text-[11px] text-gray-300">Bottleneck: {bottleneck}</p>
    </div>
  );
}
