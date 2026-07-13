import { NextResponse } from "next/server";

const HF_BASE = "https://huggingface.co";
const HF_MODELS = "https://huggingface.co/api/models";
const HF_FETCH_TIMEOUT_MS = 8000;
const HF_OPTIONAL_FETCH_TIMEOUT_MS = 3500;
const HF_TRENDING_HYDRATION_TIMEOUT_MS = 1500;
const TRENDING_HYDRATION_LIMIT = 12;

function getHeaders() {
  const token = process.env.HF_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchWithTimeout(url, options = {}, timeoutMs = HF_FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const externalSignal = options.signal;
  const abortFromExternalSignal = () => controller.abort();

  if (externalSignal?.aborted) {
    controller.abort();
  } else {
    externalSignal?.addEventListener("abort", abortFromExternalSignal, { once: true });
  }

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener("abort", abortFromExternalSignal);
  }
}

async function fetchJson(url, options = {}, timeoutMs = HF_FETCH_TIMEOUT_MS) {
  const response = await fetchWithTimeout(url, {
    ...options,
    headers: getHeaders(),
  }, timeoutMs);

  if (!response.ok) return null;
  return response.json();
}

async function fetchModelMetadata(modelId, options = {}) {
  return fetchJson(`${HF_MODELS}/${modelId}`, {
    cache: "no-store",
    signal: options.signal,
  }, HF_FETCH_TIMEOUT_MS);
}

async function fetchModelConfig(modelId, options = {}) {
  return fetchJson(`${HF_BASE}/${modelId}/resolve/main/config.json`, {
    cache: "no-store",
    signal: options.signal,
  }, HF_OPTIONAL_FETCH_TIMEOUT_MS);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || "10";
  const query = new URLSearchParams({
    sort: "trendingScore",
    direction: "-1",
    limit,
  });

  try {
    const response = await fetchWithTimeout(`${HF_MODELS}?${query.toString()}`, {
      headers: getHeaders(),
      next: { revalidate: 3600 },
    }, HF_FETCH_TIMEOUT_MS);

    if (!response.ok) {
      return NextResponse.json([], { status: response.status });
    }

    const models = await response.json();
    if (!Array.isArray(models)) {
      return NextResponse.json([]);
    }

    const sizeRegex = /(?:^|[-_])(\d+(?:\.\d+)?)[bBmM](?:[-_]|$)|(\d+(?:\.\d+)?)\s*[bBmM]/;
    const candidates = models
      .filter((model) => {
        const hasNameSize = sizeRegex.test(String(model.id || ""));
        const hasMetadataParams =
          Number(model?.safetensors?.total) > 0 ||
          Number(model?.cardData?.model_params) > 0 ||
          Number(model?.cardData?.parameters) > 0 ||
          Number(model?.transformersInfo?.num_parameters) > 0;
        return !hasNameSize && !hasMetadataParams;
      })
      .slice(0, TRENDING_HYDRATION_LIMIT);

    const hydrationController = new AbortController();
    const hydrationTimeout = setTimeout(() => hydrationController.abort(), HF_TRENDING_HYDRATION_TIMEOUT_MS);
    const hydrationEntries = await Promise.all(
      candidates.map(async (model) => {
        const requestOptions = { signal: hydrationController.signal };
        const [metadata, config] = await Promise.all([
          fetchModelMetadata(model.id, requestOptions).catch(() => null),
          fetchModelConfig(model.id, requestOptions).catch(() => null),
        ]);
        return [model.id, { metadata, config }];
      }),
    ).finally(() => clearTimeout(hydrationTimeout));
    const hydrationMap = new Map(hydrationEntries);

    const hydratedModels = models.map((model) =>
      hydrationMap.has(model.id)
        ? {
            ...model,
            ...(hydrationMap.get(model.id)?.metadata || {}),
            rawConfig: hydrationMap.get(model.id)?.config || model.rawConfig,
          }
        : model,
    );

    return NextResponse.json(hydratedModels);
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
