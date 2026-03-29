"use client";

import { useState } from "react";
import { HEATMAP_BLOCK_SIZES, HEATMAP_REGISTERS, formatPercent, getHeatmapColor, sectionLabelClassName } from "./kernel_utils";

export default function HeatmapChart({ result }) {
  const [hovered, setHovered] = useState(null);
  if (!result) return null;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className={sectionLabelClassName}>Occupancy Heatmap</p>
      <p className="mt-2 text-sm text-gray-500">Threads per block versus register pressure using current shared-memory settings.</p>

      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid gap-2" style={{ gridTemplateColumns: `110px repeat(${HEATMAP_BLOCK_SIZES.length}, minmax(52px, 1fr))` }}>
            <div />
            {HEATMAP_BLOCK_SIZES.map((blockSize) => (
              <div key={blockSize} className="text-center text-xs font-semibold text-gray-500">{blockSize}</div>
            ))}

            {HEATMAP_REGISTERS.map((registers, rowIndex) => (
              <div key={registers} className="contents">
                <div className="flex items-center text-xs font-semibold text-gray-500">{registers}</div>
                {result.heatmap[rowIndex].map((cell) => {
                  const isCurrent = cell.block_size === result.threads_per_block && cell.registers === result.registers_per_thread;
                  return (
                    <button
                      key={`${cell.block_size}-${cell.registers}`}
                      type="button"
                      onMouseEnter={() => setHovered(cell)}
                      onMouseLeave={() => setHovered(null)}
                      className={`flex h-11 items-center justify-center rounded-lg text-[11px] font-semibold text-gray-900 transition ${isCurrent ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900" : ""}`}
                      style={{ backgroundColor: getHeatmapColor(cell.occupancy_percent) }}
                    >
                      {Math.round(cell.occupancy_percent)}%
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 text-xs text-gray-500">
        <p>Registers per Thread</p>
        <p>Threads per Block</p>
      </div>

      <div className="mt-4 h-3 rounded-full" style={{ background: "linear-gradient(90deg, #ef4444 0%, #fb923c 25%, #facc15 50%, #4ade80 75%, #16a34a 100%)" }} />

      {hovered ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <p>Block: {hovered.block_size} | Regs: {hovered.registers} | Occupancy: {formatPercent(hovered.occupancy_percent)}</p>
          <p className="mt-1">Bottleneck: {hovered.bottleneck}</p>
        </div>
      ) : null}
    </section>
  );
}
