import { pageMetadata } from '../../../../src/lib/seo';

const TOPIC_METADATA = {
  'physical-hardware': {
    title: 'GPU Physical Hardware Guide',
    description: 'Learn GPU chip structure, SM internals, Tensor Cores, and the hardware foundations behind AI performance.',
  },
  'memory-hierarchy': {
    title: 'GPU Memory Hierarchy Guide',
    description: 'Understand registers, shared memory, L2 cache, and VRAM so you can reason about bandwidth and latency bottlenecks.',
  },
  'execution-model': {
    title: 'GPU Execution Model Guide',
    description: 'Study warps, blocks, grids, and divergence to understand how GPUs execute parallel workloads.',
  },
  'compilation-pipeline': {
    title: 'CUDA Compilation Pipeline Guide',
    description: 'Follow the path from CUDA source code to PTX, SASS, and the binaries that run on the GPU.',
  },
  'cuda-programming': {
    title: 'CUDA Programming Guide',
    description: 'Learn kernel design, memory access patterns, synchronization, and optimization strategies for CUDA workloads.',
  },
  'driver-stack': {
    title: 'GPU Driver Stack Guide',
    description: 'Understand how drivers, runtimes, and scheduling layers cooperate to run GPU workloads reliably.',
  },
  'libraries-frameworks': {
    title: 'GPU Libraries and Frameworks Guide',
    description: 'Explore CUDA libraries and ML frameworks that map model workloads onto GPU kernels.',
  },
};

export async function generateMetadata({ params }) {
  const unwrapParams = await params;
  const slug = unwrapParams.slug;
  const page = TOPIC_METADATA[slug];

  if (!page) {
    return pageMetadata({
      title: 'GPU Learning',
      description: 'Explore GPU learning content, architecture lessons, and practical AI performance guides.',
      path: '/gpu/learning',
    });
  }

  return pageMetadata({
    title: page.title,
    description: page.description,
    path: `/gpu/learning/${slug}`,
    keywords: [page.title, slug.replaceAll('-', ' '), 'GPU learning'],
    type: 'article',
  });
}

export default function LearningTopicLayout({ children }) {
  return children;
}
