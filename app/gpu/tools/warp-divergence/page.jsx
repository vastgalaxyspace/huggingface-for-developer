import { pageMetadata } from '../../../../src/lib/seo';
import WarpDivergencePage from '../../../../src/components/warp-divergence/WarpDivergencePage';
import WarpDivergenceContent from '../../../../src/components/warp-divergence/WarpDivergenceContent';

export const metadata = pageMetadata({
  title: 'Warp Divergence Visualizer',
  description:
    'Visualize warp divergence and thread scheduling to understand how control flow affects GPU efficiency.',
  path: '/gpu/tools/warp-divergence',
  keywords: ['warp divergence visualizer', 'GPU scheduling', 'CUDA divergence'],
});

export default function Page() {
  return (
    <>
      <WarpDivergencePage />
      <div className="bg-slate-100 pb-12">
        <div className="shell-container space-y-6">
          <WarpDivergenceContent />
        </div>
      </div>
    </>
  );
}
