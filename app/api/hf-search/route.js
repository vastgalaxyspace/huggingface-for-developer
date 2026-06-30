import { NextResponse } from "next/server";

const HF_MODELS = "https://huggingface.co/api/models";
const HF_FETCH_TIMEOUT_MS = 8000;
const FORWARDED_QUERY_PARAMS = ["search", "limit", "sort", "direction", "filter"];

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

function buildHfSearchUrl(searchParams) {
  const query = new URLSearchParams();

  for (const param of FORWARDED_QUERY_PARAMS) {
    for (const value of searchParams.getAll(param)) {
      if (value) query.append(param, value);
    }
  }

  const suffix = query.toString();
  return suffix ? `${HF_MODELS}?${suffix}` : HF_MODELS;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  try {
    const response = await fetchWithTimeout(buildHfSearchUrl(searchParams), {
      headers: getHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to reach HuggingFace API." },
        { status: response.status },
      );
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json(
      { error: "Failed to reach HuggingFace API." },
      { status: 502 },
    );
  }
}
