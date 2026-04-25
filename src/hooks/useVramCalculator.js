"use client";

import { useCallback, useMemo, useState } from "react";
import { BYTES_PER_GB, POPULAR_MODELS, clamp, getBytesPerParam } from "../components/vram/utils";

const DEFAULT_MANUAL_CONFIG = {
  parameters: "",
  layers: "",
  attentionHeads: "",
  kvHeads: "",
  hiddenSize: "",
  maxSequenceLength: ""
};

const DEFAULT_RUNTIME_CONFIG = {
  precision: "fp16",
  mode: "inference",
  sequenceLength: 2048,
  batchSize: 1,
  optimizer: "AdamW",
  gradientCheckpointing: false,
  mixedPrecisionAmp: true,
  numGpus: 1,
  parallelismStrategy: "Single GPU",
  includeFrameworkOverhead: true
};

function safeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function inferParametersFromText(...values) {
  const text = values.filter(Boolean).join(" ").toLowerCase();
  const match = text.match(/(?:^|[^a-z0-9])(\d+(?:\.\d+)?)\s*([btm])(?:[^a-z0-9]|$)/i);
  if (!match) return null;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return null;

  const unit = match[2].toLowerCase();
  if (unit === "t") return amount * 1e12;
  if (unit === "b") return amount * 1e9;
  if (unit === "m") return amount * 1e6;
  return null;
}

function detectPrecision({ tags, files, quantizationConfig }) {
  const normalizedTags = (tags || []).map((tag) => String(tag).toLowerCase());
  const filenames = (files || []).map((name) => String(name).toLowerCase());
  const joinedNames = filenames.join(" ");
  const quantString = JSON.stringify(quantizationConfig || {}).toLowerCase();

  if (normalizedTags.includes("gguf")) {
    if (joinedNames.includes("q4")) return "int4_gptq";
    if (joinedNames.includes("q8")) return "int8";
  }

  if (normalizedTags.includes("gptq") || quantString.includes("gptq")) return "int4_gptq";
  if (normalizedTags.includes("awq") || quantString.includes("awq")) return "int4_awq";
  if (normalizedTags.includes("bnb") || quantString.includes("bitsandbytes")) return "int8";
  return "fp16";
}

function parseModelPayload(metadata, config) {
  const tags = metadata?.tags || [];
  const files = (metadata?.siblings || []).map((item) => item.rfilename || item.path || item);
  const modelId = metadata?.modelId || metadata?.id || null;
  const inferredParameters = inferParametersFromText(
    modelId,
    metadata?.id,
    metadata?.cardData?.base_model,
    metadata?.cardData?.model_name
  );
  const parameters =
    safeNumber(metadata?.safetensors?.total) ??
    safeNumber(metadata?.cardData?.model_params) ??
    safeNumber(metadata?.cardData?.parameters) ??
    safeNumber(metadata?.transformersInfo?.num_parameters) ??
    inferredParameters;
  const numAttentionHeads = safeNumber(config?.num_attention_heads ?? config?.n_head);
  const hiddenSize = safeNumber(config?.hidden_size ?? config?.d_model ?? config?.n_embd);
  const numLayers = safeNumber(config?.num_hidden_layers ?? config?.n_layer ?? config?.num_layers);
  const numKvHeads = safeNumber(config?.num_key_value_heads) ?? numAttentionHeads;
  const maxSequenceLength = safeNumber(
    config?.max_position_embeddings ??
      config?.max_sequence_length ??
      config?.seq_length ??
      config?.model_max_length
  );
  const headDim = hiddenSize && numAttentionHeads ? hiddenSize / numAttentionHeads : null;
  const precision = detectPrecision({
    tags,
    files,
    quantizationConfig: config?.quantization_config
  });

  return {
    modelId,
    parameters,
    tags,
    library: metadata?.library_name || (tags.includes("gguf") ? "gguf" : "transformers"),
    architecture: config?.model_type || "unknown",
    configAvailable: Boolean(config),
    layers: numLayers,
    attentionHeads: numAttentionHeads,
    kvHeads: numKvHeads,
    hiddenSize,
    headDim,
    maxSequenceLength,
    precision,
    quantizationConfig: config?.quantization_config || null,
    missingConfigFields: {
      parameters: !parameters,
      layers: !numLayers,
      attentionHeads: !numAttentionHeads,
      hiddenSize: !hiddenSize,
      kvHeads: !numKvHeads
    }
  };
}

function buildWarnings({ breakdown, runtime, resolvedModel }) {
  if (!breakdown || !resolvedModel) {
    return [];
  }

  const warnings = [];
  const kvPercent = breakdown.total > 0 ? (breakdown.kv_cache / breakdown.total) * 100 : 0;

  if (breakdown.kv_cache > 0 && kvPercent > 30) {
    warnings.push(
      `KV Cache is ${breakdown.kv_cache.toFixed(2)} GB (${kvPercent.toFixed(1)}% of total). Consider reducing context length or using sliding window attention.`
    );
  }

  if (runtime.sequenceLength > 16384) {
    warnings.push("Long context detected. KV cache grows linearly with sequence length.");
  }

  if (runtime.mode === "training" && !runtime.gradientCheckpointing && (resolvedModel.parameters || 0) > 20e9) {
    warnings.push("Enable Gradient Checkpointing to reduce activation memory by ~4x.");
  }

  if (runtime.numGpus === 1 && breakdown.total > 80) {
    const minimumCount = Math.ceil(breakdown.total / 80);
    warnings.push(
      `This model requires multi-GPU setup. Minimum ${minimumCount}x A100 80GB or ${minimumCount}x H100 recommended.`
    );
  }

  if (runtime.mode === "training" && (runtime.precision.includes("int4") || runtime.precision.startsWith("q"))) {
    warnings.push("Quantized models (INT4) cannot be trained directly. Use QLoRA / PEFT for fine-tuning quantized models.");
  }

  return warnings;
}

export function useVramCalculator() {
  const [inputValue, setInputValue] = useState(POPULAR_MODELS[1]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modelData, setModelData] = useState(null);
  const [manualConfig, setManualConfig] = useState(DEFAULT_MANUAL_CONFIG);
  const [runtimeConfig, setRuntimeConfig] = useState(DEFAULT_RUNTIME_CONFIG);

  const updateRuntimeConfig = (field, value) => {
    setRuntimeConfig((current) => ({ ...current, [field]: value }));
  };

  const updateManualConfig = (field, value) => {
    setManualConfig((current) => ({ ...current, [field]: value }));
  };

  const searchModel = useCallback(async (rawModelId) => {
    const modelId = rawModelId.trim();

    if (!modelId) {
      setError("Enter a Hugging Face model ID to calculate VRAM.");
      setModelData(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const metadataResponse = await fetch(`/api/hf-model?modelId=${encodeURIComponent(modelId)}`);

      if (!metadataResponse.ok) {
        throw new Error("Model not found on Hugging Face.");
      }

      const payload = await metadataResponse.json();
      const metadata = payload.metadata;
      const config = payload.config;

      if (!metadata?.modelId && !metadata?.id) {
        throw new Error("The selected model could not be validated.");
      }

      const parsed = parseModelPayload(metadata, config);
      const maxSequenceLength = parsed.maxSequenceLength || 32768;

      setModelData(parsed);
      setManualConfig({
        parameters: parsed.parameters ? String(parsed.parameters) : "",
        layers: parsed.layers ? String(parsed.layers) : "",
        attentionHeads: parsed.attentionHeads ? String(parsed.attentionHeads) : "",
        kvHeads: parsed.kvHeads ? String(parsed.kvHeads) : "",
        hiddenSize: parsed.hiddenSize ? String(parsed.hiddenSize) : "",
        maxSequenceLength: parsed.maxSequenceLength ? String(parsed.maxSequenceLength) : ""
      });
      setRuntimeConfig((current) => ({
        ...current,
        precision: parsed.precision,
        sequenceLength: clamp(current.sequenceLength, 512, maxSequenceLength)
      }));
      setInputValue(modelId);
    } catch (fetchError) {
      setError(fetchError.message || "Unable to fetch model data from Hugging Face.");
      setModelData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const resolvedModel = useMemo(() => {
    if (!modelData) {
      return null;
    }

    const parameters = safeNumber(manualConfig.parameters) ?? modelData.parameters;
    const layers = safeNumber(manualConfig.layers) ?? modelData.layers;
    const attentionHeads = safeNumber(manualConfig.attentionHeads) ?? modelData.attentionHeads;
    const kvHeads = safeNumber(manualConfig.kvHeads) ?? modelData.kvHeads ?? attentionHeads;
    const hiddenSize = safeNumber(manualConfig.hiddenSize) ?? modelData.hiddenSize;
    const maxSequenceLength = safeNumber(manualConfig.maxSequenceLength) ?? modelData.maxSequenceLength ?? 32768;
    const headDim = hiddenSize && attentionHeads ? hiddenSize / attentionHeads : modelData.headDim;

    return {
      ...modelData,
      parameters,
      layers,
      attentionHeads,
      kvHeads,
      hiddenSize,
      maxSequenceLength,
      headDim
    };
  }, [manualConfig, modelData]);

  const breakdown = useMemo(() => {
    if (!resolvedModel) {
      return null;
    }

    const { parameters, layers, attentionHeads, kvHeads, hiddenSize, headDim } = resolvedModel;
    if (!parameters || !layers || !attentionHeads || !hiddenSize || !headDim) {
      return null;
    }

    const bytesPerParam = getBytesPerParam(runtimeConfig.precision);
    const isParallel =
      runtimeConfig.parallelismStrategy === "Tensor Parallel" ||
      runtimeConfig.parallelismStrategy === "Pipeline Parallel";
    const divisor = isParallel ? runtimeConfig.numGpus : 1;

    const totalWeightVram = (parameters * bytesPerParam) / BYTES_PER_GB;
    const weightVram = totalWeightVram / divisor;
    const totalKvVram =
      (2 * kvHeads * headDim * layers * runtimeConfig.sequenceLength * runtimeConfig.batchSize * bytesPerParam) /
      BYTES_PER_GB;
    const kvVram = totalKvVram / divisor;

    let activationVram = 0;
    if (runtimeConfig.mode === "inference") {
      activationVram =
        (runtimeConfig.batchSize * runtimeConfig.sequenceLength * hiddenSize * bytesPerParam * 2) / BYTES_PER_GB;
    } else if (runtimeConfig.gradientCheckpointing) {
      activationVram =
        (runtimeConfig.batchSize * runtimeConfig.sequenceLength * hiddenSize * Math.sqrt(layers) * bytesPerParam * 2) /
        BYTES_PER_GB;
    } else {
      activationVram =
        (runtimeConfig.batchSize * runtimeConfig.sequenceLength * hiddenSize * layers * bytesPerParam * 2) /
        BYTES_PER_GB;
    }

    let optimizerVram = 0;
    let gradientVram = 0;

    if (runtimeConfig.mode === "training") {
      gradientVram = weightVram;
      const optimizerBaseWeight = runtimeConfig.mixedPrecisionAmp ? (parameters * 4) / BYTES_PER_GB / divisor : weightVram;

      if (runtimeConfig.optimizer === "AdamW") optimizerVram = optimizerBaseWeight * 2;
      else if (runtimeConfig.optimizer === "AdamW 8-bit") optimizerVram = optimizerBaseWeight * 0.5;
      else optimizerVram = optimizerBaseWeight;
    }

    const subtotal = weightVram + kvVram + activationVram + optimizerVram + gradientVram;
    const overhead = runtimeConfig.includeFrameworkOverhead ? Math.max(1, subtotal * 0.12) : 0;
    const total = subtotal + overhead;
    const perGpu = runtimeConfig.parallelismStrategy === "Data Parallel" ? total : total / runtimeConfig.numGpus;

    return {
      weights: weightVram,
      kv_cache: kvVram,
      activations: activationVram,
      optimizer: optimizerVram,
      gradients: gradientVram,
      overhead,
      total,
      per_gpu: perGpu
    };
  }, [resolvedModel, runtimeConfig]);

  const warnings = useMemo(
    () => buildWarnings({ breakdown, runtime: runtimeConfig, resolvedModel }),
    [breakdown, resolvedModel, runtimeConfig]
  );

  return {
    inputValue,
    setInputValue,
    loading,
    error,
    modelData,
    resolvedModel,
    manualConfig,
    runtimeConfig,
    breakdown,
    warnings,
    searchModel,
    updateRuntimeConfig,
    updateManualConfig
  };
}

