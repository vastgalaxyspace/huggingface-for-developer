import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function KernelOccupancyEstimatorPage() {
  return (
    <div className="min-h-[calc(100vh-78px)] bg-[#f2f6fb] py-8 md:py-12">
      <div className="shell-container">
        <section className="rounded-[20px] border border-[#d7dfe8] bg-white p-6 shadow-[0_12px_30px_rgba(31,45,61,0.08)] md:p-8">
          <Link href="/gpu" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#274867]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to GPU
          </Link>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#71859b]">Precision Tool</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.02em] text-[#16202b] md:text-5xl">Kernel Occupancy Estimator</h1>
          <p className="mt-4 max-w-[760px] text-sm leading-7 text-[#536b83]">
            Model active warps and estimate occupancy impact from threads per block, register usage, and shared memory.
          </p>
        </section>
      </div>
    </div>
  );
}
