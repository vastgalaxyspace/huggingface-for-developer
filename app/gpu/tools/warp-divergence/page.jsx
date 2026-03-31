import { pageMetadata } from '../../../../src/lib/seo';
import WarpDivergencePage from '../../../../src/components/warp-divergence/WarpDivergencePage';

export const metadata = pageMetadata({
  title: 'Warp Divergence Visualizer',
  description:
    'Visualize warp divergence and thread scheduling to understand how control flow affects GPU efficiency.',
  path: '/gpu/tools/warp-divergence',
  keywords: ['warp divergence visualizer', 'GPU scheduling', 'CUDA divergence'],
});

export default function Page() {
  return <WarpDivergencePage />;
}
