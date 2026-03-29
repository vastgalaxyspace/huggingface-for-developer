"use client";

export default function QuantizedAlternatives({ alternatives, profile }) {
  if (!alternatives.length) return null;

  const bestValue = alternatives.find((row) => row.best_value && row.precision !== "fp16");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 ease-in-out">
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">QUANTIZED ALTERNATIVES</p>
      <p className="mt-2 text-sm text-gray-500">Run {profile.model_id} on smaller GPUs with quantization</p>
      {profile.is_quantized ? (
        <p className="mt-3 text-sm text-blue-700">
          This model is already quantized ({profile.current_precision}). Showing unquantized equivalent for comparison.
        </p>
      ) : null}
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-4 py-3">Precision</th>
              <th className="px-4 py-3">VRAM Needed</th>
              <th className="px-4 py-3">Smallest GPU That Fits</th>
              <th className="px-4 py-3">Est. Price</th>
              <th className="px-4 py-3">Quality Impact</th>
            </tr>
          </thead>
          <tbody>
            {alternatives.map((row) => (
              <tr
                key={row.precision}
                className={`border-t border-gray-200 hover:bg-gray-50 ${
                  row.current ? "border-l-2 border-l-blue-400 bg-blue-50" : row.precision === bestValue?.precision ? "border-l-2 border-l-emerald-400 bg-emerald-50" : ""
                }`}
              >
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{row.label}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{row.vram_gb.toFixed(1)} GB</td>
                <td className="px-4 py-3 text-sm text-gray-600">{row.cheapest_gpu?.short_name || "No single GPU fit"}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{row.cheapest_gpu?.price_label || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{row.quality_impact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
