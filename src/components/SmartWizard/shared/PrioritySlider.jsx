"use client";

import { useMemo } from "react";

function getTrackGradient(value) {
  if (value >= 75) return "linear-gradient(90deg, #059669, #10b981)";
  if (value >= 50) return "linear-gradient(90deg, #2563eb, #3b82f6)";
  if (value >= 25) return "linear-gradient(90deg, #d97706, #f59e0b)";
  return "linear-gradient(90deg, #94a3b8, #cbd5e1)";
}

function getZoneLabel(value) {
  if (value >= 85) return "Critical";
  if (value >= 65) return "High";
  if (value >= 40) return "Medium";
  if (value >= 15) return "Low";
  return "Minimal";
}

function getSolidColor(value) {
  if (value >= 75) return "#10b981";
  if (value >= 50) return "#3b82f6";
  if (value >= 25) return "#f59e0b";
  return "#94a3b8";
}

export default function PrioritySlider({
  label,
  subtitle,
  value,
  onChange,
  leftLabel,
  rightLabel,
}) {
  const progress = useMemo(() => `${value}%`, [value]);
  const gradient = useMemo(() => getTrackGradient(value), [value]);
  const zone = useMemo(() => getZoneLabel(value), [value]);

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/80 p-5 backdrop-blur-sm transition-all hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-bold text-slate-900">{label}</h3>
          <p className="mt-0.5 text-[13px] text-slate-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
            {zone}
          </span>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black"
            style={{
              background: gradient,
              color: "white",
              boxShadow: `0 2px 8px ${value >= 50 ? "rgba(37,99,235,0.2)" : "rgba(148,163,184,0.2)"}`,
            }}
          >
            {value}
          </span>
        </div>
      </div>

      <div className="relative pt-5">
        {/* Floating tooltip */}
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 transition-all duration-200"
          style={{ left: progress }}
        >
          <div
            className="rounded-lg px-2 py-0.5 text-[11px] font-bold text-white shadow-md"
            style={{ background: gradient }}
          >
            {value}
          </div>
          <div
            className="mx-auto h-0 w-0 border-x-4 border-t-4 border-x-transparent"
            style={{ borderTopColor: value >= 50 ? "#2563eb" : "#94a3b8" }}
          />
        </div>

        {/* Pill-Shaped Track */}
        <div className="relative mt-2 h-10 w-full rounded-full border border-slate-200/80 bg-white/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="relative h-full w-full">
            {/* Base Background Track */}
            <div className="absolute left-[10px] right-[10px] top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
            
            {/* Fill Track */}
            <div
              className="absolute left-[10px] top-1/2 h-1.5 -translate-y-1/2 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `calc(${value}% * calc(100% - 20px) / 100)`,
                background: gradient,
              }}
            />

            {/* Segment Markers */}
            {[0, 25, 50, 75, 100].map((mark) => (
              <div
                key={mark}
                className="pointer-events-none absolute top-1/2 h-[12px] w-[12px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-white transition-all duration-300"
                style={{
                  left: `calc(10px + ${mark}% * calc(100% - 20px) / 100)`,
                  background: value >= mark ? getSolidColor(value) : "#e2e8f0",
                }}
              />
            ))}

            {/* Native Slider Overlay */}
            <input
              type="range"
              min="0"
              max="100"
              value={value}
              onChange={(event) => onChange(Number(event.target.value))}
              className="app-slider--overlay absolute left-0 top-0 h-full w-full bg-transparent cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
