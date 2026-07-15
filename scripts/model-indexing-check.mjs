import { getIndexableModelIds, isModelIndexable, modelPath } from '../src/lib/modelIndexing.js';
import { hasBespokeEditorial } from '../src/lib/modelEditorial.js';

const indexed = getIndexableModelIds();
const failures = [];

for (const modelId of indexed) {
  if (!isModelIndexable(modelId)) {
    failures.push(`${modelId} is listed but not recognized as indexable`);
  }
  if (!modelPath(modelId).startsWith('/model/')) {
    failures.push(`${modelId} produced an invalid model path`);
  }
  // An indexable page must carry hand-written family guidance. Without this, a model
  // can be added to the whitelist and quietly ship a page of generic boilerplate.
  if (!hasBespokeEditorial(modelId)) {
    failures.push(
      `${modelId} is indexable but falls back to generic editorial — add a family entry to FAMILY_GUIDANCE in src/lib/modelEditorial.js, or drop it from INDEXABLE_MODEL_IDS`
    );
  }
}

const weakExamples = [
  'some-user/random-tiny-test-model',
  'openai-community/gpt2',
  'sentence-transformers/all-MiniLM-L6-v2',
];

for (const modelId of weakExamples) {
  if (isModelIndexable(modelId)) {
    failures.push(`${modelId} should remain noindex but matched the whitelist`);
  }
}

if (failures.length > 0) {
  console.error('\nModel indexing check failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Model indexing check passed for ${indexed.length} curated model URLs (all carry bespoke editorial).`
);
