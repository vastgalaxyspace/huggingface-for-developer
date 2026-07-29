// Asserts the ad-serving gate in src/lib/adPolicy.js still does what it claims.
//
// AdSense rejected this site for "Low value content" in July 2026. The fix was to
// stop mounting the ad loader sitewide and serve it only on routes with substantial
// publisher-written content. That guarantee is easy to break by accident: adding a
// thin page under an allowed prefix (say /gpu/something-new) silently opts it in.
//
// This script pins the routes that must stay blocked, pins the ones that must stay
// allowed, and then lists every route discovered under app/ with its verdict so a
// new one cannot slip through unnoticed.
//
// Run: npm run ads:check

import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { shouldServeAds } from '../src/lib/adPolicy.js';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const APP_DIR = join(ROOT, 'app');

// Routes that must never serve ads: behavioural screens (account, quiz) and pages
// whose body is fetched client-side, so their server HTML is an empty shell.
const MUST_BLOCK = [
  '/login',
  '/profile',
  '/favorites',
  '/gpu/test',
  '/ai-inference/tutorial/test',
  // Aggregated third-party announcements: substantial in length, but not our
  // commentary. See the note in src/lib/adPolicy.js.
  '/ai-updates',
  '/contact',
  '/privacy',
  '/terms',
  '/authors/dhiraj',
  '/about',
  '/editorial-policy',
  '/ai-inference',
];

// Routes that must keep serving ads: verified to render substantial text server-side.
const MUST_ALLOW = [
  '/',
  '/guides',
  '/guides/rag-vs-fine-tuning',
  '/can-i-run',
  '/can-i-run/rtx-4090',
  '/gpu',
  '/gpu/hardware',
  '/gpu/execution',
  '/gpu/performance',
  '/gpu/learning/memory-hierarchy',
  '/gpu/tools/vram-calculator',
  '/gpu/tools/gpu-picker',
  '/coding-model-analysis',
  '/ai-tutorials',
  // Previously client-rendered shells, now server-rendered with real content.
  '/ai-tutorials/rag',
  '/ai-inference/tutorial',
  '/compare',
  '/recommender',
  '/validation-lab',
];

/** Walk app/ and derive the static route for every page.jsx. */
function discoverRoutes(dir = APP_DIR, routes = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'api') continue;
      discoverRoutes(full, routes);
    } else if (entry === 'page.jsx' || entry === 'page.js') {
      const rel = relative(APP_DIR, dir).split(sep).filter(Boolean);
      routes.push(`/${rel.join('/')}`.replace(/\/$/, '') || '/');
    }
  }
  return routes;
}

const failures = [];

for (const route of MUST_BLOCK) {
  if (shouldServeAds(route)) failures.push(`${route} must NOT serve ads, but the policy allows it`);
}
for (const route of MUST_ALLOW) {
  if (!shouldServeAds(route)) failures.push(`${route} must serve ads, but the policy blocks it`);
}

// Trailing slashes and malformed input must never fall through to "allowed".
if (shouldServeAds('/guides/') !== shouldServeAds('/guides')) {
  failures.push('trailing slash changes the verdict for /guides');
}
for (const bad of ['', 'guides', '//', null, undefined]) {
  if (shouldServeAds(bad)) failures.push(`malformed pathname ${JSON.stringify(bad)} was allowed`);
}
// A prefix must not leak to a sibling that merely starts with the same characters.
if (shouldServeAds('/gpu-something-else')) {
  failures.push('/gpu prefix leaks to /gpu-something-else');
}

console.log('\nAd Policy Check\n');

const discovered = discoverRoutes().sort();
const dynamic = discovered.filter((r) => r.includes('['));
const staticRoutes = discovered.filter((r) => !r.includes('['));

for (const route of staticRoutes) {
  console.log(`  ${shouldServeAds(route) ? 'ADS   ' : 'no ads'} ${route}`);
}
if (dynamic.length) {
  console.log('\n  Dynamic routes (verdict depends on the resolved path):');
  for (const route of dynamic) console.log(`    ${route}`);
}

const adRoutes = staticRoutes.filter((r) => shouldServeAds(r)).length;
console.log(`\n  ${adRoutes} of ${staticRoutes.length} static routes serve ads.`);

if (failures.length) {
  console.error('\n[FAIL] Ad policy regressions:\n');
  for (const f of failures) console.error(`  - ${f}`);
  console.error('');
  process.exit(1);
}

console.log('\nAd policy check passed.\n');
