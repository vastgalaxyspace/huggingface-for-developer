"use client";

import { MEMORY_HIERARCHY_OPTIONS, PRECISION_OPTIONS, getPrecisionPeak } from "../../hooks/useRooflineModel";

function PrecisionChip({ option, active, onToggle }) {
  const style = active
    ? { backgroundColor: option.color, borderColor: option.color, color: "#ffffff" }
    : { backgroundColor: "#ffffff", borderColor: "#e5e7eb", color: "#111827" };

  return (
    <button
      type="button"
      onClick={() => onToggle(option.id)}
      className="rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-150"
      style={style}
    >
      {option.chipLabel}
    </button>
  );
}

export default function PrecisionToggle({ gpu, activePrecisionIds, onTogglePrecision, memoryMode, onChangeMemoryMode }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Precision Toggle</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRECISION_OPTIONS.filter((option) => getPrecisionPeak(gpu, option.id) > 0).map((option) => (
            <PrecisionChip key={option.id} option={option} active={activePrecisionIds.includes(option.id)} onToggle={onTogglePrecision} />
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Memory Hierarchy</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {MEMORY_HIERARCHY_OPTIONS.map((option) => {
            const active = option.id === memoryMode;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChangeMemoryMode(option.id)}
                className={`rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-150 ${
                  active ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-700"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
