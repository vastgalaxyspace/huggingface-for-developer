"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Label, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getLimiterColor, sectionLabelClassName } from "./kernel_utils";

const TABS = [
  { id: "block", label: "Block Size" },
  { id: "registers", label: "Registers" },
  { id: "smem", label: "Shared Memory" }
];

export default function SweepChart({ result }) {
  const [tab, setTab] = useState("block");

  const chart = useMemo(() => {
    if (!result) return { data: [], currentX: 0, dataKey: "threads", xLabel: "", tooltipLabel: "", lineColor: "#3b82f6", breakpoints: [] };
    if (tab === "registers") return { data: result.sweep_registers, currentX: result.registers_per_thread, dataKey: "registers", xLabel: "Registers per thread", tooltipLabel: "Registers", lineColor: getLimiterColor(result.bottleneck?.names?.[0] || "Register Limit"), breakpoints: [] };
    if (tab === "smem") return { data: result.sweep_smem, currentX: result.total_smem / 1024, dataKey: "smem_kb", xLabel: "Shared memory per block (KB)", tooltipLabel: "Shared Memory", lineColor: getLimiterColor(result.bottleneck?.names?.[0] || "Shared Memory"), breakpoints: result.sweep_smem.filter((item, index, array) => index > 0 && item.occupancy_percent !== array[index - 1].occupancy_percent) };
    return { data: result.sweep_blocksize, currentX: result.threads_per_block, dataKey: "threads", xLabel: "Threads per block", tooltipLabel: "Block", lineColor: getLimiterColor(result.bottleneck?.names?.[0] || "Warp/Thread Limit"), breakpoints: [] };
  }, [result, tab]);

  if (!result) return null;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className={sectionLabelClassName}>Sweep Analysis</p>
          <p className="mt-2 text-sm text-gray-500">Explore how occupancy shifts across launch shapes, register pressure, and shared memory.</p>
        </div>
        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          {TABS.map((item) => (
            <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${tab === item.id ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart.data} margin={{ top: 20, right: 20, left: 0, bottom: 16 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
            <XAxis dataKey={chart.dataKey} tick={{ fontSize: 12, fill: "#6b7280" }}>
              <Label value={chart.xLabel} offset={-8} position="insideBottom" style={{ fill: "#6b7280", fontSize: 12 }} />
            </XAxis>
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={(value) => `${value}%`} />
            <Tooltip
              formatter={(value, _name, payload) => [tab === "block" ? `${Number(value).toFixed(1)}% occupancy | Bottleneck: ${payload.payload.bottleneck}` : `${Number(value).toFixed(1)}% occupancy`, chart.tooltipLabel]}
              labelFormatter={(label) => `${chart.tooltipLabel}: ${label}${tab === "smem" ? " KB" : tab === "block" ? " threads" : ""}`}
              contentStyle={{ borderRadius: 12, borderColor: "#e5e7eb" }}
            />
            <ReferenceLine y={100} stroke="#9ca3af" strokeDasharray="4 4" />
            <ReferenceLine y={50} stroke="#eab308" strokeDasharray="4 4" />
            <ReferenceLine x={chart.currentX} stroke="#111827" strokeDasharray="6 4" />
            {tab === "smem"
              ? chart.breakpoints.map((point) => (
                  <ReferenceLine key={point.smem_kb} x={point.smem_kb} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `<= ${point.blocks} blocks/SM`, fill: "#ef4444", fontSize: 11 }} />
                ))
              : null}
            <Line
              type="monotone"
              dataKey="occupancy_percent"
              stroke={chart.lineColor}
              strokeWidth={3}
              dot={(props) => {
                const isCurrent = props.payload[chart.dataKey] === chart.currentX;
                return <circle cx={props.cx} cy={props.cy} r={isCurrent ? 6 : 0} fill={isCurrent ? chart.lineColor : "transparent"} stroke={isCurrent ? "#111827" : "transparent"} strokeWidth={2} />;
              }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
