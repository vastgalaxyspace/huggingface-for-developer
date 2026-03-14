import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = "HuggingFace Model Explorer - Decode Any LLM Instantly",
  description = "Analyze any HuggingFace model in seconds. Get VRAM requirements, license info, parameter explanations, and deployment recommendations. Free developer tool for LLM evaluation.",
  keywords = "huggingface, llm, model analysis, vram calculator, ai models, machine learning, transformers, model comparison, gpu requirements, ai developer tools",
  image = "/og-image.svg",
  url = "https://your-domain.com",
  type = "website",
  modelData = null,
  breadcrumbs = null
}) => {
  // If model data is provided, customize SEO for the model detail page
  if (modelData) {
    const modelName = modelData.modelId?.split('/')[1] || 'Unknown Model';
    const author = modelData.author || 'Unknown';
    const vram = modelData.vramEstimates?.fp16 || 'N/A';
    const license = modelData.licenseInfo?.name || 'Unknown';
    const params = modelData.vramEstimates?.totalParams || 'N/A';
    const contextLen = modelData.config?.max_position_embeddings || 4096;
    
    title = `${modelName} - Complete Analysis | HF Model Explorer`;
    description = `${modelName} by ${author}: ${params}B parameters, ${vram}GB VRAM (FP16), ${license} license, ${contextLen.toLocaleString()} context. Get complete technical breakdown, deployment guide, and hardware requirements.`;
    keywords = `${modelName}, ${author}, llm analysis, ${license} license, ${params}b parameters, vram requirements, model deployment, gpu memory, model benchmark`;
    type = "article";
  }

  // --- Structured Data: WebApplication ---
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "HuggingFace Model Explorer",
    "url": url,
    "description": "Free developer tool to analyze any HuggingFace AI model. Get VRAM requirements, license analysis, parameter explanations, and deployment recommendations.",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "HuggingFace Model Explorer"
    },
    "featureList": [
      "Instant LLM model analysis",
      "VRAM calculator for FP16, INT8, INT4 quantization",
      "License compatibility checking",
      "Side-by-side model comparison (up to 3)",
      "Smart model recommender wizard",
      "Hardware and GPU recommendations",
      "Total Cost of Ownership calculator",
      "Benchmark performance visualizer",
      "Live model testing via HuggingFace API",
      "Code snippet generation for Python and Node.js"
    ]
  };

  // --- Structured Data: SoftwareApplication for model detail pages ---
  const modelSchema = modelData ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": modelData.modelId,
    "description": description,
    "applicationCategory": "Machine Learning Model",
    "author": {
      "@type": "Organization",
      "name": modelData.author || "Unknown"
    },
    "license": modelData.licenseInfo?.name || "Unknown",
    "url": `https://huggingface.co/${modelData.modelId}`
  } : null;

  // --- Structured Data: FAQ (for homepage) ---
  const faqSchema = !modelData ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How much VRAM do I need to run an LLM?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "VRAM depends on model size and quantization. A 7B parameter model needs ~14GB in FP16, ~7GB in INT8, or ~4GB in INT4. Use HF Model Explorer to calculate exact VRAM for any HuggingFace model."
        }
      },
      {
        "@type": "Question",
        "name": "How do I check if a HuggingFace model is free for commercial use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use HF Model Explorer to instantly check any model's license. It analyzes license tags like MIT, Apache 2.0, and Llama licenses to tell you if commercial deployment is allowed."
        }
      },
      {
        "@type": "Question",
        "name": "How do I compare different LLM models?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "HF Model Explorer lets you compare up to 3 models side-by-side across parameters, VRAM usage, license terms, context length, and benchmark scores. Add models to the comparison bar and click Compare."
        }
      },
      {
        "@type": "Question",
        "name": "Which GPU should I use to run a large language model?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "It depends on the model size. Small models (7B) run on RTX 3090/4070 (16-24GB). Medium models (13-30B) need A6000 or dual GPUs. Large models (70B+) require A100/H100 or multi-GPU setups. HF Model Explorer provides specific GPU recommendations for each model."
        }
      },
      {
        "@type": "Question",
        "name": "What is the best free tool to analyze HuggingFace models?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "HuggingFace Model Explorer is a free, open-source tool that provides instant model analysis including VRAM calculations, license checking, hardware recommendations, benchmark visualization, and deployment cost estimation for any model on HuggingFace."
        }
      }
    ]
  } : null;

  // --- Structured Data: BreadcrumbList ---
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs || [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": url
      },
      ...(modelData ? [{
        "@type": "ListItem",
        "position": 2,
        "name": modelData.modelId?.split('/')[1] || "Model Analysis",
        "item": `${url}/model/${modelData.modelId}`
      }] : [])
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="HuggingFace Model Explorer" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
      <meta name="language" content="English" />
      <meta name="author" content="HuggingFace Model Explorer" />
      <link rel="canonical" href={url} />
      
      {/* Structured Data: WebApplication */}
      <script type="application/ld+json">
        {JSON.stringify(webAppSchema)}
      </script>

      {/* Structured Data: BreadcrumbList */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      {/* Structured Data: FAQ (homepage only) */}
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}

      {/* Structured Data: Model detail (model pages only) */}
      {modelSchema && (
        <script type="application/ld+json">
          {JSON.stringify(modelSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;