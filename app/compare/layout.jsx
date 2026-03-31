import { pageMetadata } from '../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'Compare AI Models',
  description:
    'Compare AI models side by side across VRAM, parameters, context length, and licensing before you deploy.',
  path: '/compare',
  keywords: ['compare AI models', 'LLM comparison', 'VRAM comparison'],
});

export default function CompareLayout({ children }) {
  return <>{children}</>;
}
