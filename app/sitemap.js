import { absoluteUrl } from '../src/lib/seo';

const routes = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/ai-updates', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/compare', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/favorites', priority: 0.5, changeFrequency: 'weekly' },
  { path: '/gpu', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/gpu/hardware', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/gpu/execution', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/gpu/performance', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/gpu/tools/vram-calculator', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/gpu/tools/gpu-picker', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/gpu/tools/roofline-model-analyzer', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/gpu/tools/kernel-occupancy-estimator', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/gpu/tools/warp-divergence', priority: 0.75, changeFrequency: 'monthly' },
  { path: '/gpu/learning/physical-hardware', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/gpu/learning/memory-hierarchy', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/gpu/learning/execution-model', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/gpu/learning/compilation-pipeline', priority: 0.75, changeFrequency: 'monthly' },
  { path: '/gpu/learning/cuda-programming', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/gpu/learning/driver-stack', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/gpu/learning/libraries-frameworks', priority: 0.7, changeFrequency: 'monthly' },
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
