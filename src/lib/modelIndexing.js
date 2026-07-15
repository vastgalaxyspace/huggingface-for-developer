// Every ID here is verified to resolve on Hugging Face and to map (via
// getModelFamily in modelEditorial.js) to a family with hand-written editorial.
// `npm run indexing:check` enforces that; run it after editing this list.
export const INDEXABLE_MODEL_IDS = [
  // Llama 4
  "meta-llama/Llama-4-Scout-17B-16E-Instruct",
  // Llama 3.x
  "meta-llama/Llama-3.3-70B-Instruct",
  "meta-llama/Llama-3.1-70B-Instruct",
  "meta-llama/Llama-3.1-8B-Instruct",
  "meta-llama/Llama-3.2-3B-Instruct",
  "meta-llama/Llama-3.2-1B-Instruct",
  // DeepSeek
  "deepseek-ai/DeepSeek-R1",
  "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
  "deepseek-ai/DeepSeek-R1-Distill-Llama-70B",
  "deepseek-ai/DeepSeek-V3",
  "deepseek-ai/DeepSeek-V3-0324",
  // Qwen 3
  "Qwen/Qwen3-235B-A22B",
  "Qwen/Qwen3-32B",
  "Qwen/Qwen3-30B-A3B",
  "Qwen/Qwen3-14B",
  "Qwen/Qwen3-8B",
  "Qwen/Qwen3-4B",
  "Qwen/Qwen3-1.7B",
  // Qwen 2.5
  "Qwen/Qwen2.5-72B-Instruct",
  "Qwen/Qwen2.5-32B-Instruct",
  "Qwen/Qwen2.5-14B-Instruct",
  "Qwen/Qwen2.5-7B-Instruct",
  "Qwen/Qwen2.5-Coder-32B-Instruct",
  // Gemma 3
  "google/gemma-3-27b-it",
  "google/gemma-3-12b-it",
  "google/gemma-3-4b-it",
  "google/gemma-3-1b-it",
  // Mistral
  "mistralai/Mistral-Small-24B-Instruct-2501",
  "mistralai/Mistral-Nemo-Instruct-2407",
  "mistralai/Mistral-7B-Instruct-v0.3",
  // Phi
  "microsoft/phi-4",
  // GPT-OSS
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
];

// Version-specific patterns (never a bare family name like /llama/): they keep
// sibling sizes of a promoted family indexable without auto-indexing every
// random third-party fork. Broad families stay explicit in the list above.
const INDEXABLE_FAMILY_PATTERNS = [
  /(^|\/)llama-4-scout/i,
  /(^|\/)deepseek-r1/i,
  /(^|\/)deepseek-v3/i,
  /(^|\/)qwen3/i,
  /(^|\/)qwen2\.5/i,
  /(^|\/)gemma-3/i,
  /(^|\/)gpt-oss/i,
  /(^|\/)phi-4/i,
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
