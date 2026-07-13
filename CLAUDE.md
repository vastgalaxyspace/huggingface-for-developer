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
npm run indexing:check   # scripts/model-indexing-check.mjs

# Firestore seeding (one-off content loaders)
npm run seed:ai-inference-tutorial
npm run seed:gpu-tutorial
```

There is **no test runner** configured. `content:check` / `indexing:check` are the closest thing to automated verification — run the relevant one after touching guide or model-index data. To check a single guide, edit the thresholds/filters in the script or inspect its output; there is no per-test flag.

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

### Hugging Face data flow (browser vs. server)
`src/services/huggingface.js` is the single entry point for HF data and branches on `isBrowser`:
- **Browser** → calls same-origin proxy routes (`/api/hf-model`, `/api/hf-search`) to avoid CORS and keep `HF_TOKEN` server-side.
- **Server** → fetches `huggingface.co` directly with the `HF_TOKEN` auth header.

API routes under `app/api/`:
- `hf-model/route.js` — metadata + `config.json` for one model.
- `hf-search/route.js` — search + enrichment (fetches configs/metadata for top results, detects capabilities/family).
- `smart-wizard/route.js` — powers the recommender wizard; ranks/enriches models by task.

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

### Firebase / Firestore
- `src/lib/firebase.js` — lazy singleton init; exports `db`/`auth` (or `null`).
- `src/lib/tutorialsFirestore.js` — reads tutorial docs (public read).
- `src/lib/tutorialProgress.js` — per-user progress under `users/{uid}/tutorialProgress/{id}`.
- `firestore.rules` — tutorials/updates are public-read, **write-only via seed scripts / console** (`allow write: if false`); user docs and progress are owner-only; nothing is client-deletable. When changing data access, update `firestore.rules` accordingly.

### GPU tooling
`app/gpu/` is a large sub-app: learning topics (`gpu/learning/[slug]`), and interactive tools under `gpu/tools/` (gpu-picker, kernel-occupancy-estimator, roofline-model-analyzer, vram-calculator, warp-divergence). Each tool pairs a `use*` hook (`src/hooks/`) with `kernel_*` / tool-specific components (`src/components/`).

## Conventions
- **JSX only**, ES modules (`"type": "module"`). Path imports are relative (no path aliases configured).
- Tailwind CSS v4 (`@tailwindcss/postcss`); global styles in `app/globals.css` and `src/index.css`.
- Client components must declare `"use client"`; keep data-fetching in server components where possible.
- Deployed on Netlify via `@netlify/plugin-nextjs` (`netlify.toml`). `firebase.json` exists but hosting is Netlify.
