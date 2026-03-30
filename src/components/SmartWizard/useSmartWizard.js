"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

  return params;
}

function estimateParamsFromName(modelId) {
  const match = modelId?.match(/(\d+(?:\.\d+)?)\s*(b|m)/i);
  if (!match) return null;
  const value = Number(match[1]);
  return match[2].toLowerCase() === "b" ? value * 1e9 : value * 1e6;
}

function getRecencyScore(lastModified) {
  if (!lastModified) return 0;
  const diff = Date.now() - new Date(lastModified).getTime();
  const sixMonths = 1000 * 60 * 60 * 24 * 30 * 6;
  return diff <= sixMonths ? 0.2 : 0;
}

function normalizeLicense(model) {
  const license =
    model.cardData?.license ||
    model.meta?.cardData?.license ||
    model.license ||
    model.meta?.license ||
    "Unknown";

  return String(license)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function languageLabel(model) {
  if (model.tags?.includes("multilingual")) return "Multilingual";
  if (model.tags?.includes("en")) return "English";
  return null;
}

function scoreModel(model, compute, metrics, batchStats) {
  const params = model.meta?.safetensors?.total || estimateParamsFromName(model.modelId);
  const params_b = params ? params / 1e9 : null;
  const bytes_per_param = 2;
  const vram_needed = params_b ? params_b * bytes_per_param * 1.2 : null;
  const availableVram = (compute.vram_gb || 0) * (compute.multi_gpu ? compute.num_gpus : 1);
  const fits_vram = !vram_needed || !availableVram || vram_needed <= availableVram;

  if (!fits_vram) {
    return {
      ...model,
      params_b,
      vram_needed,
      fits_vram,
      license_label: normalizeLicense(model),
      language_label: languageLabel(model),
      total_score: 0,
      disqualified: "VRAM",
    };
  }

  const max_downloads = Math.max(batchStats.maxDownloads, 1);
  const max_params_b = Math.max(batchStats.maxParams / 1e9, 1);
  const task_fit = Math.min((model.downloads || 0) / max_downloads, 1);
  const speed = params_b ? Math.max(0, 1 - params_b / max_params_b) : 0.5;
  const size = params_b ? Math.max(0, 1 - params_b / max_params_b) : 0.5;
  const cost = vram_needed && availableVram ? Math.max(0, 1 - vram_needed / availableVram) : 0.5;

  let deployment = 0;
  if (model.tags?.includes("transformers") || model.library_name === "transformers") deployment += 0.3;
  if (model.tags?.includes("gguf")) deployment += 0.2;
  if (model.cardData?.model_description || model.meta?.cardData?.model_description) deployment += 0.2;
  deployment += getRecencyScore(model.lastModified);
  deployment = Math.min(deployment, 1);

  const total_w =
    metrics.accuracy +
    metrics.speed +
    metrics.model_size +
    metrics.cost +
    metrics.deployment;

  const total_score =
    (task_fit * (metrics.accuracy / total_w) +
      speed * (metrics.speed / total_w) +
      size * (metrics.model_size / total_w) +
      cost * (metrics.cost / total_w) +
      deployment * (metrics.deployment / total_w)) *
    100;

  return {
    ...model,
    params_b,
    vram_needed,
    fits_vram,
    license_label: normalizeLicense(model),
    language_label: languageLabel(model),
    sub_scores: { task_fit, speed, size, cost, deployment },
    total_score,
  };
}

export function useSmartWizard() {
  const [state, setState] = useState(INITIAL_STATE);
  const [direction, setDirection] = useState("forward");
  const [sortKey, setSortKey] = useState("best");

  const updateTask = useCallback((patch) => {
    setState((current) => ({
      ...current,
      task: {
        ...current.task,
        ...patch,
      },
    }));
  }, []);

  const updateCompute = useCallback((patch) => {
    setState((current) => ({
      ...current,
      compute: {
        ...current.compute,
        ...patch,
      },
    }));
  }, []);

  const updateMetrics = useCallback((patch) => {
    setState((current) => ({
      ...current,
      metrics: {
        ...current.metrics,
        ...patch,
      },
    }));
  }, []);

  const canProceed = useCallback(() => {
    if (state.current_step === 1) {
      return Boolean(state.task.primary_task);
    }
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

  const goToStep = useCallback((step) => {
    setDirection(step > state.current_step ? "forward" : "backward");
    setState((current) => ({
      ...current,
      current_step: step,
    }));
  }, [state.current_step]);

  const prevStep = useCallback(() => {
    if (state.current_step === 1) return;
    setDirection("backward");
    setState((current) => ({
      ...current,
      current_step: current.current_step - 1,
    }));
  }, [state.current_step]);

  const fetchModels = useCallback(async () => {
    const params = buildSearchParams(state.task, state.compute, state.metrics);

    setState((current) => ({
      ...current,
      results: {
        ...current.results,
        loading: true,
        error: null,
      },
    }));

    try {
      let response = await fetch(`/api/smart-wizard?${params.toString()}`, { cache: "no-store" });
      let payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to reach HuggingFace API.");
      }

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
            model.meta?.safetensors?.total || estimateParamsFromName(model.modelId) || 0,
          ),
        }),
        { maxDownloads: 0, maxParams: 0 },
      );

      const scored = models
        .map((model) => scoreModel(model, state.compute, state.metrics, batchStats))
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
  }, [
    fetchModels,
    state.current_step,
    state.results.error,
    state.results.loading,
    state.results.models.length,
  ]);

  const sortedModels = useMemo(() => {
    const items = [...state.results.models];
    if (sortKey === "downloads") {
      return items.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    }
    if (sortKey === "smallest") {
      return items.sort(
        (a, b) => (a.params_b || Number.MAX_SAFE_INTEGER) - (b.params_b || Number.MAX_SAFE_INTEGER),
      );
    }
    if (sortKey === "fastest") {
      return items.sort((a, b) => (b.sub_scores?.speed || 0) - (a.sub_scores?.speed || 0));
    }
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
      downloads: model.downloads,
      license: model.license_label,
    }));

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
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
