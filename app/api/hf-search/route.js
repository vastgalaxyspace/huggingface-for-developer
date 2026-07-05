import { NextResponse } from "next/server";

const HF_MODELS = "https://huggingface.co/api/models";
const HF_FETCH_TIMEOUT_MS = 8000;

function getHeaders() {
  const token = process.env.HF_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchWithTimeout(url, options = {}, timeoutMs = HF_FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const limit = searchParams.get("limit") || "10";

  if (!search.trim()) {
    return NextResponse.json([]);
  }

  const query = new URLSearchParams({
    search,
    limit,
    sort: "downloads",
    direction: "-1",
  });

  if (!search.includes("/")) {
    query.set("filter", "text-generation");
  }

  try {
    const response = await fetchWithTimeout(`${HF_MODELS}?${query.toString()}`, {
      headers: getHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json([], { status: response.status });
    }

    const models = await response.json();
    return NextResponse.json(Array.isArray(models) ? models : []);
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
