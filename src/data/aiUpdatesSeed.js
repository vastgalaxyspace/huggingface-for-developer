// Curated AI update entries for the ai_updates Firestore collection.
// Consumed only by scripts/seed-ai-updates.mjs (admin-side seeding), not the app runtime.
export const AI_UPDATES_SEED = [
  {
    title: 'Claude Sonnet 5 becomes the default model for Free and Pro users',
    description:
      'Anthropic made Claude Sonnet 5 the default model for Free and Pro users on June 30, 2026, reporting 63.2% on SWE-bench Pro and gains over Opus 4.8 on Terminal-Bench 2.1.',
    category: 'AI Models',
    date: '2026-06-30',
    link: 'https://www.anthropic.com/news',
  },
  {
    title: 'OpenAI launches the GPT-5.6 family: Sol, Terra, and Luna',
    description:
      'OpenAI publicly launched GPT-5.6 on July 9, 2026 as three variants: Sol (flagship, agentic coding/biology/cybersecurity), Terra (everyday tasks at lower cost), and Luna (speed and affordability).',
    category: 'AI Models',
    date: '2026-07-09',
    link: 'https://openai.com/news/',
  },
  {
    title: 'xAI ships Grok 4.5 as a faster, cheaper Opus-class model',
    description:
      'xAI released Grok 4.5 in early July 2026, positioning it as an Opus-class model that is faster and more token-efficient than its predecessor.',
    category: 'AI Models',
    date: '2026-07-05',
    link: 'https://x.ai/news',
  },
  {
    title: 'Z.ai releases GLM-5.2, a 744B MoE model under MIT license',
    description:
      'GLM-5.2 launched in mid-June 2026 as a 744B-parameter mixture-of-experts model with 40B active parameters per token, leading open-weight coding benchmarks including SWE-bench Pro.',
    category: 'AI Models',
    date: '2026-06-13',
    link: 'https://huggingface.co/zai-org',
  },
  {
    title: 'MiniMax M3 posts a top open-weight SWE-bench Pro score',
    description:
      'MiniMax released M3 on June 1, 2026 with a 1M-token context window and native multimodality, reporting 59.0% on SWE-bench Pro, the highest open-weight score at the time.',
    category: 'AI Models',
    date: '2026-06-01',
    link: 'https://huggingface.co/MiniMaxAI',
  },
  {
    title: 'Moonshot AI ships Kimi K2.7 Code with a large coding-benchmark jump',
    description:
      'Kimi K2.7 Code launched June 12, 2026, reporting a 21.8% improvement over K2.6 on Kimi Code Bench v2, extending Moonshot AI\'s open coding-model lineup.',
    category: 'AI Models',
    date: '2026-06-12',
    link: 'https://huggingface.co/moonshotai',
  },
  {
    title: 'Transformers v5.13.0 adds Kimi 2.5 architecture and serving fixes',
    description:
      'Hugging Face Transformers v5.13.0 shipped broader export and kernels tooling plus generation, attention, cache, quantization, and serving fixes, including support for the Kimi 2.5 architecture.',
    category: 'AI Tools',
    date: '2026-07-01',
    link: 'https://github.com/huggingface/transformers/releases',
  },
  {
    title: 'Transformers v5.11.0 adds DiffusionGemma and DeepSeek-V3.2-Exp support',
    description:
      'An earlier June 2026 Transformers release added first-class support for DiffusionGemma and DeepSeek-V3.2-Exp, followed by v5.12.0 adding MiniMax-M3-VL, PP-OCRv6, and Parakeet-RNNT.',
    category: 'AI Models',
    date: '2026-06-12',
    link: 'https://github.com/huggingface/transformers/releases',
  },
  {
    title: 'vLLM 0.21 stabilizes DeepSeek V4 on Blackwell GPUs',
    description:
      'vLLM 0.21 landed in May 2026 with DeepSeek V4 stability improvements on Blackwell-class hardware, ahead of EAGLE 3.1 speculative-decoding fixes planned for v0.22.',
    category: 'AI Infrastructure',
    date: '2026-05-20',
    link: 'https://github.com/vllm-project/vllm/releases',
  },
  {
    title: 'llama.cpp merges MTP speculative decoding and passes 120K GitHub stars',
    description:
      'llama.cpp merged MTP (multi-token prediction) speculative decoding into master in May 2026 and continues shipping build-tagged releases, surpassing 120,000 GitHub stars by July 2026.',
    category: 'AI Infrastructure',
    date: '2026-07-01',
    link: 'https://github.com/ggml-org/llama.cpp/releases',
  },
  {
    title: 'Anthropic brings Claude Code to general availability',
    description:
      'Claude Code launched broadly on June 9, 2026, available via the Anthropic API and inside GitHub Copilot for Pro+, Max, Business, and Enterprise plans, built on the Claude Agent SDK.',
    category: 'AI Tools',
    date: '2026-06-09',
    link: 'https://www.anthropic.com/claude-code',
  },
  {
    title: 'Cursor 3.7 ships Composer 2.5 and a dedicated Tab completion model',
    description:
      'Cursor 3.7, released in June 2026, adds the Composer 2.5 agentic mode alongside a Tab completion model trained specifically for inline editing inside the editor.',
    category: 'AI Tools',
    date: '2026-06-15',
    link: 'https://cursor.com/',
  },
  {
    title: 'Hyperscalers push AI infrastructure spend toward $700B in 2026',
    description:
      'Amazon, Microsoft, Alphabet, Meta, and Oracle are collectively projected to spend $660-725 billion on AI infrastructure in 2026, nearly double 2025 levels, driven by GPU and data-center buildout.',
    category: 'AI Infrastructure',
    date: '2026-06-20',
    link: 'https://blogs.nvidia.com/blog/gtc-2026-news/',
  },
  {
    title: 'AMD data center revenue jumps 57% year-over-year in Q1 2026',
    description:
      'AMD reported $5.8 billion in data center revenue for Q1 2026, up 57% year-over-year, as it gains share in AI accelerators against NVIDIA.',
    category: 'AI Infrastructure',
    date: '2026-05-01',
    link: 'https://www.amd.com/en/newsroom.html',
  },
  {
    title: 'NVIDIA GTC 2026 centers on Blackwell-generation AI infrastructure',
    description:
      'NVIDIA used GTC 2026 to detail its next wave of AI infrastructure, spanning GPUs, high-speed networking, and full-stack data-center reference designs for hyperscale AI buildouts.',
    category: 'AI Infrastructure',
    date: '2026-03-13',
    link: 'https://blogs.nvidia.com/blog/gtc-2026-news/',
  },
  {
    title: 'Qualcomm expands its partnership with Hugging Face for on-device AI',
    description:
      'Qualcomm and Hugging Face expanded their relationship to advance open, developer-driven AI from device to cloud, broadening on-device model deployment options for developers.',
    category: 'AI Tools',
    date: '2026-06-01',
    link: 'https://huggingface.co/blog/nvidia-reachy-mini',
  },
  {
    title: 'NVIDIA and Hugging Face bring new models to LeRobot for open robotics',
    description:
      'NVIDIA and Hugging Face partnered to add Isaac GR00T and Isaac Teleop framework support to LeRobot, Hugging Face\'s open-source robotics library, with NVIDIA Cosmos support planned.',
    category: 'AI Research',
    date: '2026-06-01',
    link: 'https://blogs.nvidia.com/blog/hugging-face-lerobot-models-frameworks-open-robotics/',
  },
  {
    title: 'Qwen 3.6 extends Alibaba\'s open-weight model lineup',
    description:
      'Alibaba\'s Qwen team released Qwen 3.6 in the mid-2026 open-model wave alongside GLM-5.2 and DeepSeek V4, continuing rapid iteration across dense and MoE size classes.',
    category: 'AI Models',
    date: '2026-07-01',
    link: 'https://huggingface.co/Qwen',
  },
  {
    title: 'DeepSeek V4 lands as the next step past V3.2-Exp',
    description:
      'DeepSeek V4 released as part of the July 2026 open-model wave, following the V3.2-Exp checkpoint that Transformers added support for in June, and gained early stability support in vLLM 0.21.',
    category: 'AI Models',
    date: '2026-07-01',
    link: 'https://huggingface.co/deepseek-ai',
  },
  {
    title: 'Enterprises report GPU utilization far below spend, pressuring cost-per-token',
    description:
      'Industry analysis in mid-2026 highlighted that many enterprise GPU fleets run near 5% utilization while metered cloud billing continues, making cost-per-useful-token a front-line production metric.',
    category: 'AI Infrastructure',
    date: '2026-06-10',
    link: 'https://venturebeat.com/infrastructure/5-gpu-utilization-the-401-billion-ai-infrastructure-problem-enterprises-cant-keep-ignoring',
  },
];
