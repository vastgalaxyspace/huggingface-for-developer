import { fetchCompleteModelData } from '../../../src/services/huggingface';
import ModelDetailClient from '../../../src/components/model/ModelDetailClient';
import { absoluteUrl, pageMetadata } from '../../../src/lib/seo';

export async function generateMetadata({ params }) {
  const unwrapParams = await params;
  const idArray = unwrapParams.id || [];
  const modelId = idArray.join('/');
  const encodedPath = `/model/${idArray.map(encodeURIComponent).join('/')}`;

  try {
    const rawData = await fetchCompleteModelData(modelId);
    const author = rawData.author || 'Hugging Face';

    return {
      ...pageMetadata({
        title: `${modelId} Hardware, VRAM, and Deployment Guide`,
        description: `Analyze ${modelId} by ${author}. Review VRAM requirements, architecture details, licensing, and deployment recommendations.`,
        path: encodedPath,
        keywords: [modelId, `${modelId} VRAM`, `${modelId} hardware requirements`],
        type: 'article',
      }),
      openGraph: {
        ...pageMetadata({
          title: `${modelId} Hardware, VRAM, and Deployment Guide`,
          description: `Analyze ${modelId} by ${author}. Review VRAM requirements, architecture details, licensing, and deployment recommendations.`,
          path: encodedPath,
          type: 'article',
        }).openGraph,
        publishedTime: rawData.lastModified || undefined,
        authors: [author],
      },
      twitter: {
        ...pageMetadata({
          title: `${modelId} Hardware, VRAM, and Deployment Guide`,
          description: `Analyze ${modelId} by ${author}. Review VRAM requirements, architecture details, licensing, and deployment recommendations.`,
          path: encodedPath,
        }).twitter,
      },
      alternates: {
        canonical: absoluteUrl(encodedPath),
      },
    };
  } catch {
    return pageMetadata({
      title: `${modelId} Model Overview`,
      description: `Explore the AI model ${modelId} on InnoAI with hardware guidance, metadata, and deployment context.`,
      path: encodedPath,
      keywords: [modelId, 'Hugging Face model analysis'],
      type: 'article',
    });
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
