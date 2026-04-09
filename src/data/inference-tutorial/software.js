export const SOFTWARE_CHAPTER = 
  {
    id: 'software',
    number: 4,
    title: 'Software',
    icon: '⚙️',
    color: '#f59e0b',
    description: 'The software stack powering inference — CUDA, frameworks, inference engines, and performance benchmarking.',
    sections: [
      {
        id: 'cuda',
        title: 'CUDA',
        content: `CUDA is NVIDIA's parallel computing platform — the foundation of GPU-accelerated inference.

**CUDA Kernels for Inference**
A CUDA kernel is a function that runs on the GPU. Key inference kernels:
- **GEMM (General Matrix Multiply)**: The core of linear layers. cuBLAS provides highly optimized implementations.
- **Softmax**: Used in attention. Must be numerically stable (subtract max before exp).
- **Layer Normalization**: RMSNorm in modern LLMs — simpler and faster than LayerNorm.
- **Rotary Position Embeddings (RoPE)**: Computed on-the-fly during attention.

**CUDA Kernel Selection**
The runtime chooses the best kernel based on:
- Matrix dimensions (different algorithms for different shapes)
- Data type (FP16, BF16, FP8, INT8)
- GPU architecture (different Tensor Core generations)
- Batch size (affecting arithmetic intensity)

**Reducing Memory Accesses with Kernel Fusion**
The biggest optimization: combine multiple operations into a single kernel.
- Without fusion: Write intermediate result to HBM, read it back for next op
- With fusion: Keep data in registers/shared memory between operations
- Flash Attention is the ultimate example — fuses Q×K, softmax, and ×V into one kernel
- Custom fused kernels can provide 2-5x speedups over naive implementations`
      },
      {
        id: 'deep-learning-frameworks',
        title: 'Deep Learning Frameworks & Libraries',
        content: `The software stack between your model and CUDA kernels.

**PyTorch**
The dominant framework for AI inference:
- \`torch.compile()\`: JIT compiler that optimizes and fuses operations automatically
- \`torch.inference_mode()\`: Disables autograd for faster inference
- CUDA Graphs: Record and replay GPU operations to eliminate CPU overhead

**Model File Formats**
How models are stored and loaded:
- **Safetensors**: The modern standard. Memory-mapped, fast loading, safe (no arbitrary code execution)
- **GGUF**: Used by llama.cpp. Includes quantization metadata. Self-contained format.
- **PyTorch (.pt/.pth)**: Uses pickle — powerful but can execute arbitrary code (security risk)

**ONNX Runtime and TensorRT**
Inference-optimized runtimes:
- **ONNX Runtime**: Cross-platform, supports CPU/GPU/NPU. Good for deployment portability.
- **TensorRT**: NVIDIA's inference optimizer. Applies layer fusion, kernel auto-tuning, precision calibration.
- TensorRT can provide 2-6x speedup over naive PyTorch but requires a compilation step

**Transformers and Diffusers**
Hugging Face libraries that simplify model loading and inference:
- \`transformers\`: Load any text model from the Hub with \`AutoModelForCausalLM.from_pretrained()\`
- \`diffusers\`: Load diffusion models with \`StableDiffusionPipeline.from_pretrained()\`
- Both support device placement, quantization, and attention optimizations out-of-the-box`,
        code: `# Optimized inference with PyTorch
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3-8B",
    torch_dtype=torch.bfloat16,
    device_map="auto",
    attn_implementation="flash_attention_2"  # Use Flash Attention
)

# Compile for faster inference
model = torch.compile(model, mode="reduce-overhead")

tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3-8B")

with torch.inference_mode():
    inputs = tokenizer("What is inference?", return_tensors="pt").to("cuda")
    outputs = model.generate(**inputs, max_new_tokens=100)`
      },
      {
        id: 'inference-engines',
        title: 'Inference Engines',
        content: `Inference engines are specialized servers designed for maximum throughput and minimum latency.

**vLLM**
The most popular open-source LLM inference engine:
- **Paged Attention**: Manages KV cache like virtual memory — near-zero waste
- **Continuous batching**: Dynamically adds/removes requests from a batch
- **Tensor parallelism**: Splits models across multiple GPUs automatically
- Supports 100+ model architectures, quantization, LoRA serving
- OpenAI-compatible API out of the box

**SGLang**
High-performance engine with advanced features:
- **RadixAttention**: Efficient prefix caching using a radix tree
- Constrained decoding (JSON mode) at near-native speed
- Multi-modal model support
- Often faster than vLLM for workloads with shared prefixes

**TensorRT-LLM**
NVIDIA's optimized LLM inference library:
- Maximum performance on NVIDIA hardware
- Requires model compilation (less flexible than vLLM/SGLang)
- In-flight batching and paged KV caching
- FP8 quantization with calibration

**NVIDIA Dynamo**
Orchestration layer for multi-node LLM serving:
- Routes requests to the best available GPU
- Manages model replicas and load balancing
- Integrates with TensorRT-LLM and vLLM backends`,
        code: `# Serving with vLLM — OpenAI-compatible API
# pip install vllm

# Start the server:
# python -m vllm.entrypoints.openai.api_server \\
#   --model meta-llama/Llama-3-8B \\
#   --tensor-parallel-size 2 \\
#   --dtype bfloat16

# Then use it like OpenAI:
from openai import OpenAI
client = OpenAI(base_url="http://localhost:8000/v1", api_key="none")

response = client.chat.completions.create(
    model="meta-llama/Llama-3-8B",
    messages=[{"role": "user", "content": "What is AI inference?"}],
    max_tokens=200,
    stream=True
)
for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")`
      },
      {
        id: 'performance-benchmarking',
        title: 'Performance Benchmarking',
        content: `Benchmarking inference performance correctly requires methodology and the right tools.

**Benchmarking Tooling**
- **vLLM benchmark scripts**: \`benchmark_serving.py\` simulates realistic traffic
- **GenAI-Perf** (NVIDIA): Comprehensive benchmarking for LLM inference servers
- **LLMPerf** (Anyscale): Measures TTFT, ITL, and throughput across providers
- **Custom scripts**: For measuring your specific workload patterns

**Performance Benchmarking Tips**
- **Warm up**: Run 50-100 requests before measuring to fill caches and JIT compile
- **Realistic prompts**: Use production-like input/output lengths
- **Vary concurrency**: Test with 1, 10, 50, 100+ concurrent requests
- **Measure percentiles**: P50, P95, P99 — not just averages
- **Record all metrics**: TTFT, ITL, throughput, GPU utilization, memory usage

**Profiling Performance**
Deep-dive tools for optimization:
- **NVIDIA Nsight Systems**: System-level profiling — see CPU/GPU timeline
- **NVIDIA Nsight Compute**: Kernel-level analysis — identify bottlenecks in individual operations
- **PyTorch Profiler**: \`torch.profiler\` traces GPU operations and memory
- Look for: GPU idle time, memory transfer bottlenecks, kernel launch overhead`
      }
    ]
  }
;

