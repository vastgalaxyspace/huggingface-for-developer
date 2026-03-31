import { pageMetadata } from '../../../src/lib/seo';
import WarpDivergencePage from '../../../src/components/warp-divergence/WarpDivergencePage';

export const metadata = pageMetadata({
  title: 'GPU Execution Model',
  description:
    'Understand warps, divergence, and scheduling behavior with an interactive GPU execution model walkthrough.',
  path: '/gpu/execution',
  keywords: ['GPU execution model', 'warp divergence', 'CUDA warps'],
});

export default function Page() {
  return <WarpDivergencePage />;
}
