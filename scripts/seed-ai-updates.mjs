import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Seeds the ai_updates collection using the Firebase Admin SDK, which bypasses
// Firestore Security Rules entirely — so firestore.rules (allow write: if false)
// never needs to be loosened for this to work. Requires a service account key:
//   1. Firebase Console > Project Settings > Service Accounts > Generate new private key
//   2. Save the JSON file somewhere OUTSIDE the repo (never commit it)
//   3. Set GOOGLE_APPLICATION_CREDENTIALS to its absolute path before running this script
//
// Usage:
//   GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json" npm run seed:ai-updates
//
// Note: this appends new documents on every run (auto-generated ids). Re-running it
// without clearing the collection first will create duplicates.

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

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credentialsPath) {
  console.error(
    'Missing GOOGLE_APPLICATION_CREDENTIALS.\n' +
      'Generate a service account key in Firebase Console > Project Settings > Service Accounts,\n' +
      'save it outside the repo, then run:\n' +
      '  GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json" npm run seed:ai-updates'
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(credentialsPath), 'utf8'));

const { AI_UPDATES_SEED } = await import('../src/data/aiUpdatesSeed.js');

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

let written = 0;
for (const update of AI_UPDATES_SEED) {
  const docRef = db.collection('ai_updates').doc();
  await docRef.set({
    title: update.title,
    description: update.description,
    category: update.category,
    date: update.date,
    link: update.link,
    published: true,
    createdAt: Timestamp.fromDate(new Date(update.date)),
  });
  written += 1;
  console.log(`Seeded ai_updates/${docRef.id} — ${update.title}`);
}

console.log(`\nDone. Wrote ${written} documents to ai_updates in project ${serviceAccount.project_id}.`);
