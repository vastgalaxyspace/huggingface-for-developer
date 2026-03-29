"use client";

export default function DivergenceExplainer({ analysis }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">DIVERGENCE EXPLAINER</p>

      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-900">WHAT HAPPENED</p>
        <p className="mt-2 text-sm leading-7 text-gray-600">{analysis.explainer.happened}</p>
      </div>

      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-900">HOW TO FIX IT</p>
        <p className="mt-2 text-sm leading-7 text-gray-600">{analysis.explainer.fix}</p>
      </div>
    </div>
  );
}
