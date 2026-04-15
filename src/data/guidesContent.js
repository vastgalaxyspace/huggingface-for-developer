export const guides = [
  {
    slug: 'choose-ai-model-by-gpu-budget',
    title: 'How to Choose an AI Model by GPU and Budget',
    description: 'Pick models by VRAM, latency, and monthly cost instead of hype.',
    category: 'Model Selection',
    readTime: '8 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: [
      'Start with constraints first.',
      'Benchmark with your own prompts.',
      'Keep a fallback model ready.',
    ],
    sections: [
      {
        heading: 'Start with hard limits',
        content:
          'Define budget ceiling, latency target, and memory limits before model shortlisting. This immediately removes options that cannot operate in production.',
      },
      {
        heading: 'Compare quality and cost together',
        content:
          'Use a shortlist with quality score, p95 latency, and cost per 1,000 requests. A model that looks strong in benchmark tables can still be expensive in your workload.',
      },
      {
        heading: 'Run scenario testing',
        content:
          'Test normal and peak traffic using representative prompts. Validate degraded-mode behavior with a smaller fallback model.',
      },
    ],
    checklist: [
      'Document constraints',
      'Build a 3-model shortlist',
      'Benchmark with real prompts',
      'Define fallback policy',
    ],
    faq: [
      { q: 'Should I pick the smallest model?', a: 'Only if quality remains acceptable for your user tasks.' },
      { q: 'Is quantization worth it?', a: 'Usually yes for cost and memory, but validate quality on production prompts.' },
    ],
    related: ['rag-vs-fine-tuning', 'best-models-low-vram'],
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
    title: 'Quantization Explained: 4-bit, 8-bit, and FP16',
    description: 'Understand precision tradeoffs across quality, speed, and cost.',
    category: 'Deployment',
    readTime: '7 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: ['8-bit is a common balance.', '4-bit can reduce cost sharply.', 'Always keep rollback to higher precision.'],
    sections: [
      {
        heading: 'Precision affects business outcomes',
        content:
          'Lower precision reduces memory usage and can improve serving density. This directly impacts infrastructure cost.',
      },
      {
        heading: 'Evaluate on real tasks',
        content:
          'Use the same prompt suite across FP16, 8-bit, and 4-bit variants to compare quality impact fairly.',
      },
      {
        heading: 'Plan safe rollout',
        content:
          'Use canaries, monitor correction rates, and define triggers for fallback to higher precision during incidents.',
      },
    ],
    checklist: ['Run identical evaluation suite', 'Track cost and quality together', 'Set rollback thresholds'],
    faq: [
      { q: 'Is 4-bit always worse?', a: 'Not always in user-visible outcomes. It depends on task sensitivity.' },
      { q: 'Should long context be tested?', a: 'Yes, precision impact can increase on long prompts.' },
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
    title: '10 Costly Model Selection Mistakes and How to Avoid Them',
    description: 'Prevent expensive errors in evaluation, deployment, and operations.',
    category: 'Operations',
    readTime: '9 min read',
    lastUpdated: '2026-04-12',
    keyTakeaways: ['Benchmark-only choices fail often.', 'Operations readiness is mandatory.', 'Selection must be revisited regularly.'],
    sections: [
      {
        heading: 'Mistake: leaderboard-only decisions',
        content:
          'Leaderboards are signals, not final answers. Product-specific prompts and constraints should determine model choice.',
      },
      {
        heading: 'Mistake: no fallback design',
        content:
          'Without fallback and rollback policy, traffic spikes and regressions quickly become user-facing incidents.',
      },
      {
        heading: 'Mistake: no learning loop',
        content:
          'Selection is ongoing. Review correction logs and latency trends to keep architecture aligned with real usage.',
      },
    ],
    checklist: ['Use weighted scorecards', 'Define rollback policy', 'Run quarterly model review'],
    faq: [
      { q: 'Most common error?', a: 'Picking by benchmark rank without validating real user workflows.' },
      { q: 'How often revisit decisions?', a: 'At least quarterly or after major model shifts.' },
    ],
    related: ['choose-ai-model-by-gpu-budget', 'fastest-models-low-latency-apps'],
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
