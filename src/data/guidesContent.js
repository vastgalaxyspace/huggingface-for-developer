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
    description: 'Decide whether you need retrieval, training, or a hybrid approach.',
    category: 'Architecture',
    readTime: '9 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: ['RAG is faster to ship.', 'Fine-tuning is for behavior consistency.', 'Hybrid works well at scale.'],
    sections: [
      {
        heading: 'Use RAG for freshness',
        content:
          'RAG is often the quickest path when knowledge changes frequently. You can update retrieval indexes without retraining model weights.',
      },
      {
        heading: 'Use fine-tuning for style and format',
        content:
          'Fine-tuning helps when strict response style or domain behavior is required and prompting alone is inconsistent.',
      },
      {
        heading: 'Combine when product matures',
        content:
          'A common path is RAG first, then targeted fine-tuning after you have stable usage data and failure analysis.',
      },
    ],
    checklist: ['Audit main gap: knowledge vs behavior', 'Run RAG pilot', 'Define evaluation gates'],
    faq: [
      { q: 'Can RAG replace tuning?', a: 'For many knowledge tasks, yes. For strict style control, not always.' },
      { q: 'What fails most in RAG?', a: 'Weak retrieval relevance and poor chunking design.' },
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
    description: 'Choose architecture based on lifecycle cost and governance risk.',
    category: 'Strategy',
    readTime: '8 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: ['Closed APIs reduce setup effort.', 'Open models improve control.', 'Hybrid keeps portability.'],
    sections: [
      {
        heading: 'Compare lifecycle cost',
        content:
          'Entry cost is only one phase. Evaluate expected traffic growth, latency constraints, and staffing overhead across 6 to 12 months.',
      },
      {
        heading: 'Review governance early',
        content:
          'Data residency, retention, and legal obligations can decide architecture before benchmark performance is considered.',
      },
      {
        heading: 'Design for portability',
        content:
          'Keep provider interfaces abstracted so you can route traffic or migrate without deep rewrites.',
      },
    ],
    checklist: ['Model long-term cost', 'Run legal review', 'Add provider abstraction layer'],
    faq: [
      { q: 'Is open-source always cheaper?', a: 'Not always. Operations overhead can be significant.' },
      { q: 'Should small teams go hybrid?', a: 'Usually start simple, then add hybrid routing as scale increases.' },
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
    description: 'Deploy useful AI experiences under strict memory constraints.',
    category: 'Hardware Planning',
    readTime: '8 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: ['VRAM is the primary deployment constraint.', 'Prompt length can break memory plans.', 'Stability beats peak speed.'],
    sections: [
      {
        heading: 'Plan by VRAM tier',
        content:
          'Treat 8GB, 16GB, and 24GB as separate deployment classes with different model and precision strategies.',
      },
      {
        heading: 'Include long-context tests',
        content:
          'Sizing based on average prompt length is risky. Stress test memory using long-context and concurrent requests.',
      },
      {
        heading: 'Ship with safeguards',
        content:
          'Use conservative defaults, clear limits, and fallback behavior to maintain reliability under load.',
      },
    ],
    checklist: ['Select model per VRAM tier', 'Stress test context windows', 'Define fallback behavior'],
    faq: [
      { q: 'Can 8GB be practical?', a: 'Yes for focused use cases with quantized models.' },
      { q: 'Is 24GB enough for production?', a: 'Often yes for medium workloads, depending on concurrency and context size.' },
    ],
    related: ['quantization-4bit-8bit-fp16', 'build-local-ai-assistant-8gb'],
  },
  {
    slug: 'best-multilingual-llms',
    title: 'Best Multilingual LLM Strategies for English and Indian Languages',
    description: 'Build robust multilingual systems with realistic evaluation and prompt design.',
    category: 'Localization',
    readTime: '8 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: ['Language performance varies by task.', 'Use language-specific tests.', 'Track corrections per language.'],
    sections: [
      {
        heading: 'Define multilingual quality dimensions',
        content:
          'Evaluate fluency, factuality, terminology consistency, and instruction following per language group.',
      },
      {
        heading: 'Design realistic test sets',
        content:
          'Use real product queries and include code-switched prompts. Translation-only tests miss production failure modes.',
      },
      {
        heading: 'Iterate with user feedback',
        content:
          'Track correction rates and refine prompts and retrieval by language. Small changes can produce strong gains.',
      },
    ],
    checklist: ['Create language buckets', 'Include code-switching', 'Run periodic regressions'],
    faq: [
      { q: 'Are multilingual benchmarks enough?', a: 'No. Product-specific prompt sets are still required.' },
      { q: 'One model for all languages?', a: 'Good for start; routing by language can help at scale.' },
    ],
    related: ['rag-vs-fine-tuning', 'prompt-patterns-that-work'],
  },
  {
    slug: 'fastest-models-low-latency-apps',
    title: 'Fastest Models for Low-Latency AI Applications',
    description: 'Reduce response time using full-pipeline optimization and smart routing.',
    category: 'Performance',
    readTime: '7 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: ['Latency is end-to-end.', 'Token budget drives speed.', 'Optimize p95, not only average.'],
    sections: [
      {
        heading: 'Break down latency components',
        content:
          'Measure queue, network, prefill, generation, and post-processing separately to identify true bottlenecks.',
      },
      {
        heading: 'Cut token overhead',
        content:
          'Trim unnecessary prompt instructions and retrieval context. Token reduction improves both speed and cost.',
      },
      {
        heading: 'Use model routing',
        content:
          'Route simple tasks to faster models and keep high-capability models for complex prompts.',
      },
    ],
    checklist: ['Instrument pipeline timings', 'Track p95 latency', 'Implement routing and fallback'],
    faq: [
      { q: 'Does streaming solve latency?', a: 'It improves perception but not backend bottlenecks.' },
      { q: 'What should I optimize first?', a: 'Start with p95 latency and failure rate.' },
    ],
    related: ['choose-ai-model-by-gpu-budget', 'best-models-low-vram'],
  },
  {
    slug: 'build-local-ai-assistant-8gb',
    title: 'Build a Local AI Assistant on an 8GB GPU',
    description: 'Ship a constrained but useful local assistant with stable defaults.',
    category: 'Tutorials',
    readTime: '10 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: ['Scope narrowly first.', 'Use conservative context limits.', 'Monitor quality after launch.'],
    sections: [
      {
        heading: 'Start with a narrow use case',
        content:
          'Focus on one or two high-value tasks. This keeps memory usage predictable and improves first-release reliability.',
      },
      {
        heading: 'Configure for stability',
        content:
          'Use quantized checkpoints, strict token limits, and low-concurrency defaults to avoid memory spikes.',
      },
      {
        heading: 'Improve using real usage logs',
        content:
          'Track corrections and latency weekly. Tune prompts and retrieval before switching model families.',
      },
    ],
    checklist: ['Define scope', 'Set limits', 'Monitor correction rate'],
    faq: [
      { q: 'Can this handle heavy enterprise traffic?', a: 'Usually no, but it works for focused internal and prototype workflows.' },
      { q: 'What causes instability most?', a: 'Long prompts and uncontrolled concurrency.' },
    ],
    related: ['best-models-low-vram', 'quantization-4bit-8bit-fp16'],
  },
  {
    slug: 'deploy-small-rag-app',
    title: 'Deploy a Small RAG App End-to-End',
    description: 'A practical RAG implementation flow from ingestion to monitoring.',
    category: 'Tutorials',
    readTime: '10 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: ['Ingestion quality is foundational.', 'Retrieval tuning matters more than model swaps early.', 'Guardrails improve trust.'],
    sections: [
      {
        heading: 'Clean ingestion pipeline',
        content:
          'Normalize documents and attach metadata so retrieval has consistent structure and context-rich filtering.',
      },
      {
        heading: 'Tune retrieval first',
        content:
          'Iterate chunk size and reranking with real query patterns before changing generation models.',
      },
      {
        heading: 'Add confidence guardrails',
        content:
          'Expose source snippets and low-confidence fallback behavior to reduce unsupported answers.',
      },
    ],
    checklist: ['Normalize docs', 'Tune retrieval', 'Require source-aware outputs'],
    faq: [
      { q: 'Need a large model for RAG?', a: 'Not initially. Better retrieval often gives larger gains.' },
      { q: 'Is reranking optional?', a: 'Optional, but often very useful for precision.' },
    ],
    related: ['rag-vs-fine-tuning', 'prompt-patterns-that-work'],
  },
  {
    slug: 'prompt-patterns-that-work',
    title: 'Prompt Engineering Patterns That Actually Work',
    description: 'Reusable prompt structures for reliability and maintainability.',
    category: 'Prompting',
    readTime: '8 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: ['Use role-task-format structure.', 'Define output schema clearly.', 'Version prompts like code.'],
    sections: [
      {
        heading: 'Use a stable structure',
        content:
          'Role, task, constraints, and output format is a reliable baseline that improves consistency across prompt variants.',
      },
      {
        heading: 'Encode success criteria',
        content:
          'If output must follow JSON or section rules, define that explicitly and include concise examples.',
      },
      {
        heading: 'Version and test prompt updates',
        content:
          'Prompt changes can regress behavior. Track revisions in source control and run regression tests before rollout.',
      },
    ],
    checklist: ['Standardize template', 'Set schema rules', 'Run prompt regression tests'],
    faq: [
      { q: 'Should prompts be very long?', a: 'Only as long as needed; avoid conflicting and redundant instructions.' },
      { q: 'When use few-shot?', a: 'When strict format and behavior consistency is required.' },
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

const enrichGuide = (guide) => ({
  ...guide,
  author: guide.author || 'InnoAI Editorial Team',
  reviewedBy: guide.reviewedBy || 'InnoAI Technical Review Board',
  publishedDate: guide.publishedDate || guide.lastUpdated || '2026-04-12',
  qualityVersion: guide.qualityVersion || 'v1.0',
  difficulty: guide.difficulty || inferDifficulty(guide.readTime),
  whatYouWillLearn: guide.whatYouWillLearn || guide.keyTakeaways || [],
  sources: Array.isArray(guide.sources) && guide.sources.length > 0 ? guide.sources : DEFAULT_SOURCES,
});

export function getAllGuides() {
  return guides.map(enrichGuide);
}

export function getGuideBySlug(slug) {
  const guide = guides.find((entry) => entry.slug === slug);
  return guide ? enrichGuide(guide) : null;
}
