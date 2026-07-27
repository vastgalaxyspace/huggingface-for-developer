# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**InnoAI AI Explorer** (package name `hf-model-explorer`) is a Next.js 16 App Router application (React 19, JavaScript/JSX — no TypeScript) for exploring, comparing, and sizing Hugging Face models, plus a large set of GPU/CUDA learning tools and calculators. Firebase (Firestore + Auth) backs user accounts, favorites, tutorial content, and tutorial progress.

> Note: `README.md` is the stock Vite template README and is **inaccurate** — this is a Next.js app, not Vite. Ignore it.

## Commands

```bash
npm run dev      # next dev (local dev server)
npm run build    # next build (Netlify runs this; publish dir is .next)
npm start        # next start (serve production build)
npm run lint     # eslint app src --ext .js,.jsx

# Content / data integrity checks (Node scripts, run standalone)
npm run content:check    # scripts/content-depth-check.mjs — asserts guides meet word/section/FAQ/source minimums
npm run indexing:check   # scripts/model-indexing-check.mjs — indexable models must carry bespoke editorial
npm run specs:check      # scripts/can-i-run-specs-check.mjs — CURATED_MODELS specs vs. the real HF config.json (network; HF_TOKEN optional)
npm run ads:check        # scripts/ad-policy-check.mjs — asserts the ad loader stays off thin/behavioural routes

# Firestore seeding (one-off content loaders)
npm run seed:ai-inference-tutorial
npm run seed:gpu-tutorial
```

Two more standalone scripts have no npm alias — run with `node scripts/<name>`: `responsive-audit.mjs` and `extract-physical-theory.cjs`.

There is **no test runner** configured. `content:check` / `indexing:check` are the closest thing to automated verification — run the relevant one after touching guide or model-index data. To check a single guide, edit the thresholds/filters in the script or inspect its output; there is no per-test flag.

`content:check` fails the build of a guide that falls below its minimums (900 total words, 3 sections, 2 FAQ entries, 3 checklist items, 2 sources). New guides in `src/data/guidesContent.js` must clear all five.

Lint config (`eslint.config.js`) enforces `no-unused-vars` but ignores vars matching `^[A-Z_]` (intentional — allows unused capitalized imports/constants).

## Environment

Copy `.env.example` to `.env.local`. Key variables:
- `NEXT_PUBLIC_FIREBASE_*` — client Firebase config. If `NEXT_PUBLIC_FIREBASE_API_KEY` or `NEXT_PUBLIC_FIREBASE_PROJECT_ID` are missing, `db` and `auth` in `src/lib/firebase.js` are exported as `null` and the app degrades gracefully (guard for null before use).
- `HF_TOKEN` — **server-only** Hugging Face token. Never prefix with `NEXT_PUBLIC_`. Used only in API routes and server-side service calls.
- `NEXT_PUBLIC_TUTORIALS_COLLECTION` — Firestore collection name for tutorials (default `ai_tutorials`).

## Architecture

### App Router ↔ `src/` split
`app/` holds routing, `layout.jsx`, `page.jsx`, metadata/SEO, and API routes. Almost all UI and logic lives under `src/`. The conventional pattern:

- **Server Component page** (`app/**/page.jsx`) fetches data server-side (e.g. `app/page.jsx` calls `getTrendingModels(150)`), then renders a **`*Client.jsx`** component from `src/components/routes/` (marked `"use client"`). Server pages fetch; client components handle interactivity.
- `app/layout.jsx` wraps everything in `<AppProviders>` (global context) plus `Header`/`Footer`, and defines site-wide SEO metadata, JSON-LD schema, and Google Analytics.

`src/views/` holds four older full-page components (`HomePage`, `ComparisonPage`, `ModelDetailPage`, `RecommenderPage`) that predate the `routes/*Client.jsx` convention. Both wiring styles are live: `app/compare` and `app/recommender` import from `src/views/` directly, while `app/page.jsx` and the model route go through a `*Client.jsx` wrapper that then renders the view. Prefer the `*Client.jsx` pattern for new routes; don't assume a page's UI lives in `src/components/routes/`.

### Hugging Face data flow (browser vs. server)
`src/services/huggingface.js` is the single entry point for HF data and branches on a module-level `isBrowser` check:
- **Browser** → calls same-origin proxy routes (`/api/hf-*`) to avoid CORS and keep `HF_TOKEN` server-side.
- **Server** → fetches `huggingface.co` directly with the `HF_TOKEN` auth header (`getHeaders()` returns `{}` in the browser, so a token can never leak client-side).

`src/services/huggingfaceClient.js` is the browser-only sibling: thin `fetch` wrappers over the same-origin API routes, with no HF host or token knowledge. Client components should import from it rather than from `huggingface.js`.

API routes under `app/api/`:
- `hf-model/route.js` — metadata + `config.json` for one model.
- `hf-search/route.js` — search + enrichment (fetches configs/metadata for top results, detects capabilities/family).
- `hf-trending/route.js` — trending model list for the home page.
- `smart-wizard/route.js` — powers the recommender wizard; ranks/enriches models by task.

All HF fetches go through `fetchWithTimeout`. Timeouts are tiered by importance (~6s for required data, ~1.5s for optional assets and trending hydration) — keep new fetches on the same helper rather than calling `fetch` bare.

Optional repo files (config, README, tokenizer) are fetched with timeouts and **fail soft** (return `null`, never throw) — gated models often have public config/README even when weights are gated. Use `handleAPIError(error)` to convert thrown errors into structured `{type, title, message, suggestion}` for the UI.

### Global state
`src/components/providers/AppProviders.jsx` builds one `AppContext` value: `{ favorites, comparison, db, auth }`.
- The **`*Base` hooks** (`useFavoritesBase`, `useComparisonBase`, `useModelDatabaseBase`) are the real implementations, instantiated **once** in `AppProviders`.
- The **non-Base hooks** (`useFavorites`, `useComparison`, etc.) are thin `useContext(AppContext)` consumers used throughout components. When adding shared state, follow this Base-provides / consumer-reads split rather than calling a Base hook directly in a component.
- `useModelDatabase` is only loaded on `/recommender` and `/model` routes (see `shouldLoadDatabase` in `AppProviders`).

### Computation engines & data (`src/utils/`, `src/data/`)
The domain logic is pure-JS engines with no React dependency — safe to import anywhere:
- `src/utils/` — `vramCalculator`, `tcoCalculator`, `scoringEngine`, `recommenderEngine`, `alternativesEngine`, `compatibilityEngine`, `codeGenerator`, `licenseChecker`, etc.
- `src/data/` — large static databases (`gpuDatabase`, `gpuArchDatabase`, `rooflineGpuDatabase`, `precisionStrategyData`) and long-form theory/guide content (`*Theory.js`, `guidesContent.js`, `additionalGuides.js`). The `content:check` script validates the guide content shape.

### SEO & the model-indexing whitelist
SEO is centralized, not per-page ad-hoc, and one piece of it is a genuine trap:

- `src/lib/seo.js` — `SITE_URL` (`https://innoai.space`), `absoluteUrl()`, and `pageMetadata({title, description, path, keywords, type})`, which builds the canonical URL + OpenGraph/Twitter blocks. New pages should export metadata via `pageMetadata` rather than hand-rolling the object.
- `app/sitemap.js`, `app/robots.js`, `app/opengraph-image.js`, `app/twitter-image.js` — Next.js file conventions. The sitemap is assembled from a hardcoded route list plus generated entries (guides, indexable models, can-I-run combos), so **a new static route is not in the sitemap until you add it to `app/sitemap.js`**.
- `src/lib/modelIndexing.js` — HF has ~2M models; the dynamic `/model/[...id]` route is **`noindex` by default**. Only IDs in `INDEXABLE_MODEL_IDS` or matching `INDEXABLE_FAMILY_PATTERNS` get indexable robots metadata and a sitemap entry (those IDs are also prerendered via `generateStaticParams`). To promote a model, edit that whitelist — then run `npm run indexing:check`.
- **Indexable ⇒ bespoke editorial.** `indexing:check` asserts every indexable model resolves to a hand-written family entry in `FAMILY_GUIDANCE` (`src/lib/modelEditorial.js`) rather than the `GENERIC_GUIDANCE` fallback, so a model can't be whitelisted and quietly ship a boilerplate page. Note indexability is *not* derived from `hasBespokeEditorial()`: broad families like `Llama` would then auto-index every random fork. Indexing stays narrow (explicit IDs + specific version patterns); the check only enforces the two stay aligned.

### can-i-run: specs must be provable, not remembered
`/can-i-run/[gpu]/[...model]` pages are indexed and state a confident numeric verdict ("needs 43 GB, your card has 24"). That verdict is computed from the architecture specs in `src/data/canIRunData.js` (`layers`, `kvHeads`, `headDim`, `hiddenSize`, `context`), so a single wrong value silently produces a **wrong answer on a page Google is ranking**. Never hand-type these from memory — `npm run specs:check` fetches each model's real `config.json` from Hugging Face and fails on any mismatch. Gated repos (Meta, Google) return 403 unless the `HF_TOKEN` account has accepted their license, and are reported as unverified rather than passing.

### Ads are route-gated, and can-i-run has no per-combo pages
Both of these exist because AdSense rejected the site for "Low value content" (July 2026), and both are easy to undo by accident:

- **`src/lib/adPolicy.js` decides where the ad loader mounts.** `app/layout.jsx` renders `<AdSenseLoader>` (a client component, since the decision needs `usePathname`), which returns `null` unless `shouldServeAds(pathname)` passes. Google's Inventory value policy bars ads on low-value screens and on navigation/behavioural screens, so account pages, quiz pages, and routes whose body is fetched client-side are blocked. Allowed routes were picked by measuring **rendered** body text (~500-word floor) — not JSX source length, which is meaningless here because most pages compose their text from components and hooks. Adding a thin page under an allowed prefix like `/gpu` silently opts it into ads; `npm run ads:check` is what catches that.
- **Site verification is deliberately *not* gated.** The `google-adsense-account` meta tag in `app/layout.jsx` and `public/ads.txt` are sitewide and unconditional. Don't move them behind the route gate.
- **`/can-i-run/[gpu]/[...model]` no longer exists.** 38 GPUs × 38 models produced 1,444 near-identical pages — the scaled-content-abuse pattern in Google's spam policies. Each GPU hub (`/can-i-run/[gpu]`) now carries the full model × precision matrix, both capacity cliffs, and long-context headroom (~1,900 rendered words), and the old combo URLs permanently redirect to their hub via `next.config.mjs`. Link to a specific model's row with `canIRunModelAnchorPath()`, not by rebuilding a combo URL.

### Firebase / Firestore
- `src/lib/firebase.js` — lazy singleton init; exports `db`/`auth` (or `null`).
- `src/lib/tutorialsFirestore.js` — reads tutorial docs (public read).
- `src/lib/tutorialProgress.js` — per-user progress under `users/{uid}/tutorialProgress/{id}`.
- `firestore.rules` — tutorials/updates are public-read, **write-only via seed scripts / console** (`allow write: if false`); user docs and progress are owner-only; nothing is client-deletable. When changing data access, update `firestore.rules` accordingly.

### GPU tooling
`app/gpu/` is a large sub-app: learning topics (`gpu/learning/[slug]`), and interactive tools under `gpu/tools/` (gpu-picker, kernel-occupancy-estimator, roofline-model-analyzer, vram-calculator, warp-divergence). Each tool pairs a `use*` hook (`src/hooks/`) with `kernel_*` / tool-specific components (`src/components/`).

**Learning content is public; only progress is gated.** `gpu/learning/[slug]` fetches its topic from Firestore in the *server* component and passes it to `LearningTopicClient` so the content is in the crawlable HTML. Signing in adds progress tracking, the final test, and the certificate — it must never gate the content itself, which previously made all 7 sitemap'd topics render a login prompt to Googlebot.

## Conventions
- **JSX only**, ES modules (`"type": "module"`). Path imports are relative (no path aliases configured) — deep routes reach back with `../../src/...`.
- Tailwind CSS v4 (`@tailwindcss/postcss`); global styles in `app/globals.css` and `src/index.css`.
- Client components must declare `"use client"`; keep data-fetching in server components where possible.
- Two routes use catch-all params — `/model/[...id]` (HF IDs contain a `/`) and `/can-i-run/[gpu]/[...model]`. Model IDs must be encoded segment-by-segment; use `modelPath()` from `src/lib/modelIndexing.js` instead of building the URL by hand.
- `next.config.mjs` is deliberately small: `images.remotePatterns` allows `lh3.googleusercontent.com` (Google auth avatars), so any new remote image host must be added there or `next/image` will refuse it.
- Deployed on Netlify via `@netlify/plugin-nextjs` (`netlify.toml`). `firebase.json` exists but hosting is Netlify.
