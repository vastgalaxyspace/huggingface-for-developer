import { ExternalLink, Heart } from "lucide-react";
import ModelScoreBar from "./ModelScoreBar";
import ModelDetailsExpand from "./ModelDetailsExpand";

function formatCompactNumber(value) {
  if (!value && value !== 0) return "Unknown";
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

function getRecommendationLabel(index, totalScore) {
  if (index === 0) return "Recommended";
  if (totalScore < 60) return "Budget Pick";
  return "Alternative";
}

function getReason(model, hardwareLabel, taskLabel) {
  const entries = Object.entries(model.sub_scores || {}).sort((a, b) => b[1] - a[1]);
  const [topKey, topValue] = entries[0] || [];

  if (topKey === "task_fit" && model.downloads) {
    return `Most downloaded ${taskLabel.toLowerCase()} option here, with strong community validation and a ${Math.round(topValue * 100)}% task-fit score.`;
  }

  if (topKey === "size" || topKey === "speed") {
    return `Lightweight ${model.params_b ? `${model.params_b.toFixed(1)}B` : "compact"} model that aligns well with ${hardwareLabel.toLowerCase()} inference constraints.`;
  }

  return "Strong deployment signals, active maintenance, and balanced scoring across quality, cost, and ease of use.";
}

function getBadgeTone(label) {
  if (label === "Recommended") return "border-emerald-300 bg-emerald-50 text-emerald-700";
  if (label === "Budget Pick") return "border-amber-300 bg-amber-50 text-amber-700";
  return "border-gray-300 bg-gray-50 text-gray-700";
}

export default function ModelResultCard({ model, index, taskLabel, hardwareLabel }) {
  const recommendationLabel = getRecommendationLabel(index, model.total_score);
  const architecture =
    model.config?.architectures?.[0]?.replace(/ForConditionalGeneration|ForCausalLM|Model/g, "") ||
    model.library_name ||
    "Transformer";

  const badges = [
    taskLabel?.toUpperCase(),
    architecture.toUpperCase(),
    model.tags?.includes("gguf") ? "GGUF Available" : null,
    model.license_label,
    model.language_label,
  ].filter(Boolean);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300 bg-emerald-50 text-sm font-black text-emerald-700">
            #{index + 1}
          </div>
          <div>
            <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest ${getBadgeTone(recommendationLabel)}`}>
              {recommendationLabel}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <a
                href={`https://huggingface.co/${model.modelId}`}
                target="_blank"
                rel="noreferrer"
                className="text-2xl font-black text-gray-900 hover:text-gray-700"
              >
                {model.modelId}
              </a>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {model.params_b ? `${model.params_b.toFixed(1)}B params` : "Params unknown"} | ~
              {model.vram_needed ? `${model.vram_needed.toFixed(1)}GB VRAM` : "Unknown VRAM"} |{" "}
              {formatCompactNumber(model.downloads)} downloads |{" "}
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {formatCompactNumber(model.likes ?? 0)}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span
            key={badge}
            className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-600"
          >
            {badge}
          </span>
        ))}
      </div>

      <div className="mt-5">
        <ModelScoreBar totalScore={model.total_score} subScores={model.sub_scores} />
      </div>

      <p className="mt-4 text-sm text-gray-500">
        {getReason(model, hardwareLabel, taskLabel)}
      </p>

      <div className="mt-5">
        <ModelDetailsExpand model={model} hardwareLabel={hardwareLabel} />
      </div>
    </div>
  );
}
