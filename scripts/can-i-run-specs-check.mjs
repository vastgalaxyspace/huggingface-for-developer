// Verifies every CURATED_MODEL in src/data/canIRunData.js against the real
// config.json on Hugging Face.
//
// This matters because /can-i-run/* pages are indexed and state a confident
// numeric verdict ("needs 41.2 GB, your card has 24"). A wrong layer count or
// kv_head count silently produces a wrong KV-cache size and therefore a wrong
// answer on a page Google is ranking. Guessing these values is not acceptable;
// this check makes them provable.
//
// Usage: node scripts/can-i-run-specs-check.mjs
// HF_TOKEN is optional but avoids rate limits and reads gated repo configs.

import { CURATED_MODELS } from '../src/data/canIRunData.js';

const TOKEN = process.env.HF_TOKEN || '';
const headers = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};

// config.json key -> our spec key. head_dim is often omitted and derived.
const FIELDS = [
  ['num_hidden_layers', 'layers'],
  ['num_attention_heads', 'heads'],
  ['num_key_value_heads', 'kvHeads'],
  ['hidden_size', 'hiddenSize'],
  ['max_position_embeddings', 'context'],
];

async function fetchConfig(modelId) {
  const url = `https://huggingface.co/${modelId}/resolve/main/config.json`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

const failures = [];
const skipped = [];
let verified = 0;

for (const model of CURATED_MODELS) {
  let config;
  try {
    config = await fetchConfig(model.id);
  } catch (err) {
    // A gated or moved repo is not a spec error; report it rather than failing the
    // build, but never let it be mistaken for a passing verification.
    skipped.push(`${model.id} — could not read config.json (${err.message})`);
    continue;
  }

  const expectedHeadDim =
    config.head_dim || Math.round(config.hidden_size / config.num_attention_heads);

  for (const [configKey, specKey] of FIELDS) {
    const actual = config[configKey];
    if (actual === undefined) continue;
    if (Number(actual) !== Number(model[specKey])) {
      failures.push(
        `${model.id}: ${specKey} is ${model[specKey]} but config.json says ${configKey}=${actual}`
      );
    }
  }

  if (Number(expectedHeadDim) !== Number(model.headDim)) {
    failures.push(
      `${model.id}: headDim is ${model.headDim} but config.json implies ${expectedHeadDim}`
    );
  }

  verified += 1;
}

if (skipped.length > 0) {
  console.warn('\nCould not verify (gated/unreachable):\n');
  for (const s of skipped) console.warn(`- ${s}`);
}

if (failures.length > 0) {
  console.error('\ncan-i-run spec check FAILED:\n');
  for (const f of failures) console.error(`- ${f}`);
  console.error('\nThese specs drive the VRAM verdict on indexed pages. Fix them.\n');
  process.exit(1);
}

console.log(
  `\ncan-i-run spec check passed: ${verified}/${CURATED_MODELS.length} models match their config.json.`
);
if (skipped.length > 0) {
  console.log(`${skipped.length} could not be verified — see warnings above.`);
}
