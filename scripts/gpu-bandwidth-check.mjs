// Guards the memory-bandwidth figures in CURATED_GPUS.
//
// These feed the tokens-per-second estimate shown on the 38 indexed /can-i-run/{gpu}
// pages, so a wrong value publishes a wrong speed on a page Google is ranking. Unlike
// model specs there is no API to verify a GPU spec against, so this does the next
// best thing: every card that also appears in src/data/gpuPickerData.js is checked
// against that copy, which catches typos and drift between the two datasets.
//
// Cards with no second copy are listed as unverified rather than passing silently.
// They are published vendor specs and are the only entries needing a human eye.
//
// Run: npm run bandwidth:check

import { CURATED_GPUS } from '../src/data/canIRunData.js';
import { gpuPickerGpus } from '../src/data/gpuPickerData.js';
import { estimateDecodeSpeed } from '../src/utils/canIRunEngine.js';

// H100 and A100 80GB ship in SXM and PCIe variants with materially different
// bandwidth. CURATED_GPUS deliberately uses the SXM figure; pin the expected pick
// here so a future edit to either dataset has to be intentional.
const FORM_FACTOR_PINS = {
  h200: { expect: 4800, variant: 'H200 SXM' },
  h100: { expect: 3350, variant: 'H100 SXM (PCIe is 2000)' },
  'a100-80gb': { expect: 2000, variant: 'A100 SXM 80GB (PCIe is 1935)' },
  'a100-40gb': { expect: 1555, variant: 'A100 40GB (SXM and PCIe match)' },
};

const norm = (s) =>
  String(s).toLowerCase().replace(/nvidia|geforce|amd|radeon|tesla/g, '').replace(/[^a-z0-9]/g, '');

const findPeer = (gpu) => {
  const n = norm(gpu.name);
  return (
    gpuPickerGpus.find((x) => norm(x.short_name || x.name) === n && x.vram_gb === gpu.vram) ||
    gpuPickerGpus.find((x) => norm(x.short_name || x.name) === n) ||
    null
  );
};

const failures = [];
const unverified = [];
let crossChecked = 0;

for (const gpu of CURATED_GPUS) {
  if (!Number.isFinite(gpu.bandwidth) || gpu.bandwidth <= 0) {
    failures.push(`${gpu.slug}: missing or invalid bandwidth (${gpu.bandwidth})`);
    continue;
  }

  const pin = FORM_FACTOR_PINS[gpu.slug];
  if (pin) {
    if (gpu.bandwidth !== pin.expect) {
      failures.push(
        `${gpu.slug}: bandwidth ${gpu.bandwidth} != pinned ${pin.expect} for ${pin.variant}`,
      );
    } else {
      crossChecked += 1;
    }
    continue;
  }

  const peer = findPeer(gpu);
  if (!peer) {
    unverified.push(gpu);
    continue;
  }
  if (peer.memory_bandwidth_gbps !== gpu.bandwidth) {
    failures.push(
      `${gpu.slug}: ${gpu.bandwidth} GB/s in canIRunData but ` +
        `${peer.memory_bandwidth_gbps} GB/s in gpuPickerData (${peer.short_name || peer.name})`,
    );
  } else {
    crossChecked += 1;
  }
}

// Sanity-bound the derived estimate. A plausible single-stream decode figure for the
// tracked hardware sits well inside these bounds; anything outside means the formula
// or a bandwidth value has gone wrong.
const smallest = [...CURATED_GPUS].sort((a, b) => a.bandwidth - b.bandwidth)[0];
const largest = [...CURATED_GPUS].sort((a, b) => b.bandwidth - a.bandwidth)[0];
const slowCase = estimateDecodeSpeed(70.6, smallest.bandwidth, 'int4');
const fastCase = estimateDecodeSpeed(3.21, largest.bandwidth, 'int4');
if (!(slowCase > 0 && slowCase < 20)) {
  failures.push(`70B int4 on ${smallest.slug} estimated ${slowCase} tok/s — outside the plausible range`);
}
if (!(fastCase > 100 && fastCase < 3000)) {
  failures.push(`3B int4 on ${largest.slug} estimated ${fastCase} tok/s — outside the plausible range`);
}

console.log('\nGPU Bandwidth Check\n');
console.log(`  ${crossChecked} of ${CURATED_GPUS.length} cards cross-checked or pinned.`);

if (unverified.length) {
  console.log(`\n  Vendor spec only — no second copy in this repo to check against (${unverified.length}):`);
  for (const gpu of unverified) {
    console.log(`    ${String(gpu.bandwidth).padStart(5)} GB/s  ${gpu.name}`);
  }
}

if (failures.length) {
  console.error('\n[FAIL] Bandwidth problems:\n');
  for (const f of failures) console.error(`  - ${f}`);
  console.error('');
  process.exit(1);
}

console.log('\nBandwidth check passed.\n');
