import { NextResponse } from "next/server";

const HF_BASE = "https://huggingface.co";
const HF_API = `${HF_BASE}/api/models`;

function getHeaders() {
  const token = process.env.NEXT_PUBLIC_HF_TOKEN || process.env.HF_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) return null;
  return response.json();
}

// Detect architecture family from model ID and tags
function detectFamily(modelId) {
  const id = (modelId || "").toLowerCase();
  if (id.includes("llama")) return "llama";
  if (id.includes("mistral") || id.includes("mixtral")) return "mistral";
  if (id.includes("qwen")) return "qwen";
  if (id.includes("phi")) return "phi";
  if (id.includes("gemma")) return "gemma";
  if (id.includes("deepseek")) return "deepseek";
  if (id.includes("starcoder") || id.includes("codellama")) return "code";
  if (id.includes("falcon")) return "falcon";
  if (id.includes("yi-")) return "yi";
  if (id.includes("internlm")) return "internlm";
  if (id.includes("command")) return "command";
  if (id.includes("whisper")) return "whisper";
  if (id.includes("stable") && id.includes("diffusion")) return "stable-diffusion";
  if (id.includes("flux")) return "flux";
  return "unknown";
}

// Extract safetensors param count
function extractParamCount(meta) {
  const st = meta?.safetensors;
  if (st?.total) return st.total;
  if (st?.parameters) {
    const vals = Object.values(st.parameters);
    if (vals.length) return Math.max(...vals.map(Number).filter(Boolean));
  }
  return null;
}

// Detect key capabilities from tags
function detectCapabilities(model) {
  const tags = model.tags || [];
  const id = (model.modelId || "").toLowerCase();
  return {
    isChat: tags.some((t) => ["chat", "conversational", "instruct"].includes(t)) || id.includes("chat") || id.includes("instruct"),
    isCode: tags.includes("code") || id.includes("code") || id.includes("coder") || id.includes("starcoder"),
    isGGUF: tags.includes("gguf"),
    isSafetensors: tags.includes("safetensors"),
    isTransformers: tags.includes("transformers") || model.library_name === "transformers",
    isPEFT: tags.includes("peft"),
    isMultilingual: tags.includes("multilingual"),
    hasModelCard: Boolean(model.cardData?.model_description || model.meta?.cardData?.model_description),
    isGated: Boolean(model.gated),
    family: detectFamily(model.modelId),
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = new URLSearchParams(searchParams);
  const filters = query.get("filter")?.split(",").filter(Boolean) || [];

  // Add search hints based on task type for better results
  const taskHint = query.get("task_hint");
  if (taskHint) {
    query.set("search", taskHint);
    query.delete("task_hint");
  }

  // Fetch more models for better ranking
  query.set("limit", "50");

  try {
    const rawModels = await fetchJson(`${HF_API}?${query.toString()}`);
    if (!rawModels || !Array.isArray(rawModels)) {
      throw new Error("Invalid response from HuggingFace API");
    }

    // Enrich top 30 models with configs and metadata
    const top30 = rawModels.slice(0, 30);

    const [configs, metadata] = await Promise.all([
      Promise.allSettled(
        top30.map(async (model, index) => {
          await delay(index * 80);
          return fetchJson(`${HF_BASE}/${model.modelId}/resolve/main/config.json`);
        }),
      ),
      Promise.allSettled(
        top30.map(async (model, index) => {
          await delay(index * 80);
          return fetchJson(`${HF_API}/${model.modelId}`);
        }),
      ),
    ]);

    const enriched = top30.map((model, index) => {
      const config = configs[index].status === "fulfilled" ? configs[index].value : null;
      const meta = metadata[index].status === "fulfilled" ? metadata[index].value : null;

      const paramCount = extractParamCount(meta) || extractParamCount(model);
      const capabilities = detectCapabilities({ ...model, meta, tags: [...(model.tags || []), ...(meta?.tags || [])] });

      return {
        ...model,
        config,
        meta,
        cardData: meta?.cardData || model.cardData,
        paramCount,
        capabilities,
      };
    });

    // Fallback: if pipeline_tag returned < 5 useful models, try broader search
    if (enriched.length < 5 && query.get("pipeline_tag")) {
      const broadQuery = new URLSearchParams(query);
      broadQuery.delete("pipeline_tag");
      broadQuery.set("sort", "downloads");
      broadQuery.set("direction", "-1");
      broadQuery.set("limit", "20");

      const fallback = await fetchJson(`${HF_API}?${broadQuery.toString()}`);
      if (fallback && Array.isArray(fallback)) {
        const existingIds = new Set(enriched.map((m) => m.modelId));
        const extras = fallback
          .filter((m) => !existingIds.has(m.modelId))
          .slice(0, 10)
          .map((model) => ({
            ...model,
            config: null,
            meta: null,
            paramCount: null,
            capabilities: detectCapabilities(model),
            isFallback: true,
          }));
        enriched.push(...extras);
      }
    }

    return NextResponse.json({
      models: enriched,
      total: rawModels.length,
      filters,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch HuggingFace search results." },
      { status: 502 },
    );
  }
}
