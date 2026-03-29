"use client";

import { useEffect, useMemo, useState } from "react";
import { WARP_SIZE } from "../../hooks/useWarpDivergence";
import ThreadCell from "./ThreadCell";
import PassControls from "./PassControls";
import PassDescriptions from "./PassDescriptions";

function getThreadState(threadId, pass) {
  if (pass.active_threads.includes(threadId)) return "active";
  if (pass.waiting_threads.includes(threadId)) return "waiting";
  return "inactive";
}

export default function WarpGridPanel({ analysis, title = "Warp View" }) {
  const [currentPass, setCurrentPass] = useState(1);
  const [autoPlay, setAutoPlay] = useState(false);
  const [speed, setSpeed] = useState(1);

  const handleReset = () => {
    setAutoPlay(false);
    setCurrentPass(1);
  };

  useEffect(() => {
    if (!autoPlay || analysis.passes.length <= 1) return undefined;
    const intervalMs = 1500 / speed;
    const interval = window.setInterval(() => {
      setCurrentPass((value) => (value >= analysis.passes.length ? 1 : value + 1));
    }, intervalMs);
    return () => window.clearInterval(interval);
  }, [analysis.passes.length, autoPlay, speed]);

  const displayPass = Math.min(currentPass, Math.max(analysis.passes.length, 1));
  const activePass = analysis.passes[displayPass - 1] ?? analysis.passes[0];
  const cells = useMemo(() => Array.from({ length: WARP_SIZE }, (_, threadId) => threadId), []);

  if (!activePass) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Enter a valid expression to visualize the warp.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">{title}</p>
          <h2 className="mt-2 text-3xl font-black text-gray-900">Warp Divergence</h2>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-500">
            <input type="checkbox" checked={autoPlay} onChange={(event) => setAutoPlay(event.target.checked)} />
            Auto-play passes
          </label>
          <span className="font-mono text-sm text-gray-500">Pass {displayPass} of {analysis.passes.length}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {analysis.passes.map((pass) => (
          <button
            key={pass.id}
            type="button"
            onClick={() => setCurrentPass(pass.id)}
            className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-widest ${displayPass === pass.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}
          >
            {pass.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-8 gap-2 overflow-x-auto">
        {cells.map((threadId) => (
          <ThreadCell
            key={threadId}
            threadId={threadId}
            state={getThreadState(threadId, activePass)}
            accent={activePass.accent || "green"}
          />
        ))}
      </div>

      <div className="mt-5">
        <PassControls
          currentPass={displayPass}
          totalPasses={analysis.passes.length}
          isPlaying={autoPlay}
          speed={speed}
          onReset={handleReset}
          onPrev={() => setCurrentPass((value) => (value <= 1 ? analysis.passes.length : value - 1))}
          onTogglePlay={() => setAutoPlay((value) => !value)}
          onNext={() => setCurrentPass((value) => (value >= analysis.passes.length ? 1 : value + 1))}
          onSpeedChange={setSpeed}
        />
      </div>

      <div className="mt-5">
        <PassDescriptions passes={analysis.passes} currentPass={displayPass} />
      </div>
    </div>
  );
}
