import GpuPickerPage from '../../../../src/components/gpu-picker/GpuPickerPage';
import { pageMetadata } from '../../../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'GPU Picker for AI Models',
  description:
    'Match an AI model to the right GPU based on VRAM, budget, throughput, and deployment intent.',
  path: '/gpu/tools/gpu-picker',
  keywords: ['GPU picker', 'best GPU for LLM', 'GPU recommendation tool'],
});

export default function Page() {
  return <GpuPickerPage />;
}
