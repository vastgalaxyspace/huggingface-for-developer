import { parseModelSize } from "./modelUtils";

const PRECISION_PRESETS = [
  { name: "fp16", bytes: 2, label: "fp16 (default)", impact: "No loss (baseline)" },
  { name: "int8", bytes: 1, label: "INT8 (bitsandbytes)", impact: "Minimal quality loss. Recommended for production." },
  { name: "int4", bytes: 0.5, label: "INT4 / GPTQ / AWQ", impact: "Small quality loss. Good for local inference." },
  { name: "q4_km", bytes: 0.45, label: "Q4_K_M (GGUF)", impact: "Similar to int4. Best GGUF option for quality/size." },
  { name: "q3_km", bytes: 0.375, label: "Q3_K_M (GGUF)", impact: "Noticeable quality degradation. Use only if VRAM-constrained." },
  { name: "q2_k", bytes: 0.25, label: "Q2_K (GGUF)", impact: "Significant loss. Last resort only." },
];

function safeLower(value) {
  return String(value || "").toLowerCase();
}

function formatParamCount(raw) {
  const billions = raw / 1e9;
  if (billions >= 1000) return `${(billions / 1000).toFixed(2)}T`;
  if (billions >= 1) return `${billions.toFixed(2)}B`;
  return `${(raw / 1e6).toFixed(0)}M`;
}

function prettifyWords(value) {
  return String(value || "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function detectPrecision(tags, metadata, config) {
  const normalizedTags = tags.map(safeLower);
  const siblingNames = (metadata?.siblings ?? []).map((file) => safeLower(file.rfilename || file.path || ""));

  const ggufFilename = siblingNames.find((name) => name.includes("q4_k_m") || name.includes("q3_k_m") || name.includes("q2_k") || name.includes("q8") || name.includes("q4") || name.includes("q2"));

  if (normalizedTags.includes("gguf") || safeLower(metadata?.library_name) === "gguf") {
    if (ggufFilename?.includes("q2_k")) return { key: "q2_k", label: "Q2_K", bytes: 0.25, current_precision: "Q2_K (GGUF)" };
    if (ggufFilename?.includes("q3_k_m")) return { key: "q3_km", label: "Q3_K_M", bytes: 0.375, current_precision: "Q3_K_M (GGUF)" };
    if (ggufFilename?.includes("q4_k_m")) return { key: "q4_km", label: "Q4_K_M", bytes: 0.45, current_precision: "Q4_K_M (GGUF)" };
    if (ggufFilename?.includes("q8")) return { key: "int8", label: "INT8", bytes: 1, current_precision: "Q8 / GGUF" };
    return { key: "q4_km", label: "Q4", bytes: 0.5, current_precision: "Q4 / GGUF" };
  }

  if (normalizedTags.some((tag) => tag.includes("gptq") || tag.includes("awq"))) {
    return { key: "int4", label: "INT4", bytes: 0.5, current_precision: "INT4 / GPTQ / AWQ" };
  }

  if (normalizedTags.some((tag) => tag.includes("bnb") || tag.includes("bitsandbytes"))) {
    return { key: "int8", label: "INT8", bytes: 1, current_precision: "INT8 / bitsandbytes" };
  }

  if (config?.quantization_config) {
    return { key: "int4", label: "Quantized", bytes: 0.5, current_precision: "Quantized" };
  }

  return { key: "fp16", label: "FP16", bytes: 2, current_precision: "fp16" };
}

function detectContext(metadata) {
  const pipelineTag = safeLower(metadata?.pipeline_tag);
  const libraryName = safeLower(metadata?.library_name);

  if (pipelineTag === "text-generation" || pipelineTag === "text2text-generation") return "llm";
  if (pipelineTag === "text-to-image" || pipelineTag === "image-to-image") return "diffusion";
  if (pipelineTag.includes("speech")) return "audio";
  if (pipelineTag.includes("feature")) return "embedding";
  if (libraryName === "diffusers") return "diffusion";
  return "llm";
}

function getTaskLabel(metadata) {
  const pipelineTag = metadata?.pipeline_tag;
  return pipelineTag ? prettifyWords(pipelineTag) : "Text Generation";
}

function getArchitectureLabel(modelType, modelId) {
  const normalized = safeLower(modelType);
  if (normalized.includes("llama")) return "LLaMA 3";
  if (normalized.includes("mistral")) return "Mistral";
  if (normalized.includes("mixtral")) return "Mixtral";
  if (normalized.includes("qwen")) return "Qwen";
  if (normalized.includes("gemma")) return "Gemma";
  if (normalized.includes("phi")) return "Phi";
  if (normalized.includes("whisper")) return "Whisper";
  if (normalized.includes("flux")) return "FLUX";
  if (safeLower(modelId).includes("mixtral")) return "Mixtral";
  return prettifyWords(modelType || "Unknown");
}

function inferParamCount(metadata, modelId) {
  const fromSafetensors = metadata?.safetensors?.total;
  if (typeof fromSafetensors === "number" && fromSafetensors > 0) {
    return { raw: fromSafetensors, source: "safetensors.total", estimated: false };
  }

  const parsed = parseModelSize(modelId);
  if (parsed?.endsWith("B")) {
    return { raw: Number.parseFloat(parsed) * 1e9, source: "model_id_estimate", estimated: true };
  }
  if (parsed?.endsWith("M")) {
    return { raw: Number.parseFloat(parsed) * 1e6, source: "model_id_estimate", estimated: true };
  }

  return { raw: 7e9, source: "fallback_default", estimated: true };
}

function calculateKvCache({ config, bytesPerParam, sequenceLength, batchSize }) {
  if (!config) return 0;
  const layers = Number(config.num_hidden_layers || 0);
  const attnHeads = Number(config.num_attention_heads || 0);
  const kvHeads = Number(config.num_key_value_heads || attnHeads || 0);
  const hiddenDim = Number(config.hidden_size || 0);
  if (!layers || !attnHeads || !kvHeads || !hiddenDim) return 0;

  return (
    2 *
    kvHeads *
    (hiddenDim / attnHeads) *
    layers *
    sequenceLength *
    batchSize *
    bytesPerParam
  ) / 1e9;
}

export function detectModelProfile({ modelId, metadata, config, configAvailable, overrides = {} }) {
  const tags = metadata?.tags ?? [];
  const paramInfo = inferParamCount(metadata, modelId);
  const modelType = config?.model_type || metadata?.config?.model_type || "";
  const precision = detectPrecision(tags, metadata, config);
  const contextLength = Number(config?.max_position_embeddings || 2048);
  const detectedContext = detectContext(metadata);
  const isQuantized = precision.key !== "fp16";
  const isMoe = safeLower(modelType).includes("moe") || safeLower(modelId).includes("mixtral");
  const activeParams = isMoe ? paramInfo.raw * (2 / 8) : paramInfo.raw;
  const bytesPerParam = overrides.bytesPerParam ?? precision.bytes;
  const sequenceLength = overrides.sequenceLength ?? 2048;
  const batchSize = overrides.batchSize ?? 1;
  const kvCacheVram = calculateKvCache({ config, bytesPerParam, sequenceLength, batchSize });

  const baseVramInference = (activeParams * bytesPerParam) / 1e9 * 1.15;
  const baseVramFinetune = (activeParams * bytesPerParam) / 1e9 * 1.6;
  const baseVramTraining = (activeParams * bytesPerParam) / 1e9 * 4.0;

  const longContext = contextLength > 100000 ? "very_long" : contextLength > 32768;
  const libraryName = metadata?.library_name || "transformers";
  const canTrain = !(isQuantized || safeLower(libraryName) === "gguf");
  const supportsAppleMps =
    safeLower(libraryName) === "gguf" ||
    safeLower(libraryName) === "mlx" ||
    (isQuantized && ["llama", "mistral", "phi"].includes(safeLower(modelType)));

  return {
    model_id: modelId,
    model_url: `https://huggingface.co/${modelId}`,
    param_count: paramInfo.raw,
    param_count_display: formatParamCount(paramInfo.raw),
    param_source: paramInfo.source,
    param_estimated: paramInfo.estimated,
    detected_task: metadata?.pipeline_tag || "text-generation",
    task_label: getTaskLabel(metadata),
    detected_context: detectedContext,
    library_name: libraryName,
    license: metadata?.cardData?.license || "Unknown",
    architecture: getArchitectureLabel(modelType, modelId),
    model_type: modelType || "unknown",
    layers: config?.num_hidden_layers ?? null,
    attn_heads: config?.num_attention_heads ?? null,
    kv_heads: config?.num_key_value_heads ?? null,
    hidden_dim: config?.hidden_size ?? null,
    context_length: contextLength,
    config_available: configAvailable,
    detected_precision: precision.label.toLowerCase(),
    precision_key: precision.key,
    precision_bytes: bytesPerParam,
    current_precision: precision.current_precision,
    is_quantized: isQuantized,
    is_moe: isMoe,
    active_params: activeParams,
    active_params_display: formatParamCount(activeParams),
    long_context: longContext,
    can_train: canTrain,
    supports_apple_mps: supportsAppleMps,
    sequence_length: sequenceLength,
    batch_size: batchSize,
    kv_cache_vram_gb: kvCacheVram,
    total_vram_inference: baseVramInference + kvCacheVram,
    total_vram_finetune: baseVramFinetune + kvCacheVram,
    total_vram_training: baseVramTraining + kvCacheVram,
    warnings: [],
  };
}

export function buildQuantizationAlternatives(profile, gpus) {
  const fp16Vram = (profile.active_params * 2) / 1e9 * 1.15;

  return PRECISION_PRESETS.map((preset) => {
    const vramGb = (profile.active_params * preset.bytes) / 1e9 * 1.15;
    const cheapestGpu = [...gpus]
      .filter((gpu) => gpu.vram_gb >= vramGb)
      .sort((a, b) => a.price_usd_approx - b.price_usd_approx)[0] ?? null;

    return {
      precision: preset.name,
      label: preset.label,
      vram_gb: Number(vramGb.toFixed(1)),
      cheapest_gpu: cheapestGpu,
      savings_vs_fp16: Number((fp16Vram - vramGb).toFixed(1)),
      quality_impact: preset.impact,
    };
  });
}
