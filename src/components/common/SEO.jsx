import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = "HuggingFace Model Explorer - Decode Any LLM Instantly",
  description = "Analyze any HuggingFace model in seconds. Get VRAM requirements, license info, parameter explanations, and deployment recommendations. Make confident AI model decisions.",
  keywords = "huggingface, llm, model analysis, vram calculator, ai models, machine learning, transformers, model comparison",
  image = "/og-image.png",
  url = "https://your-domain.com",
  type = "website",
  modelData = null
}) => {
  // If model data is provided, customize SEO
  if (modelData) {
    const modelName = modelData.modelId?.split('/')[1] || 'Unknown Model';
    const author = modelData.author || 'Unknown';
    const vram = modelData.vramEstimates?.fp16 || 'N/A';
    const license = modelData.licenseInfo?.name || 'Unknown';
    const params = modelData.vramEstimates?.totalParams || 'N/A';
    
    title = `${modelName} - Complete Analysis | HF Model Explorer`;
    description = `${modelName} by ${author}: ${params}B parameters, ${vram}GB VRAM (FP16), ${license} license. Get complete technical breakdown, deployment guide, and hardware requirements.`;
    keywords = `${modelName}, ${author}, llm analysis, ${license} license, ${params}b parameters, vram requirements, model deployment`;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "HuggingFace Model Explorer",
    "description": description,
    "url": url,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "HuggingFace Model Explorer"
    }
  };

  // If analyzing a model, add SoftwareApplication schema
  if (modelData) {
    structuredData["@type"] = "SoftwareApplication";
    structuredData.name = modelData.modelId;
    structuredData.author = {
      "@type": "Organization",
      "name": modelData.author
    };
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="HuggingFace Model Explorer" />
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;