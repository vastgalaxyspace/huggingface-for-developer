"use client";

export default function PassControls({
  currentPass,
  totalPasses,
  isPlaying,
  speed,
  onReset,
  onPrev,
  onTogglePlay,
  onNext,
  onSpeedChange,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onReset} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600">
          {"<<"} Reset
        </button>
        <button type="button" onClick={onPrev} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600">
          {"<"} Prev Pass
        </button>
        <button type="button" onClick={onTogglePlay} className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white">
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button type="button" onClick={onNext} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600">
          Next Pass {">"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-gray-500">Pass {currentPass} of {totalPasses}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Speed:</span>
          {[0.5, 1, 2].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onSpeedChange(value)}
              className={`rounded-lg px-3 py-1 text-sm font-semibold ${speed === value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}
            >
              {value}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
