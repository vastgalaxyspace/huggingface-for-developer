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
const { PREREQUISITES_CHAPTER } = await import('../src/data/inference-tutorial/prerequisites.js');
const { MODELS_CHAPTER } = await import('../src/data/inference-tutorial/models.js');
const { HARDWARE_CHAPTER } = await import('../src/data/inference-tutorial/hardware.js');
const { SOFTWARE_CHAPTER } = await import('../src/data/inference-tutorial/software.js');
const { TECHNIQUES_CHAPTER } = await import('../src/data/inference-tutorial/techniques.js');
const { MODALITIES_CHAPTER } = await import('../src/data/inference-tutorial/modalities.js');
const { PRODUCTION_CHAPTER } = await import('../src/data/inference-tutorial/production.js');

const tutorialChapters = [
  PREREQUISITES_CHAPTER,
  MODELS_CHAPTER,
  HARDWARE_CHAPTER,
  SOFTWARE_CHAPTER,
  TECHNIQUES_CHAPTER,
  MODALITIES_CHAPTER,
  PRODUCTION_CHAPTER,
];

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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const collectionName = requiredEnv('NEXT_PUBLIC_TUTORIALS_COLLECTION');
const tutorialId = 'ai-inference';

const tutorial = {
  slug: tutorialId,
  href: '/ai-inference/tutorial',
  title: 'AI Inference Tutorial',
  description: 'A practical tutorial for AI inference, model serving, hardware, optimization, modalities, and production deployment.',
  published: true,
  order: 1,
  updatedAt: new Date(),
  chapters: tutorialChapters,
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
