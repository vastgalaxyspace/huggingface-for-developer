// Serialize the VRAM calculator's shareable inputs to/from URL query params so a
// copied link reproduces the same estimate. Only the model id + runtime knobs are
// shared (manual config overrides are derived from the model's real config).

// param key -> [runtimeConfig field, type]
const RUNTIME_PARAMS = {
  p: ["precision", "string"],
  mode: ["mode", "string"],
  seq: ["sequenceLength", "number"],
  bs: ["batchSize", "number"],
  g: ["numGpus", "number"],
  par: ["parallelismStrategy", "string"],
  opt: ["optimizer", "string"],
  gc: ["gradientCheckpointing", "bool"],
  amp: ["mixedPrecisionAmp", "bool"],
  ovh: ["includeFrameworkOverhead", "bool"],
};

function coerce(raw, type) {
  if (type === "number") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  }
  if (type === "bool") return raw === "1" ? true : raw === "0" ? false : undefined;
  return raw || undefined;
}

// Read a query string into { modelId, runtime } where runtime holds only the
// fields actually present in the URL.
export function parseVramParams(search) {
  const params = new URLSearchParams(search || "");
  const modelId = params.get("m") || null;
  const runtime = {};

  for (const [key, [field, type]] of Object.entries(RUNTIME_PARAMS)) {
    if (!params.has(key)) continue;
    const value = coerce(params.get(key), type);
    if (value !== undefined) runtime[field] = value;
  }

  return { modelId, runtime };
}

// Build a "?..." search string from the current model + runtime config.
export function buildVramSearch(modelId, runtimeConfig) {
  const params = new URLSearchParams();
  if (modelId) params.set("m", modelId);

  for (const [key, [field, type]] of Object.entries(RUNTIME_PARAMS)) {
    const value = runtimeConfig?.[field];
    if (value === undefined || value === null) continue;
    params.set(key, type === "bool" ? (value ? "1" : "0") : String(value));
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
