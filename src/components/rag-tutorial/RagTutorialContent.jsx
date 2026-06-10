"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Database,
  FileText,
  Layers,
  ListChecks,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getTutorialFromFirestore } from "../../lib/tutorialsFirestore";

const ICONS = {
  arrowRight: ArrowRight,
  bookOpen: BookOpen,
  checkCircle: CheckCircle,
  database: Database,
  fileText: FileText,
  layers: Layers,
  listChecks: ListChecks,
  search: Search,
  shieldCheck: ShieldCheck,
  sparkles: Sparkles,
};

const FALLBACK_TUTORIAL = {
  eyebrow: "RAG Tutorial",
  title: "Build a retrieval-augmented AI app",
  description:
    "RAG, or retrieval-augmented generation, lets an AI app answer using your documents instead of relying only on model memory. This tutorial walks through the practical pipeline: clean documents, chunk content, create embeddings, retrieve context, prompt the model, cite sources, and measure quality.",
  badges: ["Beginner friendly", "Works with any LLM provider", "Focused on production habits"],
  cards: [
    {
      title: "What you will build",
      body: "A question-answering flow that searches your documents, passes the best chunks to a model, and returns an answer with source citations.",
      icon: "bookOpen",
    },
    {
      title: "Core pieces",
      body: "You need documents, a chunking strategy, an embedding model, a vector store, retrieval logic, an LLM, and a small evaluation set.",
      icon: "database",
    },
    {
      title: "Success metric",
      body: "A good RAG app retrieves the right source first, answers only from that source, and admits when the answer is not present.",
      icon: "listChecks",
    },
  ],
  pipeline: {
    eyebrow: "Pipeline",
    title: "The RAG workflow, step by step",
    steps: [
      {
        title: "Collect and clean documents",
        body: "Start with a small, trusted document set. Remove duplicated boilerplate, stale pages, navigation text, empty sections, and content that should never be used in answers.",
        icon: "fileText",
      },
      {
        title: "Chunk the content",
        body: "Split documents into chunks that preserve meaning. Good chunks are large enough to answer a question, but small enough that retrieval stays precise.",
        icon: "layers",
      },
      {
        title: "Create embeddings",
        body: "Convert each chunk into an embedding vector. Store the vector with source metadata such as title, URL, section, date, and access level.",
        icon: "database",
      },
      {
        title: "Retrieve relevant context",
        body: "Embed the user question, search for nearby chunks, apply filters, and optionally rerank results before sending them to the model.",
        icon: "search",
      },
      {
        title: "Generate grounded answers",
        body: "Give the model the retrieved context and ask it to answer only from that context. Include citations so users can inspect the source.",
        icon: "sparkles",
      },
      {
        title: "Evaluate and monitor",
        body: "Track retrieval misses, unsupported answers, citation quality, latency, and user corrections. Improve the pipeline from real failures.",
        icon: "shieldCheck",
      },
    ],
  },
  chunking: {
    eyebrow: "Chunking rules",
    title: "Chunk for meaning, not just size",
    rules: [
      "Keep headings with the body text they explain.",
      "Avoid chunks that mix unrelated topics just because they are near each other.",
      "Use overlap when a concept often spans paragraph boundaries.",
      "Chunk tables and code examples carefully so structure is not destroyed.",
    ],
  },
  prompt: {
    eyebrow: "Prompt pattern",
    title: "Use a grounded answer prompt",
    snippet: `You are answering from the provided context only.

Question:
{user_question}

Context:
{retrieved_chunks}

Rules:
- Answer only when the context supports it.
- If the context is insufficient, say what is missing.
- Cite the source title or URL for each important claim.
- Keep the answer concise and practical.`,
  },
  checklist: {
    eyebrow: "Build checklist",
    title: "Before you launch a RAG app",
    items: [
      "Use a narrow first document collection instead of indexing everything at once.",
      "Store source metadata with every chunk so answers can cite where they came from.",
      "Test retrieval separately before judging the final generated answer.",
      "Add a low-confidence response when retrieved context is weak or missing.",
      "Measure latency across embedding, retrieval, reranking, and generation steps.",
      "Keep an evaluation set of real questions and expected source documents.",
    ],
  },
  nextSteps: {
    eyebrow: "Next steps",
    title: "Continue learning",
    links: [
      { label: "RAG vs Fine-Tuning", href: "/guides/rag-vs-fine-tuning" },
      { label: "Deploy Small RAG", href: "/guides/deploy-small-rag-app" },
    ],
  },
};

const mergeTutorialData = (remoteData) => ({
  ...FALLBACK_TUTORIAL,
  ...remoteData,
  pipeline: {
    ...FALLBACK_TUTORIAL.pipeline,
    ...(remoteData?.pipeline || {}),
  },
  chunking: {
    ...FALLBACK_TUTORIAL.chunking,
    ...(remoteData?.chunking || {}),
  },
  prompt: {
    ...FALLBACK_TUTORIAL.prompt,
    ...(remoteData?.prompt || {}),
  },
  checklist: {
    ...FALLBACK_TUTORIAL.checklist,
    ...(remoteData?.checklist || {}),
  },
  nextSteps: {
    ...FALLBACK_TUTORIAL.nextSteps,
    ...(remoteData?.nextSteps || {}),
  },
});

const getIcon = (name, fallback = "sparkles") => ICONS[name] || ICONS[fallback];

export default function RagTutorialContent() {
  const [tutorial, setTutorial] = useState(FALLBACK_TUTORIAL);

  useEffect(() => {
    async function fetchTutorial() {
      const remoteTutorial = await getTutorialFromFirestore("rag");
      if (remoteTutorial) {
        setTutorial(mergeTutorialData(remoteTutorial));
      }
    }

    fetchTutorial();
  }, []);

  return (
    <div className="space-y-8">
      <section className="editorial-panel overflow-hidden rounded-[24px] px-6 py-8 sm:px-10">
        <div className="max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">{tutorial.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
            {tutorial.title}
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-8 text-[var(--text-muted)]">{tutorial.description}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-[var(--text-faint)]">
            {(tutorial.badges || []).map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {(tutorial.cards || []).map((card) => {
          const Icon = getIcon(card.icon, "bookOpen");
          return (
            <article key={card.title} className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
              <Icon className="h-6 w-6 text-[var(--accent)]" />
              <h2 className="mt-4 text-lg font-black text-[var(--text-strong)]">{card.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{card.body}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">
            {tutorial.pipeline.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--text-strong)]">
            {tutorial.pipeline.title}
          </h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(tutorial.pipeline.steps || []).map((step, index) => {
            const Icon = getIcon(step.icon);
            return (
              <article key={step.title} className="rounded-2xl bg-[var(--panel-muted)] p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--accent)]">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--text-faint)]">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-black text-[var(--text-strong)]">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{step.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">
            {tutorial.chunking.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--text-strong)]">
            {tutorial.chunking.title}
          </h2>
          <div className="mt-5 space-y-3">
            {(tutorial.chunking.rules || []).map((rule) => (
              <p key={rule} className="flex gap-3 text-sm leading-7 text-[var(--text-muted)]">
                <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-[rgb(21,128,61)]" />
                <span>{rule}</span>
              </p>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">
            {tutorial.prompt.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--text-strong)]">
            {tutorial.prompt.title}
          </h2>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-[#0f172a] p-5 text-xs leading-6 text-slate-100">
            <code>{tutorial.prompt.snippet}</code>
          </pre>
        </article>
      </section>

      <section className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">
          {tutorial.checklist.eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--text-strong)]">
          {tutorial.checklist.title}
        </h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {(tutorial.checklist.items || []).map((item) => (
            <p
              key={item}
              className="flex gap-3 rounded-2xl bg-[var(--panel-muted)] p-4 text-sm leading-7 text-[var(--text-muted)]"
            >
              <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-[rgb(21,128,61)]" />
              <span>{item}</span>
            </p>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">
              {tutorial.nextSteps.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--text-strong)]">
              {tutorial.nextSteps.title}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {(tutorial.nextSteps.links || []).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--panel-muted)] px-4 py-3 text-sm font-bold text-[var(--accent)]"
              >
                {link.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
