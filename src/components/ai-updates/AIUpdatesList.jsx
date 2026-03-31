"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function AIUpdatesList() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUpdates() {
      try {
        const q = query(
          collection(db, "ai_updates"), 
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedUpdates = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
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

  return (
    <div className="flex flex-col gap-2.5">
      {updates.map((update) => (
        <a 
          key={update.id}
          href={update.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="group block rounded-lg border border-[var(--border-soft)] bg-white p-3 sm:px-4 sm:py-3 shadow-sm transition-all hover:border-blue-300 hover:bg-slate-50"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1">
            <h2 className="text-base font-semibold text-[var(--text-strong)] group-hover:text-blue-600 transition-colors">
              {update.title}
            </h2>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                {update.category || "News"}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {update.date || new Date(update.createdAt?.toDate()).toLocaleDateString()}
              </span>
            </div>
          </div>
          <p className="text-sm text-[var(--text-muted)] leading-snug">
            {update.description}
          </p>
        </a>
      ))}
    </div>
  );
}
