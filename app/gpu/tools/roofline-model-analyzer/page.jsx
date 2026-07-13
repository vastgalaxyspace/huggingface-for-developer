import { Suspense } from 'react';
import RooflineAnalyzerClient from '../../../../src/components/roofline/RooflineAnalyzerClient';
import RooflineContent from '../../../../src/components/roofline/RooflineContent';
import { pageMetadata } from '../../../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'Roofline Model Analyzer',
  description:
    'Analyze arithmetic intensity and estimate whether your workload is limited by memory bandwidth or compute throughput.',
  path: '/gpu/tools/roofline-model-analyzer',
  keywords: ['roofline model analyzer', 'arithmetic intensity', 'GPU roofline'],
});

export default function RooflineModelAnalyzerPage() {
  return (
    <div className="bg-slate-100 py-8 md:py-12">
      <div className="shell-container space-y-6">
        <Suspense fallback={null}>
          <RooflineAnalyzerClient />
        </Suspense>
        <RooflineContent />
      </div>
    </div>
  );
}
