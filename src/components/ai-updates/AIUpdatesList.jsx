"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "ai_research", label: "AI Research" },
  { key: "ai_models", label: "AI Models" },
  { key: "ai_tools", label: "AI Tools" },
  { key: "ai_infrastructure", label: "AI Infrastructure" },
  { key: "ai_news", label: "AI News" }
];

const FALLBACK_UPDATES = [
  {
    id: "fallback-model-evaluation",
    title: "Model releases should be evaluated against real workloads before adoption",
    description:
      "New AI model announcements are useful signals, but production teams should test quality, latency, cost, and governance fit against their own prompts before switching.",
    category: "ai_models",
    date: "Updated regularly",
  },
  {
    id: "fallback-inference-costs",
    title: "Inference cost planning needs token volume, latency, and hardware checks",
    description:
      "Budget decisions are stronger when model quality is paired with monthly token volume, concurrency, VRAM requirements, and fallback strategy.",
    category: "ai_infrastructure",
    date: "Updated regularly",
  },
  {
    id: "fallback-tooling-workflow",
    title: "Tooling changes should be validated in staging before production use",
    description:
      "Framework, serving, and observability updates can improve delivery speed, but teams should verify compatibility, rollback paths, and measurement quality first.",
    category: "ai_tools",
    date: "Updated regularly",
  },
];

const normalizeCategory = (value) => {
  const raw = (value || "").toString().trim().toLowerCase();
  const compact = raw.replace(/[\s_-]+/g, "");
  if (!compact) return "ai_news";
  if (compact.includes("research")) return "ai_research";
  if (compact.includes("model")) return "ai_models";
  if (compact.includes("tool")) return "ai_tools";
  if (compact.includes("infra")) return "ai_infrastructure";
  if (compact.includes("news")) return "ai_news";
  return "ai_news";
};

const getCategoryLabel = (value) => {
  const normalized = normalizeCategory(value);
  return FILTER_OPTIONS.find((option) => option.key === normalized)?.label || "AI News";
};

const formatUpdateDate = (update) => {
  if (update?.date) return update.date;

  const createdAt = update?.createdAt?.toDate?.();
  if (!createdAt || Number.isNaN(createdAt.getTime())) return "Unknown date";

  return createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const toMillis = (value) => {
  if (!value) return 0;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const mapUpdateDocs = (querySnapshot) =>
  querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

export default function AIUpdatesList() {
  const [updates, setUpdates] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUpdates() {
      if (!db) {
        setUpdates(FALLBACK_UPDATES);
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, "ai_updates"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedUpdates = mapUpdateDocs(querySnapshot);
        setUpdates(fetchedUpdates);
      } catch (err) {
        console.warn("Ordered AI updates query failed; retrying without orderBy.", err);

        try {
          const querySnapshot = await getDocs(collection(db, "ai_updates"));
          const fetchedUpdates = mapUpdateDocs(querySnapshot).sort(
            (a, b) => toMillis(b.createdAt || b.date) - toMillis(a.createdAt || a.date)
          );
          setUpdates(fetchedUpdates.length > 0 ? fetchedUpdates : FALLBACK_UPDATES);
        } catch (fallbackErr) {
          console.error("Error fetching AI updates:", fallbackErr);
          setUpdates(FALLBACK_UPDATES);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUpdates();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--text-strong)]"></div>
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-muted)]">
        <p>No AI updates available at this time. Check back later!</p>
      </div>
    );
  }

  const filteredUpdates = updates.filter((update) => {
    if (activeFilter === "all") return true;
    return normalizeCategory(update.category) === activeFilter;
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-[var(--text-muted)]">
          {filteredUpdates.length} update{filteredUpdates.length === 1 ? "" : "s"}
        </p>
        <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => {
              const isActive = activeFilter === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setActiveFilter(option.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : "border-[var(--border-soft)] bg-white text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-main)]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
        </div>
      </div>

      {filteredUpdates.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-soft)] bg-white px-6 py-10 text-center text-sm text-[var(--text-muted)]">
          <p>No updates found for this filter.</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-soft)] rounded-2xl border border-[var(--border-soft)] bg-white">
          {filteredUpdates.map((update) => {
            const isExternal = Boolean(update.link);

            return (
              <a
                key={update.id}
                href={isExternal ? update.link : undefined}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="group block px-5 py-5 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-[var(--panel-muted)] sm:px-6"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
                      {getCategoryLabel(update.category)}
                      </span>
                      <span className="text-xs font-semibold text-[var(--text-faint)]">{formatUpdateDate(update)}</span>
                    </div>
                    <h2 className="mt-2 text-lg font-black leading-snug text-[var(--text-strong)] transition-colors group-hover:text-[var(--accent)]">
                      {update.title}
                    </h2>
                  </div>
                  {isExternal ? (
                    <span className="shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                      Source
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
                  {update.description}
                </p>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
