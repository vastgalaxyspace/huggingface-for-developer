import { NextResponse } from "next/server";

const HF_BASE = "https://huggingface.co";
const HF_MODELS = "https://huggingface.co/api/models";

function getHeaders() {
  const token = process.env.NEXT_PUBLIC_HF_TOKEN || process.env.HF_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const modelId = searchParams.get("modelId");

  if (!modelId) {
    return NextResponse.json({ error: "Missing modelId" }, { status: 400 });
  }

  try {
    const metadataResponse = await fetch(`${HF_MODELS}/${modelId}`, {
      headers: getHeaders(),
      cache: "no-store",
    });

    if (!metadataResponse.ok) {
      const message = metadataResponse.status === 404
        ? "Model not found. Check the model ID."
        : "Failed to reach HuggingFace API.";
      return NextResponse.json({ error: message }, { status: metadataResponse.status });
    }

    const metadata = await metadataResponse.json();
    let config = null;
    let config_available = true;
    let config_error = null;

    try {
      const configResponse = await fetch(`${HF_BASE}/${modelId}/resolve/main/config.json`, {
        headers: getHeaders(),
        cache: "no-store",
      });

      if (!configResponse.ok) {
        config_available = false;
        config_error = configResponse.status === 404
          ? "Model found but config.json unavailable. Using parameter-based estimation."
          : "Failed to load config.json.";
      } else {
        config = await configResponse.json();
      }
    } catch {
      config_available = false;
      config_error = "Failed to load config.json.";
    }

    return NextResponse.json({
      metadata,
      config,
      config_available,
      config_error,
    });
  } catch {
    return NextResponse.json({ error: "Failed to reach HuggingFace API." }, { status: 502 });
  }
}
