"use client";
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useFavorites } from '../../src/hooks/useFavorites';
import FavoritesPanel from '../../src/components/favorites/FavoritesPanel';

export default function FavoritesPage() {
  const router = useRouter();
  const {
    favorites,
    toggleFavorite,
    clearFavorites,
    exportFavorites,
    importFavorites
  } = useFavorites();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Search</span>
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
