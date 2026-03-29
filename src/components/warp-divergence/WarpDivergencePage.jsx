"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { normalizeExpression, useWarpDivergence, validateExpression } from "../../hooks/useWarpDivergence";
import KernelConditionalPanel from "./KernelConditionalPanel";
import WarpGridPanel from "./WarpGridPanel";
import DivergenceExplainer from "./DivergenceExplainer";
import ExecutionMetrics from "./ExecutionMetrics";

const DEFAULT_EXPRESSION = "threadIdx.x % 3 == 0";

export default function WarpDivergencePage() {
  const [inputExpression, setInputExpression] = useState(DEFAULT_EXPRESSION);
  const [committedExpression, setCommittedExpression] = useState(DEFAULT_EXPRESSION);
  const [copyStatus, setCopyStatus] = useState("");

  const validation = useMemo(() => validateExpression(inputExpression), [inputExpression]);
  const analysis = useWarpDivergence({
    expression: committedExpression,
    nestedEnabled: false,
    nestedExpression: "",
  });

  const handleEvaluate = () => {
    const normalized = normalizeExpression(inputExpression);
    if (!validateExpression(normalized).valid) return;
    setCommittedExpression(normalized);
    setInputExpression(normalized);
  };

  const handleQuickExample = (example) => {
    const normalized = normalizeExpression(example);
    setInputExpression(normalized);
    setCommittedExpression(normalized);
  };

  const handleCopyMetrics = async () => {
    const metrics = `Condition: ${analysis.normalizedExpression}
Efficiency: ${analysis.efficiency}% | Passes: ${analysis.num_passes} | Active: ${analysis.active_count}/32 | Waiting: ${analysis.waiting_count}/32`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(metrics);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = metrics;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopyStatus("Metrics copied.");
    } catch {
      setCopyStatus("Copy failed. Your browser blocked clipboard access.");
    }

    window.setTimeout(() => {
      setCopyStatus("");
    }, 2000);
  };

  return (
    <div className="min-h-[calc(100vh-78px)] bg-slate-100 py-8 md:py-12">
      <div className="shell-container">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <Link href="/gpu" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#274867]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to GPU
          </Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-gray-400">Precision Tool</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900 md:text-5xl">Warp Divergence Visualizer</h1>
          <p className="mt-4 max-w-[760px] text-sm leading-7 text-gray-600">
            Enter a CUDA branch condition and visualize how a warp serializes active and waiting lanes across execution passes.
          </p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[35%_65%]">
          <KernelConditionalPanel
            expression={inputExpression}
            validation={validation}
            analysis={analysis}
            onExpressionChange={setInputExpression}
            onEvaluate={handleEvaluate}
            onQuickExample={handleQuickExample}
          />

          <div className="space-y-6">
            <WarpGridPanel key={analysis.normalizedExpression} analysis={analysis} />
            <DivergenceExplainer analysis={analysis} />
            <ExecutionMetrics
              analysis={analysis}
              expression={analysis.normalizedExpression}
              onCopy={handleCopyMetrics}
              copyStatus={copyStatus}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
