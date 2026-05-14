import { absoluteUrl, SITE_NAME } from "./seo";
import { isModelIndexable, modelPath } from "./modelIndexing";

const formatNumber = (value) => {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return "not publicly reported";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
};

const formatGb = (value) => {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return "not available";
  return `${n.toFixed(n >= 10 ? 0 : 1)} GB`;
};

const titleCase = (value = "") =>
  String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export function getModelFamily(modelId = "") {
  const id = modelId.toLowerCase();
  if (id.includes("llama-4-scout")) return "Llama 4 Scout";
  if (id.includes("deepseek-r1")) return "DeepSeek R1";
  if (id.includes("qwen3")) return "Qwen 3";
  if (id.includes("gemma-3")) return "Gemma 3";
  if (id.includes("llama")) return "Llama";
  if (id.includes("mistral")) return "Mistral";
  if (id.includes("qwen")) return "Qwen";
  if (id.includes("gemma")) return "Gemma";
  return "Transformer";
}

function getFamilyGuidance(family) {
  const guidance = {
    "Llama 4 Scout": {
      overview: "Llama 4 Scout is most relevant for teams evaluating current-generation open-weight assistant models with strong long-context and instruction-following ambitions.",
      deployment: "Treat Scout-class models as production candidates for retrieval, agents, and coding assistants only after measuring prompt latency and memory pressure on your target GPU stack.",
      quantization: "Start with BF16 or FP16 for quality baselines, then test AWQ or GPTQ for GPU inference and GGUF for llama.cpp-style local deployment.",
    },
    "DeepSeek R1": {
      overview: "DeepSeek R1 is a reasoning-focused model family, so evaluation should emphasize multi-step tasks, math, code review, tool planning, and failure recovery rather than chat fluency alone.",
      deployment: "Use it when reasoning quality matters more than minimum latency. For production, route routine prompts to a smaller model and reserve R1-style inference for complex requests.",
      quantization: "Reasoning models can be sensitive to aggressive quantization, so compare full precision, 8-bit, and 4-bit outputs on the same reasoning traces before rollout.",
    },
    "Qwen 3": {
      overview: "Qwen 3 models are strong general-purpose open models with useful coverage across multilingual, coding, agentic, and structured-output workloads.",
      deployment: "They are good candidates for teams that need broad task coverage and want several model sizes for routing across latency and budget tiers.",
      quantization: "Qwen deployments commonly benefit from AWQ/GPTQ for GPU serving and GGUF variants for local inference, but structured-output tests should be rerun after quantization.",
    },
    "Gemma 3": {
      overview: "Gemma 3 models are useful for developers who want compact, modern open models with practical deployment paths on consumer and workstation GPUs.",
      deployment: "Use smaller Gemma variants for local assistants, classification, extraction, and prototypes; reserve larger variants for higher-quality generation where latency allows.",
      quantization: "Gemma 3 can fit attractive local profiles when quantized, but compare instruction following and refusal behavior before moving a quantized variant into production.",
    },
  };
  return guidance[family] || {
    overview: "This model should be evaluated as a transformer-based AI system where architecture, license, context length, and deployment hardware decide practical fit.",
    deployment: "Start with a representative workload, measure latency and memory, then choose hosted API, single-GPU, or multi-GPU deployment based on observed constraints.",
    quantization: "Use FP16 or BF16 as the quality baseline, then test 8-bit and 4-bit variants against your own prompts before accepting the memory savings.",
  };
}

export function buildModelEditorial(modelData) {
  const modelId = modelData?.modelId || modelData?.metadata?.modelId || modelData?.rawData?.metadata?.id || "unknown/model";
  const [author = "unknown", name = modelId] = modelId.split("/");
  const family = getModelFamily(modelId);
  const familyGuidance = getFamilyGuidance(family);
  const config = modelData?.config || {};
  const vram = modelData?.vramEstimates || {};
  const license = modelData?.licenseInfo?.name || modelData?.rawData?.metadata?.cardData?.license || "not clearly declared";
  const context = config.max_position_embeddings ? `${Number(config.max_position_embeddings).toLocaleString()} tokens` : "not published in the config";
  const architecture = config.model_type || config.architectures?.[0] || modelData?.architectureLabel || family;
  const hasMoe = Boolean(config.num_experts);
  const moeText = hasMoe
    ? `The config indicates a mixture-of-experts layout with ${config.num_experts} experts${config.num_experts_per_tok ? ` and ${config.num_experts_per_tok} active experts per token` : ""}.`
    : "The available config does not expose a mixture-of-experts layout, so it should be treated as dense unless the model card says otherwise.";
  const fp16 = formatGb(vram.fp16);
  const int8 = formatGb(vram.int8);
  const int4 = formatGb(vram.int4);
  const downloads = formatNumber(modelData?.downloads);
  const likes = formatNumber(modelData?.likes);

  return {
    modelId,
    name,
    author,
    family,
    indexable: isModelIndexable(modelId),
    title: `${modelId} deployment and hardware guide`,
    summary: `${familyGuidance.overview} On InnoAI, this page focuses on practical deployment questions: what the model is for, what the config implies, how much VRAM to budget, and when quantization or alternative models should be considered.`,
    architecture: `The detected architecture is ${titleCase(architecture)}. The public config reports ${config.num_hidden_layers || "an unknown number of"} layers, ${config.num_attention_heads || "an unknown number of"} attention heads, ${config.num_key_value_heads || "an unknown number of"} key-value heads, and a context window of ${context}. ${moeText}`,
    hardware: `For memory planning, use ${fp16} as the FP16/BF16 reference estimate, ${int8} for 8-bit inference, and ${int4} for 4-bit inference. These are planning numbers, not a replacement for profiling; KV cache, batch size, sequence length, tensor parallelism, and runtime overhead can move real usage above the weight-only estimate.`,
    deployment: `${familyGuidance.deployment} A single consumer GPU is usually practical only when the final precision and KV cache fit with safety margin. If the FP16 estimate exceeds the GPU by more than a small margin, plan for quantization, CPU offload, or tensor parallel serving.`,
    quantization: `${familyGuidance.quantization} GGUF is best for llama.cpp and local desktop workflows, AWQ is common for efficient GPU serving, and GPTQ remains useful when prebuilt kernels and model availability match your stack.`,
    comparison: `${modelId} should be compared against nearby models in the same family and against adjacent open families. Good comparison candidates include DeepSeek R1 for reasoning-heavy workloads, Qwen 3 for multilingual and coding breadth, Gemma 3 for compact deployment, and Llama-family models for broad ecosystem support.`,
    trust: `Public Hugging Face signals show ${downloads} downloads and ${likes} likes at the time this page was generated. The license is reported as ${license}. Always confirm the upstream model card before commercial deployment, because license tags and usage restrictions can change.`,
  };
}

export function buildModelSchemas(editorial, modelData) {
  const pageUrl = absoluteUrl(modelPath(editorial.modelId));
  const updated = modelData?.lastModified || modelData?.rawData?.metadata?.lastModified || modelData?.rawData?.fetchedAt || new Date().toISOString();
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: editorial.title,
    description: editorial.summary,
    dateModified: new Date(updated).toISOString(),
    author: {
      "@type": "Person",
      name: "Dhiraj",
      url: absoluteUrl("/authors/dhiraj"),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    mainEntityOfPage: pageUrl,
    about: editorial.family,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Models", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 3, name: editorial.modelId, item: pageUrl },
    ],
  };

  return [articleSchema, breadcrumbSchema];
}
