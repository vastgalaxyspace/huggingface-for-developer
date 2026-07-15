import { additionalGuides } from './additionalGuides.js';

export const guides = [
  {
    slug: 'choose-ai-model-by-gpu-budget',
    title: 'How to Choose an AI Model by GPU and Budget',
    description: 'A practical budget framework for selecting AI coding models by cost, hosting mode, and GPU reality.',
    category: 'Model Selection',
    readTime: '15 min read',
    lastUpdated: '2026-04-16',
    keyTakeaways: [
      'Choose models by constraints and workload, not by hype or max capability.',
      'Use token-volume math early to avoid surprise billing after launch.',
      'Use tiered planning (Hobby, Startup, Scale) to match model and hosting strategy.',
      'For self-hosting, GPU + infra + ops costs decide feasibility more than raw model quality.',
      'Hybrid routing can significantly reduce spend while preserving high-quality results for complex tasks.',
    ],
    sections: [
      {
        heading: '1. Introduction / Why Budget Planning Matters for AI Models',
        content:
          'Most teams discover cost issues too late. They prototype with a powerful model, then scale slightly and face an unexpected bill. This page exists to help developers and teams choose models that fit GPU resources and monthly budget before building. The best model is not always the most powerful one; it is the one that delivers acceptable quality within your real constraints.',
      },
      {
        heading: '2. How to Use This Page',
        content:
          'Use this order: identify your budget tier, shortlist model and hosting options for that tier, estimate monthly cost using token-volume math, then check GPU requirements if you are considering self-hosting. This sequence prevents wasted evaluation effort.',
      },
      {
        heading: '3. The Three Budget Tiers Overview',
        content:
          'Free/Hobby is for students and side projects with near-zero budget. Startup ($50-$500/month) is for small teams and early products. Scale ($500+/month) is for production systems and larger organizations. Tier boundaries are flexible and should be based on usage volume, not just company size.',
      },
      {
        heading: '4. Tier 1 — Free and Hobby',
        content:
          'Useful options include Gemini Flash free usage, Groq-hosted open models, free Mistral access for smaller models, and fully local workflows through Ollama or LM Studio. API free tiers are easy but rate-limited; local is cost-free but hardware-limited. Practical recommendation: start with Ollama (CodeLlama 7B/Phi-3 Mini) or Gemini Flash free tier, then move up only when limits become a blocker.',
      },
      {
        heading: '5. Tier 2 — Startup ($50 to $500 per month)',
        content:
          'This tier unlocks stronger API models and practical hybrid routing. Common choices: Claude Sonnet, GPT-4o Mini, Gemini Flash variants, or open models on providers like Together/Fireworks/Replicate/Vast. Hybrid strategy (cheap model for routine tasks + stronger model for hard tasks) can reduce spend substantially versus single-model routing.',
      },
      {
        heading: '6. Tier 3 — Scale ($500 and above per month)',
        content:
          'At scale, teams can combine frontier APIs, enterprise agreements, fine-tuned models, or self-hosted large models. The key themes are reliability, compliance, observability, fallback architecture, and contract negotiation. Self-hosting becomes financially attractive when spend is sustained and infrastructure expertise is available.',
      },
      {
        heading: '7. GPU Requirements Table',
        content:
          'Baseline practical mapping: 7B (8GB min / 16GB recommended), 13B (16GB min / 24GB recommended), 34B (24GB min / 40GB recommended), 70B (40GB min / 80GB recommended). Quantization (8-bit/4-bit) can reduce VRAM requirements materially with quality tradeoffs.',
      },
      {
        heading: '8. The Cost Estimator Framework',
        content:
          'Monthly cost formula: (tokens per day × 30 × price per 1M) / 1,000,000. Calculate input and output separately. Estimate usage by workflow: completion, code review, and file-level refactor prompts have very different token footprints.',
      },
      {
        heading: '9. Hidden Costs Section',
        content:
          'Do not ignore egress fees, non-GPU infra costs, engineering effort for model switching, prompt tuning time, and rate-limit mitigation. These hidden costs often determine total ROI more than headline token pricing.',
      },
      {
        heading: '10. API vs Self-Hosted vs Cloud GPU — Side by Side',
        content:
          'API is fastest to launch and usually best for most teams until spend grows significantly. Self-hosted requires infra maturity but can lower marginal cost at scale and improve control. Cloud GPU hosting is a middle path for teams that want model control without owning hardware.',
      },
      {
        heading: '11. When to Move Between Tiers',
        content:
          'Move from free to startup when limits block weekly workflow. Move from startup to scale when spend is consistently high or enterprise controls become mandatory. Evaluate self-hosting when spend is sustained and at least one engineer can own infra operations.',
      },
      {
        heading: '12. Budget Planning Checklist',
        content:
          'Estimate daily tokens, validate current pricing, include hidden infra costs, set spending alerts, add usage logging per feature, define fallback model strategy, and budget engineering time for integration and prompt stabilization.',
      },
      {
        heading: '13. Frequently Asked Questions',
        content:
          'Common questions include daily GPT coding cost, free-model options, local CodeLlama GPU needs, API vs self-hosted break-even, and practical methods to reduce API spend while preserving quality.',
      },
    ],
    checklist: [
      'Have you estimated daily input and output token volume?',
      'Have you checked current pricing for your shortlisted models?',
      'Have you included egress and infrastructure overhead for self-hosted scenarios?',
      'Have you enabled API spending alerts and hard limits?',
      'Do you log usage by feature or user to identify cost hotspots?',
      'Do you have a fallback model for outage or rate-limit events?',
      'Did you allocate engineering time for integration and prompt tuning?',
    ],
    faq: [
      {
        q: 'How much does it cost to use GPT-4 for coding every day?',
        a: 'It depends on token volume. Use the estimator formula on this page and calculate input and output tokens separately.',
      },
      {
        q: 'Can I run an AI coding model for free?',
        a: 'Yes. Free API tiers and local models via Ollama/LM Studio are practical for learning and light usage.',
      },
      {
        q: 'What GPU do I need to run CodeLlama locally?',
        a: 'For 7B models, 8GB VRAM minimum (16GB recommended). Larger variants require significantly more VRAM.',
      },
      {
        q: 'Is self-hosting cheaper than using an API?',
        a: 'At low usage, usually no. At sustained higher usage with strong infra operations, it can be.',
      },
      {
        q: 'How do I reduce AI API costs?',
        a: 'Reduce token context, route simple tasks to cheaper models, and reserve premium models for complex requests.',
      },
      {
        q: 'What is the cheapest coding model that is still useful?',
        a: 'For many teams, GPT-4o Mini or quantized 7B local models offer a strong cost-performance baseline.',
      },
    ],
    whatYouWillLearn: [
      'How to pick model/hosting strategy by budget tier.',
      'How to estimate monthly spend before rollout.',
      'How to map model size to practical GPU requirements.',
      'When to switch tiers and when to consider self-hosting.',
    ],
    sources: [
      { label: 'OpenAI API Pricing', href: 'https://platform.openai.com/docs/pricing/' },
      { label: 'Anthropic Claude Pricing', href: 'https://docs.anthropic.com/en/docs/about-claude/pricing' },
      { label: 'Google AI Pricing', href: 'https://ai.google.dev/pricing' },
      { label: 'Mistral Pricing', href: 'https://docs.mistral.ai/getting-started/models/pricing/' },
      { label: 'InnoAI GPU VRAM Calculator', href: '/gpu/tools/vram-calculator' },
      { label: 'InnoAI GPU Picker', href: '/gpu/tools/gpu-picker' },
    ],
    related: ['best-models-low-vram', 'model-selection-mistakes', 'quantization-4bit-8bit-fp16'],
  },
  {
    slug: 'rag-vs-fine-tuning',
    title: 'RAG vs Fine-Tuning: A Practical Decision Framework',
    description: 'A practical decision framework for choosing RAG, fine-tuning, or a hybrid architecture based on knowledge freshness, behavior control, cost, evaluation risk, and production maintenance.',
    category: 'Architecture',
    readTime: '18 min read',
    lastUpdated: '2026-04-23',
    keyTakeaways: [
      'Use RAG when the model needs access to changing facts, private documents, citations, or source-grounded answers.',
      'Use fine-tuning when the model already has the knowledge but fails at behavior, tone, format, classification style, or domain-specific response patterns.',
      'Do not fine-tune to “teach” frequently changing facts. Update retrieval indexes instead.',
      'Do not build RAG to fix weak instruction following. Improve prompting or fine-tune behavior instead.',
      'Most teams should start with prompting plus RAG, collect failure logs, then fine-tune only when failure patterns prove it is necessary.',
      'Hybrid RAG plus fine-tuning is powerful, but it adds evaluation, monitoring, and maintenance complexity that small teams should not adopt too early.',
    ],
    sections: [
      {
        heading: '1. The simplest decision rule',
        content:
          'Use RAG when the model needs better information. Use fine-tuning when the model needs better behavior. This single rule prevents most architecture mistakes. If your chatbot gives outdated pricing, cannot find policy details, or needs to cite internal documents, retrieval is the right first move. If the model knows the answer but keeps responding in the wrong tone, wrong format, or inconsistent classification style, fine-tuning is more relevant.',
      },
      {
        heading: '2. What RAG actually changes',
        content:
          'RAG changes what information the model sees at answer time. You keep documents, chunks, metadata, embeddings, and retrieval logic outside the model. At runtime, the app searches the knowledge base and inserts relevant context into the prompt. This is ideal for company docs, product catalogs, legal policies, support articles, research PDFs, release notes, knowledge bases, and anything that changes often. You can update content by re-indexing documents instead of training new weights.',
      },
      {
        heading: '3. What fine-tuning actually changes',
        content:
          'Fine-tuning changes how the model behaves after learning from examples. It is useful when you have repeated input-output pairs and want the model to follow a style, classify consistently, produce structured output, or obey a domain response policy. Fine-tuning does not automatically make the model aware of your latest documents. It is a behavior-shaping tool, not a document database.',
      },
      {
        heading: '4. Practical examples where RAG is the right choice',
        content:
          'Choose RAG for an internal HR assistant that answers from company policy PDFs, a customer support bot that must cite help-center articles, a legal research assistant that needs source references, a product search assistant that depends on live inventory, or a sales assistant that uses current pricing and feature documentation. In each case, the key problem is not that the model lacks style. The problem is that it needs access to fresh and trusted information.',
      },
      {
        heading: '5. Practical examples where fine-tuning is the right choice',
        content:
          'Choose fine-tuning for routing support tickets into fixed categories, converting messy notes into a strict JSON schema, enforcing a brand-specific response tone, generating domain-specific short summaries, or making repeated compliance responses more consistent. In these cases, the model can usually answer from the prompt, but it does not reliably follow the exact behavior you need at scale.',
      },
      {
        heading: '6. Decision matrix for real products',
        content:
          'If knowledge changes weekly or daily, prefer RAG. If knowledge is stable but response format is unreliable, prefer fine-tuning. If answers must include citations, prefer RAG. If the same task happens thousands of times with predictable labels or outputs, fine-tuning may reduce prompt length and improve consistency. If both fresh knowledge and strict behavior matter, use RAG first, then fine-tune later using real failure examples.',
      },
      {
        heading: '7. Cost comparison that teams often miss',
        content:
          'RAG costs come from embedding documents, storing vectors, retrieval calls, longer prompts, and more complex orchestration. Fine-tuning costs come from dataset preparation, training runs, evaluation, retraining, and model-version maintenance. RAG can be cheaper to update because content changes do not require new training. Fine-tuning can be cheaper at high volume if it reduces very long prompts or replaces complex instruction blocks with learned behavior.',
      },
      {
        heading: '8. Evaluation plan before choosing',
        content:
          'Build a test set of 50 to 100 real user questions before committing. Tag each failure as missing knowledge, wrong retrieval, hallucination, bad format, wrong tone, weak reasoning, or policy violation. If most failures are missing or stale facts, improve RAG. If most failures are format/tone/classification consistency, consider fine-tuning. If failures are reasoning quality, neither RAG nor fine-tuning may help enough; you may need a stronger base model or better task decomposition.',
      },
      {
        heading: '9. Common RAG failure modes and fixes',
        content:
          'Weak RAG systems usually fail because chunks are too large, chunks are too small, metadata is missing, embeddings do not match the query style, irrelevant passages are retrieved, or the prompt does not force the model to use sources. Practical fixes include better chunking, metadata filters, reranking, query rewriting, source citations, and fallback behavior when retrieval confidence is low.',
      },
      {
        heading: '10. Common fine-tuning failure modes and fixes',
        content:
          'Fine-tuning fails when the dataset is too small, examples are inconsistent, labels are noisy, edge cases are missing, or the team expects training to add fresh knowledge. Practical fixes include cleaning examples, adding negative examples, separating task types, validating on unseen data, and keeping a strong baseline prompt for comparison. Fine-tuning should improve a measured failure pattern, not be used because it sounds advanced.',
      },
      {
        heading: '11. Recommended rollout path',
        content:
          'Start with a strong prompt and no training. Add RAG if answers need private or changing knowledge. Log failures for two to four weeks. Improve chunking, metadata, retrieval, and reranking. Only then consider fine-tuning if the model still fails predictable behavior patterns. For production teams, keep a fallback model and a manual review path for low-confidence responses.',
      },
      {
        heading: '12. When hybrid RAG plus fine-tuning makes sense',
        content:
          'Hybrid is best when a product needs both grounded knowledge and consistent behavior. Examples include regulated support assistants, enterprise search copilots, insurance claim assistants, legal intake systems, and internal technical assistants. The RAG layer supplies current source material; the fine-tuned model learns response policy, structure, and domain-specific handling. Adopt this only when you have enough traffic and logs to justify the complexity.',
      },
      {
        heading: '13. Architecture patterns',
        content:
          'A simple RAG architecture includes ingestion, chunking, embeddings, vector storage, retrieval, optional reranking, prompt assembly, generation, citations, and monitoring. A fine-tuning workflow includes dataset collection, example cleaning, train/validation split, baseline evaluation, training, regression testing, deployment, and rollback. A hybrid architecture combines both, which means you must monitor retrieval quality and tuned-model behavior separately.',
      },
      {
        heading: '14. Practical recommendation by team size',
        content:
          'Solo developers should usually use prompting plus lightweight RAG. Startups should use RAG first and fine-tune only after repeated failures are visible in logs. Larger teams can run hybrid systems if they have evaluation infrastructure, model operations ownership, and enough usage volume to justify maintenance. Regulated teams should prioritize source-grounded answers, audit logs, and clear fallback behavior before tuning.',
      },
      {
        heading: '15. Final recommendation',
        content:
          'Do not ask “Which is better: RAG or fine-tuning?” Ask “What kind of failure am I trying to fix?” If the failure is missing knowledge, use RAG. If the failure is inconsistent behavior, consider fine-tuning. If both are present, solve retrieval first, measure again, and then tune only the stable behavior layer. This order keeps cost lower and makes failures easier to debug.',
      },
    ],
    checklist: [
      'Write down the top 20 real user questions or tasks before choosing an architecture.',
      'Label each failure as missing knowledge, stale knowledge, wrong retrieval, hallucination, bad format, wrong tone, weak reasoning, or policy violation.',
      'Use RAG first if the main issue is missing, private, changing, or source-dependent information.',
      'Use fine-tuning only when the main issue is repeated behavior, tone, classification, or output-format inconsistency.',
      'Do not fine-tune frequently changing facts into model weights.',
      'Do not use RAG to compensate for a model that cannot follow basic instructions.',
      'Test RAG with source citations and low-confidence fallback behavior.',
      'Test fine-tuning against a strong prompt baseline before paying training and maintenance cost.',
      'Keep separate metrics for retrieval quality, answer quality, format compliance, hallucination rate, and user correction rate.',
      'Move to hybrid only after logs prove that both retrieval and behavior control are needed.',
    ],
    faq: [
      {
        q: 'Can RAG replace fine-tuning?',
        a: 'For many knowledge-heavy products, yes. If the problem is access to current documents, policies, sources, or private data, RAG is usually enough. But if the model repeatedly fails response format, tone, classification, or policy behavior, fine-tuning may still be useful.',
      },
      {
        q: 'What fails most often in RAG systems?',
        a: 'The most common failures are poor chunking, weak metadata, irrelevant retrieval, missing reranking, stale indexes, and prompts that allow the model to answer without using the retrieved source material.',
      },
      {
        q: 'Should startups fine-tune early?',
        a: 'Usually no. Startups should begin with a strong prompt and RAG when needed, then collect production failure logs. Fine-tune only when failures are predictable, repeated, and clearly behavioral.',
      },
      {
        q: 'Is fine-tuning better for reducing hallucinations?',
        a: 'Not usually. If hallucinations happen because the model lacks the right facts, RAG with citations and retrieval confidence checks is usually better. Fine-tuning may help behavior, but it does not guarantee factual grounding.',
      },
      {
        q: 'Can I use RAG and fine-tuning together?',
        a: 'Yes. A common hybrid pattern is to use RAG for current source material and fine-tuning for consistent response style, schema, or domain policy. The tradeoff is higher complexity and more evaluation work.',
      },
      {
        q: 'How much data do I need for fine-tuning?',
        a: 'It depends on the task. For narrow format or classification improvements, hundreds of high-quality examples may help. For broad behavior changes, you may need much more. Quality and consistency matter more than raw count.',
      },
      {
        q: 'How do I know if my RAG system is good enough?',
        a: 'Track whether the right source appears in top retrieved chunks, whether answers cite the correct source, whether users need corrections, and whether low-confidence queries fall back safely instead of hallucinating.',
      },
    ],
    whatYouWillLearn: [
      'How to separate knowledge problems from behavior problems before choosing an architecture.',
      'When RAG, fine-tuning, or a hybrid system is the practical choice.',
      'How to evaluate real user failures before spending time on training.',
      'Which cost and maintenance tradeoffs matter in production.',
      'How to design a rollout path from prompt-only to RAG to fine-tuning.',
      'What metrics to track so architecture decisions are based on evidence.',
    ],
    sources: [
      { label: 'Hugging Face RAG task docs', href: 'https://huggingface.co/docs/transformers/en/model_doc/rag' },
      { label: 'OpenAI fine-tuning guide', href: 'https://platform.openai.com/docs/guides/fine-tuning' },
      { label: 'Pinecone RAG overview', href: 'https://www.pinecone.io/learn/retrieval-augmented-generation/' },
      { label: 'LangChain RAG concepts', href: 'https://python.langchain.com/docs/concepts/rag/' },
      { label: 'LlamaIndex RAG concepts', href: 'https://docs.llamaindex.ai/en/stable/understanding/rag/' },
      { label: 'InnoAI guide: Deploy a Small RAG App', href: '/guides/deploy-small-rag-app' },
      { label: 'InnoAI guide: Prompt Patterns That Work', href: '/guides/prompt-patterns-that-work' },
    ],
    endLinks: [
      {
        href: '/guides/deploy-small-rag-app',
        title: 'Deploy a Small RAG App',
        body: 'Use this if your decision points toward retrieval, citations, document ingestion, and source-aware answers.',
      },
      {
        href: '/guides/prompt-patterns-that-work',
        title: 'Prompt Patterns That Work',
        body: 'Use this before fine-tuning to make sure the issue is not just weak prompt structure.',
      },
      {
        href: '/recommender',
        title: 'Open the Model Recommender',
        body: 'Shortlist models after you decide whether your architecture needs retrieval, tuning, or both.',
      },
    ],
    related: ['deploy-small-rag-app', 'prompt-patterns-that-work'],
  },
  {
    slug: 'quantization-4bit-8bit-fp16',
    title: 'Precision Strategy: FP32 to GGUF Quantization for Real Deployment',
    description: 'A practical precision guide with memory estimates, benchmark-backed comparisons, and deployment recommendations.',
    category: 'Deployment',
    readTime: '12 min read',
    lastUpdated: '2026-04-20',
    keyTakeaways: [
      'Precision is the main deployment lever for memory, speed, cost, and quality.',
      'FP16/BF16 preserve quality; INT8 is a common production midpoint; INT4 and GGUF are strongest for constrained hardware.',
      'Always evaluate quantized variants on your own long-context and failure-prone prompts.',
      'Tag benchmark data by provenance: source-reported, example baseline, or locally reproducible recipe.',
    ],
    sections: [
      {
        heading: 'Why precision strategy matters',
        content:
          'Precision controls how model weights are represented. Higher precision formats preserve numerical detail but consume more memory and compute. Lower precision formats reduce footprint and can improve throughput, but quality may decline depending on model and quantization method.',
      },
      {
        heading: 'How to use this page',
        content:
          'Start with the precision family overview, then filter the comparison table by your goal and hardware. Use the memory calculator for feasibility, inspect benchmark confidence tags, and finish with the recommender to pick a starting precision for your machine.',
      },
      {
        heading: 'Safe rollout principle',
        content:
          'Treat precision as a production policy, not a one-time setting. Keep fallback formats available, monitor response quality drift, and define explicit rollback triggers when aggressive quantization harms user-facing reliability.',
      },
    ],
    checklist: [
      'Run identical prompt suites across FP16/BF16, INT8, and 4-bit variants.',
      'Measure memory, throughput, latency, and quality together for each precision.',
      'Validate long-context and tool-calling behavior before rollout.',
      'Label benchmark rows by provenance to avoid over-generalizing numbers.',
      'Define rollback thresholds and keep higher-precision fallback ready.',
    ],
    faq: [
      {
        q: 'Should I always start with INT4 for deployment?',
        a: 'Not always. Start with INT8 or FP16/BF16 when quality risk is high, then downshift only if memory or cost constraints demand it.',
      },
      {
        q: 'Is BF16 better than FP16?',
        a: 'For training, BF16 is often preferred due to numerical range. For inference, FP16 and BF16 are both strong options depending on hardware and runtime support.',
      },
      {
        q: 'Are GGUF quantizations only for CPU?',
        a: 'No. GGUF is popular for CPU-first local inference, but can also run on compatible GPU backends through llama.cpp-based stacks.',
      },
      {
        q: 'How reliable are benchmark numbers across setups?',
        a: 'Throughput and latency vary significantly by hardware, runtime, and prompt shape. Use source tags and reproduce critical tests on your own environment.',
      },
    ],
    whatYouWillLearn: [
      'What each precision means: FP32, TF32, BF16, FP16, FP8, INT8, INT4, GPTQ, AWQ, and GGUF variants.',
      'How precision choices map to training, production inference, local laptop deployment, and cloud serving.',
      'How to estimate whether a model fits your RAM/VRAM before running it.',
      'How to choose a starting precision based on hardware limits and quality priorities.',
    ],
    sources: [
      { label: 'PyTorch AMP (mixed precision)', href: 'https://docs.pytorch.org/docs/stable/amp.html' },
      { label: 'Cloud TPU bfloat16 guide', href: 'https://docs.cloud.google.com/tpu/docs/bfloat16' },
      { label: 'ONNX Runtime quantization docs', href: 'https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html' },
      { label: 'Transformers bitsandbytes quantization', href: 'https://huggingface.co/docs/transformers/en/quantization/bitsandbytes' },
      { label: 'llama.cpp tensor encoding schemes', href: 'https://github.com/ggml-org/llama.cpp/wiki/Tensor-Encoding-Schemes' },
      { label: 'llama.cpp llama-bench README', href: 'https://github.com/ggml-org/llama.cpp/blob/master/tools/llama-bench/README.md' },
      { label: 'TensorRT-LLM Mixtral FP8 vs FP16 benchmark', href: 'https://developer.nvidia.com/blog/achieving-high-mixtral-8x7b-performance-with-nvidia-h100-tensor-core-gpus-and-tensorrt-llm/' },
      { label: 'NVIDIA TF32 explainer', href: 'https://blogs.nvidia.com/blog/tensorfloat-32-precision-format/' },
      { label: 'GPTQ paper', href: 'https://arxiv.org/abs/2210.17323' },
      { label: 'AWQ paper', href: 'https://arxiv.org/abs/2306.00978' },
      { label: 'BitNet b1.58 paper', href: 'https://arxiv.org/abs/2402.17764' },
    ],
    related: ['best-models-low-vram', 'choose-ai-model-by-gpu-budget'],
  },
  {
    slug: 'open-vs-closed-models',
    title: 'Open vs Closed Models: Cost, Control, and Compliance',
    description: 'Choose between open and closed models by looking beyond benchmark quality to lifecycle cost, governance, portability, and operational ownership.',
    category: 'Strategy',
    readTime: '8 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: [
      'Closed APIs usually reduce launch friction and operational overhead.',
      'Open models improve control over latency, retention policy, and deployment environment.',
      'Total cost depends on traffic shape, infra maturity, and staffing, not only token price.',
      'A hybrid architecture can preserve portability while keeping time-to-launch reasonable.',
    ],
    sections: [
      {
        heading: 'Compare lifecycle cost, not just entry price',
        content:
          'Entry cost is only one phase of the decision. Closed models often look expensive per token but remove infrastructure work, model serving, and deployment debugging. Open models reduce vendor dependence and can lower marginal cost at scale, but only if you account for GPUs, observability, on-call effort, prompt adaptation, and model upgrades across 6 to 12 months.',
      },
      {
        heading: 'Review governance and data handling before benchmark comparisons',
        content:
          'Data residency, retention policy, auditability, and legal obligations can decide architecture before benchmark performance is even relevant. Teams handling source code, internal documents, or regulated user data often need stronger clarity around logging, training usage, and regional hosting. In those cases, open or self-hosted paths may be a requirement rather than an optimization.',
      },
      {
        heading: 'Design for portability even if you start with one provider',
        content:
          'Keep provider interfaces abstracted so you can route traffic or migrate without deep rewrites. A thin orchestration layer for prompts, model configs, and evaluation logs makes it much easier to compare providers later. That portability is valuable whether you begin with a closed API, an open model host, or a hybrid stack.',
      },
    ],
    checklist: [
      'Model 6 to 12 months of cost, not just first-month usage.',
      'Review retention, residency, and compliance requirements with stakeholders.',
      'Estimate infra and staffing cost for any open-model plan.',
      'Add a provider abstraction layer before deep integration work.',
      'Keep an evaluation suite ready so migration decisions are evidence-based.',
    ],
    faq: [
      {
        q: 'Is open-source always cheaper than a closed API?',
        a: 'No. For low or variable traffic, a closed API is often cheaper once you include engineering time and reliability overhead.',
      },
      {
        q: 'When should a small team choose hybrid?',
        a: 'Usually after launch, once you know which requests need premium quality and which can be routed to cheaper or self-hosted paths.',
      },
      {
        q: 'What is the biggest mistake in this decision?',
        a: 'Comparing only benchmark quality or token price while ignoring governance requirements and long-term maintenance cost.',
      },
    ],
    whatYouWillLearn: [
      'How to compare open and closed models using real lifecycle cost.',
      'Why governance and privacy constraints can override benchmark rankings.',
      'When a hybrid architecture is worth the additional complexity.',
      'How to preserve portability so you are not locked into one model decision.',
    ],
    sources: [
      { label: 'Hugging Face models hub', href: 'https://huggingface.co/models' },
      { label: 'InnoAI guide: Choose an AI Model by GPU and Budget', href: '/guides/choose-ai-model-by-gpu-budget' },
      { label: 'InnoAI guide: Fastest Models for Low-Latency Apps', href: '/guides/fastest-models-low-latency-apps' },
    ],
    related: ['choose-ai-model-by-gpu-budget', 'fastest-models-low-latency-apps'],
  },
  {
    slug: 'llama-vs-qwen-vs-gemma-coding',
    title: 'Llama vs Qwen vs Gemma for Coding Workflows',
    description: 'A complete coding-model analysis covering tools, benchmarks, prompts, automation, and agentic workflows.',
    category: 'Comparisons',
    readTime: '8 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: [
      'Coding model selection should include workflow fit, not only benchmark rank.',
      'Tooling ecosystem and IDE integration strongly affect developer productivity.',
      'Automation and agentic capabilities are now practical selection criteria.',
      'Prompt quality and evaluation discipline drive long-term reliability.',
    ],
    sections: [
      {
        heading: 'What is AI coding and why this category matters',
        content:
          'AI coding now spans generation, debugging, refactoring, test writing, and code explanation. A useful analysis page should map these job types clearly so teams can pick models based on delivery outcomes rather than hype.',
      },
      {
        heading: 'Top AI coding models and where each one fits',
        content:
          'Compare Claude, GPT-4o/o3, Gemini 2.5 Pro, Codestral, DeepSeek-Coder, and Llama code-focused variants by strengths: long-context reasoning, multi-file edits, bug-fixing reliability, and speed. Avoid a single winner framing; use task-specific fit.',
      },
      {
        heading: 'AI coding tools and IDE ecosystem',
        content:
          'Include Copilot, Claude Code, Cursor, Windsurf, Replit AI, Tabnine, Codeium, JetBrains AI, and Supermaven with practical differences: inline completion quality, repo awareness, agent mode depth, and enterprise controls.',
      },
      {
        heading: 'Automation workflows with coding AI',
        content:
          'Cover high-ROI automations such as test generation, CI/CD checks, code-review summarization, doc generation, and repetitive refactoring. Teams should evaluate measurable cycle-time reduction, not just output novelty.',
      },
      {
        heading: 'Agentic coding and autonomous execution',
        content:
          'Explain coding agents that can plan, edit, run, and iterate across repositories. Compare patterns like single-agent loops and multi-agent orchestration, and call out safety boundaries such as approval gates and scoped permissions.',
      },
      {
        heading: 'Languages and stacks where coding AI is strongest',
        content:
          'Most models perform best on Python and JavaScript/TypeScript, then Java/Go, with mixed reliability on Rust-heavy low-level logic and complex SQL migrations. Highlight where stronger human review is still required.',
      },
      {
        heading: 'Prompt engineering for developer teams',
        content:
          'Document reusable templates for bug fixing, refactoring, test writing, and architecture explanation. Show before/after prompt quality patterns so developers can reduce ambiguity and increase deterministic outputs.',
      },
      {
        heading: 'Benchmarks and performance interpretation',
        content:
          'Use HumanEval, MBPP, and SWE-bench as directional signals. Pair benchmark scores with internal evaluation suites, latency percentiles, and pass-rate-on-first-attempt to reflect real developer experience.',
      },
      {
        heading: 'Learning resources and upcoming trends',
        content:
          'Link official model docs, IDE tool docs, and practical coding-agent resources. Track near-term trends including voice-to-code workflows, stronger pair-programming copilots, and self-healing CI pipelines.',
      },
    ],
    checklist: [
      'Define coding task categories for your org',
      'Create a side-by-side model comparison sheet',
      'Pilot at least two IDE copilots',
      'Measure automation ROI in CI/CD',
      'Set guardrails for agentic execution',
      'Score language-specific reliability',
      'Standardize prompt templates per use case',
      'Track benchmark + real-world quality together',
      'Create a quarterly re-evaluation cycle',
    ],
    faq: [
      { q: 'Should leaderboard rank decide coding model choice?', a: 'No. Treat public benchmarks as signals and validate using your real repository tasks.' },
      { q: 'What is the most overlooked evaluation factor?', a: 'IDE workflow fit and correction rate during normal coding sessions.' },
      { q: 'Are coding agents production-ready?', a: 'For bounded tasks, yes. For broad autonomous changes, keep human approval checkpoints.' },
      { q: 'How often should teams update this analysis?', a: 'Quarterly, or immediately after major model/tool releases.' },
    ],
    related: ['prompt-patterns-that-work', 'model-selection-mistakes'],
  },
  {
    slug: 'best-models-low-vram',
    title: 'Best Models for 8GB, 16GB, and 24GB VRAM Setups',
    description: 'Plan realistic model choices for 8GB, 16GB, and 24GB VRAM machines without overcommitting on context length, concurrency, or precision.',
    category: 'Hardware Planning',
    readTime: '8 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: [
      'VRAM is the first hard limit for local and self-hosted inference.',
      'Context length, batch size, and concurrency can break otherwise safe-looking plans.',
      'Quantization changes what fits, but should always be validated for quality drift.',
      'Stable throughput and predictable fallbacks matter more than peak benchmark speed.',
    ],
    sections: [
      {
        heading: 'Plan by VRAM tier instead of by model hype',
        content:
          'Treat 8GB, 16GB, and 24GB as separate deployment classes with different model and precision strategies. On 8GB cards, you are usually in the world of small or aggressively quantized models. At 16GB, you can support stronger 7B to 14B-style deployments with tighter safeguards. At 24GB, more useful context lengths and medium-size checkpoints become realistic, but only if you still budget for KV cache growth.',
      },
      {
        heading: 'Include long-context and concurrency tests before declaring success',
        content:
          'Sizing based on average prompt length is risky because real users do not send average prompts forever. Stress test memory using long-context requests, repeated sessions, and your expected concurrency pattern. Many “works on my GPU” setups fail in production because the original test was only one short prompt at a time.',
      },
      {
        heading: 'Ship with safeguards, not just a model that technically loads',
        content:
          'Use conservative defaults, clear limits, and fallback behavior to maintain reliability under load. Memory headroom, token limits, model routing, and visible user constraints are part of the product design. A slightly smaller model with clear guardrails usually creates a better user experience than an unstable larger model that crashes or swaps constantly.',
      },
    ],
    checklist: [
      'Choose a target model and precision for each VRAM tier you support.',
      'Stress test context windows beyond the average user prompt length.',
      'Measure concurrency impact on memory and response time.',
      'Define fallback behavior for OOM or latency spikes.',
      'Document safe defaults for batch size, max tokens, and session limits.',
    ],
    faq: [
      {
        q: 'Can an 8GB GPU be practical for AI work?',
        a: 'Yes, especially for focused assistants, embedding workflows, and quantized small models with careful prompt and context limits.',
      },
      {
        q: 'Is 24GB enough for production inference?',
        a: 'Often yes for medium workloads, but the real answer depends on concurrency, context length, and whether you need headroom for spikes.',
      },
      {
        q: 'What gets overlooked most in low-VRAM planning?',
        a: 'KV cache growth from longer conversations. Teams often size only for weights and forget how quickly context can consume the remaining memory.',
      },
    ],
    whatYouWillLearn: [
      'What kinds of workloads are realistic on 8GB, 16GB, and 24GB VRAM systems.',
      'Why context length and concurrency can invalidate simple sizing assumptions.',
      'How to use quantization without hiding quality regressions.',
      'Which safeguards improve reliability on constrained hardware.',
    ],
    sources: [
      { label: 'InnoAI VRAM Calculator', href: '/gpu/tools/vram-calculator' },
      { label: 'InnoAI guide: Precision Strategy', href: '/guides/quantization-4bit-8bit-fp16' },
      { label: 'InnoAI guide: Build a Local AI Assistant on an 8GB GPU', href: '/guides/build-local-ai-assistant-8gb' },
    ],
    related: ['quantization-4bit-8bit-fp16', 'build-local-ai-assistant-8gb'],
  },
  {
    slug: 'best-multilingual-llms',
    title: 'Best Multilingual LLM Strategies for English and Indian Languages',
    description: 'Build multilingual AI systems for English and Indian languages with stronger evaluation, prompt design, and language-specific feedback loops.',
    category: 'Localization',
    readTime: '8 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: [
      'Language quality varies sharply by task, domain vocabulary, and script complexity.',
      'Translation benchmarks alone are not enough for multilingual product decisions.',
      'Code-switching and regional phrasing should be part of every evaluation plan.',
      'Feedback loops should be tracked per language, not just globally.',
    ],
    sections: [
      {
        heading: 'Define multilingual quality dimensions before choosing a model',
        content:
          'Evaluate fluency, factuality, terminology consistency, and instruction following per language group. For English and Indian language deployments, also watch script handling, transliteration behavior, domain terminology, and whether the model stays stable when users mix languages in one prompt. Those are the failure modes that affect real usage more than leaderboard summaries.',
      },
      {
        heading: 'Design realistic test sets with code-switching and product context',
        content:
          'Use real product queries and include code-switched prompts such as English plus Hindi or English plus Tamil instructions. Translation-only tests miss production failure modes because user traffic is often mixed, informal, and context-heavy. If your product serves India, customer support, finance, healthcare, and education vocabulary should each be tested explicitly.',
      },
      {
        heading: 'Iterate with language-specific feedback, not one global score',
        content:
          'Track correction rates and refine prompts and retrieval by language. Small changes can produce strong gains when you discover that one language needs shorter instructions, better glossary support, or retrieval tuned on regional content. A single “multilingual accuracy” number can hide major weaknesses that hurt trust in one audience segment.',
      },
    ],
    checklist: [
      'Create separate evaluation buckets for each language and script you support.',
      'Include code-switching and transliterated prompts in tests.',
      'Check terminology consistency on domain-specific phrases.',
      'Track correction rates and escalation rates by language.',
      'Run regular regressions after prompt, retrieval, or model changes.',
    ],
    faq: [
      {
        q: 'Are multilingual benchmarks enough?',
        a: 'No. They are directional signals only. You still need product-specific prompt sets, especially for code-switching and domain vocabulary.',
      },
      {
        q: 'Should I use one model for every language?',
        a: 'A single model is a good starting point, but routing by language or domain can improve both quality and cost at scale.',
      },
      {
        q: 'What is the biggest hidden risk in multilingual launches?',
        a: 'Assuming English performance transfers automatically. Many models are strong in English but inconsistent in regional phrasing, mixed-language prompts, or specialized local terminology.',
      },
    ],
    whatYouWillLearn: [
      'How to evaluate multilingual quality beyond translation benchmarks.',
      'Why code-switching should be part of every production test set.',
      'How to track feedback and regressions per language.',
      'When one model is enough and when routing is worth the extra complexity.',
    ],
    sources: [
      { label: 'Hugging Face multilingual models', href: 'https://huggingface.co/models?pipeline_tag=text-generation&language=multilingual' },
      { label: 'InnoAI guide: RAG vs Fine-Tuning', href: '/guides/rag-vs-fine-tuning' },
      { label: 'InnoAI guide: Prompt Patterns That Work', href: '/guides/prompt-patterns-that-work' },
    ],
    related: ['rag-vs-fine-tuning', 'prompt-patterns-that-work'],
  },
  {
    slug: 'fastest-models-low-latency-apps',
    title: 'Fastest Models for Low-Latency AI Applications',
    description: 'Reduce response time by treating latency as a whole-system problem across model choice, prompt size, routing, and serving architecture.',
    category: 'Performance',
    readTime: '7 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: [
      'Latency is an end-to-end system metric, not just a model benchmark.',
      'Prompt size and retrieval payload often dominate perceived speed.',
      'Optimize p95 and failure rate, not only average response time.',
      'Routing simpler requests to faster models is often the highest-ROI change.',
    ],
    sections: [
      {
        heading: 'Break down latency into measurable pipeline components',
        content:
          'Measure queue time, network overhead, prefill, generation, tool calls, and post-processing separately to identify the true bottleneck. Teams often blame the model when the real issue is oversized prompts, slow retrieval, or shared infrastructure contention. You cannot optimize what you do not isolate first.',
      },
      {
        heading: 'Cut token overhead before upgrading infrastructure',
        content:
          'Trim unnecessary prompt instructions, duplicate examples, and oversized retrieval context before buying bigger hardware or premium models. Token reduction improves speed and cost together, which makes it one of the most efficient optimizations available. In many apps, prompt design changes beat model swaps for latency improvement.',
      },
      {
        heading: 'Use routing to reserve slower models for complex requests',
        content:
          'Route simple tasks to faster models and keep high-capability models for complex prompts. This is especially effective for autocomplete, support triage, classification, and first-pass drafting. The goal is not to find one universally fastest model, but to design a latency strategy that fits different request types.',
      },
    ],
    checklist: [
      'Instrument every major pipeline stage separately.',
      'Track p50, p95, and timeout rate rather than average alone.',
      'Reduce prompt and retrieval payload before scaling infrastructure.',
      'Implement routing and fallback by request complexity.',
      'Re-test latency after every model, prompt, or infra change.',
    ],
    faq: [
      {
        q: 'Does streaming solve latency?',
        a: 'It improves user perception, but it does not remove backend bottlenecks. You still need to measure full completion time and timeout behavior.',
      },
      {
        q: 'What should I optimize first for a slow AI app?',
        a: 'Start with p95 latency, prompt size, and retrieval payload. Those usually reveal faster wins than changing providers immediately.',
      },
      {
        q: 'Should I always choose the smallest model for speed?',
        a: 'Not always. If the smaller model fails more often, retries and corrections can erase the latency gains. Optimize for successful task completion speed, not raw generation speed alone.',
      },
    ],
    whatYouWillLearn: [
      'How to decompose latency into actionable measurements.',
      'Why prompt and retrieval design affect speed as much as model choice.',
      'When routing delivers better latency than one-model strategies.',
      'How to avoid misleading averages by focusing on p95 behavior.',
    ],
    sources: [
      { label: 'InnoAI GPU Picker', href: '/gpu/tools/gpu-picker' },
      { label: 'InnoAI guide: Choose an AI Model by GPU and Budget', href: '/guides/choose-ai-model-by-gpu-budget' },
      { label: 'InnoAI guide: Best Models for Low VRAM', href: '/guides/best-models-low-vram' },
    ],
    related: ['choose-ai-model-by-gpu-budget', 'best-models-low-vram'],
  },
  {
    slug: 'build-local-ai-assistant-8gb',
    title: 'Build a Local AI Assistant on an 8GB GPU',
    description: 'Build a practical local AI assistant on an 8GB GPU by keeping scope narrow, defaults conservative, and quality measurement honest.',
    category: 'Tutorials',
    readTime: '10 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: [
      'Scope narrowly first so the assistant is useful instead of overloaded.',
      'Use conservative context and concurrency limits on 8GB hardware.',
      'Quantized models are viable, but quality must be checked on your actual tasks.',
      'Logs and correction patterns matter more than first-day demo quality.',
    ],
    sections: [
      {
        heading: 'Start with one or two narrow, high-value tasks',
        content:
          'Focus on one or two high-value tasks such as local document Q&A, coding assistance for a small repo, or a private writing helper. This keeps memory usage predictable and makes prompt design easier. A narrow assistant that works reliably is more valuable than a broad assistant that constantly runs out of memory or gives inconsistent results.',
      },
      {
        heading: 'Configure for stability before chasing maximum model size',
        content:
          'Use quantized checkpoints, strict token limits, and low-concurrency defaults to avoid memory spikes. On an 8GB card, stability comes from guardrails: smaller context defaults, one-request-at-a-time policies, simple retrieval, and clear fallbacks when prompts get too large. These controls matter more than squeezing in the biggest possible model.',
      },
      {
        heading: 'Improve using real logs rather than forum advice',
        content:
          'Track corrections, latency, truncation events, and user satisfaction weekly. Tune prompts and retrieval before switching model families because many first-release failures are workflow problems, not model problems. Real local usage data will tell you whether you need better retrieval, a different quantization, or simply tighter task boundaries.',
      },
    ],
    checklist: [
      'Define a narrow launch scope and primary success metric.',
      'Choose a quantized model that leaves safe VRAM headroom.',
      'Set explicit limits for context length, max tokens, and concurrency.',
      'Log correction rate, truncation events, and slow responses.',
      'Tune prompts and retrieval before moving to a larger model.',
    ],
    faq: [
      {
        q: 'Can an 8GB local assistant handle heavy enterprise traffic?',
        a: 'Usually no, but it can be very effective for personal workflows, prototypes, internal tools, and privacy-sensitive niche use cases.',
      },
      {
        q: 'What causes instability most often on 8GB systems?',
        a: 'Long prompts, large context windows, and uncontrolled concurrency are the biggest causes of crashes and latency spikes.',
      },
      {
        q: 'Should I start with RAG or a bigger model?',
        a: 'Usually start with a smaller model plus lightweight retrieval. On constrained hardware, better context selection beats simply trying to load a larger checkpoint.',
      },
    ],
    whatYouWillLearn: [
      'What kinds of assistants are realistic on an 8GB GPU.',
      'How to keep local inference stable with conservative defaults.',
      'Which metrics show whether the assistant is improving.',
      'When to tune prompts, retrieval, or model size next.',
    ],
    sources: [
      { label: 'InnoAI guide: Best Models for Low VRAM', href: '/guides/best-models-low-vram' },
      { label: 'InnoAI guide: Precision Strategy', href: '/guides/quantization-4bit-8bit-fp16' },
      { label: 'InnoAI VRAM Calculator', href: '/gpu/tools/vram-calculator' },
    ],
    related: ['best-models-low-vram', 'quantization-4bit-8bit-fp16'],
  },
  {
    slug: 'deploy-small-rag-app',
    title: 'Deploy a Small RAG App End-to-End',
    description: 'A practical end-to-end RAG deployment flow covering ingestion, retrieval tuning, answer grounding, and production monitoring.',
    category: 'Tutorials',
    readTime: '10 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: [
      'Ingestion quality is the foundation of every useful RAG system.',
      'Retrieval tuning usually matters more than model swaps in the early stages.',
      'Grounding, citations, and low-confidence behavior improve trust quickly.',
      'A small RAG app should be instrumented from day one so you can see failures clearly.',
    ],
    sections: [
      {
        heading: 'Build a clean ingestion pipeline before prompt tuning',
        content:
          'Normalize documents, attach metadata, and remove duplicate or low-quality text before worrying about model prompts. Retrieval quality depends heavily on document hygiene. If your source data is messy, stale, or poorly chunked, no prompt template will reliably rescue the final answer quality.',
      },
      {
        heading: 'Tune retrieval before changing the generation model',
        content:
          'Iterate chunk size, overlap, metadata filters, and reranking with real query patterns before changing generation models. Many small RAG apps underperform because the wrong passages are retrieved, not because the model lacks intelligence. Better retrieval often produces larger gains than switching to a more expensive generator.',
      },
      {
        heading: 'Add confidence guardrails and source-aware answers',
        content:
          'Expose source snippets, require answers to stay grounded in retrieved content, and define low-confidence fallback behavior. These features improve trust more than cosmetic UI changes because users can see why the system answered the way it did. When the retrieval is weak, the app should say so instead of pretending to be confident.',
      },
    ],
    checklist: [
      'Normalize documents and attach useful metadata during ingestion.',
      'Tune chunking and retrieval on real query logs.',
      'Add source-aware answer formatting and low-confidence fallbacks.',
      'Track retrieval hit quality, unsupported answers, and correction rate.',
      'Re-run evaluations after every major source-data or prompt change.',
    ],
    faq: [
      {
        q: 'Do I need a large model for a useful RAG app?',
        a: 'Not initially. Better ingestion, chunking, and retrieval often deliver larger improvements than upgrading the generator.',
      },
      {
        q: 'Is reranking optional?',
        a: 'Yes, but it is often one of the highest-value additions for improving retrieval precision in small production systems.',
      },
      {
        q: 'What should I monitor first in production?',
        a: 'Start with unsupported answer rate, retrieval miss rate, latency, and how often users need to reformulate their question.',
      },
    ],
    whatYouWillLearn: [
      'How to build a small RAG app without overcomplicating the first version.',
      'Why ingestion and retrieval quality determine most of the outcome.',
      'Which trust features make a RAG app feel reliable to users.',
      'What metrics to log before scaling traffic.',
    ],
    sources: [
      { label: 'InnoAI guide: RAG vs Fine-Tuning', href: '/guides/rag-vs-fine-tuning' },
      { label: 'InnoAI guide: Prompt Patterns That Work', href: '/guides/prompt-patterns-that-work' },
      { label: 'InnoAI Recommender', href: '/recommender' },
    ],
    related: ['rag-vs-fine-tuning', 'prompt-patterns-that-work'],
  },
  {
    slug: 'prompt-patterns-that-work',
    title: 'Prompt Engineering Patterns That Actually Work',
    description: 'Reusable prompt structures for reliability, maintainability, and easier testing in real product workflows.',
    category: 'Prompting',
    readTime: '8 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: [
      'A simple role-task-constraints-format structure is still the strongest default.',
      'Clear output schemas reduce ambiguity more than extra stylistic instructions.',
      'Prompt changes should be versioned, reviewed, and regression tested like code.',
      'Shorter, sharper prompts often outperform long instruction piles.',
    ],
    sections: [
      {
        heading: 'Use a stable prompt structure your team can reuse',
        content:
          'Role, task, constraints, and output format is a reliable baseline that improves consistency across prompt variants. The real value is not only quality but maintainability: once your team uses a shared structure, debugging prompt failures becomes much easier. Consistent prompts also make model-to-model evaluations fairer.',
      },
      {
        heading: 'Encode success criteria explicitly instead of hoping the model infers them',
        content:
          'If output must follow JSON, section rules, or citation requirements, define that explicitly and include concise examples. Hidden expectations are one of the biggest causes of prompt failure in production. A prompt should make success visible enough that another teammate can read it and understand what “good output” means.',
      },
      {
        heading: 'Version and test prompt updates as operational changes',
        content:
          'Prompt changes can regress behavior just like code changes do. Track revisions in source control, annotate what changed, and run regression tests before rollout. This is especially important when prompts are tied to support workflows, agent actions, or structured outputs that downstream systems depend on.',
      },
    ],
    checklist: [
      'Adopt a shared prompt structure across the team.',
      'Define strict output schema and success criteria.',
      'Store prompt versions in source control.',
      'Run regression tests before shipping prompt changes.',
      'Review prompts regularly for redundancy and conflicting instructions.',
    ],
    faq: [
      {
        q: 'Should prompts be very long?',
        a: 'Only as long as needed. Extra instructions often add ambiguity or conflict unless every line has a clear purpose.',
      },
      {
        q: 'When should I use few-shot prompting?',
        a: 'Use it when strict format, style, or task behavior is hard to achieve with direct instructions alone.',
      },
      {
        q: 'What is the most common prompt mistake?',
        a: 'Mixing goals, constraints, and style preferences into one long block without clearly prioritizing what the model must do first.',
      },
    ],
    whatYouWillLearn: [
      'How to build prompt templates that are easier to debug and maintain.',
      'Why output schemas and success criteria matter so much in production.',
      'How to treat prompts as versioned operational assets.',
      'When few-shot examples are worth the extra tokens.',
    ],
    sources: [
      { label: 'InnoAI guide: Deploy a Small RAG App', href: '/guides/deploy-small-rag-app' },
      { label: 'InnoAI guide: Llama vs Qwen vs Gemma for Coding', href: '/guides/llama-vs-qwen-vs-gemma-coding' },
      { label: 'InnoAI guide: RAG vs Fine-Tuning', href: '/guides/rag-vs-fine-tuning' },
    ],
    related: ['deploy-small-rag-app', 'llama-vs-qwen-vs-gemma-coding'],
  },
  {
    slug: 'model-selection-mistakes',
    title: 'Selection Pitfalls: 12 Costly AI Coding Model Mistakes and How to Avoid Them',
    description: 'Avoid expensive model-selection mistakes before your team commits time, budget, and engineering effort.',
    category: 'Operations',
    readTime: '14 min read',
    lastUpdated: '2026-04-15',
    keyTakeaways: [
      'Start with use case, latency, budget, and privacy constraints before comparing models.',
      'Treat benchmark scores as directional signals, not deployment truth.',
      'Always evaluate on your own codebase with real tasks before committing.',
      'Account for total cost of ownership, including migration and maintenance.',
      'Involve multiple team members in evaluation to avoid biased choices.',
    ],
    sections: [
      {
        heading: '1. Introduction / Why This Page Exists',
        content:
          'Developers and teams lose weeks of engineering time and thousands of dollars by choosing the wrong AI coding model. The problem is not lack of information; it is a decision process full of hidden traps. This page exists to help you avoid the most common and costly mistakes before you commit to a model in production.',
      },
      {
        heading: '2. Who This Page Is For',
        content:
          'This guide is for individual developers selecting a model for side projects, engineering leads evaluating options for teams, CTOs and technical decision-makers planning AI budgets, and startup founders building products on top of AI coding models. If you are making a model decision that affects quality, speed, or cost, this page is written for you.',
      },
      {
        heading: '3. Pitfall 1 — Choosing by Hype and Social Media Buzz',
        content:
          'Hype is the most common selection mistake. New model launches create viral posts claiming dramatic wins, but these claims are often based on cherry-picked scenarios. Social posts rarely reflect real, messy software engineering tasks. Hype cycles move faster than actual reliability improvements. A safer pattern is to wait one week after major launches so independent evaluations and real developer feedback can surface practical strengths and regressions.',
      },
      {
        heading: '4. Pitfall 2 — Trusting Benchmark Scores Blindly',
        content:
          'Benchmarks are useful but can mislead if read without context. Data contamination can inflate results when training data overlaps with test sets. Benchmark saturation reduces differentiation when many top models score similarly on legacy tests like HumanEval. Narrow benchmark scope also matters: strong Python algorithm scores do not guarantee strong performance on your TypeScript React or enterprise Java stack. Prefer refreshed benchmark sets like LiveCodeBench and always validate with your own workloads.',
      },
      {
        heading: '5. Pitfall 3 — Not Testing on Your Own Codebase',
        content:
          'Benchmark tasks are cleaner than real production code. Real repositories include internal APIs, naming conventions, domain-specific rules, and historical complexity. A model that looks strong in public benchmarks may still fail badly in your environment. Build a small internal evaluation set with 10 to 20 real tasks, including debugging an actual repo bug, extending an existing module, and generating tests for a real function your team maintains.',
      },
      {
        heading: '6. Pitfall 4 — Ignoring Latency Requirements',
        content:
          'Model quality and price are not enough; speed requirements differ by use case. IDE autocomplete often needs sub-500ms responsiveness to feel usable, while overnight batch code review can tolerate slower responses. Distinguish time to first token from total response time. Some high-quality models are slower, and selecting them for latency-sensitive products can damage user experience even if output quality is high.',
      },
      {
        heading: '7. Pitfall 5 — Confusing Context Window Size with Context Quality',
        content:
          'A large advertised context window does not guarantee reliable long-context reasoning. Many models show lost-in-the-middle behavior, where details in the middle of long prompts are underused compared to beginning and end segments. A 200K-window model may underperform a smaller-window model if retrieval quality is weaker. Evaluate context utilization quality, not only token count.',
      },
      {
        heading: '8. Pitfall 6 — Overlooking the Total Cost of Ownership',
        content:
          'Token price is only one part of cost. Real TCO includes infrastructure (GPUs, servers, cloud), integration engineering time, ongoing maintenance for model/API changes, and switching costs when migrating models. Switching costs are often underestimated and can include prompt rewrites, retraining team workflows, and revalidating output quality across multiple features.',
      },
      {
        heading: '9. Pitfall 7 — Picking a Model Before Defining Your Use Case',
        content:
          'Selection should start with the problem, not the model. Autocomplete, deep code review, test generation, and repository-level analysis require different tradeoffs in latency, quality, context, and cost. Write down your primary use case, acceptable latency, expected monthly token volume, budget ceiling, and privacy requirements before evaluating model options.',
      },
      {
        heading: '10. Pitfall 8 — Ignoring Privacy and Data Security',
        content:
          'Sending source code to third-party APIs introduces governance risk. Teams should verify retention terms, logging policy, training usage policy, enterprise zero-retention options, and compliance alignment with frameworks relevant to their industry (for example SOC 2, GDPR, HIPAA where applicable). For proprietary or regulated codebases, self-hosted open models may be mandatory regardless of benchmark rank.',
      },
      {
        heading: '11. Pitfall 9 — Assuming the Newest Model Is Always Best',
        content:
          'New releases can regress specific tasks and break stable prompt workflows. A newer model can produce different format, tone, and tool-calling behavior that disrupts integrations. Treat every upgrade as a migration project: run regression tests, compare against current production baselines, and rollout gradually instead of switching all traffic at once.',
      },
      {
        heading: '12. Pitfall 10 — Choosing Open Source Without Accounting for Infrastructure',
        content:
          'Open models reduce token fees and improve control, but infrastructure realities are substantial. Large models can require multiple high-memory GPUs, tuned inference servers, and concurrency planning. Quantization reduces hardware load but can change quality. Before adopting open models, estimate hardware requirements, serving architecture, scaling approach, and monthly cloud GPU cost relative to managed APIs.',
      },
      {
        heading: '13. Pitfall 11 — Neglecting Prompt Engineering Differences Between Models',
        content:
          'Models respond differently to prompt structure. Some follow detailed instructions best, others improve significantly with examples, and some open models require stricter formatting for reliable code output. Fair evaluation requires adapting prompts per model rather than using one generic prompt and declaring a winner too early.',
      },
      {
        heading: '14. Pitfall 12 — Making the Decision Alone',
        content:
          'Single-person evaluation creates bias. The engineer selecting the model may not represent the whole team’s workflows. Involve developers with different seniority levels and task types, collect structured feedback, and compare results across debugging, feature work, tests, and refactoring. Team-wide fit matters more than one evaluator’s preference.',
      },
      {
        heading: '15. The Pre-Selection Checklist',
        content:
          'Before committing: define primary use case; set latency requirement; estimate monthly token volume; test at least three models on ten real internal tasks; review privacy terms and retention policy; account for infrastructure and integration costs; include multiple team members in evaluation; and document rollback/fallback strategy.',
      },
      {
        heading: '16. How to Recover If You Chose the Wrong Model',
        content:
          'If you are already locked into a weak model choice, recover in phases: audit current usage and key prompts; run parallel evaluation of alternatives on real workloads; shift traffic incrementally rather than all at once; and monitor for quality regressions, latency drift, and integration breakages during migration.',
      },
      {
        heading: '17. Frequently Asked Questions',
        content:
          'Common questions include: how to choose the right AI coding model for a team, whether Claude or GPT variants are better for coding, what the biggest selection mistake is, whether switching models later is safe, and how to evaluate models using your own codebase. The short answer: define constraints first, evaluate on your own tasks, and treat model choice as an ongoing operational decision.',
      },
      {
        heading: '18. Continue to Related Decision Pages',
        content:
          'Next steps: review Coding Model Analysis for side-by-side benchmark and capability comparison, then use the Budget Framework guide to map model choices to GPU and cost constraints. These two pages help convert pitfalls into confident, practical selection decisions.',
      },
    ],
    checklist: [
      'Have you defined the primary use case clearly?',
      'Have you set a target for acceptable latency (time to first token and total response time)?',
      'Have you estimated monthly token volume and budget ceiling?',
      'Have you tested at least 3 models on at least 10 tasks from your own codebase?',
      'Have you checked data retention, logging, and compliance terms?',
      'Have you included infrastructure and integration costs in TCO?',
      'Have you involved more than one team member in evaluation?',
      'Do you have a rollback and fallback plan?',
    ],
    faq: [
      {
        q: 'How do I choose the right AI coding model for my team?',
        a: 'Start with use case, latency target, privacy constraints, and budget, then run a structured evaluation on real internal tasks.',
      },
      {
        q: 'Is Claude better than GPT-4 for coding?',
        a: 'It depends on workflow. Compare both on your own repo tasks, not only public benchmarks.',
      },
      {
        q: 'What is the biggest mistake developers make when choosing an AI tool?',
        a: 'Choosing based on hype or leaderboard rank without internal workload testing.',
      },
      {
        q: 'Can I switch models later without losing my work?',
        a: 'Yes, but treat it as a migration: validate prompts, test regressions, and shift traffic gradually.',
      },
      {
        q: 'How do I evaluate an AI model on my own code?',
        a: 'Use a fixed task set from your repository, score correctness and latency, and compare costs under expected volume.',
      },
    ],
    endLinks: [
      {
        href: '/coding-model-analysis',
        title: 'Go to Coding Model Analysis',
        body: 'Compare benchmarks, context limits, pricing, and practical coding strengths side by side.',
      },
      {
        href: '/guides/choose-ai-model-by-gpu-budget',
        title: 'Go to Budget Framework',
        body: 'Map model options to GPU limits, monthly costs, and deployment constraints.',
      },
    ],
    related: ['choose-ai-model-by-gpu-budget', 'llama-vs-qwen-vs-gemma-coding', 'fastest-models-low-latency-apps'],
    whatYouWillLearn: [
      'How to avoid 12 high-cost model selection mistakes.',
      'How to build a realistic internal evaluation process.',
      'How to incorporate latency, privacy, and TCO into model decisions.',
      'How to recover safely if your current model choice is failing.',
    ],
    sources: [
      { label: 'SWE-bench Verified documentation', href: 'https://www.swebench.com/verified.html' },
      { label: 'EvalPlus Leaderboard (HumanEval / MBPP)', href: 'https://evalplus.github.io/leaderboard.html' },
      { label: 'LiveCodeBench Leaderboard', href: 'https://livecodebench.github.io/leaderboard.html' },
      { label: 'Coding Model Analysis page', href: '/coding-model-analysis' },
      { label: 'Budget Framework guide', href: '/guides/choose-ai-model-by-gpu-budget' },
    ],
  },
];

guides.push(...additionalGuides);

const DEFAULT_SOURCES = [
  { label: 'Model metadata and tags from Hugging Face model pages', href: 'https://huggingface.co/models' },
  { label: 'InnoAI internal comparison and deployment heuristics', href: '/compare' },
  { label: 'InnoAI GPU sizing and VRAM estimation tools', href: '/gpu/tools/vram-calculator' },
];

const parseReadMinutes = (readTime = '') => {
  const match = String(readTime).match(/(\d+)/);
  return match ? Number(match[1]) : 8;
};

const inferDifficulty = (readTime = '') => {
  const minutes = parseReadMinutes(readTime);
  if (minutes <= 7) return 'Beginner';
  if (minutes <= 9) return 'Intermediate';
  return 'Advanced';
};

const GUIDE_SUPPLEMENTS = {
  'choose-ai-model-by-gpu-budget': {
    sections: [
      {
        heading: '14. Budget-to-model routing examples',
        content:
          'A practical budget plan should route requests by difficulty instead of sending every request to the same model. Example: use a cheap fast model for autocomplete, summarization, and simple extraction; use a stronger model for architecture review, multi-file refactors, security-sensitive changes, or final answer generation. This keeps daily cost predictable while preserving quality where it matters.',
      },
      {
        heading: '15. Break-even signals for self-hosting',
        content:
          'Self-hosting starts to make sense when API spend is predictable, usage is high enough to keep GPUs utilized, privacy requirements are strict, or latency must be controlled inside your own region. It usually does not make sense when usage is spiky, the team lacks infrastructure ownership, or model quality changes frequently enough that managed APIs save engineering time.',
      },
      {
        heading: '16. Practical cost-control playbook',
        content:
          'Add per-feature token logging, cache repeated context, compress long documents before sending them to the model, cap maximum output length, route easy tasks to cheaper models, and set hard spend alerts. Review token usage weekly during early rollout; most cost leaks come from hidden long prompts, unbounded retries, and features that send entire files when a small excerpt would work.',
      },
      {
        heading: '17. GPU buying decision checklist',
        content:
          'Before buying or renting GPUs, confirm model size, precision, context length, expected batch size, concurrency, framework overhead, and whether you need training or inference only. A 7B model that fits for one-user local testing can fail under production concurrency because KV cache and batch size grow memory demand quickly.',
      },
    ],
    checklist: [
      'Have you separated cheap, medium, and premium request types?',
      'Have you estimated spend for peak days, not only average days?',
      'Have you tested whether caching or shorter prompts reduce cost without quality loss?',
      'Have you compared API cost against rented GPU cost at expected utilization?',
      'Have you defined when to downgrade, retry, or fail gracefully during budget pressure?',
    ],
    faq: [
      {
        q: 'What is the safest budget strategy for a new AI product?',
        a: 'Start with managed APIs, add usage logging from day one, then introduce cheaper models or self-hosting only after real traffic shows stable usage patterns.',
      },
      {
        q: 'When should I avoid self-hosting even if it looks cheaper?',
        a: 'Avoid it when usage is unpredictable, your team cannot maintain inference infrastructure, or model quality changes faster than your deployment process can handle.',
      },
    ],
  },
  'rag-vs-fine-tuning': {
    sections: [
      {
        heading: '16. Evidence you should collect before deciding',
        content:
          'Before choosing RAG or fine-tuning, collect real user questions, failed answers, retrieval traces, source documents, and expected outputs. Label each failure type. Missing source facts point toward RAG. Repeated format or tone failures point toward fine-tuning. Weak reasoning often means the base model or task decomposition needs improvement first.',
      },
      {
        heading: '17. RAG production checklist',
        content:
          'A production RAG system needs document ingestion, chunking strategy, metadata, embeddings, vector search, optional reranking, citation formatting, low-confidence fallback, and monitoring. Do not skip the monitoring layer: unsupported-answer rate and retrieval miss rate reveal whether the system is actually grounded.',
      },
      {
        heading: '18. Fine-tuning production checklist',
        content:
          'A production fine-tuning workflow needs clean examples, consistent labels, validation data, baseline prompts, regression tests, rollback plans, and model-version tracking. Fine-tuning without evaluation creates a model that feels better in demos but may fail silently in production.',
      },
      {
        heading: '19. Hybrid architecture example',
        content:
          'A support assistant can use RAG to retrieve current policy pages and a fine-tuned model to produce responses in the company support style. The retrieval layer supplies facts and citations. The tuned behavior layer controls tone, escalation language, JSON fields, and compliance wording.',
      },
    ],
    checklist: [
      'Have you built a labeled failure log before choosing architecture?',
      'Have you measured retrieval hit quality separately from answer quality?',
      'Have you compared fine-tuning against a strong prompt baseline?',
      'Have you planned separate rollback paths for retrieval changes and model changes?',
    ],
    faq: [
      {
        q: 'Can I use both RAG and fine-tuning together?',
        a: 'Yes. Use RAG for current source knowledge and fine-tuning for repeated behavior patterns such as tone, schema, routing, or classification.',
      },
      {
        q: 'What should I build first if I am unsure?',
        a: 'Start with prompting plus a small RAG prototype. Logs from that prototype will show whether fine-tuning is actually needed.',
      },
    ],
  },
  'prompt-patterns-that-work': {
    sections: [
      {
        heading: '4. The production prompt template',
        content:
          'A reliable production prompt usually contains: role, task, input context, rules, output format, examples, refusal/fallback behavior, and quality checks. Keep each block short and named. This makes prompts easier to diff, review, and test when behavior changes.',
      },
      {
        heading: '5. Retrieval-aware prompt pattern',
        content:
          'For RAG apps, explicitly tell the model to answer only from retrieved sources, cite the source title or URL, and say when the provided context is insufficient. This reduces confident unsupported answers and gives users a better trust signal.',
      },
      {
        heading: '6. Structured-output prompt pattern',
        content:
          'When the output feeds another system, provide an exact JSON schema, field descriptions, allowed enum values, and one valid example. Tell the model not to add prose outside the JSON. Then validate the output server-side instead of trusting the model blindly.',
      },
      {
        heading: '7. Prompt regression testing',
        content:
          'Maintain a small prompt test suite with examples that previously failed. Run it before changing prompts, switching models, or adding new retrieval context. Track correctness, format validity, refusal behavior, and latency.',
      },
    ],
    checklist: [
      'Split prompts into named blocks: role, task, context, rules, output, examples.',
      'Add fallback instructions for missing or low-confidence context.',
      'Validate structured outputs with code after generation.',
      'Keep a regression set of prompts that must not break.',
    ],
    faq: [
      {
        q: 'How many examples should I include in a prompt?',
        a: 'Use the smallest number that changes behavior reliably. One or two high-quality examples often beat five noisy examples.',
      },
      {
        q: 'Should prompts include chain-of-thought instructions?',
        a: 'For most products, ask for concise reasoning or validation notes instead of hidden chain-of-thought. Keep outputs useful and safe for users.',
      },
    ],
  },
  'deploy-small-rag-app': {
    sections: [
      {
        heading: 'Step 1: Define the narrow first use case',
        content:
          'A small RAG app should start with one clear user problem, such as answering product docs, internal onboarding questions, or support-policy lookups. Avoid trying to ingest every company document on day one. A narrow source set makes chunking, evaluation, and trust easier.',
      },
      {
        heading: 'Step 2: Build the ingestion pipeline',
        content:
          'Normalize files, remove duplicate boilerplate, split documents into chunks, attach metadata such as title and URL, and store original source references. Good metadata is what lets the app cite sources and filter irrelevant results later.',
      },
      {
        heading: 'Step 3: Add retrieval and reranking',
        content:
          'Start with embeddings and vector search, then evaluate the top results against real questions. If relevant passages appear below irrelevant ones, add reranking or metadata filters before changing the generator model.',
      },
      {
        heading: 'Step 4: Generate answers with citations',
        content:
          'The answer prompt should include retrieved chunks, source labels, user question, answer format, and fallback behavior. If the context does not contain the answer, the app should say that clearly and suggest the next action.',
      },
      {
        heading: 'Step 5: Deploy, monitor, and improve',
        content:
          'Log question, retrieved sources, answer, latency, and user feedback. Monitor unsupported answers, retrieval misses, and slow requests. Improve ingestion and retrieval before scaling to more documents or adding fine-tuning.',
      },
    ],
    checklist: [
      'Start with one document set and one user workflow.',
      'Keep source URLs or document IDs attached to every chunk.',
      'Evaluate retrieval before evaluating answer style.',
      'Show citations or source labels in the UI.',
      'Log low-confidence answers and user corrections.',
    ],
    faq: [
      {
        q: 'What is the smallest useful RAG stack?',
        a: 'A document parser, chunker, embedding model, vector store, retrieval function, answer prompt, and logging are enough for a first useful version.',
      },
      {
        q: 'Should I fine-tune my RAG model immediately?',
        a: 'Usually no. First fix retrieval quality, chunking, metadata, and prompting. Fine-tune later only if behavior is repeatedly wrong.',
      },
    ],
  },
};

const mergeGuideSupplement = (guide) => {
  const supplement = GUIDE_SUPPLEMENTS[guide.slug];
  if (!supplement) return guide;

  return {
    ...guide,
    sections: [...(guide.sections || []), ...(supplement.sections || [])],
    checklist: [...(guide.checklist || []), ...(supplement.checklist || [])],
    faq: [...(guide.faq || []), ...(supplement.faq || [])],
  };
};

const countWords = (value = '') =>
  String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const countGuideWords = (guide) => {
  const fields = [
    guide.description,
    ...(guide.keyTakeaways || []),
    ...(guide.checklist || []),
    ...(guide.sections || []).flatMap((section) => [section.heading, section.content]),
    ...(guide.faq || []).flatMap((entry) => [entry.q, entry.a]),
  ];
  return fields.reduce((sum, item) => sum + countWords(item), 0);
};

const depthExpansionFor = (guide) => ({
  sections: [
    {
      heading: `Decision context for ${guide.title}`,
      content:
        `${guide.title} should be read as a deployment decision guide rather than a definition page. The practical question is how this topic changes model choice, hardware sizing, runtime selection, evaluation design, and operating cost. For ${guide.category.toLowerCase()} work, teams should write down the workload, acceptable latency, context length, privacy limits, and budget before adopting a technique. That framing prevents a common mistake: choosing a popular model or runtime feature before proving that it solves the actual bottleneck.`,
    },
    {
      heading: 'Implementation workflow',
      content:
        'A reliable workflow starts with a baseline. Pick one representative model, one hardware target, one runtime, and a small set of real prompts. Measure quality, time to first token, tokens per second, p95 latency, memory use, and failure patterns. Then change only one variable at a time. If the page topic improves memory but hurts output quality, record both outcomes. If it improves average latency but worsens p95 behavior, treat that as a product risk rather than a benchmark win.',
    },
    {
      heading: 'Common failure modes',
      content:
        'Most production failures come from hidden assumptions. Teams test short prompts and later deploy long documents. They measure one user and later serve many concurrent sessions. They accept a quantized model without rerunning structured-output tests. They compare model families without checking license or tokenizer behavior. They assume a GPU that fits weights will also fit KV cache and runtime overhead. Use this guide to surface those assumptions before they become outages, surprise bills, or poor user experiences.',
    },
    {
      heading: 'Measurement checklist',
      content:
        'Before publishing an internal recommendation, record the exact model repository, revision, precision, runtime version, GPU, driver, context length, batch settings, and prompt set. Keep output samples from the baseline and the optimized run. Include at least one easy case, one average case, one long-context case, one malformed input, and one high-value production scenario. This makes the decision reproducible and helps future reviewers understand whether a change is still valid after model or runtime updates. Add notes about cost and operational complexity so a technically faster option does not hide a maintenance burden or weaken reliability.',
    },
    {
      heading: 'How this connects to InnoAI tools',
      content:
        'Use the VRAM calculator before renting or buying hardware, the GPU picker when memory and budget are both constrained, the comparison workspace when multiple model families look plausible, and the recommender when the use case is still unclear. Editorial guides provide the reasoning layer around those tools. The strongest workflow combines both: read the guide, estimate memory, shortlist models, compare alternatives, then validate the top choice against prompts from the real application.',
    },
  ],
  checklist: [
    `Have you connected ${guide.title} to a measurable deployment bottleneck?`,
    'Have you kept a baseline result before applying this technique?',
    'Have you tested realistic prompt lengths and concurrency?',
    'Have you documented model revision, runtime version, precision, and hardware?',
    'Have you linked the decision to a fallback plan if quality or latency regresses?',
  ],
  faq: [
    {
      q: `How should I use ${guide.title} in a production decision?`,
      a: 'Use it as one input in a measured deployment workflow. Confirm the impact on quality, latency, memory, cost, and reliability before treating it as a standard.',
    },
    {
      q: 'What is the most common mistake?',
      a: 'The most common mistake is testing a small demo and assuming the result holds for long prompts, higher concurrency, different hardware, or stricter output requirements.',
    },
  ],
});

// Genuine, topic-specific depth per guide. Guides that reach real length through
// their own material must never fall through to depthExpansionFor(), whose sections
// are identical across pages and read as duplicate/templated content. Add a slug
// here to give that page bespoke depth instead of the generic boilerplate.
const TOPIC_DEPTH = {
  'what-is-vllm': {
    sections: [
      {
        heading: '9. Continuous batching is the other half of the story',
        content:
          'PagedAttention gets the headlines, but continuous (in-flight) batching is what keeps the GPU busy under real traffic. Naive servers wait for a fixed batch to fill and finish together, so one slow 2,000-token generation stalls seven short replies. vLLM instead admits and evicts requests at every decoding step: as soon as one sequence emits its stop token, its slot is freed and a queued request takes its place. That is why throughput scales with bursty, mixed-length traffic rather than collapsing to the slowest request in each batch.',
      },
      {
        heading: '10. The configuration knobs that decide fit',
        content:
          'Four settings govern most vLLM deployments. gpu-memory-utilization caps how much VRAM the KV cache pool may claim (leave headroom or you will OOM under load). max-model-len reserves cache for the worst-case context; setting it to the model maximum when you only send 4K prompts silently halves your concurrency. max-num-seqs bounds how many sequences run at once, and tensor-parallel-size shards the model across GPUs. Tune max-model-len to real prompt lengths first — it is the cheapest way to raise the number of concurrent users a card can hold.',
      },
    ],
    checklist: [
      'Confirm the model architecture is on the vLLM supported list before committing.',
      'Set gpu-memory-utilization below 1.0 so a traffic spike does not OOM the server.',
      'Cap max-model-len to the context you actually send, not the model maximum.',
      'Load-test concurrency (max-num-seqs) at p95 prompt length, not a single request.',
      'Pin the vLLM version; kernel and quantization support shifts between releases.',
    ],
    faq: [
      {
        q: 'Does vLLM run quantized models?',
        a: 'Yes — AWQ, GPTQ, FP8, and (in recent versions) some GGUF and INT8 KV-cache paths are supported, though exact coverage varies by release and GPU. Validate answer quality under the specific quantization before shipping.',
      },
    ],
  },
  'what-is-quantization': {
    sections: [
      {
        heading: '9. Weight-only versus full quantization',
        content:
          'Not all "4-bit" or "8-bit" labels mean the same thing. Weight-only methods such as GPTQ and AWQ compress the stored weights but dequantize to FP16 for the actual matrix multiply, so they mainly save memory and bandwidth. Full schemes such as W8A8 or FP8 also quantize the activations, which can unlock faster tensor-core math but are more sensitive to outliers. Knowing which one you are using explains why two "INT8" models can differ in both speed and quality on the same GPU.',
      },
      {
        heading: '10. Calibration and outliers decide the quality hit',
        content:
          'Post-training quantization estimates the range of each weight or activation from a small calibration set. A handful of outlier channels carry disproportionate magnitude, and squashing them is where accuracy is lost. AWQ works by identifying and protecting the most salient weight channels; GPTQ minimizes layer-wise reconstruction error greedily. The practical consequence: a poorly chosen calibration set — wrong domain, too few samples — produces a model that benchmarks fine but fails on your actual prompts. Prefer published quants calibrated on general data, and always re-test on your workload.',
      },
    ],
    checklist: [
      'Note whether the method is weight-only (GPTQ/AWQ) or full (W8A8/FP8) — they behave differently.',
      'Keep an FP16/BF16 baseline run for every quality comparison.',
      'Re-test structured output and tool calling; JSON adherence degrades first.',
      'Check the calibration domain of any downloaded quant matches your use case.',
      'Record the exact quant repo, method, and revision as a deployment dependency.',
    ],
    faq: [
      {
        q: 'What is the difference between GPTQ and AWQ?',
        a: 'Both are weight-only post-training methods. GPTQ minimizes layer-wise reconstruction error; AWQ scales and protects the most salient weight channels using activation statistics. AWQ often preserves quality slightly better at 4-bit, while GPTQ has broader tooling and prebuilt models.',
      },
    ],
  },
  'how-gguf-works': {
    sections: [
      {
        heading: '9. Anatomy of a GGUF file',
        content:
          'A GGUF file is a single self-describing container: it stores the quantized tensors alongside metadata for the architecture, tokenizer, RoPE settings, and often the chat template. That is why a runtime can load one file and run the model without the scattered config.json, tokenizer.json, and shard files a Transformers checkpoint needs. The metadata block is also why newer llama.cpp builds can refuse or mis-run an older GGUF: if the architecture keys predate a format change, the file must be re-converted.',
      },
      {
        heading: '10. Reading the K-quant suffix',
        content:
          'GGUF filenames encode the quantization scheme, and the modern "K-quant" family (Q4_K_M, Q5_K_M, Q6_K, Q8_0) is what most users should pick. K-quants assign mixed per-block precision — attention and feed-forward tensors that matter most keep more bits — which is why Q4_K_M beats the older flat Q4_0 at the same size. The _M and _S suffixes mean medium and small variants of that trade. Importance-matrix (imatrix) quants push this further by calibrating which weights to protect. For most hardware, Q4_K_M or Q5_K_M is the quality-per-gigabyte sweet spot.',
      },
    ],
    checklist: [
      'Match the GGUF quant level (Q4_K_M / Q5_K_M / Q6_K) to your VRAM, not the smallest file.',
      'Update llama.cpp before blaming a model — GGUF format keys change over time.',
      'Prefer imatrix or K-quants over legacy Q4_0/Q4_1 at the same size.',
      'Set -ngl (GPU layers) deliberately and measure tokens/sec after each change.',
      'Watch KV-cache growth at long context even when the weight file is small.',
    ],
    faq: [
      {
        q: 'What does the _K_M suffix mean in a GGUF filename?',
        a: 'K marks a K-quant (mixed per-block precision that protects the most important tensors), and M is the medium-size variant (S is smaller, larger blocks keep more bits). Q4_K_M is the common balanced default.',
      },
    ],
  },
  'tensor-parallelism': {
    sections: [
      {
        heading: '9. How the split actually works',
        content:
          'Tensor parallelism partitions the big matmuls inside each layer. In the Megatron pattern, attention projections and the first feed-forward matrix are split column-wise, the second feed-forward matrix row-wise, and an all-reduce combines partial results after each block. Every token therefore triggers cross-GPU communication twice per layer. This is why tensor parallelism is latency-sensitive and wants NVLink or NVSwitch: on PCIe-only links the all-reduce traffic can erase the compute savings, especially at small batch sizes where there is little work to hide the communication behind.',
      },
      {
        heading: '10. Tensor vs pipeline vs data parallel',
        content:
          'These three axes solve different problems. Tensor parallelism splits within a layer to cut per-GPU memory and latency, but needs fast interconnect. Pipeline parallelism assigns whole layer ranges to different GPUs; it tolerates slower links but introduces pipeline "bubbles" that hurt latency at low batch. Data parallelism replicates the full model to raise throughput and does nothing for a model that does not fit. Large clusters combine them — tensor parallel inside a node, pipeline across nodes — but for a single 8-GPU box, plain tensor parallelism is usually the simplest path to serving a 70B model.',
      },
    ],
    checklist: [
      'Confirm the interconnect (NVLink vs PCIe) before choosing a tensor-parallel size.',
      'Set tensor-parallel-size to a value that divides the attention head count.',
      'Compare against a 4-bit single-GPU run before committing to multi-GPU complexity.',
      'Measure p95 latency, not just aggregate throughput, as you add GPUs.',
      'Pin runtime and driver versions; sharded paths are the most version-sensitive.',
    ],
    faq: [
      {
        q: 'Why must the tensor-parallel size divide the number of attention heads?',
        a: 'Each GPU handles a whole-number slice of the attention heads. If the head count is not divisible by the tensor-parallel size, the heads cannot be split evenly and the runtime will reject the configuration.',
      },
    ],
  },
  'kv-cache-optimization': {
    sections: [
      {
        heading: '9. Sizing the cache with the actual formula',
        content:
          'KV cache memory is predictable: roughly 2 × layers × kv_heads × head_dim × sequence_length × batch × bytes_per_element. The factor of two is keys plus values. Work a real example: a 32-layer model with 8 key-value heads, 128 head dim, at 32K tokens and FP16 costs about 2 × 32 × 8 × 128 × 32768 × 2 bytes ≈ 4.3 GB per sequence — often larger than a quantized copy of the weights. Plugging your own numbers into this formula, rather than trusting the weight size alone, is what prevents production OOMs.',
      },
      {
        heading: '10. The levers that actually cut cache memory',
        content:
          'Because kv_heads is a direct multiplier, grouped-query and multi-query attention are the biggest structural savings — a model with 8 KV heads instead of 64 uses an eighth of the cache. Beyond architecture, you can quantize the cache itself to FP8 or INT8 (supported in vLLM and TensorRT-LLM), enable sliding-window attention to bound the cache at long context, or reuse prefix cache for shared system prompts. Each lever trades something: FP8 cache can nick quality, sliding windows drop distant tokens. Pick the one that matches whether your constraint is context length, concurrency, or raw capacity.',
      },
    ],
    checklist: [
      'Compute cache size with the 2·layers·kv_heads·head_dim·seq·batch·bytes formula.',
      'Prefer GQA/MQA models when long context or high concurrency is required.',
      'Evaluate FP8/INT8 KV cache against quality before enabling it in production.',
      'Cap or bucket context length so worst-case prompts cannot exhaust VRAM.',
      'Reuse prefix cache for shared system prompts to reclaim concurrency.',
    ],
    faq: [
      {
        q: 'Does a bigger context window automatically use more memory?',
        a: 'Only when you fill it. The KV cache grows with the tokens actually present, so a 128K-capable model at a 2K prompt uses little cache — but the runtime may pre-reserve for max-model-len, so cap that setting to your real needs.',
      },
    ],
  },
  flashattention: {
    sections: [
      {
        heading: '9. Why attention is memory-bound',
        content:
          'A standard attention implementation forms the full N×N score matrix in high-bandwidth memory, softmaxes it, then multiplies by values — writing and re-reading a matrix that grows quadratically with sequence length. On modern GPUs the math is cheap relative to that memory traffic, so attention is bandwidth-bound, not compute-bound. FlashAttention keeps tiles of queries, keys, and values in fast on-chip SRAM, computes the softmax incrementally (the "online softmax" trick), and never materializes the full score matrix. The result is mathematically exact attention with memory that scales linearly instead of quadratically.',
      },
      {
        heading: '10. Versions and support gotchas',
        content:
          'FlashAttention-2 improved GPU occupancy and parallelism; FlashAttention-3 targets Hopper-class hardware and FP8. Support is not universal: head dimensions above certain limits, some sliding-window or ALiBi variants, and older GPUs may not be covered, in which case the framework quietly falls back to a slower kernel. That silent fallback is the classic trap — your latency assumptions were built on FlashAttention but the run never used it. Check startup logs or profiler output to confirm the fast kernel is actually active for your model and precision. On multi-GPU serving, verify it again after tensor-parallel sharding, because some fused kernels only cover specific head-dimension and dtype combinations and quietly revert on the rest.',
      },
    ],
    checklist: [
      'Confirm your GPU generation and head dimension are supported by the FA version.',
      'Check logs/profiler to verify the fast kernel is active, not a silent fallback.',
      'Test at production context length — short prompts hide the benefit.',
      'Hold model, precision, and batch fixed when benchmarking FA on vs off.',
      'Remember weights and KV cache are unchanged; FA only speeds attention.',
    ],
    faq: [
      {
        q: 'Is FlashAttention an approximation?',
        a: 'No. It computes exact attention — the same result as the naive implementation — using tiling and an online softmax to avoid writing the full score matrix to memory. The gain is efficiency, not an accuracy trade.',
      },
    ],
  },
  'pagedattention-internals': {
    sections: [
      {
        heading: '9. Blocks, block tables, and copy-on-write',
        content:
          'PagedAttention stores each sequence’s KV cache in fixed-size blocks (commonly 16 tokens) rather than one contiguous slab. A per-sequence block table maps logical token positions to physical blocks scattered across the pool, exactly like virtual-memory page tables. This indirection enables copy-on-write sharing: when many requests share a system prompt or a beam-search branch, they point at the same physical blocks until one diverges, at which point only the changed block is copied. That sharing is why prefix-heavy workloads see large concurrency gains.',
      },
      {
        heading: '10. The fragmentation math',
        content:
          'Contiguous pre-allocation wastes memory two ways: internal fragmentation (a request reserved for max length but generated few tokens) and external fragmentation (free gaps too small to reuse). PagedAttention nearly eliminates both — external fragmentation drops to zero because any free block fits any sequence, and internal fragmentation is bounded to less than one block per sequence. In vLLM’s own measurements this pushed KV memory utilization from roughly 20–40% to over 90%, which is the concrete reason a paged runtime serves several times more concurrent requests on the same card. The same block-sharing mechanism also makes beam search and parallel sampling cheap: candidate sequences share the prompt’s physical blocks and only diverge where their tokens differ, instead of duplicating the entire cache per candidate.',
      },
    ],
    checklist: [
      'Expect the largest gains on workloads with shared prefixes or many concurrent users.',
      'Enable prefix caching when system prompts or templates repeat across requests.',
      'Log active sequence count and block-pool usage to diagnose cache pressure.',
      'Remember paging improves utilization but cannot exceed physical VRAM.',
      'Treat block size as a tunable; smaller blocks cut waste but add metadata overhead.',
    ],
    faq: [
      {
        q: 'What block size does PagedAttention use?',
        a: 'vLLM defaults to 16 tokens per block, and it is configurable. Smaller blocks reduce internal fragmentation but increase block-table metadata and lookup overhead, so the default is a balance for typical serving.',
      },
    ],
  },
  'cuda-graph-optimization': {
    sections: [
      {
        heading: '9. The capture-and-replay lifecycle',
        content:
          'A CUDA graph is recorded once via stream capture, which traces the full directed graph of kernels and their dependencies for one decode step. On every subsequent step the runtime replays the captured graph instead of re-issuing and re-validating each kernel from the CPU. The launch overhead — normally a few microseconds per kernel, multiplied by dozens of kernels per token — is paid once and amortized across thousands of tokens. That is why the benefit shows up as lower, steadier per-token decode latency rather than higher peak throughput.',
      },
      {
        heading: '10. Why stable shapes matter',
        content:
          'Graph replay assumes the same tensor shapes and memory addresses as capture, so serving stacks bucket requests into a small set of fixed batch sizes and pad to them; a captured graph exists per bucket. Prefill, where prompt lengths vary widely, is harder to graph and often uses piecewise or partial capture instead. The cost is memory: each captured graph reserves its own working set, so capturing many buckets can reduce the concurrency headroom you were trying to protect. Capture a few well-chosen batch sizes rather than every possible shape — a common compromise is to graph only the handful of batch sizes your scheduler actually produces under load, then let rare or oversized shapes fall back to normal eager execution without a captured graph.',
      },
    ],
    checklist: [
      'Stabilize decode shapes (fixed batch buckets, padding) before enabling capture.',
      'Benchmark graphs on vs off with identical model, precision, and context.',
      'Watch reserved memory — many captured graphs can shrink concurrency.',
      'Verify the runtime did not silently disable capture for your config.',
      'Apply CUDA graphs last, after model, precision, and batching are settled.',
    ],
    faq: [
      {
        q: 'Do CUDA graphs help prefill or decode more?',
        a: 'Decode. The token-by-token decode loop repeats the same small kernels with stable shapes, which is ideal for graph replay. Prefill has variable prompt lengths and larger kernels, so launch overhead matters less and capture is harder.',
      },
    ],
  },
  'moe-routing': {
    sections: [
      {
        heading: '9. Top-k gating and load balancing',
        content:
          'A mixture-of-experts layer replaces one feed-forward network with many, plus a lightweight router that scores the experts for each token and sends it to the top-k (often top-1 or top-2). The catch is balance: left alone, the router collapses onto a few favorite experts while others go unused, wasting capacity. Training adds an auxiliary load-balancing loss to spread tokens, and inference uses a capacity factor that caps how many tokens each expert accepts — excess tokens are dropped or padded. Understanding this explains why MoE quality can be uneven across domains where routing skews.',
      },
      {
        heading: '10. Expert parallelism and the all-to-all cost',
        content:
          'At serving scale the experts are sharded across GPUs (expert parallelism), so after routing, tokens must be shipped to whichever GPU holds their chosen expert and the results shipped back — two all-to-all communication steps per MoE layer. This makes MoE inference bandwidth-sensitive in a way dense models are not: interconnect, not FLOPs, is frequently the bottleneck. It is also why a model advertising few active parameters can still demand a lot of VRAM and fast links — every expert must be resident even though each token only visits a couple.',
      },
    ],
    checklist: [
      'Size VRAM for all resident experts, not just the active-parameter count.',
      'Prefer fast interconnect; MoE all-to-all traffic is bandwidth-bound.',
      'Evaluate across domains — routing skew makes quality task-dependent.',
      'Confirm your runtime and quantization support the MoE layers cleanly.',
      'Check the config for num_experts and num_experts_per_tok before planning memory.',
    ],
    faq: [
      {
        q: 'What is the capacity factor in a mixture-of-experts model?',
        a: 'It caps how many tokens each expert will process in a batch, as a multiple of the average. Tokens beyond the cap are dropped or padded. Higher capacity reduces dropped tokens but costs memory and compute; it is a balance-versus-efficiency knob.',
      },
    ],
  },
  'quantization-4bit-8bit-fp16': {
    sections: [
      {
        heading: 'Estimate the memory before you pick a precision',
        content:
          'Precision is a memory decision first, so start from the arithmetic. Weight memory is roughly parameters × bytes-per-parameter: 2 bytes at FP16/BF16, 1 byte at INT8, and about 0.5 bytes at 4-bit. A 7B model is therefore near 14 GB in FP16, 7 GB at INT8, and under 4 GB at 4-bit — before you add the KV cache and a gigabyte or so of runtime overhead. Because the KV cache can rival the weights at long context, a precision that fits the weights can still overflow the card once conversations grow. Run the real numbers through the VRAM calculator instead of assuming the weight size is the whole cost.',
      },
      {
        heading: 'Match the quantization method to your stack',
        content:
          'The label "4-bit" hides very different tools. bitsandbytes quantizes on the fly (NF4/INT8), is the easiest path inside Transformers, and underpins QLoRA training. GPTQ and AWQ are calibrated weight-only methods with large libraries of prebuilt repos and are the usual choice for GPU serving through vLLM or TGI. GGUF (llama.cpp) is the format for CPU-first and mixed CPU/GPU offload, with K-quants such as Q4_K_M giving the best quality per gigabyte. FP8 runs natively on Ada and Hopper GPUs and keeps near-FP16 quality while using tensor-core speed. Pick the method your runtime supports well rather than the smallest file.',
      },
      {
        heading: 'Where quality actually breaks',
        content:
          'Quantization damage is not uniform, and it appears in a predictable order. Strict structured output — JSON adherence and tool calling — usually degrades first, then long-context coherence, then multi-step reasoning on code and math. That is why 4-bit is often near-lossless for general chat but risky for agentic or schema-bound workloads. Keep an FP16 or BF16 baseline, re-run your structured-output and tool-calling tests at each precision, and define a rollback trigger so an aggressive quant that saves memory cannot quietly ship worse answers to users.',
      },
      {
        heading: 'A practical precision ladder',
        content:
          'When you are unsure where to begin, use a ladder and stop at the first rung that meets your constraints. Start at BF16 or FP16 for maximum quality when memory allows; step to FP8 on Ada or Hopper hardware for near-identical quality with better throughput; drop to INT8 as a widely safe production midpoint; and move to 4-bit — GPTQ, AWQ, or a GGUF K-quant — only when memory or cost genuinely forces it. Descend one rung at a time and re-run your evaluation suite at each step, because the right stopping point depends on the specific model and task rather than a universal rule. Many toolkits also let you keep sensitive layers — the embeddings, the output head, or attention projections — at higher precision while quantizing the bulk of the weights, which recovers noticeable quality at almost no extra memory cost. Documenting which rung you chose, and why, makes the decision easy to revisit when a newer quantization method or a larger GPU shifts the trade-off later.',
      },
    ],
    checklist: [
      'Compute weights + KV cache + overhead before committing to a precision.',
      'Choose the method by runtime: bitsandbytes, GPTQ/AWQ, GGUF, or FP8.',
      'Prefer prebuilt, well-calibrated quants over ad-hoc one-off conversions.',
      'Re-test JSON output and tool calling at every precision level.',
      'Keep a higher-precision fallback and a defined rollback threshold.',
    ],
    faq: [
      {
        q: 'Does 4-bit always halve quality?',
        a: 'No. For general chat it is often close to lossless, but for code, math, agentic loops, and strict JSON it can regress noticeably. Always measure on your own prompt suite rather than trusting a single benchmark.',
      },
    ],
  },
  'open-vs-closed-models': {
    sections: [
      {
        heading: 'Run the actual cost model, in both directions',
        content:
          'Closed-API cost is tokens × price: it scales linearly with usage and carries no infrastructure work. Self-hosting an open model is mostly a fixed cost — GPU rental or amortization plus engineering and on-call time — that you pay whether or not the GPUs are busy. The break-even point is simple to estimate: divide your monthly GPU-plus-operations cost by the API price per token to get the token volume above which self-hosting is cheaper. Below that volume the API wins, and spiky traffic tilts the decision further toward the API because idle self-hosted GPUs still bill every hour.',
      },
      {
        heading: 'Control, latency, and data residency are the real differentiators',
        content:
          'Beyond price, open models buy you control that closed APIs cannot. You can pin an exact model version so a silent provider update never breaks your prompts, keep inference inside your own region or VPC for residency and latency, and fine-tune the weights themselves. Closed APIs trade that away for frontier quality, zero operations, and fast iteration — but you accept their retention policy, rate limits, and deprecation schedule. Teams handling regulated data or source code often find these governance constraints decide the architecture before any benchmark comparison is relevant.',
      },
      {
        heading: 'Keep an exit ramp from day one',
        content:
          'Whichever side you start on, design so the decision stays reversible. Put a thin provider abstraction in front of the model, log prompts, outputs, and evaluations in a provider-neutral format, and maintain an evaluation suite so switching is a measured comparison rather than a rewrite. A hybrid architecture then becomes easy: route hard or premium requests to a closed frontier API and send bulk, cheap, or privacy-sensitive traffic to a self-hosted open model.',
      },
      {
        heading: 'Total cost of ownership beyond the invoice',
        content:
          'The line items people forget are usually the ones that decide the real cost. On the closed side, budget for rate-limit headroom, retries, prompt-caching discounts, and the engineering time to adapt when the provider deprecates a model. On the open side, the GPU is rarely the largest number: staffing for on-call and upgrades, observability and load-testing infrastructure, and the effort to re-tune prompts and re-validate quality after every model update often dominate a twelve-month view. A useful exercise is to write both totals as fully loaded monthly figures — including people, not just compute — and compare them at your realistic traffic, then again at two and five times that traffic. That sensitivity check frequently flips the answer, because the option that is cheapest at launch is often not the one that stays cheapest as usage grows and reliability expectations rise.',
      },
    ],
    checklist: [
      'Compute the break-even token volume before assuming open is cheaper.',
      'List version-pinning, residency, and retention requirements up front.',
      'Check the closed provider deprecation and data-retention policy.',
      'Add a provider abstraction layer before deep integration work.',
      'Keep a portable evaluation suite so migration stays evidence-based.',
    ],
    faq: [
      {
        q: 'At what scale does self-hosting beat an API?',
        a: 'When steady token volume exceeds the break-even point (monthly GPU + operations cost divided by API price per token) and traffic is predictable enough to keep the GPUs utilized. Spiky or low volume usually favors a managed API. Re-run the calculation whenever your pricing, traffic, or hardware costs change, because the break-even point moves with all three at once.',
      },
    ],
  },
  'llama-vs-qwen-vs-gemma-coding': {
    sections: [
      {
        heading: 'How the three open families actually differ for code',
        content:
          'Treat these as current-generation signals to verify on your repository, not fixed rankings. Qwen — especially the Qwen2.5-Coder line in 1.5B, 7B, 14B, and 32B — is the strongest open code family across sizes right now, with long context and fill-in-the-middle support; the 32B variant competes with much larger models on HumanEval and MBPP. Llama 3.x Instruct (8B, 70B) is a capable generalist with the broadest fine-tune and tooling ecosystem, though it no longer leads pure coding benchmarks. Gemma 2 and 3 (2B to 27B) are efficient and strong at reasoning and multilingual work, but have a smaller coding-specialized lineage.',
      },
      {
        heading: 'Pick the size that fits your GPU, then the task',
        content:
          'Shortlist by what your hardware can hold before comparing quality. At 4-bit, a 7B model fits comfortably on 8–12 GB, a 32B needs roughly 24 GB, and a 70B wants multiple GPUs or aggressive quantization. Then match model to job: for inline autocomplete a fast 7B fill-in-the-middle model beats a slow 70B, while multi-file refactors and reliable bug-fixing reward a larger model with long context. Choosing a model that does not fit, or a slow one for latency-sensitive completion, hurts developer experience more than a few benchmark points ever help.',
      },
      {
        heading: 'Evaluate on first-pass success, not leaderboards',
        content:
          'HumanEval, MBPP, and SWE-bench are directional only. Build a 20–50 task suite from your own repository — real bug fixes, refactors, and test generation — and score pass-on-first-attempt and edit-acceptance rate with precision and context held fixed. That measures the experience your team will actually have, which public leaderboards cannot.',
      },
      {
        heading: 'Check the license and context terms, not just quality',
        content:
          'Two models with similar benchmark scores can carry very different obligations. Llama ships under a community license with an acceptable-use policy and a monthly-active-user threshold that matters for large products; Qwen and Gemma have their own terms; and some coding-tuned forks add further restrictions. Before standardizing on a family, confirm the license permits your commercial and hosting use, and check the real usable context length rather than the advertised maximum, since long-context quality often falls off well before the stated limit. For coding specifically, verify the model supports the interaction mode you need — fill-in-the-middle for inline completion, or a chat template that plays well with your agent framework — because a mismatch there costs more day to day than a small benchmark gap.',
      },
    ],
    checklist: [
      'Shortlist by GPU-fitting size before comparing model quality.',
      'Prefer Qwen2.5-Coder sizes for code-heavy local workflows.',
      'Use fill-in-the-middle models for inline completion.',
      'Build an evaluation set from your real repository tasks.',
      'Score first-pass pass rate and edit-acceptance, not benchmarks alone.',
    ],
    faq: [
      {
        q: 'Which open family is best for coding right now?',
        a: 'For most local setups Qwen2.5-Coder leads open-weight code quality per size, Llama wins on ecosystem breadth, and Gemma on efficiency. Treat this as a starting point and validate on your own repository tasks.',
      },
    ],
  },
  'best-models-low-vram': {
    sections: [
      {
        heading: 'The math that decides each tier',
        content:
          'Usable VRAM is the card total minus roughly 0.5–1 GB of OS and driver overhead, minus the KV cache that grows with context and concurrency. At 4-bit, weight memory is about parameters × 0.5 bytes, so the tiers fall out cleanly: 8 GB holds a 7B model at 4-bit with modest context, 16 GB holds a 13–14B at 4-bit or a 7B in FP16 with room for cache, and 24 GB holds a 32B at 4-bit or a 14B in FP16 with longer context. Always leave 1–2 GB of headroom for KV growth rather than sizing to the exact weight footprint.',
      },
      {
        heading: 'Concrete starting points per tier',
        content:
          'Use these as starting points to confirm in the VRAM calculator, not guarantees. On 8 GB, a 7B-class 4-bit model such as Qwen2.5-7B, Llama-3.1-8B, or Mistral-7B works, or drop to a 3–4B model when you need long context. On 16 GB, a 14B at 4-bit or a 7B in FP16 makes a solid coding or document assistant. On 24 GB, a 32B at 4-bit (for example Qwen2.5-32B) or a 14B in FP16 with extended context becomes realistic. Verify the exact model and context length before committing.',
      },
      {
        heading: 'What breaks these plans',
        content:
          'The failures are almost always memory growth you did not budget for. Long conversations expand the KV cache linearly and can OOM a setup that loaded fine on a short prompt; concurrency multiplies that cache per active request; and mixture-of-experts models must keep every expert resident even though only a couple are active per token, so their low active-parameter count understates VRAM. Cap context length, cap concurrency, and test the worst-case prompt before calling a plan safe.',
      },
      {
        heading: 'Reclaim memory before dropping model size',
        content:
          'When a model almost fits, several levers recover headroom before you accept a smaller checkpoint. Quantizing the KV cache to FP8 or INT8 (supported in vLLM and TensorRT-LLM) can roughly halve cache memory at long context; choosing a grouped-query-attention model shrinks the cache structurally; and lowering the reserved maximum sequence length to the context you actually send stops the runtime pre-allocating for the worst case. Reducing batch size and enabling paged attention or prefix caching further raises effective capacity. Work through these first, because a 14B model that fits after cache quantization usually beats a 7B model that fit only because you gave up half the parameters — but re-run your quality tests after each change, since FP8 cache and aggressive context caps have their own small trade-offs.',
      },
    ],
    checklist: [
      'Compute usable VRAM as card total minus overhead minus KV cache.',
      'Pick a 4-bit model that leaves 1–2 GB of headroom for cache.',
      'Verify the exact model and context in the VRAM calculator.',
      'Stress-test long-context and concurrent requests, not one prompt.',
      'Prefer dense models over MoE when VRAM is tight.',
    ],
    faq: [
      {
        q: 'Can I run a 13B model on 8GB?',
        a: 'Only with aggressive 3-bit quantization and a very small context, and quality suffers noticeably on code and reasoning. A 7B model at 4-bit is usually the better choice on 8 GB because it leaves headroom for the KV cache and keeps quality closer to the full-precision model.',
      },
    ],
  },
  'best-multilingual-llms': {
    sections: [
      {
        heading: 'Tokenizer efficiency is a hidden multilingual cost',
        content:
          'Before comparing accuracy, check how each model tokenizes your languages. English-centric tokenizers split non-Latin scripts such as Devanagari or Tamil into many more tokens per word than English, which inflates latency and cost and consumes context faster. That "fertility" difference can make a nominally capable model impractical for Indic products. Models trained with multilingual tokenizers — Gemma, Qwen, Llama 3.x, and dedicated efforts like Cohere Aya — generally represent Indian-language text more compactly, so measuring tokens-per-word on your own sentences is a cheap and decisive first filter.',
      },
      {
        heading: 'Families with real multilingual coverage',
        content:
          'Coverage varies widely. Gemma and Qwen carry broad multilingual training, Llama 3.x improved its non-English performance markedly, and specialized projects target Indian languages directly — Cohere Aya, AI4Bharat-style Indic models, and Sarvam among them. For an English-plus-Indic product, shortlist by three things in order: tokenizer efficiency on the target scripts, instruction-following quality in each language, and stability when users code-switch within a single prompt. Only then compare general benchmark scores, which rarely reflect regional phrasing.',
      },
      {
        heading: 'Build Indic-aware evaluation sets',
        content:
          'Translation benchmarks miss how people actually type. Include transliteration (Hindi written in Latin script), code-switching such as Hinglish, formal versus colloquial register, and domain vocabulary from finance, health, and government. Track correction and escalation rates per language rather than a single global accuracy number, which can hide one weak language that quietly erodes trust for an entire audience segment.',
      },
      {
        heading: 'Lift regional quality with retrieval and glossaries',
        content:
          'When a capable multilingual model still stumbles on your domain, the fix is often not a different model but better grounding. A retrieval layer built on regional and domain content lets the model answer from correct local sources instead of guessing, and a curated glossary — mapping product, legal, and medical terms to their accepted translations — keeps terminology consistent across a language where the base model would otherwise drift. For English-plus-Indic products this combination usually raises quality faster than chasing a higher benchmark score, because it targets the exact failure modes real users hit: unfamiliar named entities, code-mixed phrasing, and specialized vocabulary.',
      },
      {
        heading: 'Decide between one model and language routing',
        content:
          'A single strong multilingual model is the simplest starting point, but at scale it can be worth routing by language or script. If one language shows persistently high correction rates, sending its traffic to a model specialized for that language — or to a different prompt and retrieval configuration — can lift quality without regressing the others. Weigh that gain against the added operational complexity of running and evaluating more than one path, and let per-language metrics, not intuition, decide when routing earns its keep.',
      },
    ],
    checklist: [
      'Measure tokenizer fertility (tokens per word) on each target script.',
      'Shortlist multilingual-trained families: Gemma, Qwen, Aya, Indic-specific.',
      'Test transliteration and Hinglish code-switching explicitly.',
      'Check domain terminology consistency per language.',
      'Track correction rate per language, not one global score.',
    ],
    faq: [
      {
        q: 'Is a bigger model always better multilingually?',
        a: 'No. Tokenizer coverage and language-specific training data usually matter more than raw size. A smaller model trained well on your languages can beat a larger English-centric one on both quality and cost, and it will often produce shorter, cheaper token sequences on non-Latin scripts as a bonus. Always confirm this on your own languages rather than assuming the larger model wins.',
      },
    ],
  },
  'fastest-models-low-latency-apps': {
    sections: [
      {
        heading: 'Separate time-to-first-token from tokens-per-second',
        content:
          'Perceived speed is two distinct numbers. Time-to-first-token is dominated by prefill, which scales with prompt length and any queueing, so shortening the prompt cuts it immediately. Tokens-per-second is decode, which is memory-bandwidth-bound and set by model size, precision, and batching, so a smaller or quantized model raises it. Streaming makes an app feel fast by showing the first tokens quickly, but it does not reduce total completion time — you still have to measure the whole request. Optimizing the wrong half is the most common latency mistake.',
      },
      {
        heading: 'Model-level levers, cheapest first',
        content:
          'Work from the cheapest change upward. Quantizing to 4-bit or FP8 raises decode throughput and frees memory; right-sizing the model — routing easy requests to a fast 7B rather than a 70B — often cuts latency dramatically with acceptable quality; trimming prompt instructions and oversized retrieval payloads reduces prefill; and capping maximum output tokens bounds the worst case. A distilled or 7B model at 4-bit frequently beats a large model on latency-sensitive paths while still passing your quality bar.',
      },
      {
        heading: 'Serving-level levers',
        content:
          'The serving stack matters as much as the model. A batching server such as vLLM or TGI with continuous batching keeps concurrent requests from serializing; prefix caching skips repeated prefill for shared system prompts; and speculative decoding can raise the decode rate. Load-test at real concurrency and watch p95 latency and timeout rate rather than single-request averages, which hide the tail behavior users actually feel.',
      },
      {
        heading: 'Cache and precompute the repeatable work',
        content:
          'The fastest request is the one you never fully run. Response caching for identical or near-identical prompts eliminates the model call entirely for common queries; embedding and retrieval caches avoid recomputing vectors for repeated documents; and prompt-prefix caching reuses the prefill of a shared system prompt across every user turn. For classification and routing, a small local model or even a rules layer can answer the easy majority instantly and escalate only the ambiguous cases. Each of these removes work from the hot path rather than making the model faster, which is usually the cheapest latency win available and the first place to look before you reach for bigger or more expensive hardware.',
      },
      {
        heading: 'Design the timeout and fallback path deliberately',
        content:
          'Tail latency is a product decision, not just an infrastructure metric. Set explicit per-stage timeouts, and decide in advance what happens when one is exceeded — return a partial streamed answer, retry on a faster model, or degrade gracefully to a cached or simpler response. An app that occasionally answers a little worse but always answers quickly usually feels better than one that is fast on average but stalls unpredictably. Measure how often each fallback fires, because a fallback that triggers constantly is really a capacity problem wearing a disguise.',
      },
    ],
    checklist: [
      'Measure time-to-first-token and tokens-per-second separately.',
      'Shorten prompt and retrieval payload before scaling infrastructure.',
      'Quantize and right-size the model to the request type.',
      'Use continuous batching and prefix caching in the serving layer.',
      'Optimize p95 latency and timeout rate, not the average.',
    ],
    faq: [
      {
        q: 'Does a smaller model always mean lower latency?',
        a: 'For raw decode rate yes, but if the smaller model fails more often and triggers retries or corrections, total task-completion time can rise. Optimize for successful-completion latency, not raw generation speed, and route only the requests the smaller model handles reliably to it while sending harder ones to a stronger model.',
      },
    ],
  },
  'build-local-ai-assistant-8gb': {
    sections: [
      {
        heading: 'Pick a runtime and a right-sized quant',
        content:
          'On 8 GB, use a llama.cpp-based runtime — Ollama or LM Studio — with a GGUF Q4_K_M build of a 7B model, or a 3–4B model when you need longer context. Leave roughly 1.5 GB for the KV cache and system. Tune the number of offloaded GPU layers (llama.cpp calls this -ngl) to push as many layers onto the card as fit and keep the rest on the CPU, then measure tokens per second after each change. The goal is a stable configuration with headroom, not the largest model that technically loads.',
      },
      {
        heading: 'Add lightweight retrieval instead of a bigger model',
        content:
          'A small embedding model plus a local vector store such as Chroma, FAISS, or SQLite lets a 7B assistant answer from your own documents far better than upgrading the base model would. Chunk documents on semantic boundaries, attach source metadata for citations, and keep top-k small so retrieved context does not blow the tight KV budget. On constrained hardware, better context selection beats a larger checkpoint almost every time.',
      },
      {
        heading: 'Guardrails that keep 8GB stable',
        content:
          'Stability on 8 GB comes from limits, not luck. Cap context length and maximum output tokens, serialize requests so only one runs at a time, and add a fallback when a prompt is too long. Log correction rate, truncation events, and latency weekly, and tune prompts and retrieval before switching model families — most early failures are workflow problems rather than model limitations.',
      },
      {
        heading: 'A minimal, reproducible setup path',
        content:
          'Keep the first build small enough to rebuild from scratch in an afternoon. Install one runtime (Ollama is the simplest), pull a single Q4_K_M 7B model, and confirm it generates at an acceptable tokens-per-second before adding anything. Then layer retrieval: a compact embedding model, a local vector store, and an ingestion script that chunks your documents and attaches source metadata. Wire a thin chat interface last. Pin the exact model tag, embedding model, and runtime version in a short README so the environment is reproducible, and keep configuration — context length, offloaded layers, top-k — in one file rather than scattered flags. This makes it trivial to roll back a change that hurt quality or stability, which on constrained hardware you will do often.',
      },
      {
        heading: 'Know when 8 GB is the wrong tool',
        content:
          'Part of building well is recognizing the ceiling. An 8 GB assistant is excellent for personal workflows, prototypes, private document Q&A, and internal tools with light traffic. It is the wrong choice for concurrent production traffic, very long documents, or tasks that genuinely need a large model — heavy multi-file code reasoning or complex agentic loops. When your logs show frequent truncation, rising correction rates, or queueing under real use, that is the signal to move to a larger GPU or a hosted API rather than fighting the memory limit with ever more aggressive quantization.',
      },
    ],
    checklist: [
      'Run a GGUF Q4_K_M 7B (or 3–4B for long context) via Ollama or llama.cpp.',
      'Tune GPU-offloaded layers to fit, leaving ~1.5 GB KV headroom.',
      'Add a small embedding model and a local vector store.',
      'Cap context, max tokens, and concurrency to one request.',
      'Log corrections, truncations, and latency weekly before changing models.',
    ],
    faq: [
      {
        q: 'Ollama or llama.cpp directly on 8GB?',
        a: 'Ollama wraps llama.cpp with easy model management and is the better default. Drop to raw llama.cpp only when you need fine control over offloaded layers, KV-cache type, or a custom quantization.',
      },
    ],
  },
  'deploy-small-rag-app': {
    sections: [
      {
        heading: 'Chunking and embedding choices decide retrieval',
        content:
          'Retrieval quality is set long before the generation model runs. Start with chunks of roughly 300–500 tokens and 10–15% overlap, and keep semantic units intact rather than splitting mid-table or mid-function. Match the embedding model to your domain and language, and store title, URL, and section metadata so you can filter results and produce citations. Whenever you change chunking, re-embed — stale vectors quietly degrade retrieval while everything appears to still work.',
      },
      {
        heading: 'Measure retrieval and grounding separately',
        content:
          'When answers are wrong, you need to know why. Track retrieval hit rate — was the correct passage in the top-k? — apart from answer quality, and add unsupported-answer rate and citation correctness. If the right passage never reaches the model, the fix is chunking or reranking; if it does but the answer is still wrong, the fix is the prompt or the generator. Add a low-confidence fallback that declines rather than inventing an answer.',
      },
      {
        heading: 'Keep the source data fresh and scoped',
        content:
          'A RAG app is only as current as its index. Decide up front how documents get updated — scheduled re-ingestion, a webhook on source changes, or manual refresh — and re-embed whenever content or chunking changes so the vectors never drift from the truth. Keep the corpus scoped to what the app actually answers; adding unrelated documents dilutes retrieval precision and raises the chance of confidently citing the wrong source. Attach a last-updated timestamp to chunks so stale answers are diagnosable, and prune or version content that has been superseded rather than leaving contradictory passages in the index.',
      },
    ],
    checklist: [
      'Start with ~300–500 token chunks and light overlap on semantic boundaries.',
      'Match the embedding model to your domain and language.',
      'Store title, URL, and section metadata for filtering and citations.',
      'Measure retrieval hit rate separately from answer quality.',
      'Add a decline-on-low-confidence fallback instead of hallucinating.',
    ],
    faq: [
      {
        q: 'How do I tell a retrieval problem from a generation problem?',
        a: 'Check retrieval hit rate first. If the correct passage is not in the top-k results, fix chunking or add reranking. If it is present but the answer is still wrong, fix the prompt or the generation model.',
      },
    ],
  },
  'prompt-patterns-that-work': {
    sections: [
      {
        heading: 'Structure the context, not just the instructions',
        content:
          'How you lay out a prompt matters as much as what it says. Put instructions before long context, use clear delimiters — XML-like tags or fenced blocks — to separate role, data, and examples, and reference each input by an explicit name. Models attend most reliably to the beginning and end of a long prompt, so the critical rule and the required output format belong at the edges rather than buried in the middle where they are most likely to be ignored.',
      },
      {
        heading: 'Make prompt quality measurable',
        content:
          'Treat a production prompt like a function with a test suite: a set of inputs paired with expected properties such as valid JSON, a correct refusal, or specific field values. Score format-validity and correctness on every edit before rollout. That turns "the new prompt feels better" into evidence and catches regressions when you change the underlying model or add new retrieval context, exactly the moments when prompt behavior silently shifts.',
      },
      {
        heading: 'Specify refusal and fallback behavior explicitly',
        content:
          'Most prompt failures in production are not wrong answers but confident answers to questions the model should have declined. Spell out what to do when the input is missing, ambiguous, or out of scope: refuse with a specific message, ask a clarifying question, or return a defined empty result. For retrieval-backed prompts, instruct the model to answer only from the provided context and to say plainly when that context is insufficient. Making the failure path as explicit as the success path is what separates a prompt that demos well from one that behaves predictably under the messy, unexpected inputs real users send.',
      },
    ],
    checklist: [
      'Order the prompt instruction, then context, then examples, with delimiters.',
      'Place the critical rule and output format at the start and end.',
      'Reference every input by an explicit, named variable.',
      'Keep a scored regression suite for each production prompt.',
      'Re-run the suite on every model or retrieval change.',
    ],
    faq: [
      {
        q: 'Where should the most important instruction go?',
        a: 'Near the start and restated near the end. Models attend most reliably to the beginning and end of a long prompt, so critical rules and the required output format should sit at the edges, not the middle.',
      },
    ],
  },
};

const ensureGuideDepth = (guide) => {
  // Bespoke, per-topic depth wins over the generic expansion — even if the guide
  // is already long — so these pages never carry the shared boilerplate.
  const topic = TOPIC_DEPTH[guide.slug];
  if (topic) {
    return {
      ...guide,
      sections: [...(guide.sections || []), ...topic.sections],
      checklist: [...(guide.checklist || []), ...topic.checklist],
      faq: [...(guide.faq || []), ...topic.faq],
    };
  }

  if (countGuideWords(guide) >= 900) return guide;
  const expansion = depthExpansionFor(guide);
  return {
    ...guide,
    sections: [...(guide.sections || []), ...expansion.sections],
    checklist: [...(guide.checklist || []), ...expansion.checklist],
    faq: [...(guide.faq || []), ...expansion.faq],
  };
};

const enrichGuide = (guide) => {
  const baseGuide = {
    ...mergeGuideSupplement(guide),
    author: guide.author || 'Dhiraj',
    reviewedBy: guide.reviewedBy || 'InnoAI Technical Review Board',
    publishedDate: guide.publishedDate || guide.lastUpdated || '2026-04-12',
    qualityVersion: guide.qualityVersion || 'v1.0',
    difficulty: guide.difficulty || inferDifficulty(guide.readTime),
    whatYouWillLearn: guide.whatYouWillLearn || guide.keyTakeaways || [],
    sources: Array.isArray(guide.sources) && guide.sources.length > 0 ? guide.sources : DEFAULT_SOURCES,
  };

  return ensureGuideDepth(baseGuide);
};

export function getAllGuides() {
  return guides.map(enrichGuide);
}

export function getGuideBySlug(slug) {
  const guide = guides.find((entry) => entry.slug === slug);
  return guide ? enrichGuide(guide) : null;
}
