import { pageMetadata } from '../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'GPU Hub & Hardware Tools',
  description:
    'Learn GPU architecture, understand execution behavior, and use practical performance tools for AI workloads.',
  path: '/gpu',
  keywords: ['GPU tools', 'GPU architecture', 'VRAM calculator', 'roofline model'],
});

export default function GpuLayout({ children }) {
  return <>{children}</>;
}
