import { absoluteUrl } from '../src/lib/seo';

const learningTopicRoutes = [
  '/gpu/learning/physical-hardware',
  '/gpu/learning/memory-hierarchy',
  '/gpu/learning/execution-model',
  '/gpu/learning/compilation-pipeline',
  '/gpu/learning/cuda-programming',
  '/gpu/learning/driver-stack',
  '/gpu/learning/libraries-frameworks',
];

const routes = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/ai-updates', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/compare', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/gpu', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/gpu/hardware', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/gpu/execution', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/gpu/performance', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/gpu/tools/vram-calculator', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/gpu/tools/gpu-picker', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/gpu/tools/roofline-model-analyzer', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/gpu/tools/kernel-occupancy-estimator', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/gpu/tools/warp-divergence', priority: 0.75, changeFrequency: 'monthly' },
  ...learningTopicRoutes.map((path) => ({
    path,
    priority: path === '/gpu/learning/compilation-pipeline' ? 0.75 : 0.8,
    changeFrequency: 'monthly',
  })),
  { path: '/privacy', priority: 0.45, changeFrequency: 'yearly' },
  { path: '/recommender', priority: 0.85, changeFrequency: 'weekly' },
];

export default function sitemap() {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
