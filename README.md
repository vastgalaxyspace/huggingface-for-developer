# HF Model Explorer

HF Model Explorer is an AI/ML developer tools site for comparing models, sizing GPU workloads, and learning practical inference concepts. It combines model exploration, GPU calculators, tutorials, and interactive analysis tools in a Next.js app.

## Tech Stack

- Next.js 16 App Router
- React 19
- Firebase Auth and Firestore
- Tailwind CSS
- Chart.js and Recharts
- Hugging Face API proxy routes

## Local Development

Install dependencies:

```bash
npm install
```

Create a local environment file from `.env.example` and fill in the required Firebase values:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

The app runs at `http://localhost:3000` by default.

## Required Environment Variables

See `.env.example` for the full list. Firebase configuration and `NEXT_PUBLIC_TUTORIALS_COLLECTION` are required and have no defaults, so missing values fail loudly instead of connecting to the wrong Firebase project.

`HF_TOKEN` is optional and server-only. Use it when Hugging Face API requests need authentication or higher limits.

## Key Features

- VRAM calculator for estimating model memory needs
- GPU picker for matching models and workloads to hardware
- Roofline analyzer for GPU performance reasoning
- Coding-model analysis and comparison tools
- Model comparison workflows backed by Hugging Face metadata
- AI inference and GPU tutorials stored in Firestore

## Useful Scripts

```bash
npm run dev
npm run build
npm run lint
npm run content:check
npm run indexing:check
```
