import { ExternalLink, Heart, DownloadCloud, Cpu, Award } from "lucide-react";
import ModelScoreBar from "./ModelScoreBar";
import ModelDetailsExpand from "./ModelDetailsExpand";

function formatCompactNumber(value) {
  if (!value && value !== 0) return "Unknown";
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

function getRecommendationCategory(index, totalScore) {
  if (index === 0) return { label: "Top Recommendation", color: "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-900 shadow-[0_4px_14px_rgba(245,158,11,0.3)]" };
  if (index === 1) return { label: "Strong Alternative", color: "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 shadow-[0_4px_14px_rgba(148,163,184,0.3)]" };
  if (index === 2) return { label: "Solid Option", color: "bg-gradient-to-br from-amber-600 to-amber-800 text-amber-50 shadow-[0_4px_14px_rgba(217,119,6,0.3)]" };
  if (totalScore < 60) return { label: "Budget/Niche Pick", color: "bg-gradient-to-br from-slate-100 to-slate-300 text-slate-600" };
  return { label: "Alternative", color: "bg-gradient-to-br from-slate-100 to-slate-300 text-slate-600" };
}

function ConfidenceBadge({ confidence }) {
  if (!confidence) return null;
  const colors = {
    high: "text-emerald-600",
    medium: "text-amber-600",
    low: "text-rose-600",
  }[confidence.level] || "text-slate-600";
  
  const bg = {
    high: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]",
    medium: "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]",
    low: "bg-rose-500 shadow-[0_0_6px_rgba(243,33,33,0.5)]",
  }[confidence.level] || "bg-slate-500";

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${colors}`}>
      <div className={`h-2 w-2 shrink-0 rounded-full ${bg}`} />
      {confidence.label} Confidence
    </div>
  );
}

export default function ModelResultCard({ model, index, taskLabel, hardwareLabel, sortKey }) {
  const recCategory = getRecommendationCategory(index, model.total_score);
  
  const architecture =
    model.config?.architectures?.[0]?.replace(/ForConditionalGeneration|ForCausalLM|Model/g, "") ||
    model.library_name ||
    "Transformer";

  const badges = [
    model.family !== "unknown" ? model.family.toUpperCase() : architecture.toUpperCase(),
    model.tags?.includes("gguf") ? "GGUF/Quantizable" : null,
    model.license_label,
    model.language_label,
  ].filter(Boolean);

  // Derive "Why this model" reason bullet points
  const reasons = [];
  if (index === 0 && sortKey === "best") reasons.push("Highest overall alignment with your stated priorities and hardware layout.");
  if (model.sub_scores?.task_fit >= 90) reasons.push(`Exceptionally strong fit for ${taskLabel.toLowerCase()} tasks based on architecture/tuning.`);
  if (model.sub_scores?.cost >= 85) reasons.push(`Highly efficient; comfortably fits your ${hardwareLabel} VRAM limits.`);
  if (model.sub_scores?.deployment >= 80) reasons.push("Strong community trust metrics with excellent documentation and usage.");
  if (reasons.length === 0) reasons.push("Good balance of capabilities offering a viable alternative.");

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
      {/* Header section with rank and title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${recCategory.color}`}>
            #{index + 1}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                {recCategory.label}
              </span>
              <ConfidenceBadge confidence={model.confidence} />
            </div>
            <div className="mt-1 flex items-center gap-2">
              <a
                href={`https://huggingface.co/${model.modelId}`}
                target="_blank"
                rel="noreferrer"
                className="text-2xl font-black text-slate-900 transition-colors hover:text-blue-600 focus:text-blue-600 focus:outline-none"
              >
                {model.modelId.split("/").pop()}
              </a>
              <ExternalLink className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-1 text-sm font-medium text-slate-500">
              by {model.modelId.split("/")[0]}
            </div>
          </div>
        </div>

        {/* Quick stats row right aligned on desktop */}
        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1.5">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
            <Cpu className="h-4 w-4 text-slate-400" />
            {model.params_b ? `${model.params_b.toFixed(1)}B` : "Unknown Size"}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
            <DownloadCloud className="h-4 w-4 text-slate-400" />
            {formatCompactNumber(model.downloads)}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
            <Heart className="h-4 w-4 text-slate-400" />
            {formatCompactNumber(model.likes ?? 0)}
          </div>
        </div>
      </div>

      {/* Tags / Badges */}
      <div className="mt-5 flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span
            key={badge}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-600"
          >
            {badge}
          </span>
        ))}
      </div>

      {/* Main Score UI */}
      <div className="mt-6">
        <ModelScoreBar totalScore={model.total_score} subScores={model.sub_scores} />
      </div>

      {/* Reasoning */}
      <div className="mt-6 rounded-2xl bg-blue-50/50 p-5 border border-blue-100/50">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-800 mb-3">
          <Award className="h-4 w-4" />
          Why this model?
        </div>
        <ul className="space-y-2">
          {reasons.slice(0, 3).map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-[14px] text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Expandable Details */}
      <div className="mt-4">
        <ModelDetailsExpand model={model} hardwareLabel={hardwareLabel} />
      </div>
    </div>
  );
}
