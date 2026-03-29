"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, RotateCcw, Share2 } from "lucide-react";
import { MEMORY_HIERARCHY_OPTIONS, PRECISION_OPTIONS, clamp, formatCompactNumber } from "../../hooks/useRooflineModel";

const WIDTH = 800;
const HEIGHT = 500;
const MARGINS = { top: 40, right: 60, bottom: 60, left: 80 };
const PLOT_WIDTH = 660;
const PLOT_HEIGHT = 400;
const DEFAULT_X = { min: 0.01, max: 10000 };
const X_TICKS = [0.01, 0.1, 1, 10, 100, 1000, 10000];

function getDefaultView(maxPeak) {
  return { xMin: DEFAULT_X.min, xMax: DEFAULT_X.max, yMin: 1, yMax: Math.max(10, maxPeak * 5) };
}

function log10(value) {
  return Math.log10(Math.max(value, Number.MIN_VALUE));
}

function mapX(value, view) {
  return MARGINS.left + ((log10(value) - log10(view.xMin)) / (log10(view.xMax) - log10(view.xMin))) * PLOT_WIDTH;
}

function mapY(value, view) {
  return MARGINS.top + PLOT_HEIGHT - ((log10(value) - log10(view.yMin)) / (log10(view.yMax) - log10(view.yMin))) * PLOT_HEIGHT;
}

function invertX(svgX, view) {
  const ratio = (svgX - MARGINS.left) / PLOT_WIDTH;
  const logValue = log10(view.xMin) + ratio * (log10(view.xMax) - log10(view.xMin));
  return 10 ** logValue;
}

function invertY(svgY, view) {
  const ratio = 1 - (svgY - MARGINS.top) / PLOT_HEIGHT;
  const logValue = log10(view.yMin) + ratio * (log10(view.yMax) - log10(view.yMin));
  return 10 ** logValue;
}

function buildYTicks(view) {
  const minExp = Math.floor(log10(view.yMin));
  const maxExp = Math.ceil(log10(view.yMax));
  const ticks = [];
  for (let exp = minExp; exp <= maxExp; exp += 1) ticks.push(10 ** exp);
  return ticks;
}

function getPrimaryPrecisionColor(precisionId) {
  if (precisionId === "fp32") return { slope: "#3b82f6", ceiling: "#eab308" };
  const option = PRECISION_OPTIONS.find((item) => item.id === precisionId);
  return { slope: option?.color || "#3b82f6", ceiling: option?.color || "#3b82f6" };
}

function getMousePoint(event, svg) {
  const rect = svg.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
  };
}

export default function RooflinePlot({
  svgRef,
  gpu,
  primaryPrecision,
  activePrecisionIds,
  memoryMode,
  rooflinesByPrecision,
  kernels,
  exportOpen,
  onToggleExport,
  onDownloadSvg,
  onDownloadPng,
  onCopyMetrics,
  onShareLink,
}) {
  const maxPeak = useMemo(() => Math.max(...activePrecisionIds.map((id) => rooflinesByPrecision[id]?.roofline?.peak_flops || 0), 1000), [activePrecisionIds, rooflinesByPrecision]);
  const defaultView = useMemo(() => getDefaultView(maxPeak), [maxPeak]);
  const [view, setView] = useState(defaultView);
  const [tooltip, setTooltip] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const plotWrapRef = useRef(null);

  const visibleLevels = MEMORY_HIERARCHY_OPTIONS.find((option) => option.id === memoryMode)?.levels || ["HBM"];
  const yTicks = buildYTicks(view);
  const exportActions = [
    { label: "Download SVG", handler: onDownloadSvg, icon: Download },
    { label: "Download PNG", handler: onDownloadPng, icon: Download },
    { label: "Copy Metrics", handler: onCopyMetrics, icon: Share2 },
    { label: "Share Link", handler: onShareLink, icon: Share2 },
  ];

  const handleWheel = (event) => {
    event.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const point = getMousePoint(event, svg);
    const focusX = invertX(point.x, view);
    const focusY = invertY(point.y, view);
    const factor = event.deltaY > 0 ? 1.18 : 0.84;
    const nextXMin = focusX / ((focusX / view.xMin) ** (1 / factor));
    const nextXMax = focusX * ((view.xMax / focusX) ** (1 / factor));
    const nextYMin = focusY / ((focusY / view.yMin) ** (1 / factor));
    const nextYMax = focusY * ((view.yMax / focusY) ** (1 / factor));
    setView({
      xMin: clamp(nextXMin, 0.0001, 1e6),
      xMax: clamp(nextXMax, 0.001, 1e7),
      yMin: clamp(nextYMin, 0.1, 1e12),
      yMax: clamp(nextYMax, 1, 1e13),
    });
  };

  const handlePointerDown = (event) => {
    const svg = svgRef.current;
    if (!svg) return;
    const point = getMousePoint(event, svg);
    setDragStart({ point, view });
  };

  const handlePointerMove = (event) => {
    if (!dragStart || !svgRef.current) return;
    const point = getMousePoint(event, svgRef.current);
    const dx = (point.x - dragStart.point.x) / PLOT_WIDTH;
    const dy = (point.y - dragStart.point.y) / PLOT_HEIGHT;
    const xLogSpan = log10(dragStart.view.xMax) - log10(dragStart.view.xMin);
    const yLogSpan = log10(dragStart.view.yMax) - log10(dragStart.view.yMin);
    setView({
      xMin: 10 ** (log10(dragStart.view.xMin) - dx * xLogSpan),
      xMax: 10 ** (log10(dragStart.view.xMax) - dx * xLogSpan),
      yMin: 10 ** (log10(dragStart.view.yMin) + dy * yLogSpan),
      yMax: 10 ** (log10(dragStart.view.yMax) + dy * yLogSpan),
    });
  };

  const stopDrag = () => setDragStart(null);

  useEffect(() => {
    window.addEventListener("mouseup", stopDrag);
    return () => window.removeEventListener("mouseup", stopDrag);
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Roofline Plot</p>
          <p className="mt-2 text-sm text-gray-500">Log-log roofline chart for {gpu.name}. Drag to pan, use the mouse wheel to zoom, and double click to reset.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setView(defaultView)} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-700 transition-all duration-150 hover:border-gray-900">
            <RotateCcw className="h-4 w-4" />
            Reset Zoom
          </button>
          <div className="relative">
            <button type="button" onClick={onToggleExport} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-700 transition-all duration-150 hover:border-gray-900">
              <Download className="h-4 w-4" />
              Export
            </button>
            {exportOpen ? (
              <div className="absolute right-0 top-12 z-20 w-48 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
                {exportActions.map((action) => (
                  <button key={action.label} type="button" onClick={action.handler} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-slate-100">
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div ref={plotWrapRef} className="relative overflow-hidden rounded-xl bg-white">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full touch-none"
          onWheel={handleWheel}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onDoubleClick={() => setView(defaultView)}
          onMouseLeave={() => {
            stopDrag();
            setTooltip(null);
          }}
        >
          <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="#ffffff" />

          {X_TICKS.filter((tick) => tick >= view.xMin && tick <= view.xMax).map((tick) => (
            <g key={`x-${tick}`}>
              <line x1={mapX(tick, view)} y1={MARGINS.top} x2={mapX(tick, view)} y2={MARGINS.top + PLOT_HEIGHT} stroke="#e5e7eb" strokeWidth="0.5" />
              <text x={mapX(tick, view)} y={HEIGHT - 24} fill="#9ca3af" fontSize="11" textAnchor="middle">{tick}</text>
            </g>
          ))}
          {yTicks.filter((tick) => tick >= view.yMin && tick <= view.yMax).map((tick) => (
            <g key={`y-${tick}`}>
              <line x1={MARGINS.left} y1={mapY(tick, view)} x2={MARGINS.left + PLOT_WIDTH} y2={mapY(tick, view)} stroke="#e5e7eb" strokeWidth="0.5" />
              <text x={MARGINS.left - 12} y={mapY(tick, view) + 4} fill="#9ca3af" fontSize="11" textAnchor="end">{formatCompactNumber(tick, 0)}</text>
            </g>
          ))}

          <line x1={MARGINS.left} y1={MARGINS.top + PLOT_HEIGHT} x2={MARGINS.left + PLOT_WIDTH} y2={MARGINS.top + PLOT_HEIGHT} stroke="#d1d5db" />
          <line x1={MARGINS.left} y1={MARGINS.top} x2={MARGINS.left} y2={MARGINS.top + PLOT_HEIGHT} stroke="#d1d5db" />

          <text x={WIDTH / 2} y={HEIGHT - 6} fill="#9ca3af" fontSize="11" textAnchor="middle">Arithmetic Intensity (FLOP/B)</text>
          <text transform={`translate(18 ${HEIGHT / 2}) rotate(-90)`} fill="#9ca3af" fontSize="11" textAnchor="middle">Performance (GFLOP/s)</text>

          {activePrecisionIds.map((precisionId) => {
            const entry = rooflinesByPrecision[precisionId];
            if (!entry) return null;
            const colors = getPrimaryPrecisionColor(precisionId);
            const precisionMeta = PRECISION_OPTIONS.find((item) => item.id === precisionId);
            return entry.memoryLevels
              .filter((level) => visibleLevels.includes(level.label))
              .map((level) => {
                const slopeColor = level.label === "HBM" ? colors.slope : level.color;
                const ceilingColor = level.label === "HBM" ? colors.ceiling : level.color;
                return (
                  <g key={`${precisionId}-${level.label}`}>
                    <line
                      x1={mapX(Math.max(view.xMin, DEFAULT_X.min), view)}
                      y1={mapY(level.roofline_y(Math.max(view.xMin, DEFAULT_X.min)), view)}
                      x2={mapX(level.ridge_x, view)}
                      y2={mapY(entry.roofline.peak_flops, view)}
                      stroke={slopeColor}
                      strokeWidth="2"
                      strokeDasharray={precisionMeta?.dash}
                    />
                    <line
                      x1={mapX(level.ridge_x, view)}
                      y1={mapY(entry.roofline.peak_flops, view)}
                      x2={mapX(view.xMax, view)}
                      y2={mapY(entry.roofline.peak_flops, view)}
                      stroke={ceilingColor}
                      strokeWidth="2"
                      strokeDasharray={precisionMeta?.dash}
                    />
                    <circle
                      cx={mapX(level.ridge_x, view)}
                      cy={mapY(entry.roofline.peak_flops, view)}
                      r="4"
                      fill="#ffffff"
                      stroke={ceilingColor}
                      strokeWidth="2"
                      onMouseEnter={(event) => {
                        const rect = plotWrapRef.current?.getBoundingClientRect();
                        setTooltip({
                          left: event.clientX - (rect?.left || 0) + 12,
                          top: event.clientY - (rect?.top || 0) + 12,
                          lines: [`${precisionId.toUpperCase()} ${level.label}`, `Ridge Point: ${formatCompactNumber(level.ridge_x, 2)} FLOP/B`],
                        });
                      }}
                    />
                  </g>
                );
              });
          })}

          <text x={mapX(0.12, view)} y={mapY(4, view)} fill="#9ca3af" fontSize="11">Memory Bound</text>
          <text x={mapX(60, view)} y={mapY(4, view)} fill="#9ca3af" fontSize="11">Compute Bound</text>

          {kernels.map((kernel) => (
            <g key={kernel.id}>
              <line x1={mapX(kernel.arithmetic_intensity || DEFAULT_X.min, view)} y1={MARGINS.top + PLOT_HEIGHT} x2={mapX(kernel.arithmetic_intensity || DEFAULT_X.min, view)} y2={mapY(kernel.achieved_gflops || 1, view)} stroke="#d1d5db" strokeDasharray="4 4" />
              <line x1={MARGINS.left} y1={mapY(kernel.achieved_gflops || 1, view)} x2={mapX(kernel.arithmetic_intensity || DEFAULT_X.min, view)} y2={mapY(kernel.achieved_gflops || 1, view)} stroke="#d1d5db" strokeDasharray="4 4" />
              <rect
                x={mapX(kernel.arithmetic_intensity || DEFAULT_X.min, view) - 5}
                y={mapY(kernel.achieved_gflops || 1, view) - 5}
                width="10"
                height="10"
                fill="#dcfce7"
                stroke="#4ade80"
                strokeWidth="2"
                onMouseEnter={(event) => {
                  const rect = plotWrapRef.current?.getBoundingClientRect();
                  setTooltip({
                    left: event.clientX - (rect?.left || 0) + 12,
                    top: event.clientY - (rect?.top || 0) + 12,
                    lines: [kernel.name || "KERNEL", `AI: ${formatCompactNumber(kernel.arithmetic_intensity, 2)} FLOP/B`, `Perf: ${formatCompactNumber(kernel.achieved_gflops, 2)} GFLOP/s`, `Bound: ${kernel.bound}`],
                  });
                }}
              />
              <text x={mapX(kernel.arithmetic_intensity || DEFAULT_X.min, view) + 10} y={mapY(kernel.achieved_gflops || 1, view) + 4} fontSize="12" fill="#374151">{kernel.name || "KERNEL"}</text>
            </g>
          ))}
        </svg>

        {tooltip ? (
          <div className="pointer-events-none absolute z-10 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 shadow-lg" style={{ left: tooltip.left, top: tooltip.top }}>
            {tooltip.lines.map((line) => <div key={line}>{line}</div>)}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-200 pt-4">
        {activePrecisionIds.map((precisionId) => {
          const option = PRECISION_OPTIONS.find((item) => item.id === precisionId);
          if (!option) return null;
          const colors = getPrimaryPrecisionColor(precisionId);
          return (
            <div key={precisionId} className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <span className="block h-0.5 w-6" style={{ backgroundColor: colors.ceiling }} />
              <span>{option.label}</span>
            </div>
          );
        })}
        {visibleLevels.filter((level) => level !== "HBM").map((level) => {
          const roofline = rooflinesByPrecision[primaryPrecision]?.memoryLevels?.find((entry) => entry.label === level);
          if (!roofline) return null;
          return (
            <div key={level} className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <span className="block h-0.5 w-6" style={{ backgroundColor: roofline.color }} />
              <span>{level} slope</span>
            </div>
          );
        })}
        {kernels.map((kernel) => (
          <div key={`${kernel.id}-legend`} className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <span className="h-3 w-3 rounded-sm border border-green-400 bg-green-100" />
            <span>{kernel.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
