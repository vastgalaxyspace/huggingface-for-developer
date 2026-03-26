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

import { analyzeCompatibility } from '../../utils/compatibilityEngine';
import { calculateTCO } from '../../utils/tcoCalculator';
import { getGPURecommendations, calculateCloudCosts, getMultiGPURecommendations } from '../../utils/hardwareRecommendations';
import { calculateDeploymentScore } from '../../utils/scoringEngine';
import { generateCodeSnippet, getCompatibleFrameworks } from '../../utils/codeGenerator';
import { getParametersByCategory } from '../../utils/parameterExplanations';
import { getDeploymentRecommendation, formatLicenseDisplay } from '../../utils/licenseChecker';
import { useMemo } from 'react';

export default function ModelDetailClient({ modelId }) {
  const router = useRouter();
  const decodedModelId = decodeURIComponent(modelId);
  
  const { data: modelData, loading, error, refetch } = useModelData(decodedModelId);
  const { addToComparison, removeFromComparison, isInComparison, canAddMore } = useComparison();
  const { toggleFavorite, isFavorite } = useFavorites();
  const db = useModelDatabase();

  const handleBack = () => router.push('/');
  const handleRetry = () => refetch();

  const enrichedProps = useMemo(() => {
    if (!modelData) return null;

    const compatibility = modelData.config ? analyzeCompatibility(modelData) : null;
    const deploymentScore = calculateDeploymentScore(modelData);
    const vramFP16 = parseFloat(modelData.vramEstimates?.fp16 || 0);
    const gpuRecommendations = vramFP16 > 0 ? getGPURecommendations(vramFP16) : null;
    const cloudCosts = vramFP16 > 0 ? calculateCloudCosts(vramFP16) : null;
    const multiGPU = vramFP16 > 0 ? getMultiGPURecommendations(vramFP16) : null;
    const tco = calculateTCO(modelData);

    const frameworks = getCompatibleFrameworks();
    const codeSnippets = {};
    frameworks.forEach(fw => {
      codeSnippets[fw.id] = generateCodeSnippet(modelData, fw.id);
    });

    const parameterCategories = getParametersByCategory();
    const licenseDisplay = formatLicenseDisplay(
      modelData.rawData?.metadata?.cardData?.license ||
      modelData.rawData?.metadata?.tags?.find(t => t.includes('license'))
    );
    const deploymentRec = getDeploymentRecommendation(
      modelData.rawData?.metadata?.cardData?.license ||
      modelData.rawData?.metadata?.tags?.find(t => t.includes('license'))
    );

    return {
      compatibility, deploymentScore, gpuRecommendations, cloudCosts,
      multiGPU, tco, codeSnippets, frameworks, parameterCategories,
      licenseDisplay, deploymentRec,
    };
  }, [modelData]);

  if (loading || (!modelData && !error)) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group self-start">
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
      {...enrichedProps}
    />
  );
}
