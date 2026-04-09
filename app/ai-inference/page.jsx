import { Cpu, Zap, Server, Cloud, Gauge, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'AI Inference | InnoAI – Run & Deploy AI Models',
  description:
    'Explore AI inference solutions, APIs, and deployment strategies. Learn how to run AI models efficiently in production with optimized inference pipelines.',
  openGraph: {
    title: 'AI Inference | InnoAI',
    description:
      'Explore AI inference solutions, APIs, and deployment strategies for production AI workloads.',
  },
};

const INFERENCE_PROVIDERS = [
  {
    name: 'Hugging Face Inference API',
    description:
      'Free tier serverless inference for thousands of models. Great for prototyping and light workloads.',
    icon: Zap,
    link: 'https://huggingface.co/inference-api',
    color: 'var(--accent)',
    tags: ['Free Tier', 'Serverless', '100k+ Models'],
  },
  {
    name: 'Hugging Face Inference Endpoints',
    description:
      'Dedicated infrastructure for production inference. Choose your GPU, region, and scaling options.',
    icon: Server,
    link: 'https://huggingface.co/inference-endpoints',
    color: '#8b5cf6',
    tags: ['Dedicated GPU', 'Auto-scaling', 'Production'],
  },
  {
    name: 'AWS SageMaker',
    description:
      'Deploy Hugging Face models on SageMaker with optimized containers and enterprise-grade reliability.',
    icon: Cloud,
    link: 'https://huggingface.co/docs/sagemaker',
    color: '#f59e0b',
    tags: ['Enterprise', 'AWS', 'Managed'],
  },
  {
    name: 'NVIDIA Triton',
    description:
      'High-performance inference server supporting multiple frameworks. Ideal for maximum throughput.',
    icon: Gauge,
    link: 'https://developer.nvidia.com/triton-inference-server',
    color: '#22c55e',
    tags: ['High Throughput', 'Multi-framework', 'On-Premise'],
  },
];

const QUICK_GUIDES = [
  {
    title: 'Text Generation',
    description: 'Run LLMs like Llama, Mistral, and GPT-style models for text generation tasks.',
    models: ['meta-llama/Llama-3-8B', 'mistralai/Mistral-7B-v0.1'],
    category: 'NLP',
  },
  {
    title: 'Image Generation',
    description: 'Generate images using Stable Diffusion, DALL-E, and other diffusion models.',
    models: ['stabilityai/stable-diffusion-xl-base-1.0'],
    category: 'Vision',
  },
  {
    title: 'Speech & Audio',
    description: 'Transcribe audio with Whisper or generate speech with text-to-speech models.',
    models: ['openai/whisper-large-v3'],
    category: 'Audio',
  },
  {
    title: 'Embeddings',
    description: 'Create vector embeddings for semantic search, RAG pipelines, and clustering.',
    models: ['sentence-transformers/all-MiniLM-L6-v2'],
    category: 'Retrieval',
  },
];

export default function AIInferencePage() {
  return (
    <main className="shell-container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '999px',
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            fontSize: '0.82rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            marginBottom: '1.25rem',
          }}
        >
          <Cpu style={{ width: 15, height: 15 }} />
          AI INFERENCE
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.7rem, 4vw, 2.6rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: 'var(--text-strong)',
            marginBottom: '1rem',
          }}
        >
          Run AI Models in Production
        </h1>
        <p
          style={{
            maxWidth: '640px',
            margin: '0 auto',
            fontSize: '1.05rem',
            lineHeight: 1.7,
            color: 'var(--text-muted)',
          }}
        >
          Discover inference providers, deployment strategies, and best practices
          to serve AI models at scale — from free APIs to enterprise-grade solutions.
        </p>
      </section>

      {/* Inference Providers Grid */}
      <section style={{ marginBottom: '3.5rem' }}>
        <h2
          style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            color: 'var(--text-strong)',
            marginBottom: '1.5rem',
          }}
        >
          Inference Providers
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {INFERENCE_PROVIDERS.map((provider) => (
            <a
              key={provider.name}
              href={provider.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                padding: '1.5rem',
                borderRadius: '1rem',
                border: '1px solid var(--border-soft)',
                background: 'white',
                textDecoration: 'none',
                transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
              }}
              className="inference-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `${provider.color}15`,
                    color: provider.color,
                  }}
                >
                  <provider.icon style={{ width: 20, height: 20 }} />
                </div>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--text-strong)',
                  }}
                >
                  {provider.name}
                </h3>
              </div>
              <p
                style={{
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  color: 'var(--text-muted)',
                  flex: 1,
                }}
              >
                {provider.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {provider.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      background: 'var(--bg-muted)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Quick Start Guides */}
      <section style={{ marginBottom: '3.5rem' }}>
        <h2
          style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            color: 'var(--text-strong)',
            marginBottom: '1.5rem',
          }}
        >
          Quick Start by Task
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {QUICK_GUIDES.map((guide) => (
            <div
              key={guide.title}
              style={{
                padding: '1.5rem',
                borderRadius: '1rem',
                border: '1px solid var(--border-soft)',
                background: 'white',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.6rem',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-strong)' }}>
                  {guide.title}
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.55rem',
                    borderRadius: '999px',
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {guide.category}
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.86rem',
                  lineHeight: 1.6,
                  color: 'var(--text-muted)',
                  marginBottom: '1rem',
                }}
              >
                {guide.description}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {guide.models.map((model) => (
                  <Link
                    key={model}
                    href={`/model/${encodeURIComponent(model)}`}
                    prefetch={false}
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--accent)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <ArrowRight style={{ width: 13, height: 13 }} />
                    {model}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Code Example */}
      <section
        style={{
          padding: '2rem',
          borderRadius: '1rem',
          border: '1px solid var(--border-soft)',
          background: 'var(--bg-muted)',
        }}
      >
        <h2
          style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            color: 'var(--text-strong)',
            marginBottom: '1rem',
          }}
        >
          Get Started in Seconds
        </h2>
        <p
          style={{
            fontSize: '0.9rem',
            lineHeight: 1.7,
            color: 'var(--text-muted)',
            marginBottom: '1.25rem',
          }}
        >
          Use the Hugging Face Inference API with just a few lines of code. No GPU required.
        </p>
        <pre
          style={{
            padding: '1.25rem',
            borderRadius: '0.75rem',
            background: '#1e1e2e',
            color: '#cdd6f4',
            fontSize: '0.82rem',
            lineHeight: 1.7,
            overflowX: 'auto',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}
        >
          <code>{`import requests

API_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-3-8B"
headers = {"Authorization": "Bearer hf_YOUR_TOKEN"}

response = requests.post(API_URL, headers=headers, json={
    "inputs": "What is AI inference?",
    "parameters": {"max_new_tokens": 200}
})

print(response.json())`}</code>
        </pre>
      </section>

      {/* Tutorial Banner CTA */}
      <section style={{ marginTop: '4rem', marginBottom: '1rem', padding: '2.5rem', borderRadius: '1rem', background: 'linear-gradient(135deg, var(--bg-muted), #1e293b)', border: '1px solid var(--border-soft)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-strong)', marginBottom: '1rem' }}>
          Ready to learn more?
        </h2>
        <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Dive into our comprehensive, chapter-by-chapter AI Inference tutorial. Learn about everything from transformer architectures and Flash Attention to hardware selection and autoscaling in production.
        </p>
        <Link
          href="/ai-inference/tutorial"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.6rem',
            borderRadius: '999px',
            background: 'var(--accent)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.2s',
          }}
        >
          Start the Tutorial
          <ArrowRight style={{ width: 18, height: 18 }} />
        </Link>
      </section>
    </main>
  );
}
