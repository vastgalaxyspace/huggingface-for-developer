export const INDEXABLE_MODEL_IDS = [
  "meta-llama/Llama-4-Scout-17B-16E-Instruct",
  "deepseek-ai/DeepSeek-R1",
  "Qwen/Qwen3-32B",
  "Qwen/Qwen3-30B-A3B",
  "Qwen/Qwen3-8B",
  "google/gemma-3-27b-it",
  "google/gemma-3-12b-it",
  "google/gemma-3-4b-it",
  "meta-llama/Llama-3.1-8B-Instruct",
  "mistralai/Mistral-7B-Instruct-v0.3",
];

const INDEXABLE_FAMILY_PATTERNS = [
  /(^|\/)llama-4-scout/i,
  /(^|\/)deepseek-r1/i,
  /(^|\/)qwen3/i,
  /(^|\/)gemma-3/i,
];

export function normalizeModelId(modelId = "") {
  return decodeURIComponent(String(modelId)).trim();
}

export function isModelIndexable(modelId = "") {
  const normalized = normalizeModelId(modelId);
  return INDEXABLE_MODEL_IDS.includes(normalized) || INDEXABLE_FAMILY_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function modelPath(modelId = "") {
  return `/model/${normalizeModelId(modelId).split("/").map(encodeURIComponent).join("/")}`;
}

export function getIndexableModelIds() {
  return INDEXABLE_MODEL_IDS;
}
