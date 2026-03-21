"use client";
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useModelData } from '../../hooks/useModelData';
import { useComparison } from '../../hooks/useComparison';
import { useFavorites } from '../../hooks/useFavorites';
import { useModelDatabase } from '../../hooks/useModelDatabase';
import ModelDetailPage from '../../views/ModelDetailPage';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';

export default function ModelDetailClient({ modelId }) {
  const router = useRouter();
  const decodedModelId = decodeURIComponent(modelId);
  
  const { data: modelData, loading, error, refetch } = useModelData(decodedModelId);
  const { addToComparison, removeFromComparison, isInComparison, canAddMore } = useComparison();
  const { toggleFavorite, isFavorite } = useFavorites();
  const db = useModelDatabase();

  const handleBack = () => router.push('/');
  const handleRetry = () => refetch();

  if (loading || (!modelData && !error)) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group self-start"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Search</span>
        </button>
        <ErrorDisplay error={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <ModelDetailPage 
      modelData={modelData} 
      onBack={handleBack}
      onAddToComparison={addToComparison}
      onRemoveFromComparison={removeFromComparison}
      isInComparison={isInComparison(decodedModelId)}
      canAddMore={canAddMore}
      onToggleFavorite={toggleFavorite}
      isFavorite={isFavorite(decodedModelId)}
      allModels={db.models} 
    />
  );
}
