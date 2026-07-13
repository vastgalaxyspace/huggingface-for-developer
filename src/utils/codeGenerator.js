// Code Snippet Generator
// Generates ready-to-use code for different frameworks

/**
 * Generate code snippets for model inference
 * @param {object} modelData - Model data
 * @param {string} framework - Framework name
 * @returns {string} Code snippet
 */
export const generateCodeSnippet = (modelData, framework = 'transformers') => {
  const modelId = modelData.modelId;
  const quantized = Boolean(modelData.quantization?.quantized);
  const quantMethod = modelData.quantization?.method || null;
  const quantBits = modelData.quantization?.bits || null;
  const maxContextLength = modelData.config?.max_position_embeddings || 4096;

  const snippets = {
    transformers: generateTransformersCode(modelId, { quantized, quantMethod, quantBits }),
    vllm: generateVLLMCode(modelId, maxContextLength),
    ollama: generateOllamaCode(modelId, quantMethod),
    llamacpp: generateLlamaCppCode(modelId, maxContextLength),
    curl: generateCurlCode(modelId)
  };

  return snippets[framework] || snippets.transformers;
};

// Transformers (Hugging Face)
const generateTransformersCode = (modelId, { quantized, quantMethod, quantBits } = {}) => {
  // Pre-quantized checkpoints (GPTQ/AWQ/GGUF) load without a BitsAndBytesConfig —
  // the quantization is baked into the weights. Only apply bitsandbytes on-the-fly
  // quantization for full-precision checkpoints.
  const isPrequantized = quantized && ['gptq', 'awq', 'gguf', 'int4', 'int8'].includes((quantMethod || '').toLowerCase());
  const useBitsAndBytes = quantized && !isPrequantized;

  let loadModelCode;
  if (useBitsAndBytes) {
    const fourBit = quantBits === 4;
    loadModelCode = `# Quantize on-the-fly with bitsandbytes to reduce VRAM
quantization_config = BitsAndBytesConfig(
    load_in_${fourBit ? '4bit=True' : '8bit=True'},${fourBit ? '\n    bnb_4bit_compute_dtype=torch.float16,\n    bnb_4bit_quant_type="nf4",' : ''}
)
model = AutoModelForCausalLM.from_pretrained(
    "${modelId}",
    quantization_config=quantization_config,
    device_map="auto",
)`;
  } else {
    loadModelCode = `model = AutoModelForCausalLM.from_pretrained(
    "${modelId}",
    dtype="auto",        # picks bf16/fp16 from the model config
    device_map="auto",
)`;
  }

  const importLine = useBitsAndBytes
    ? 'from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig'
    : 'from transformers import AutoTokenizer, AutoModelForCausalLM';

  return `${importLine}
import torch

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained("${modelId}")
${loadModelCode}

# Build the prompt with the model's own chat template
messages = [
    {"role": "user", "content": "Hello! How are you?"}
]
inputs = tokenizer.apply_chat_template(
    messages,
    add_generation_prompt=True,
    return_tensors="pt",
).to(model.device)

# Generate response
outputs = model.generate(
    inputs,
    max_new_tokens=512,
    temperature=0.7,
    top_p=0.9,
    do_sample=True,
)

# Only decode the newly generated tokens, not the prompt
response = tokenizer.decode(outputs[0][inputs.shape[-1]:], skip_special_tokens=True)
print(response)`;
};

// vLLM (Production inference)
const generateVLLMCode = (modelId, contextLength) => {
  return `# Serve an OpenAI-compatible endpoint (recommended for production):
#   vllm serve ${modelId} --max-model-len ${contextLength}
# Then call it with any OpenAI client pointed at http://localhost:8000/v1

# Or run offline batched inference in Python:
from vllm import LLM, SamplingParams

llm = LLM(
    model="${modelId}",
    tensor_parallel_size=1,      # increase to shard across multiple GPUs
    max_model_len=${contextLength},
    gpu_memory_utilization=0.9,
)

sampling_params = SamplingParams(temperature=0.7, top_p=0.9, max_tokens=512)

# chat() applies the model's chat template automatically
messages = [{"role": "user", "content": "Hello! How are you?"}]
outputs = llm.chat(messages, sampling_params)

for output in outputs:
    print(output.outputs[0].text)`;
};

// Ollama (Local deployment)
const generateOllamaCode = (modelId, quantMethod) => {
  const isGguf = (quantMethod || '').toLowerCase() === 'gguf';
  // Ollama can pull GGUF repos straight from the Hub via the hf.co/ prefix.
  const runTarget = isGguf ? `hf.co/${modelId}` : modelId.split('/')[1];
  const pullNote = isGguf
    ? `# This is a GGUF repo — Ollama can run it directly from the Hub:`
    : `# Ollama uses its own short names, which may differ from the HF id.
# Search the library first: https://ollama.com/library`;

  return `${pullNote}
# Command line:
ollama run ${runTarget} "Hello! How are you?"

# Python API (pip install ollama):
import ollama

response = ollama.chat(
    model="${runTarget}",
    messages=[{"role": "user", "content": "Hello! How are you?"}],
)
print(response["message"]["content"])`;
};

// llama.cpp (CPU / GGUF inference)
const generateLlamaCppCode = (modelId, contextLength) => {
  return `# 1) Convert the HF model to GGUF (skip if you downloaded a *-GGUF repo):
#    python convert_hf_to_gguf.py ./${modelId.split('/')[1]} --outfile model.gguf
# 2) (optional) quantize to 4-bit:
#    ./llama-quantize model.gguf model-q4_k_m.gguf Q4_K_M
# 3) Chat from the CLI:
#    ./llama-cli -m model-q4_k_m.gguf -cnv -c ${Math.min(contextLength, 8192)} -p "Hello! How are you?"

# Python bindings (pip install llama-cpp-python):
from llama_cpp import Llama

llm = Llama(
    model_path="./model-q4_k_m.gguf",
    n_ctx=${Math.min(contextLength, 8192)},   # context window
    n_gpu_layers=-1,   # offload all layers to GPU; use 0 for CPU-only
)

response = llm.create_chat_completion(
    messages=[{"role": "user", "content": "Hello! How are you?"}],
    max_tokens=512,
    temperature=0.7,
    top_p=0.9,
)
print(response["choices"][0]["message"]["content"])`;
};

// cURL (Hugging Face Inference Providers — OpenAI-compatible)
const generateCurlCode = (modelId) => {
  return `# Using Hugging Face Inference API
curl https://api-inference.huggingface.co/models/${modelId} \\
  -X POST \\
  -H "Authorization: Bearer YOUR_HUGGING_FACE_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${modelId}",
    "messages": [
      {"role": "user", "content": "Hello! How are you?"}
    ],
    "max_tokens": 512,
    "temperature": 0.7,
    "top_p": 0.9
  }'

# Response (OpenAI schema):
# {"choices": [{"message": {"role": "assistant", "content": "..."}}]}`;
};

/**
 * Get all available frameworks for a model
 * @param {object} modelData - Model data
 * @returns {array} List of compatible frameworks
 */
export const getCompatibleFrameworks = () => {
  const frameworks = [
    {
      id: 'transformers',
      name: 'Transformers (HuggingFace)',
      icon: '🤗',
      description: 'Official library, best compatibility',
      compatibility: 'universal'
    },
    {
      id: 'vllm',
      name: 'vLLM',
      icon: '⚡',
      description: 'High-performance inference server',
      compatibility: 'most'
    },
    {
      id: 'ollama',
      name: 'Ollama',
      icon: '🦙',
      description: 'Easy local deployment',
      compatibility: 'popular'
    },
    {
      id: 'llamacpp',
      name: 'llama.cpp',
      icon: '💻',
      description: 'CPU inference, GGUF format',
      compatibility: 'convertible'
    },
    {
      id: 'curl',
      name: 'REST API',
      icon: '🌐',
      description: 'HTTP API calls',
      compatibility: 'universal'
    }
  ];

  return frameworks;
};
