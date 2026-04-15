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

const getInsightForUpdate = (update) => {
  const category = normalizeCategory(update?.category);
  const text = `${update?.title || ''} ${update?.description || ''}`.toLowerCase();

  if (category === "ai_models") {
    return {
      why: "New model launches can shift your cost-to-quality curve and change your shortlist priorities.",
      action: "Re-run model comparison with your production prompts and verify latency/quality tradeoffs.",
    };
  }

  if (category === "ai_tools") {
    return {
      why: "Tooling updates affect deployment speed, observability quality, and integration risk.",
      action: "Validate compatibility in a staging workflow before adopting in production pipelines.",
    };
  }

  if (category === "ai_infrastructure") {
    return {
      why: "Infrastructure changes directly impact throughput, cost predictability, and reliability under load.",
      action: "Update your sizing assumptions and run a fresh VRAM + throughput validation cycle.",
    };
  }

  if (category === "ai_research") {
    return {
      why: "Research shifts can become product advantages when translated into practical evaluation criteria.",
      action: "Map findings to measurable benchmarks and test them against your real user scenarios.",
    };
  }

  if (text.includes("pricing") || text.includes("cost") || text.includes("token")) {
    return {
      why: "Pricing updates can invalidate previous model selection decisions and budget assumptions.",
      action: "Recalculate total monthly serving costs and revisit fallback model strategy.",
    };
  }

  return {
    why: "Ecosystem changes can influence model viability, integration effort, and deployment risk.",
    action: "Convert major headlines into a concrete compare-test-adopt decision workflow.",
  };
};

export default function AIUpdatesList() {
  const [updates, setUpdates] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUpdates() {
      try {
        const q = query(collection(db, "ai_updates"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedUpdates = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUpdates(fetchedUpdates);
      } catch (err) {
        console.error("Error fetching AI updates:", err);
        setError("Failed to load AI updates.");
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

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
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
    <div className="flex flex-col gap-3">
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
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-[var(--border-soft)] bg-white text-[var(--text-muted)] hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {filteredUpdates.length === 0 ? (
        <div className="text-center py-10 text-sm text-[var(--text-muted)]">
          <p>No updates found for this filter.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredUpdates.map((update) => {
            const isExternal = Boolean(update.link);
            const insight = getInsightForUpdate(update);

            return (
              <a
                key={update.id}
                href={isExternal ? update.link : undefined}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="group block rounded-lg border border-[var(--border-soft)] bg-white p-3 sm:px-4 sm:py-3 shadow-sm transition-all hover:border-blue-300 hover:bg-slate-50"
              >
                <div className="mb-1 flex flex-col justify-between gap-1 sm:flex-row sm:items-center sm:gap-4">
                  <h2 className="text-base font-semibold text-[var(--text-strong)] transition-colors group-hover:text-blue-600">
                    {update.title}
                  </h2>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                      {getCategoryLabel(update.category)}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {formatUpdateDate(update)}
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-snug text-[var(--text-muted)]">
                  {update.description}
                </p>
                <div className="mt-3 grid gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--panel-muted)] p-2.5 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                      Why This Matters
                    </p>
                    <p className="mt-1 text-xs leading-6 text-[var(--text-muted)]">{insight.why}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                      Operator Action
                    </p>
                    <p className="mt-1 text-xs leading-6 text-[var(--text-muted)]">{insight.action}</p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
