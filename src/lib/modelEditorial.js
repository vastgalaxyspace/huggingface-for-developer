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

// Rough parameter count (in billions) from safetensors metadata or the VRAM estimate.
function getParamsB(modelData) {
  const st = Number(modelData?.rawData?.metadata?.safetensors?.total || modelData?.safetensors?.total || 0);
  if (st > 0) return st / 1e9;
  const totalParams = Number(modelData?.vramEstimates?.totalParams || 0);
  return totalParams > 0 ? totalParams : 0;
}

function sizeClass(paramsB) {
  if (paramsB <= 0) return { tier: "unspecified", line: "The parameter count is not published in machine-readable metadata, so size-based guidance below is approximate." };
  if (paramsB < 4) return { tier: "small", line: `At roughly ${paramsB.toFixed(1)}B parameters this is a small model that runs on a single consumer GPU and is a strong fit for local assistants, on-device features, classification, and extraction.` };
  if (paramsB < 15) return { tier: "mid", line: `At roughly ${paramsB.toFixed(0)}B parameters this is a mid-sized model that balances quality and cost, running on a single 16–24 GB GPU in FP16 or comfortably in 4-bit on smaller cards.` };
  if (paramsB < 40) return { tier: "large", line: `At roughly ${paramsB.toFixed(0)}B parameters this is a large model: expect a 24–48 GB GPU in quantized form, or a data-center card for FP16 serving.` };
  return { tier: "frontier", line: `At roughly ${paramsB.toFixed(0)}B parameters this is a frontier-scale model that needs an 80 GB GPU even in 4-bit, or multiple GPUs with tensor parallelism for higher precision.` };
}

function contextClass(tokens) {
  if (!tokens) return "The context window is not published in the config, so confirm it on the model card before relying on long-context behavior.";
  if (tokens <= 8192) return `Its ${tokens.toLocaleString()}-token context suits chat, extraction, and short-document tasks; for long documents you would chunk input or use retrieval.`;
  if (tokens <= 32768) return `Its ${tokens.toLocaleString()}-token context comfortably handles long documents and multi-turn conversations, though the KV cache grows with every token you actually use.`;
  return `Its ${tokens.toLocaleString()}-token context enables long-document and repository-scale workloads, but note that filling that window makes the KV cache the dominant memory cost — often larger than the weights.`;
}

export function buildModelEditorial(modelData) {
  const modelId = modelData?.modelId || modelData?.metadata?.modelId || modelData?.rawData?.metadata?.id || "unknown/model";
  const [author = "unknown", name = modelId] = modelId.split("/");
  const family = getModelFamily(modelId);
  const familyGuidance = getFamilyGuidance(family);
  const config = modelData?.config || {};
  const vram = modelData?.vramEstimates || {};
  const license = modelData?.licenseInfo?.name || modelData?.rawData?.metadata?.cardData?.license || "not clearly declared";
  const tokens = config.max_position_embeddings ? Number(config.max_position_embeddings) : 0;
  const context = tokens ? `${tokens.toLocaleString()} tokens` : "not published in the config";
  const architecture = config.model_type || config.architectures?.[0] || modelData?.architectureLabel || family;
  const hasMoe = Boolean(config.num_experts);
  const moeText = hasMoe
    ? `The config indicates a mixture-of-experts layout with ${config.num_experts} experts${config.num_experts_per_tok ? ` and ${config.num_experts_per_tok} active experts per token` : ""}, so all experts occupy memory even though only a few are active per token.`
    : "The config describes a dense transformer rather than a mixture-of-experts, so every parameter is active on every token.";

  // Derived, model-specific characteristics so the prose genuinely differs per model.
  const paramsB = getParamsB(modelData);
  const size = sizeClass(paramsB);
  const ctxLine = contextClass(tokens);
  const heads = Number(config.num_attention_heads || 0);
  const kvHeads = Number(config.num_key_value_heads || heads);
  const attentionType =
    heads && kvHeads && kvHeads < heads
      ? `It uses grouped-query attention (${heads} attention heads sharing ${kvHeads} key-value heads), which shrinks the KV cache substantially versus full multi-head attention and helps long-context serving.`
      : heads
        ? `It uses standard multi-head attention (${heads} heads), so the KV cache scales with the full head count — a factor to watch at long context.`
        : "The attention head configuration is not fully described in the public config.";

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
    summary: `${familyGuidance.overview} ${size.line} This page covers what ${name} is for, what its architecture implies for memory, how much VRAM to budget across precisions, and when quantization or an alternative model makes more sense.`,
    architecture: `The detected architecture is ${titleCase(architecture)}, reporting ${config.num_hidden_layers || "an unknown number of"} layers, ${heads || "an unknown number of"} attention heads, ${kvHeads || "an unknown number of"} key-value heads, and a context window of ${context}. ${attentionType} ${moeText}`,
    hardware: `Budget about ${fp16} for FP16/BF16, ${int8} for 8-bit, and ${int4} for 4-bit weights. ${ctxLine} These are weight-plus-overhead planning numbers; add the KV cache for your real context length, since it is stored in FP16 even when the weights are quantized.`,
    deployment: `${familyGuidance.deployment} For a ${size.tier === "unspecified" ? "model of this class" : `${size.tier}-tier model like this`}, a single consumer GPU is practical only when the chosen precision plus the KV cache fits with safety margin. If the FP16 estimate exceeds your GPU by more than a small margin, plan for quantization, CPU offload, or tensor-parallel serving before committing.`,
    quantization: `${familyGuidance.quantization} GGUF suits llama.cpp and local desktop workflows, AWQ is common for efficient GPU serving, and GPTQ remains useful when prebuilt kernels and model availability match your stack.${hasMoe ? " Mixture-of-experts models can be more sensitive to aggressive quantization of the router, so validate outputs after quantizing." : ""}`,
    comparison: `Compare ${name} against nearby sizes in the ${family} family and against adjacent open families before committing: DeepSeek R1 for reasoning-heavy workloads, Qwen for multilingual and coding breadth, Gemma for compact deployment, and Llama for the broadest ecosystem support. The right choice depends on whether your constraint is quality, latency, license, or GPU budget.`,
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
