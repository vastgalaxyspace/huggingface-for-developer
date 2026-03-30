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

  if (!response.ok) {
    throw new Error(`Request failed for ${url}`);
  }

  return response.json();
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = new URLSearchParams(searchParams);
  const filters = query.get("filter")?.split(",").filter(Boolean) || [];

  try {
    const rawModels = await fetchJson(`${HF_API}?${query.toString()}`);
    const top20 = rawModels.slice(0, 20);

    const configs = await Promise.allSettled(
      top20.map(async (model, index) => {
        await delay(index * 100);
        return fetchJson(`${HF_BASE}/${model.modelId}/resolve/main/config.json`);
      }),
    );

    const metadata = await Promise.allSettled(
      top20.map(async (model, index) => {
        await delay(index * 100);
        return fetchJson(`${HF_API}/${model.modelId}`);
      }),
    );

    const enriched = top20.map((model, index) => ({
      ...model,
      config: configs[index].status === "fulfilled" ? configs[index].value : null,
      meta: metadata[index].status === "fulfilled" ? metadata[index].value : null,
      cardData:
        metadata[index].status === "fulfilled"
          ? metadata[index].value?.cardData
          : model.cardData,
    }));

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
