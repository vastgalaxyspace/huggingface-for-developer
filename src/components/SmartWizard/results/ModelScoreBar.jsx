function getBarColor(score) {
  if (score > 75) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-400";
  return "bg-gray-400";
}

export default function ModelScoreBar({ totalScore, subScores }) {
  const tooltip = [
    `Quality Fit: ${Math.round((subScores?.task_fit ?? 0) * 100)}%`,
    `Speed: ${Math.round((subScores?.speed ?? 0) * 100)}%`,
    `Size: ${Math.round((subScores?.size ?? 0) * 100)}%`,
    `Cost: ${Math.round((subScores?.cost ?? 0) * 100)}%`,
    `Deployment: ${Math.round((subScores?.deployment ?? 0) * 100)}%`,
  ].join("\n");

  return (
    <div className="space-y-2" title={tooltip}>
      <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
        <span>Match Score</span>
        <span>{Math.round(totalScore)}/100</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full ${getBarColor(totalScore)}`}
          style={{ width: `${Math.max(totalScore, 2)}%` }}
        />
      </div>
    </div>
  );
}
