"use client";

const INTENTS = [
  { id: "inference", title: "Run Inference", subtitle: "Load and generate outputs" },
  { id: "finetune", title: "Fine-tune (LoRA / QLoRA)", subtitle: "Parameter-efficient training" },
  { id: "full_training", title: "Full Training", subtitle: "Train all parameters" },
];

export default function UsageIntentSelector({ profile, usageIntent, onSelect }) {
  const disabled = {
    inference: false,
    finetune: false,
    full_training: profile.is_quantized,
  };

  const helper = {
    finetune: !profile.can_train ? "Quantized models use QLoRA" : "",
    full_training: profile.is_quantized ? "Cannot full-train quantized models" : "",
  };

  const vramByIntent = {
    inference: profile.total_vram_inference,
    finetune: profile.total_vram_finetune,
    full_training: profile.total_vram_training,
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 ease-in-out">
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">WHAT DO YOU WANT TO DO?</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {INTENTS.map((intent) => (
          <button
            key={intent.id}
            type="button"
            disabled={disabled[intent.id]}
            title={helper[intent.id]}
            onClick={() => !disabled[intent.id] && onSelect(intent.id)}
            className={`rounded-2xl border p-4 text-left transition ${
              usageIntent === intent.id
                ? "border-emerald-400 bg-emerald-50"
                : "border-gray-200 bg-white"
            } ${disabled[intent.id] ? "cursor-not-allowed opacity-50" : "hover:border-emerald-300"}`}
          >
            <p className="text-sm font-bold text-gray-900">{intent.title}</p>
            <p className="mt-1 text-sm text-gray-500">{intent.subtitle}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-emerald-700">
              {vramByIntent[intent.id].toFixed(1)} GB target
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
