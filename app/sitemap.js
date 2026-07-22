import { absoluteUrl } from '../src/lib/seo';
import { getAllGuides } from '../src/data/guidesContent';
import { getIndexableModelIds, modelPath } from '../src/lib/modelIndexing';
import { CURATED_GPUS, canIRunGpuPath, canIRunPath, getCuratedCombos } from '../src/data/canIRunData';
import { getTutorialsFromFirestore } from '../src/lib/tutorialsFirestore';

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
  { path: '/authors/dhiraj', priority: 0.65, changeFrequency: 'monthly' },
  { path: '/editorial-policy', priority: 0.65, changeFrequency: 'monthly' },
  { path: '/guides', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/ai-tutorials', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/ai-tutorials/rag', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/ai-updates', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/ai-inference', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/ai-inference/tutorial', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/compare', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/coding-model-analysis', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/validation-lab', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/gpu', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/can-i-run', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/gpu/hardware', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/gpu/execution', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/gpu/performance', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/gpu/tools/vram-calculator', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/gpu/tools/gpu-picker', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/gpu/tools/cost-calculator', priority: 0.85, changeFrequency: 'weekly' },
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

// Firestore stores dates as Timestamps, ISO strings, or human text like "March 2025".
// Anything unparseable falls back rather than emitting an Invalid Date into the sitemap.
function toDate(value, fallback) {
  if (!value) return fallback;
  const parsed = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export default async function sitemap() {
  const lastModified = new Date();
  const guides = getAllGuides();
  const tutorials = await getTutorialsFromFirestore();

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

  const modelRoutes = getIndexableModelIds().map((modelId) => ({
    url: absoluteUrl(modelPath(modelId)),
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Per-GPU hub pages ("what can I run on an RTX 4090?") rank higher than any single
  // combo and are the crawl path into them, so they carry a higher priority.
  const canIRunGpuRoutes = CURATED_GPUS.map((gpu) => ({
    url: absoluteUrl(canIRunGpuPath(gpu.slug)),
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const canIRunRoutes = getCuratedCombos().map(({ gpu, model }) => ({
    url: absoluteUrl(canIRunPath(gpu.slug, model.id)),
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Firestore-backed tutorials. Skipped when a URL is already declared above
  // (e.g. /ai-tutorials/rag) so the sitemap never lists a URL twice.
  const declaredUrls = new Set(staticSitemap.map((entry) => entry.url));
  const tutorialRoutes = tutorials
    .map((tutorial) => ({
      url: absoluteUrl(tutorial.href || `/ai-tutorials/${tutorial.slug}`),
      lastModified: toDate(tutorial.updatedAt || tutorial.lastUpdated, lastModified),
      changeFrequency: 'monthly',
      priority: 0.8,
    }))
    .filter((entry) => !declaredUrls.has(entry.url));

  return [
    ...staticSitemap,
    ...guideRoutes,
    ...tutorialRoutes,
    ...modelRoutes,
    ...canIRunGpuRoutes,
    ...canIRunRoutes,
  ];
}
