"use client";

import { useMemo } from "react";

export default function PrioritySlider({
  label,
  subtitle,
  value,
  onChange,
  leftLabel,
  rightLabel,
}) {
  const progress = useMemo(() => `${value}%`, [value]);

  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">{label}</h3>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
          {value}
        </span>
      </div>

      <div className="relative pt-6">
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-full bg-gray-900 px-2 py-1 text-xs font-bold text-white"
          style={{ left: progress }}
        >
          {value}
        </div>
        <div className="relative h-2 rounded-full bg-gray-200">
          <div
            className="absolute left-0 top-0 h-2 rounded-full bg-gray-900"
            style={{ width: progress }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            className="smart-slider absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 appearance-none bg-transparent"
          />
        </div>
      </div>

      <div className="flex justify-between text-xs font-medium text-gray-400">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
