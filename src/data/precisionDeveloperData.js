export const runtimeOverheadProfiles = [
  {
    id: 'generic',
    label: 'Generic runtime',
    overheadMultiplier: 1.2,
    contextOverheadGbPerTokenBatch: 0.000002,
    description: 'Directional default for mixed deployment stacks.',
  },
  {
    id: 'llama_cpp',
    label: 'llama.cpp',
    overheadMultiplier: 1.15,
    contextOverheadGbPerTokenBatch: 0.0000018,
    description: 'Lean local runtime profile for GGUF workflows.',
  },
  {
    id: 'vllm',
    label: 'vLLM',
    overheadMultiplier: 1.3,
    contextOverheadGbPerTokenBatch: 0.0000028,
    description: 'Includes serving-engine scheduling and KV-heavy workloads.',
  },
  {
    id: 'tensorrt_llm',
    label: 'TensorRT-LLM',
    overheadMultiplier: 1.22,
    contextOverheadGbPerTokenBatch: 0.0000022,
    description: 'Optimized datacenter runtime with calibrated kernels.',
  },
  {
    id: 'tgi',
    label: 'Text Generation Inference',
    overheadMultiplier: 1.28,
    contextOverheadGbPerTokenBatch: 0.0000026,
    description: 'Production serving profile with queueing and batch dynamics.',
  },
];

export const kvPrecisionProfiles = [
  { id: 'fp16', label: 'FP16 KV cache', multiplier: 1, note: 'Highest KV fidelity; largest memory footprint.' },
  { id: 'fp8', label: 'FP8 KV cache', multiplier: 0.6, note: 'Strong memory reduction with moderate quality risk.' },
  { id: 'int8', label: 'INT8 KV cache', multiplier: 0.5, note: 'Balanced memory savings for many workloads.' },
  { id: 'int4', label: 'INT4 KV cache', multiplier: 0.3, note: 'Aggressive KV compression; validate long-context quality.' },
];

export const confidenceTags = ['all', 'source-reported', 'locally reproducible recipe', 'example baseline'];

export const benchmarkRunnerRecipes = [
  {
    id: 'llama-bench',
    title: 'llama.cpp benchmark (GGUF)',
    stack: 'llama.cpp',
    command: 'llama-bench -m ./models/model.Q4_K_M.gguf -ngl 99 -p 512 -n 128 -r 5 -o json',
    outputSchema: ['model', 'n_prompt_tokens', 'n_gen_tokens', 'tps', 'memory', 'backend', 'commit'],
  },
  {
    id: 'vllm-throughput',
    title: 'vLLM throughput run',
    stack: 'vLLM',
    command: 'python benchmarks/benchmark_throughput.py --model your/model --dtype float16 --output-json benchmark.json',
    outputSchema: ['model', 'dtype', 'request_rate', 'throughput_tokens_s', 'latency_p50_ms', 'latency_p95_ms', 'gpu'],
  },
  {
    id: 'tensorrt-llm-bench',
    title: 'TensorRT-LLM benchmark',
    stack: 'TensorRT-LLM',
    command: 'trtllm-bench --engine_dir ./engine_fp8 --input_len 512 --output_len 128 --batch_size 16 --dump_json trt_bench.json',
    outputSchema: ['engine', 'precision', 'batch_size', 'throughput_tokens_s', 'latency_ms', 'gpu_sku'],
  },
];

export const compatibilityMatrix = [
  {
    stack: 'PyTorch',
    support: {
      fp32: 'native',
      bf16: 'native',
      fp16: 'native',
      tf32: 'nvidia-mode',
      fp8: 'partial',
      int8: 'via-quantization',
      int4: 'via-quantization',
      gptq: 'plugin',
      awq: 'plugin',
      gguf_q4_k_m: 'no-native',
    },
  },
  {
    stack: 'ONNX Runtime',
    support: {
      fp32: 'native',
      bf16: 'native',
      fp16: 'native',
      int8: 'native',
      int4: 'native',
      gptq: 'conversion-path',
      awq: 'conversion-path',
    },
  },
  {
    stack: 'TensorRT-LLM',
    support: {
      fp16: 'native',
      bf16: 'native',
      fp8: 'native',
      int8: 'native',
      int4: 'native',
      gptq: 'conversion-path',
      awq: 'conversion-path',
    },
  },
  {
    stack: 'vLLM',
    support: {
      fp16: 'native',
      bf16: 'native',
      int8: 'partial',
      gptq: 'native',
      awq: 'native',
      fp8: 'partial',
    },
  },
  {
    stack: 'llama.cpp',
    support: {
      gguf_q2_k: 'native',
      gguf_q3_k_m: 'native',
      gguf_q4_k_m: 'native',
      gguf_q5_k_m: 'native',
      gguf_q6_k: 'native',
      gguf_q8_0: 'native',
      int8: 'via-gguf',
      int4: 'via-gguf',
      fp16: 'native',
    },
  },
  {
    stack: 'Ollama',
    support: {
      gguf_q2_k: 'native',
      gguf_q3_k_m: 'native',
      gguf_q4_k_m: 'native',
      gguf_q5_k_m: 'native',
      gguf_q6_k: 'native',
      gguf_q8_0: 'native',
      fp16: 'model-dependent',
    },
  },
];

export const regressionPromptPack = [
  {
    id: 'reasoning-long-chain',
    category: 'Reasoning',
    prompt: 'Solve this multi-step logic puzzle and show each step clearly before final answer: ...',
    passCriteria: 'No contradictions and final answer matches reference.',
  },
  {
    id: 'code-bugfix',
    category: 'Coding',
    prompt: 'Given this failing unit test and function, produce minimal patch and explain root cause: ...',
    passCriteria: 'Patch is minimal, tests pass, explanation identifies exact bug.',
  },
  {
    id: 'long-context-grounding',
    category: 'Long Context',
    prompt: 'Use only the supplied long document and answer with citations from sections.',
    passCriteria: 'No fabricated citations; references map to provided sections.',
  },
];

export const responseDiffSamples = {
  fp16: {
    title: 'FP16 sample output',
    text: 'The deployment plan should use canary traffic, monitor p95 latency, and keep an INT8 rollback path with automatic threshold triggers.',
  },
  int8: {
    title: 'INT8 sample output',
    text: 'Use canary rollout, track p95 latency, and prepare rollback to higher precision when quality alerts cross threshold.',
  },
  int4: {
    title: 'INT4 sample output',
    text: 'Deploy canary first. Track latency and quality. If responses get unstable, revert to 8-bit or 16-bit quickly.',
  },
  q4_k_m: {
    title: 'Q4_K_M sample output',
    text: 'Start with small traffic, monitor response quality and delays, and keep a safer quantization fallback if complex prompts degrade.',
  },
};

export const cloudGpuPricing = [
  { id: 't4', label: 'NVIDIA T4 class', usdPerHour: 0.55 },
  { id: 'l4', label: 'NVIDIA L4 class', usdPerHour: 1.1 },
  { id: 'a10g', label: 'NVIDIA A10G class', usdPerHour: 1.8 },
  { id: 'a100_40', label: 'NVIDIA A100 40GB', usdPerHour: 4.2 },
  { id: 'h100_80', label: 'NVIDIA H100 80GB', usdPerHour: 10.5 },
];

export function generateDeploymentSnippet({ runtime, modelId, precisionLabel }) {
  if (runtime === 'vllm') {
    return `python -m vllm.entrypoints.openai.api_server --model ${modelId} --dtype ${precisionLabel.toLowerCase().includes('bf16') ? 'bfloat16' : 'float16'} --max-model-len 8192`;
  }
  if (runtime === 'llama.cpp') {
    return `./llama-server -m ./models/${modelId}.Q4_K_M.gguf -ngl 99 -c 8192`;
  }
  if (runtime === 'tensorrt_llm') {
    return `trtllm-serve --engine_dir ./engine_${precisionLabel.toLowerCase()} --tokenizer ${modelId} --max_batch_size 16`;
  }
  return `python serve.py --model ${modelId} --precision ${precisionLabel}`;
}
