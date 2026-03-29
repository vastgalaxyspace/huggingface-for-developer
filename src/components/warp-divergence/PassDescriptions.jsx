"use client";

export default function PassDescriptions({ passes, currentPass }) {
  if (passes.length === 1 && passes[0]?.no_divergence) {
    return (
      <div className="rounded-xl border border-green-300 bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-900">PASS 1</p>
        <p className="mt-1 text-sm text-gray-500">No divergence - all {passes[0].active_threads.length} threads execute the same path.</p>
        <p className="mt-3 text-sm font-medium text-green-700">100% warp efficiency achieved.</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${passes.length > 2 ? "md:grid-cols-1" : "md:grid-cols-2"}`}>
      {passes.map((pass) => (
        <div key={pass.id} className={`rounded-xl border bg-white p-4 ${currentPass === pass.id ? "border-gray-900" : "border-gray-200"}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-900">{pass.label}</p>
          <p className="mt-1 text-sm text-gray-500">{pass.description}</p>
          <p className="mt-3 text-sm font-medium text-gray-600">
            {pass.active_threads.length} threads active, {pass.waiting_threads.length} threads waiting
          </p>
        </div>
      ))}
    </div>
  );
}
