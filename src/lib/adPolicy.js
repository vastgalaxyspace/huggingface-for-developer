// Which routes may serve Google ads.
//
// Google Publisher Policies ("Inventory value") prohibit Google ads on screens with
// low-value content or no publisher-provided content, and on screens used for
// alerts, navigation, or other behavioural purposes. AdSense rejected this site for
// "Low value content" in July 2026, so this gate is deliberately conservative: the
// loader is opt-in per route rather than sitewide, and a route only qualifies if it
// serves substantial publisher-written text in its server-rendered HTML.
//
// The threshold used is ~500 words of rendered body text, measured against the real
// HTML (not the JSX source — most of these pages compose their text from components
// and hooks, so source length says nothing useful). Counts noted below were measured
// on 2026-07-26. Re-measure before adding a route; a route that renders its body
// client-side will look empty to the AdSense reviewer no matter how long it reads in
// a browser.
//
// Note this does NOT affect site verification: the google-adsense-account meta tag
// in app/layout.jsx and /public/ads.txt are both sitewide and unconditional.

// Exact paths. Used where a subtree contains pages that would not qualify.
const ALLOWED_EXACT = new Set([
  '/', //                        1,044 words
  '/ai-tutorials', //              587 words — index only; the subtree varies
  '/ai-tutorials/rag', //        4,366 words — all chapters now server-rendered
  '/ai-inference/tutorial', //   9,028 words — all chapters now server-rendered
  '/coding-model-analysis', //   1,843 words
  '/compare', //                 ~1,400 words — tool plus server-rendered editorial
  '/recommender', //             1,041 words — tool plus server-rendered editorial
  '/validation-lab', //            722 words — tool plus server-rendered editorial
]);

// Whole subtrees, verified page by page.
const ALLOWED_PREFIXES = [
  '/guides', //    index 1,145; every article clears the 900-word content:check floor
  '/can-i-run', // index 1,380; each of the 38 GPU hubs runs ~1,900
  '/gpu', //       hub 583; sections 1,049-1,176; tools 997-1,248; learning ~1,288
];

// Wins over ALLOWED_PREFIXES. Quiz and account screens are behavioural, and the
// remaining entries render their body client-side, so their server HTML is a shell.
const BLOCKED = new Set([
  '/gpu/test', //                     85 words — quiz screen
  '/ai-inference/tutorial/test', //   86 words — quiz screen
  // /ai-updates is long enough now that it is server-rendered, but it stays off
  // ads deliberately: it is an aggregated feed of third-party announcements, and
  // Google's Inventory value policy specifically bars ads on screens carrying
  // content from others without substantial added commentary. Revisit only if the
  // entries grow into genuine original analysis.
  '/ai-updates',
  '/login',
  '/profile',
  '/favorites',
]);

/**
 * Whether the Google ad loader may be mounted on a given route.
 * @param {string} pathname - Route pathname, e.g. "/guides/rag-vs-fine-tuning".
 * @returns {boolean}
 */
export function shouldServeAds(pathname) {
  if (typeof pathname !== 'string' || !pathname.startsWith('/')) return false;

  // Normalize a trailing slash so "/guides/" and "/guides" resolve identically.
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/';

  if (BLOCKED.has(path)) return false;
  if (ALLOWED_EXACT.has(path)) return true;

  return ALLOWED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}
