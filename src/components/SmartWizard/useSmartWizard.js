"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

// ── Architecture family benchmark quality priors (0-100 scale) ──
const FAMILY_QUALITY = {
  llama: 88, mistral: 85, qwen: 86, phi: 78, gemma: 82,
  deepseek: 87, falcon: 72, yi: 80, internlm: 79, command: 83,
  whisper: 90, "stable-diffusion": 85, flux: 88, code: 82, unknown: 60,
};

// Code-task architecture affinity multiplier
const CODE_AFFINITY = { deepseek: 1.2, code: 1.25, qwen: 1.1, phi: 1.05, llama: 1.05 };
const CHAT_AFFINITY = { llama: 1.15, mistral: 1.12, qwen: 1.1, command: 1.15, gemma: 1.05 };

const INITIAL_STATE = {
  current_step: 1,
  completed_steps: [],
  task: {
    category: "nlp",
    primary_task: null,
    use_case: null,
    task_label: null,
    language: null,
    context_length: null,
    task_specific: {},
  },
  compute: {
    hardware_type: null,
    gpu_model: null,
    vram_gb: 24,
    ram_gb: 32,
    latency_target_ms: null,
    throughput_rps: null,
    cost_per_hour: null,
    batch_size: 1,
    allow_quantization: true,
    multi_gpu: false,
    num_gpus: 1,
  },
  metrics: {
    accuracy: 70,
    speed: 50,
    model_size: 50,
    cost: 50,
    deployment: 60,
    license: "any",
    min_quality: 0,
    needs_finetuning: false,
    quantization_ok: true,
  },
  results: {
    loading: false,
    models: [],
    error: null,
    total_searched: 0,
    filters_applied: [],
  },
};

// ── Parameter extraction ──
function estimateParamsFromName(modelId) {
  const match = modelId?.match(/(\d+(?:\.\d+)?)\s*(b|m)/i);
  if (!match) return null;
  const value = Number(match[1]);
  return match[2].toLowerCase() === "b" ? value * 1e9 : value * 1e6;
}

function getParamsBillions(model) {
  const raw = model.paramCount || model.meta?.safetensors?.total || estimateParamsFromName(model.modelId);
  if (!raw) return null;
  return raw >= 1e6 ? raw / 1e9 : raw; // handle if already in billions
}

// ── VRAM estimation ──
function estimateVRAM(paramsB, quantization) {
  if (!paramsB) return null;
  const bytesPerParam = quantization === "int4" ? 0.5 : quantization === "int8" ? 1 : 2;
  const overhead = 1.2; // KV cache + framework overhead
  return paramsB * bytesPerParam * overhead;
}

// ── License normalization ──
function normalizeLicense(model) {
  const license =
    model.cardData?.license ||
    model.meta?.cardData?.license ||
    model.license ||
    model.meta?.license ||
    "Unknown";
  return String(license).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Language detection ──
function languageLabel(model) {
  const tags = [...(model.tags || []), ...(model.meta?.tags || [])];
  if (tags.includes("multilingual") || model.capabilities?.isMultilingual) return "Multilingual";
  if (tags.includes("en")) return "English";
  return null;
}

// ── Context length parsing ──
function getContextLength(model) {
  if (model.config?.max_position_embeddings) return model.config.max_position_embeddings;
  if (model.config?.n_positions) return model.config.n_positions;
  if (model.config?.max_seq_len) return model.config.max_seq_len;
  if (model.config?.sliding_window) return model.config.sliding_window;
  return null;
}

// ── User context length requirement to numeric ──
function parseContextRequirement(contextStr) {
  if (!contextStr) return 0;
  if (contextStr === "<4k") return 2048;
  if (contextStr === "4k-32k") return 8192;
  if (contextStr === "32k-128k") return 65536;
  if (contextStr === "128k+") return 131072;
  return 0;
}

// ── Recency score (0-1) ──
function getRecencyScore(lastModified) {
  if (!lastModified) return 0;
  const diff = Date.now() - new Date(lastModified).getTime();
  const oneMonth = 1000 * 60 * 60 * 24 * 30;
  if (diff <= oneMonth) return 1.0;
  if (diff <= oneMonth * 3) return 0.8;
  if (diff <= oneMonth * 6) return 0.5;
  if (diff <= oneMonth * 12) return 0.3;
  return 0.1;
}

// ── Community trust (0-1) ──
function getCommunityTrust(model, maxDownloads) {
  const downloads = model.downloads || 0;
  const likes = model.likes || 0;
  const hasCard = model.capabilities?.hasModelCard || false;

  const downloadScore = Math.min(downloads / Math.max(maxDownloads, 1), 1);
  const likeScore = Math.min(likes / 500, 1); // normalize to 500 likes = 1.0
  const cardBonus = hasCard ? 0.15 : 0;
  const recency = getRecencyScore(model.lastModified);

  return Math.min(downloadScore * 0.4 + likeScore * 0.25 + recency * 0.2 + cardBonus, 1);
}

// ── Non-linear VRAM penalization (smooth curve) ──
function vramFitScore(vramNeeded, availableVram) {
  if (!vramNeeded || !availableVram) return 0.5;
  const ratio = vramNeeded / availableVram;
  if (ratio <= 0.5) return 1.0;   // fits easily
  if (ratio <= 0.75) return 0.95;  // comfortable fit
  if (ratio <= 0.9) return 0.85;   // tight fit
  if (ratio <= 1.0) return 0.7;    // just fits
  if (ratio <= 1.1) return 0.4;    // slightly over — quantization might help
  if (ratio <= 1.3) return 0.15;   // needs quantization
  return 0;                         // way too large
}

// ── Context fit score (smooth curve) ──
function contextFitScore(modelContext, requiredContext) {
  if (!requiredContext || !modelContext) return 0.5;
  const ratio = modelContext / requiredContext;
  if (ratio >= 2.0) return 1.0;
  if (ratio >= 1.0) return 0.9;
  if (ratio >= 0.75) return 0.6;
  if (ratio >= 0.5) return 0.3;
  return 0.05;
}

// ── Task affinity score ──
function getTaskAffinity(model, task) {
  const caps = model.capabilities || {};
  const family = caps.family || "unknown";
  let affinity = 0.5;

  // Code tasks
  if (task.category === "code" || task.primary_task?.includes("code")) {
    if (caps.isCode) affinity = 0.95;
    else affinity *= (CODE_AFFINITY[family] || 1.0);
  }

  // Chat/conversational tasks
  if (["text-generation", "question-answering"].includes(task.primary_task)) {
    if (task.task_specific?.use_cases?.includes("chatbot")) {
      if (caps.isChat) affinity = Math.max(affinity, 0.9);
      else affinity *= (CHAT_AFFINITY[family] || 1.0);
    }
  }

  // RAG usage
  if (task.task_specific?.use_cases?.includes("rag")) {
    const ctx = getContextLength(model);
    if (ctx && ctx >= 32768) affinity = Math.max(affinity, 0.85);
  }

  // Instruct/chat tuned models are preferred for most tasks
  if (caps.isChat && task.primary_task === "text-generation") {
    affinity = Math.max(affinity, 0.75);
  }

  return Math.min(affinity, 1.0);
}

// ── Confidence level ──
function getConfidence(model) {
  let signals = 0;
  let total = 6;
  if (model.paramCount || model.meta?.safetensors?.total) signals++;
  if (model.config) signals++;
  if (model.capabilities?.hasModelCard) signals++;
  if (model.downloads > 100) signals++;
  if (model.lastModified) signals++;
  if (model.capabilities?.family !== "unknown") signals++;

  const ratio = signals / total;
  if (ratio >= 0.8) return { level: "high", label: "High", score: ratio };
  if (ratio >= 0.5) return { level: "medium", label: "Medium", score: ratio };
  return { level: "low", label: "Low", score: ratio };
}

// ══════════════════════════════════════════════════
// ═══  MAIN SCORING FUNCTION  ═══
// ══════════════════════════════════════════════════
function scoreModel(model, task, compute, metrics, batchStats) {
  const params_b = getParamsBillions(model);
  const family = model.capabilities?.family || "unknown";

  // Determine effective quantization
  const quantMode = (compute.allow_quantization || metrics.quantization_ok) ? "int8" : "fp16";
  const vram_fp16 = estimateVRAM(params_b, "fp16");
  const vram_effective = estimateVRAM(params_b, quantMode);

  const availableVram = (compute.vram_gb || 0) * (compute.multi_gpu ? compute.num_gpus : 1);

  // Hard disqualify: even with quantization, if > 2x VRAM, skip
  if (vram_effective && availableVram && vram_effective > availableVram * 2) {
    return {
      ...model,
      params_b,
      vram_needed: vram_fp16,
      vram_effective,
      fits_vram: false,
      license_label: normalizeLicense(model),
      language_label: languageLabel(model),
      total_score: 0,
      disqualified: "VRAM",
      confidence: getConfidence(model),
    };
  }

  const modelContext = getContextLength(model);
  const requiredContext = parseContextRequirement(task.context_length);

  // ── Sub-scores (all 0-100) ──

  // 1. QUALITY — architecture quality prior + param tier
  const familyBase = FAMILY_QUALITY[family] || 60;
  let qualityFromParams = 50;
  if (params_b) {
    if (params_b >= 65) qualityFromParams = 95;
    else if (params_b >= 30) qualityFromParams = 88;
    else if (params_b >= 13) qualityFromParams = 80;
    else if (params_b >= 7) qualityFromParams = 72;
    else if (params_b >= 3) qualityFromParams = 60;
    else if (params_b >= 1) qualityFromParams = 45;
    else qualityFromParams = 30;
  }
  const quality = Math.min(familyBase * 0.4 + qualityFromParams * 0.6, 100);

  // 2. SPEED — inverse of model size, with GQA bonus
  let speed = 50;
  if (params_b) {
    if (params_b <= 1) speed = 98;
    else if (params_b <= 3) speed = 90;
    else if (params_b <= 7) speed = 78;
    else if (params_b <= 13) speed = 62;
    else if (params_b <= 30) speed = 40;
    else if (params_b <= 70) speed = 20;
    else speed = 8;
  }
  const hasGQA = model.config?.num_key_value_heads && model.config.num_attention_heads &&
    model.config.num_key_value_heads < model.config.num_attention_heads;
  if (hasGQA) speed = Math.min(speed + 8, 100);

  // 3. COST — VRAM fit score mapped to 0-100
  const costScore = vramFitScore(vram_effective, availableVram) * 100;

  // 4. CONTEXT — how well model context matches requirement
  const contextScore = contextFitScore(modelContext, requiredContext) * 100;

  // 5. DEPLOYMENT — tooling, format, community trust
  const trust = getCommunityTrust(model, batchStats.maxDownloads);
  const caps = model.capabilities || {};
  let deployPoints = trust * 40; // max 40 from community
  if (caps.isTransformers) deployPoints += 15;
  if (caps.isGGUF) deployPoints += 12;
  if (caps.isSafetensors) deployPoints += 8;
  if (caps.hasModelCard) deployPoints += 10;
  if (!caps.isGated) deployPoints += 5;
  const recencyBonus = getRecencyScore(model.lastModified) * 10;
  const deployment = Math.min(deployPoints + recencyBonus, 100);

  // 6. TASK AFFINITY — how well the model matches the specific task
  const taskAffinity = getTaskAffinity(model, task) * 100;

  // ── Weighted combination ──
  const total_w = metrics.accuracy + metrics.speed + metrics.model_size + metrics.cost + metrics.deployment;
  const affinityWeight = 20; // always-on bonus

  const raw =
    (quality * (metrics.accuracy / (total_w + affinityWeight)) +
      speed * (metrics.speed / (total_w + affinityWeight)) +
      costScore * (metrics.cost / (total_w + affinityWeight)) +
      deployment * (metrics.deployment / (total_w + affinityWeight)) +
      taskAffinity * (affinityWeight / (total_w + affinityWeight)));

  // Context bonus (additive top-up if user specified context needs)
  const contextBonus = requiredContext > 0 ? contextScore * 0.08 : 0;

  const total_score = Math.min(raw + contextBonus, 100);

  const fits_vram = !vram_effective || !availableVram || vram_effective <= availableVram;

  return {
    ...model,
    params_b,
    vram_needed: vram_fp16,
    vram_effective,
    fits_vram,
    license_label: normalizeLicense(model),
    language_label: languageLabel(model),
    context_length: modelContext,
    sub_scores: {
      quality: Math.round(quality),
      speed: Math.round(speed),
      cost: Math.round(costScore),
      deployment: Math.round(deployment),
      task_fit: Math.round(taskAffinity),
    },
    total_score: Math.round(total_score),
    confidence: getConfidence(model),
    family,
  };
}

// ── Search params builder ──
function buildSearchParams(task, compute, metrics) {
  const params = new URLSearchParams({
    pipeline_tag: task.primary_task || "",
    sort: "downloads",
    direction: "-1",
    limit: "50",
  });

  const tags = [];
  if (task.language === "multilingual") tags.push("multilingual");
  if (compute.allow_quantization || metrics.quantization_ok) tags.push("gguf");
  if (metrics.license === "apache") tags.push("license:apache-2.0");
  if (metrics.license === "mit") tags.push("license:mit");
  if (metrics.license === "commercial_ok") tags.push("commercial-use");
  if (metrics.needs_finetuning) tags.push("peft");
  if (task.category === "code") tags.push("code");
  if (tags.length) params.set("filter", tags.join(","));

  // Add task-specific search hints
  if (task.category === "code") params.set("task_hint", "code");
  if (task.task_specific?.use_cases?.includes("chatbot")) params.set("task_hint", "chat");
  if (task.task_specific?.use_cases?.includes("rag")) params.set("task_hint", "instruct");

  return params;
}

// ══════════════════════════════════════════════════
// ═══  MAIN HOOK  ═══
// ══════════════════════════════════════════════════
export function useSmartWizard() {
  const [state, setState] = useState(INITIAL_STATE);
  const [direction, setDirection] = useState("forward");
  const [sortKey, setSortKey] = useState("best");

  const updateTask = useCallback((patch) => {
    setState((current) => ({
      ...current,
      task: { ...current.task, ...patch },
    }));
  }, []);

  const updateCompute = useCallback((patch) => {
    setState((current) => ({
      ...current,
      compute: { ...current.compute, ...patch },
    }));
  }, []);

  const updateMetrics = useCallback((patch) => {
    setState((current) => ({
      ...current,
      metrics: { ...current.metrics, ...patch },
    }));
  }, []);

  const canProceed = useCallback(() => {
    if (state.current_step === 1) return Boolean(state.task.primary_task);
    if (state.current_step === 2) {
      if (!state.compute.hardware_type) return false;
      if (state.compute.hardware_type !== "cpu" && !state.compute.gpu_model) return false;
      return true;
    }
    return true;
  }, [state]);

  const getValidationMessage = useCallback(() => {
    if (state.current_step === 1) return "Please select a task type to continue";
    if (state.current_step === 2) return "Please choose where this will run";
    return "";
  }, [state.current_step]);

  const goToStep = useCallback(
    (step) => {
      setDirection(step > state.current_step ? "forward" : "backward");
      setState((current) => ({ ...current, current_step: step }));
    },
    [state.current_step],
  );

  const prevStep = useCallback(() => {
    if (state.current_step === 1) return;
    setDirection("backward");
    setState((current) => ({ ...current, current_step: current.current_step - 1 }));
  }, [state.current_step]);

  // ── Fetch + score models ──
  const fetchModels = useCallback(async () => {
    const params = buildSearchParams(state.task, state.compute, state.metrics);

    setState((current) => ({
      ...current,
      results: { ...current.results, loading: true, error: null },
    }));

    try {
      let response = await fetch(`/api/smart-wizard?${params.toString()}`, { cache: "no-store" });
      let payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to reach HuggingFace API.");
      }

      // Fallback: remove filters if too few results
      if (!payload.models?.length && params.get("filter")) {
        params.delete("filter");
        response = await fetch(`/api/smart-wizard?${params.toString()}`, { cache: "no-store" });
        payload = await response.json();
      }

      const models = payload.models || [];

      const batchStats = models.reduce(
        (stats, model) => ({
          maxDownloads: Math.max(stats.maxDownloads, model.downloads || 0),
          maxParams: Math.max(
            stats.maxParams,
            model.paramCount || model.meta?.safetensors?.total || estimateParamsFromName(model.modelId) || 0,
          ),
        }),
        { maxDownloads: 0, maxParams: 0 },
      );

      const scored = models
        .map((model) => scoreModel(model, state.task, state.compute, state.metrics, batchStats))
        .filter((model) => model.total_score >= state.metrics.min_quality)
        .sort((a, b) => b.total_score - a.total_score)
        .slice(0, 10);

      setState((current) => ({
        ...current,
        results: {
          loading: false,
          error: null,
          models: scored,
          total_searched: payload.total || models.length,
          filters_applied: payload.filters || [],
        },
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        results: {
          ...current.results,
          loading: false,
          error: error.message || "Failed to fetch models.",
        },
      }));
    }
  }, [state.task, state.compute, state.metrics]);

  const nextStep = useCallback(() => {
    if (!canProceed()) return;
    const next = Math.min(state.current_step + 1, 4);
    setDirection("forward");
    setState((current) => ({
      ...current,
      current_step: next,
      completed_steps: current.completed_steps.includes(current.current_step)
        ? current.completed_steps
        : [...current.completed_steps, current.current_step],
    }));
  }, [canProceed, state.current_step]);

  const handleAdvance = useCallback(() => {
    nextStep();
  }, [nextStep]);

  useEffect(() => {
    if (
      state.current_step === 4 &&
      !state.results.loading &&
      !state.results.models.length &&
      !state.results.error
    ) {
      fetchModels();
    }
  }, [fetchModels, state.current_step, state.results.error, state.results.loading, state.results.models.length]);

  const sortedModels = useMemo(() => {
    const items = [...state.results.models];
    if (sortKey === "downloads") return items.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    if (sortKey === "smallest") return items.sort((a, b) => (a.params_b || Infinity) - (b.params_b || Infinity));
    if (sortKey === "fastest") return items.sort((a, b) => (b.sub_scores?.speed || 0) - (a.sub_scores?.speed || 0));
    if (sortKey === "quality") return items.sort((a, b) => (b.sub_scores?.quality || 0) - (a.sub_scores?.quality || 0));
    return items.sort((a, b) => b.total_score - a.total_score);
  }, [sortKey, state.results.models]);

  const topPriorityLabel = useMemo(() => {
    const labels = {
      accuracy: "Accuracy",
      speed: "Speed",
      model_size: "Model Size",
      cost: "Cost",
      deployment: "Deployment",
    };
    return Object.entries(labels).sort((a, b) => state.metrics[b[0]] - state.metrics[a[0]])[0][1];
  }, [state.metrics]);

  const startOver = useCallback(() => {
    setDirection("backward");
    setSortKey("best");
    setState(INITIAL_STATE);
  }, []);

  const exportResults = useCallback(() => {
    if (!state.results.models.length) return;
    const payload = state.results.models.map((model, index) => ({
      rank: index + 1,
      modelId: model.modelId,
      totalScore: Math.round(model.total_score),
      paramsB: model.params_b,
      vramNeeded: model.vram_needed,
      vramEffective: model.vram_effective,
      downloads: model.downloads,
      license: model.license_label,
      confidence: model.confidence?.label,
      family: model.family,
      subScores: model.sub_scores,
    }));

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "smart-wizard-results.json";
    link.click();
    URL.revokeObjectURL(url);
  }, [state.results.models]);

  return {
    state,
    direction,
    sortKey,
    setSortKey,
    updateTask,
    updateCompute,
    updateMetrics,
    goToStep,
    prevStep,
    canProceed,
    getValidationMessage,
    handleAdvance,
    fetchModels,
    sortedModels,
    topPriorityLabel,
    startOver,
    exportResults,
  };
}
