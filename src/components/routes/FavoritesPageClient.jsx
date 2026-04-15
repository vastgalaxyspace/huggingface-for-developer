"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useFavorites } from "../../hooks/useFavorites";
import FavoritesPanel from "../favorites/FavoritesPanel";

export default function FavoritesPageClient() {
  const router = useRouter();
  const {
    favorites,
    toggleFavorite,
    clearFavorites,
    exportFavorites,
    importFavorites,
  } = useFavorites();

  return (
    <div className="shell-container py-10 min-h-[calc(100vh-64px)]">
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[13px] font-bold">Back to Search</span>
      </button>

      <FavoritesPanel
        favorites={favorites}
        onSelectModel={(id) => router.push(`/model/${id}`)}
        onRemove={(modelId) => toggleFavorite({ modelId })}
        onClear={clearFavorites}
        onExport={exportFavorites}
        onImport={importFavorites}
      />
    </div>
  );
}
