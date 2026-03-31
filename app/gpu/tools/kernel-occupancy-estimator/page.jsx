import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import KernelOccupancyEstimatorClient from '../../../../src/components/kernel_KernelOccupancyEstimatorClient';
import { pageMetadata } from '../../../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'Kernel Occupancy Estimator',
  description:
    'Estimate theoretical kernel occupancy for CUDA, ROCm, and Triton and identify the resource bottlenecks that limit residency.',
  path: '/gpu/tools/kernel-occupancy-estimator',
  keywords: ['kernel occupancy estimator', 'CUDA occupancy', 'Triton occupancy'],
});

export default function KernelOccupancyEstimatorPage() {
  return (
    <div className="min-h-[calc(100vh-78px)] bg-gray-100 py-8 md:py-12">
      <div className="shell-container">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <Link href="/gpu" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#274867]">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to GPU
          </Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-gray-400">Precision Tool</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">Kernel Occupancy Estimator</h1>
          <p className="mt-4 max-w-[760px] text-sm leading-7 text-gray-600">
            Estimate theoretical occupancy for CUDA, ROCm, and Triton kernels, then isolate the resource bottlenecks that limit residency.
          </p>
        </section>
        <KernelOccupancyEstimatorClient />
      </div>
    </div>
  );
}
