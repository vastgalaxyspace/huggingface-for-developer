"use client";

import { useEffect, useState } from "react";

function getScoreColor(score) {
  if (score >= 80) return { stroke: "#10b981", bg: "#d1fae5", text: "text-emerald-500" }; // emerald
  if (score >= 60) return { stroke: "#3b82f6", bg: "#dbeafe", text: "text-blue-500" }; // blue
  if (score >= 40) return { stroke: "#f59e0b", bg: "#fef3c7", text: "text-amber-500" }; // amber
  return { stroke: "#ef4444", bg: "#fee2e2", text: "text-rose-500" }; // rose
}

function MiniScoreBar({ label, score }) {
  const isGood = score >= 50;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px] font-bold tracking-wide">
        <span className="text-slate-500">{label}</span>
        <span className={isGood ? "text-slate-700" : "text-amber-600"}>{score}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/50">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${isGood ? "bg-slate-400" : "bg-amber-400"}`}
          style={{ width: `${Math.max(score, 5)}%` }}
        />
      </div>
    </div>
  );
}

export default function ModelScoreBar({ totalScore, subScores }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const colors = getScoreColor(totalScore);
  
  useEffect(() => {
    // Slight delay for entrance animation
    const timer = setTimeout(() => {
      setAnimatedScore(totalScore);
    }, 150);
    return () => clearTimeout(timer);
  }, [totalScore]);

  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col sm:flex-row gap-8 rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
      
      {/* Radial Score Gauge */}
      <div className="flex shrink-0 flex-col items-center justify-center">
        <div className="relative h-[120px] w-[120px]">
          <svg className="h-full w-full -rotate-90">
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colors.bg}
              strokeWidth={strokeWidth}
            />
            {/* Animated progress */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colors.stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-black tabular-nums tracking-tighter ${colors.text}`}>
              {Math.round(totalScore)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Match
            </span>
          </div>
        </div>
      </div>

      {/* Sub-score Breakdown */}
      <div className="flex-1">
        <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          Score Breakdown
        </h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <MiniScoreBar label="Quality/Task Fit" score={subScores?.quality || subScores?.task_fit || 0} />
          <MiniScoreBar label="Speed/Latency" score={subScores?.speed || 0} />
          <MiniScoreBar label="VRAM Cost Fit" score={subScores?.cost || 0} />
          <MiniScoreBar label="Deployment Trust" score={subScores?.deployment || 0} />
        </div>
      </div>
      
    </div>
  );
}
