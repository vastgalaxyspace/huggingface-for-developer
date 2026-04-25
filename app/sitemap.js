import { absoluteUrl } from '../src/lib/seo';
import { getTrendingModels } from '../src/services/huggingface';
import { getAllGuides } from '../src/data/guidesContent';

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
  { path: '/editorial-policy', priority: 0.65, changeFrequency: 'monthly' },
  { path: '/guides', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/ai-updates', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/ai-inference', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/ai-inference/tutorial', priority: 0.8, changeFrequency: 'monthly' },
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
  { path: '/terms', priority: 0.45, changeFrequency: 'yearly' },
  { path: '/recommender', priority: 0.85, changeFrequency: 'weekly' },
];

export default async function sitemap() {
  const lastModified = new Date();
  const guides = getAllGuides();

  const staticSitemap = routes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const guideRoutes = guides.map((guide) => ({
    url: absoluteUrl(`/guides/${guide.slug}`),
    lastModified: new Date(guide.lastUpdated || lastModified),
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  try {
    const trending = await getTrendingModels(150);
    const modelRoutes = trending.map((model) => ({
      url: absoluteUrl(`/model/${model.id}`),
      lastModified: new Date(model.lastModified || lastModified),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
    return [...staticSitemap, ...guideRoutes, ...modelRoutes];
  } catch (error) {
    console.warn("Failed to fetch dynamic models for sitemap", error);
    return [...staticSitemap, ...guideRoutes];
  }
}
