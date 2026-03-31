import { Suspense } from 'react';
import RooflineAnalyzerClient from '../../../src/components/roofline/RooflineAnalyzerClient';
import { pageMetadata } from '../../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'GPU Performance Analysis',
  description:
    'Explore roofline analysis concepts and inspect whether your GPU workloads are compute-bound or memory-bound.',
  path: '/gpu/performance',
  keywords: ['GPU performance', 'roofline analysis', 'memory bound vs compute bound'],
});

export default function GpuPerformancePage() {
  return (
    <div className="min-h-[calc(100vh-78px)] bg-slate-100 py-8 md:py-12">
      <div className="shell-container">
        <Suspense fallback={null}>
          <RooflineAnalyzerClient />
        </Suspense>
      </div>
    </div>
  );
}
