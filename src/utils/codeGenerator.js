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
  const hasQuantization = modelData.quantization?.quantized;
  const contextLength = modelData.config?.max_position_embeddings || 4096;

  const snippets = {
    transformers: generateTransformersCode(modelId, hasQuantization, contextLength),
    vllm: generateVLLMCode(modelId, contextLength),
    ollama: generateOllamaCode(modelId),
    llamacpp: generateLlamaCppCode(modelId),
    curl: generateCurlCode(modelId)
  };

  return snippets[framework] || snippets.transformers;
};

// Transformers (Hugging Face)
const generateTransformersCode = (modelId, quantized, contextLength) => {
  const quantizationCode = quantized 
    ? `\n# Load in 8-bit for lower VRAM\nmodel = AutoModelForCausalLM.from_pretrained(\n    "${modelId}",\n    load_in_8bit=True,\n    device_map="auto"\n)`
    : `\nmodel = AutoModelForCausalLM.from_pretrained(\n    "${modelId}",\n    device_map="auto",\n    torch_dtype=torch.float16\n)`;

  return `from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("${modelId}")
${quantizationCode}

# Prepare input
messages = [
    {"role": "user", "content": "Hello! How are you?"}
]
input_ids = tokenizer.apply_chat_template(
    messages,
    add_generation_prompt=True,
    return_tensors="pt"
).to(model.device)

# Generate response
outputs = model.generate(
    input_ids,
    max_new_tokens=512,
    temperature=0.7,
    top_p=0.9,
    do_sample=True
)

response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(response)`;
};

// vLLM (Production inference)
const generateVLLMCode = (modelId, contextLength) => {
  return `from vllm import LLM, SamplingParams

# Initialize vLLM engine
llm = LLM(
    model="${modelId}",
    tensor_parallel_size=1,  # Use multiple GPUs if available
    max_model_len=${contextLength},
    gpu_memory_utilization=0.9
)

# Set sampling parameters
sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.9,
    max_tokens=512
)

# Generate
prompts = ["Hello! How are you?"]
outputs = llm.generate(prompts, sampling_params)

for output in outputs:
    print(output.outputs[0].text)

# For OpenAI-compatible API server:
# vllm serve ${modelId} --host 0.0.0.0 --port 8000`;
};

// Ollama (Local deployment)
const generateOllamaCode = (modelId) => {
  return `# First, pull the model (if available on Ollama)
# ollama pull ${modelId.split('/')[1]}

# Python API
import ollama

response = ollama.chat(
    model='${modelId.split('/')[1]}',
    messages=[
        {'role': 'user', 'content': 'Hello! How are you?'}
    ]
)
print(response['message']['content'])

# Command Line
# ollama run ${modelId.split('/')[1]} "Hello! How are you?"

# Note: Check if this model is available on Ollama
# Visit: https://ollama.ai/library`;
};

// llama.cpp (CPU inference)
const generateLlamaCppCode = (modelId) => {
  return `# First, convert model to GGUF format
# python convert.py ${modelId}

# Then run with llama.cpp
# ./main -m model.gguf -p "Hello! How are you?" -n 512

# Python bindings (llama-cpp-python)
from llama_cpp import Llama

llm = Llama(
    model_path="./model.gguf",
    n_ctx=4096,  # Context window
    n_threads=8  # CPU threads
)

output = llm(
    "Hello! How are you?",
    max_tokens=512,
    temperature=0.7,
    top_p=0.9
)

print(output['choices'][0]['text'])`;
};

// cURL (API usage)
const generateCurlCode = (modelId) => {
  return `# Using Hugging Face Inference API
curl https://api-inference.huggingface.co/models/${modelId} \\
  -X POST \\
  -H "Authorization: Bearer YOUR_HF_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "inputs": "Hello! How are you?",
    "parameters": {
      "max_new_tokens": 512,
      "temperature": 0.7,
      "top_p": 0.9
    }
  }'

# Response:
# [{"generated_text": "..."}]`;
};

/**
 * Get all available frameworks for a model
 * @param {object} modelData - Model data
 * @returns {array} List of compatible frameworks
 */
export const getCompatibleFrameworks = (modelData) => {
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