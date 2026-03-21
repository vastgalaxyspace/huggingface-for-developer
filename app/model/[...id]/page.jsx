import ModelDetailClient from '../../../src/components/model/ModelDetailClient';
import { fetchCompleteModelData } from '../../../src/services/huggingface';

export async function generateMetadata({ params }) {
  const unwrapParams = await params;
  const idArray = unwrapParams.id || [];
  const modelId = idArray.join('/');
  
  try {
    const rawData = await fetchCompleteModelData(modelId);
    return {
      title: `${modelId} | HF Model Explorer`,
      description: `Analysis and hardware requirements for ${modelId} by ${rawData.author || 'HuggingFace'}.`,
    };
  } catch {
    return {
      title: `${modelId} | HF Model Explorer`,
      description: `Explore the AI model ${modelId} on HuggingFace.`,
    };
  }
}

export default async function Page({ params }) {
  const unwrapParams = await params;
  const idArray = unwrapParams.id || [];
  const modelId = idArray.join('/');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <ModelDetailClient modelId={modelId} />
    </div>
  );
}
