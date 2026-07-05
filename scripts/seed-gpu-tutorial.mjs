import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { doc, setDoc } from 'firebase/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

    const [key, ...valueParts] = trimmed.split('=');
    if (!key || process.env[key]) continue;

    const rawValue = valueParts.join('=').trim();
    process.env[key.trim()] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}

loadEnvFile(path.join(rootDir, '.env.local'));

const { getFirestore } = await import('firebase/firestore');
const { PHYSICAL_HARDWARE_THEORY } = await import('../src/data/physicalHardwareTheory.js');
const { MEMORY_HIERARCHY_THEORY } = await import('../src/data/memoryHierarchyTheory.js');
const { EXECUTION_MODEL_THEORY } = await import('../src/data/executionModelTheory.js');
const { COMPILATION_PIPELINE_THEORY } = await import('../src/data/compilationPipelineTheory.js');
const { CUDA_PROGRAMMING_THEORY } = await import('../src/data/cudaProgrammingTheory.js');
const { DRIVER_STACK_THEORY } = await import('../src/data/driverStackTheory.js');
const { LIBRARIES_FRAMEWORKS_THEORY } = await import('../src/data/librariesFrameworksTheory.js');

const normalizeTheoryForFirestore = (items) =>
  items.map((topic) => ({
    ...topic,
    blocks: (topic.blocks || []).map((block) => ({
      ...block,
      sections: (block.sections || []).map((section) => {
        if (section.type !== 'table' || !Array.isArray(section.rows)) {
          return section;
        }

        return {
          ...section,
          rows: section.rows.map((row) => ({ cells: row })),
        };
      }),
    })),
  }));

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} env var`);
  }
  return value;
}

const firebaseConfig = {
  apiKey: requiredEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
  projectId: requiredEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: requiredEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: requiredEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: requiredEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

const topics = {
  'physical-hardware': {
    id: '01',
    title: 'Physical Hardware',
    subtitle: 'GPU chip structure, SM internals, and compute building blocks.',
    learning: [
      'GPU hierarchy: GPC -> TPC -> SM',
      'SM internals across generations',
      'CUDA cores, Tensor cores, and SFU roles',
      'Warp scheduler behavior and switching',
      'TMA overview for Hopper+',
    ],
    visuals: [
      'Clickable SM diagram',
      'Hierarchy tree: GPU -> GPC -> TPC -> SM',
      'CUDA core vs Tensor core race simulation',
      'Generation comparison slider',
    ],
    theory: normalizeTheoryForFirestore(PHYSICAL_HARDWARE_THEORY),
  },
  'memory-hierarchy': {
    id: '02',
    title: 'Memory Hierarchy',
    subtitle: 'Data movement from registers to VRAM and bottlenecks.',
    learning: [
      'Register file - fastest storage, 65536 per SM, and spill behavior',
      'Shared memory / L1 cache - scratchpad model, programmer control, and H100 sizing',
      'L2 cache - shared across SMs between L1 and VRAM',
      'GPU RAM (VRAM / global memory) - HBM2e/HBM3 and model-state placement',
      'HBM vs GDDR - bandwidth and data-center trade-offs',
      'Memory banks and bank conflicts - 32-bank mapping and serialization',
      'Memory coalescing - consecutive vs strided transaction behavior',
      'Tensor memory (Blackwell) - dedicated memory path for Tensor cores',
    ],
    visuals: [
      'Latency animation: registers -> shared -> L2 -> VRAM',
      'Memory pyramid with speed/size levels',
      'Coalescing visualizer with 32 threads',
      'Bank conflict detector',
    ],
    theory: normalizeTheoryForFirestore(MEMORY_HIERARCHY_THEORY),
  },
  'execution-model': {
    id: '03',
    title: 'Execution Model',
    subtitle: 'Threads, warps, occupancy, and scheduler behavior.',
    learning: [
      'Thread - smallest unit with private PC and registers',
      'Warp - 32 threads and scheduler issue unit',
      'Thread Block (CTA) - shared memory and synchronization',
      'Grid - full kernel launch of independent blocks',
      'SIMT - one instruction across many threads',
      'Warp divergence - masking, predication, and cost',
      'Latency hiding - switching warps to cover memory wait',
      'Occupancy - active warps versus theoretical maximum',
      'Warpgroup (Hopper+) - 4-warps wgmma execution',
      'Thread Block Cluster (Hopper+) - inter-block cooperation',
      'Warp execution states - active, eligible, selected, stalled',
      'Scoreboard stalls - short versus long latency dependencies',
    ],
    visuals: [
      'Warp execution stepper',
      'Divergence simulator',
      'Latency hiding timeline',
      'Thread -> warp -> block -> grid builder',
    ],
    theory: normalizeTheoryForFirestore(EXECUTION_MODEL_THEORY),
  },
  'compilation-pipeline': {
    id: '04',
    title: 'Compilation Pipeline',
    subtitle: 'From CUDA source to PTX/SASS and architecture execution.',
    learning: [
      'CUDA C++ -> PTX -> SASS -> Binary pipeline',
      'PTX portability and virtual ISA',
      'SASS architecture-specific instruction layer',
      'nvcc flow and compute capability mapping',
    ],
    visuals: [
      'Pipeline walkthrough side-by-side',
      'PTX vs SASS diff explorer',
      'SM feature matrix by capability',
    ],
    theory: normalizeTheoryForFirestore(COMPILATION_PIPELINE_THEORY),
  },
  'cuda-programming': {
    id: '05',
    title: 'CUDA Programming',
    subtitle: 'Kernel design, memory access, and runtime optimization.',
    learning: [
      'CUDA keywords and memory qualifiers',
      'Kernel launch dimensions and mapping',
      'cudaMalloc / cudaMemcpy / cudaFree fundamentals',
      'Shared memory tiling and synchronization',
      'Streams and CUDA graphs',
    ],
    visuals: [
      'Kernel launch configurator',
      'Memory access pattern visualizer',
      'Shared memory tiling animation',
      'Stream overlap timeline',
    ],
    theory: normalizeTheoryForFirestore(CUDA_PROGRAMMING_THEORY),
  },
  'driver-stack': {
    id: '06',
    title: 'Driver Stack',
    subtitle: 'Runtime, driver, and system-level GPU software flow.',
    learning: [
      'NVIDIA driver module responsibilities',
      'Driver API vs Runtime API',
      'NVML and nvidia-smi metric semantics',
      'CUPTI role for profiling',
      'Full app-to-hardware software stack',
    ],
    visuals: [
      'Layer diagram from framework to silicon',
      'Kernel launch flow animation',
      'Annotated nvidia-smi output guide',
    ],
    theory: normalizeTheoryForFirestore(DRIVER_STACK_THEORY),
  },
  'libraries-frameworks': {
    id: '07',
    title: 'Libraries & Frameworks',
    subtitle: 'cuBLAS/cuDNN/Triton/PyTorch and profiling workflow.',
    learning: [
      'cuBLAS GEMM and Tensor Core usage',
      'cuDNN operator acceleration',
      'Triton custom kernel workflow',
      'PyTorch runtime integration',
      'Nsight and binary inspection tooling',
    ],
    visuals: [
      'Library call chain visualization',
      'Nsight timeline reader',
      'cuBLAS vs naive GEMM simulation',
      'Roofline map for common operations',
    ],
    theory: normalizeTheoryForFirestore(LIBRARIES_FRAMEWORKS_THEORY),
  },
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const collectionName = requiredEnv('NEXT_PUBLIC_TUTORIALS_COLLECTION');
const tutorialId = 'gpu';

const tutorial = {
  slug: tutorialId,
  href: '/gpu',
  title: 'GPU Tutorial for AI Developers',
  description: 'Learn GPU hardware, memory hierarchy, execution, CUDA basics, and framework layers that shape AI performance.',
  icon: 'cpu',
  level: 'GPU Track',
  readTime: '7 lessons',
  featured: true,
  showInLibrary: true,
  published: true,
  order: 2,
  updatedAt: new Date(),
  topics,
};

try {
  await setDoc(doc(db, collectionName, tutorialId), tutorial, { merge: true });
  console.log(`Seeded ${collectionName}/${tutorialId} in Firebase project ${firebaseConfig.projectId}.`);
} catch (err) {
  if (err?.code === 'permission-denied') {
    console.error(
      `Firestore denied the write to ${collectionName}/${tutorialId}. ` +
        'Temporarily allow writes for this collection or run an admin seed script with a service account.'
    );
    process.exit(1);
  }

  throw err;
}
