export const TUTORIAL_CHAPTERS = [
  {
    id: 'prerequisites',
    number: 1,
    title: 'Prerequisites',
    icon: '📋',
    color: '#6366f1',
    description: 'Foundational concepts you need before diving into AI inference — scale, applications, model selection, and performance metrics.',
    sections: [
      {
        id: 'scale-and-specialization',
        title: 'Scale and Specialization',
        content: `AI inference at scale is fundamentally different from running a model on your laptop. When you move from development to production, you encounter challenges around latency, throughput, cost, and reliability that don't exist in a notebook environment.

**Key Concepts:**
- **Scale** refers to handling thousands or millions of requests per second. A single GPU can process maybe 10-50 LLM requests/second — serving millions of users requires careful orchestration.
- **Specialization** means choosing the right model size and architecture for your specific task. A 70B parameter model is overkill for sentiment classification — a fine-tuned 1B model may outperform it at 1/70th the cost.
- The **inference cost curve** is non-linear: doubling model size often more than doubles inference cost due to memory bandwidth bottlenecks.

**Rule of thumb:** Always start with the smallest model that meets your quality bar, then scale up only if needed.`
      },
      {
        id: 'about-your-app',
        title: 'About Your App',
        content: `Before choosing an inference strategy, you need to deeply understand your application's requirements.

**AI-Native Applications**
These are apps where AI is the core product — chatbots, image generators, code assistants. They require:
- Ultra-low latency (users expect real-time responses)
- High availability (downtime = no product)
- Streaming support for long generations

**Online vs Offline Inference**
- **Online inference**: Real-time, request-response pattern. User sends input, gets output immediately. Latency-critical.
- **Offline (batch) inference**: Process large datasets asynchronously. Throughput-critical, latency doesn't matter. Example: embedding an entire document corpus overnight.

**Consumer vs B2B**
- **Consumer apps** need to handle unpredictable traffic spikes, prioritize latency, and minimize per-request cost.
- **B2B apps** often have predictable workloads, can tolerate higher latency, but demand guaranteed SLAs and data privacy.`
      },
      {
        id: 'model-selection',
        title: 'Model Selection',
        content: `Choosing the right model is the single most impactful decision for inference performance and cost.

**Model Evaluation**
Before deploying, evaluate models on:
- **Task-specific benchmarks**: MMLU for knowledge, HumanEval for code, MT-Bench for chat
- **Your own data**: Always create a domain-specific eval set. Public benchmarks don't reflect your use case.
- **Inference cost**: Measure tokens/second and cost/1M tokens on your target hardware

**Fine-Tuning for Domain-Specific Quality**
When a general model falls short on your domain:
- **LoRA/QLoRA**: Fine-tune with minimal compute. Adds small adapter layers — the base model stays frozen
- **Full fine-tuning**: Better quality but requires significant GPU memory and data
- Fine-tuning a 7B model often beats prompting a 70B model on specialized tasks

**Distillation**
Knowledge distillation compresses a large "teacher" model into a smaller "student" model:
- The student learns to mimic the teacher's output distribution, not just hard labels
- Can achieve 90-95% of teacher quality at 10-20% of the compute cost
- Popular approach: Use GPT-4/Claude to generate training data, then fine-tune a smaller open model`,
        code: `# Example: Evaluating a model with lm-eval
from lm_eval import evaluator

results = evaluator.simple_evaluate(
    model="hf",
    model_args="pretrained=meta-llama/Llama-3-8B",
    tasks=["mmlu", "hellaswag", "arc_challenge"],
    batch_size=8
)
print(results["results"])`
      },
      {
        id: 'measuring-latency-throughput',
        title: 'Measuring Latency and Throughput',
        content: `Understanding performance metrics is critical for production inference.

**Latency** — How long a single request takes to complete.
- **Time to First Token (TTFT)**: How quickly the model starts responding. Critical for streaming UX.
- **Inter-Token Latency (ITL)**: Time between consecutive tokens. Determines perceived "typing speed."
- **End-to-End Latency**: Total time from request to complete response.

**Throughput** — How many requests you can handle simultaneously.
- Measured in **tokens/second** or **requests/second**
- Higher batch sizes increase throughput but also increase latency
- The goal is finding the sweet spot between latency and throughput

**Latency Percentiles**
Never report only average latency. Use percentiles:
- **P50 (median)**: The typical experience
- **P95**: 1 in 20 requests is slower than this
- **P99**: The "tail latency" — 1 in 100 requests. This is what frustrated users actually experience.

**End-to-End Metrics**
The complete picture includes:
- Network latency (client → server)
- Queue time (waiting for GPU availability)
- Prefill time (processing the input prompt)
- Decode time (generating output tokens)
- Post-processing time`
      }
    ]
  },
  {
    id: 'models',
    number: 2,
    title: 'Models',
    icon: '🧠',
    color: '#8b5cf6',
    description: 'Deep dive into neural network architectures, LLM mechanics, image generation, and understanding inference bottlenecks.',
    sections: [
      {
        id: 'neural-networks',
        title: 'Neural Networks',
        content: `At the core of every AI model is a neural network — layers of mathematical operations that transform inputs into outputs.

**Linear Layers and Matmul**
The fundamental operation in neural networks is matrix multiplication (matmul):
- Input vector × Weight matrix = Output vector
- A model with 7 billion parameters has ~7 billion numbers in its weight matrices
- During inference, the GPU must load these weights from memory AND compute the matmul — this is the primary bottleneck

**Activation Functions**
Between linear layers, non-linear activation functions add the "intelligence":
- **ReLU**: Simple and fast — \`max(0, x)\`. Used in older architectures.
- **GELU**: Smoother variant used in transformers. \`x × Φ(x)\` where Φ is the Gaussian CDF.
- **SiLU/Swish**: \`x × sigmoid(x)\`. Used in Llama, Mistral, and modern LLMs.
- **SwiGLU**: Gated variant used in Llama 2/3. Combines Swish with a gating mechanism for better quality.`,
        code: `# Matrix multiplication is the core of inference
import torch

# Simulating a single linear layer
input_tensor = torch.randn(1, 4096)      # batch of 1, hidden dim 4096
weight_matrix = torch.randn(4096, 11008)  # projecting to FFN dim

# This single operation dominates inference time
output = input_tensor @ weight_matrix  # Matrix multiplication
print(f"Input: {input_tensor.shape}")
print(f"Weight: {weight_matrix.shape}")
print(f"Output: {output.shape}")
# FLOPs = 2 × 1 × 4096 × 11008 ≈ 90M floating point operations`
      },
      {
        id: 'llm-inference-mechanics',
        title: 'LLM Inference Mechanics',
        content: `LLM inference has two distinct phases that behave very differently.

**LLM Architecture**
Modern LLMs (GPT, Llama, Mistral) are decoder-only transformers with:
- **Token embedding layer**: Converts input text tokens into vectors
- **N transformer blocks**: Each containing self-attention + feed-forward network
- **Output head**: Projects final hidden states back to vocabulary probabilities

**Transformer Blocks**
Each transformer block contains:
1. **Self-Attention**: Allows each token to "look at" all previous tokens
2. **Feed-Forward Network (FFN)**: Two linear layers with activation — this is where most parameters live
3. **Layer Normalization**: Stabilizes training and inference (RMSNorm in modern models)
4. **Residual connections**: Skip connections that help gradient flow

**Attention Mechanism**
Attention computes: \`Attention(Q, K, V) = softmax(QK^T / √d) × V\`
- **Q (Query)**: "What am I looking for?"
- **K (Key)**: "What do I contain?"
- **V (Value)**: "What information do I provide?"
- Complexity is O(n²) with sequence length — this is why long contexts are expensive

**Mixture of Experts (MoE)**
Models like Mixtral use MoE to scale parameters without scaling compute:
- Multiple "expert" FFN networks exist in each layer
- A router selects only 2 of 8 experts per token
- Result: 47B total parameters but only ~13B active per token → faster inference`
      },
      {
        id: 'image-generation-inference',
        title: 'Image Generation Inference',
        content: `Image generation models work fundamentally differently from LLMs.

**Image Generation Model Architecture**
Diffusion models (Stable Diffusion, FLUX) generate images through iterative denoising:
1. Start with random noise
2. A U-Net or DiT (Diffusion Transformer) predicts the noise to remove
3. Subtract predicted noise, repeat for 20-50 steps
4. The final result is a clean image

Each step requires a full forward pass through the model — making image generation inherently slower than single-pass models.

**Few-Step Models**
Recent advances reduce the number of steps needed:
- **LCM (Latent Consistency Models)**: 4-8 steps instead of 50
- **SDXL Turbo**: 1-4 steps using adversarial training
- **Lightning/Hyper**: Distilled models achieving good quality in 2-4 steps

**Video Generation**
Video generation extends image diffusion to the temporal dimension:
- Models like Sora, Runway Gen-3 generate multiple frames
- Computational cost scales linearly (or worse) with frame count
- Typical approach: Generate keyframes, then interpolate`
      },
      {
        id: 'calculating-inference-bottlenecks',
        title: 'Calculating Inference Bottlenecks',
        content: `Understanding bottlenecks lets you predict inference speed before even running the model.

**Ops:Byte Ratio and Arithmetic Intensity**
Every operation is either:
- **Compute-bound**: GPU cores are the bottleneck (high arithmetic intensity)
- **Memory-bound**: Memory bandwidth is the bottleneck (low arithmetic intensity)

Arithmetic Intensity = FLOPs / Bytes loaded from memory

For a GPU with 990 TFLOPS and 3.35 TB/s bandwidth (H100):
- Operations ratio = 990,000 / 3,350 ≈ 295 ops/byte
- If your operation does fewer than 295 ops per byte loaded → memory-bound

**LLM Inference Bottlenecks**
- **Prefill phase** (processing prompt): Compute-bound. Large batch matmul with high arithmetic intensity.
- **Decode phase** (generating tokens): Memory-bound. Each token requires loading ALL model weights for a single vector-matrix multiply.
- This is why decode is slow — a 7B model must load ~14GB of weights for EACH generated token.

**Image Generation Bottlenecks**
- Diffusion steps are generally compute-bound (large batch convolutions)
- The VAE decoder (latent → pixel space) can be a bottleneck for high-res images
- Cross-attention with long text prompts adds memory pressure`
      },
      {
        id: 'optimizing-attention',
        title: 'Optimizing Attention',
        content: `Attention is the most critical component to optimize in transformer inference.

**Flash Attention**
The breakthrough optimization that fuses attention computation:
- Standard attention materializes the full N×N attention matrix in GPU memory
- Flash Attention computes attention in tiles, never materializing the full matrix
- Result: 2-4x speedup and dramatically lower memory usage
- Flash Attention 2 & 3 add further optimizations for newer GPU architectures

**Multi-Query Attention (MQA) & Grouped-Query Attention (GQA)**
Reduce the KV cache memory footprint:
- **Standard MHA**: Separate K, V heads for each attention head (e.g., 32 heads)
- **MQA**: All heads share a single K, V pair → 32x less KV cache memory
- **GQA**: Compromise — groups of heads share K, V (e.g., 8 KV heads for 32 query heads, used in Llama 3)

**Paged Attention**
Used by vLLM — manages KV cache like virtual memory:
- Allocates KV cache in fixed-size "pages" instead of contiguous blocks
- Eliminates memory fragmentation
- Enables efficient memory sharing across requests
- Critical for serving many concurrent requests`
      }
    ]
  },
  {
    id: 'hardware',
    number: 3,
    title: 'Hardware',
    icon: '🖥️',
    color: '#ec4899',
    description: 'GPU architectures, datacenter accelerators, cloud instances, and options for running inference locally.',
    sections: [
      {
        id: 'gpu-architecture',
        title: 'GPU Architecture',
        content: `Understanding GPU architecture is essential for optimizing inference performance.

**Compute**
Modern GPUs have specialized compute units:
- **CUDA Cores**: General-purpose floating point operations
- **Tensor Cores**: Specialized matrix multiply units (10-20x faster for matmul)
- **FP16/BF16 Tensor Cores**: The workhorses of inference — balance speed and precision
- **FP8 Tensor Cores** (H100+): 2x throughput of FP16, enabling faster quantized inference
- **INT8/INT4 Tensor Cores**: For quantized models — lower precision, higher throughput

**Memory and Caches**
GPU memory hierarchy determines inference speed:
- **HBM (High Bandwidth Memory)**: Main GPU memory. H100 has 80GB at 3.35 TB/s
- **L2 Cache**: Shared across all SMs. H100 has 50MB L2
- **Shared Memory/L1**: Per-SM, extremely fast. Used by Flash Attention for tiling
- **Register File**: Fastest storage, per-thread

For LLM decode (memory-bound), HBM bandwidth is the primary limiter. A 7B FP16 model needs ~14GB, and generating each token requires reading ALL of it.`
      },
      {
        id: 'gpu-architecture-generations',
        title: 'GPU Architecture Generations',
        content: `Each NVIDIA GPU generation brings significant inference improvements.

**Hopper (H100, H200) — Current Standard**
- 80-141GB HBM3/HBM3e, up to 4.8 TB/s bandwidth
- FP8 Tensor Cores — first generation with native FP8 support
- Transformer Engine — automatic mixed precision for transformers
- NVLink 4.0 — 900 GB/s GPU-to-GPU interconnect

**Ada Lovelace (RTX 4090, L40S)**
- Consumer/workstation GPUs. RTX 4090: 24GB GDDR6X at 1 TB/s
- Great for local inference and development
- L40S: 48GB — popular for inference workloads that don't need HBM

**Blackwell (B100, B200, GB200)**
- 2x the HBM bandwidth of Hopper
- FP4 Tensor Cores — enabling 4-bit inference at hardware speed
- Second-generation Transformer Engine
- NVLink 5.0 — 1.8 TB/s interconnect

**Rubin (Next Generation)**
- Expected 2026+ — HBM4 with even higher bandwidth
- Further specialized AI inference capabilities

**Grace and Vera CPUs**
- ARM-based CPUs designed to pair with NVIDIA GPUs
- Grace Hopper Superchip: CPU + GPU on same module with unified memory`
      },
      {
        id: 'instances',
        title: 'Cloud Instances',
        content: `Cloud GPU instances are how most teams access inference hardware.

**Multi-GPU Instances**
When a model doesn't fit on a single GPU, you need multi-GPU instances:
- **NVIDIA A100 80GB**: Available as 1, 2, 4, or 8-GPU instances
- **NVIDIA H100 80GB**: Similar configurations, ~2x faster
- Connected via NVLink for high-bandwidth GPU-to-GPU communication
- 8×H100 instance: 640GB total GPU memory, enough for 400B+ parameter models

**Multi-Instance GPUs (MIG)**
Partition a single GPU into isolated instances:
- H100 supports up to 7 MIG instances
- Each instance gets dedicated memory, compute, and cache
- Great for serving multiple small models on one GPU
- Example: Run 7 different 1B models on a single H100

**Cost Optimization Tips:**
- Spot/preemptible instances: 60-90% cheaper but can be interrupted
- Reserved instances: 30-60% discount for 1-3 year commitments
- Choose the right GPU — don't use H100s for a model that fits on an L4`
      },
      {
        id: 'other-accelerators',
        title: 'Other Datacenter Accelerators',
        content: `NVIDIA isn't the only option for AI inference.

**Google TPUs (Tensor Processing Units)**
- Custom ASICs designed for matrix operations
- TPU v5e: Optimized for inference, cost-effective
- Available on Google Cloud — great for JAX/TensorFlow workloads
- Excellent for large-batch throughput workloads

**AMD Instinct (MI300X)**
- 192GB HBM3 — more memory than H100
- Strong for models that need large memory (70B+ without sharding)
- ROCm software stack — growing compatibility with PyTorch

**AWS Inferentia2 / Trainium**
- AWS's custom inference chips
- Neuron SDK compiles models for Inferentia
- Very cost-effective for supported model architectures
- Trade-off: Less flexible than GPUs, limited model support

**Intel Gaudi**
- Habana Labs accelerators (acquired by Intel)
- Competitive on price/performance for inference
- Growing ecosystem but smaller community`
      },
      {
        id: 'local-inference',
        title: 'Local Inference',
        content: `Running models locally — on desktops, laptops, or phones — is increasingly viable.

**Desktop Inference**
Tools for running models on consumer GPUs:
- **llama.cpp**: C++ inference engine, runs quantized models on CPU/GPU. Supports GGUF format.
- **Ollama**: User-friendly wrapper around llama.cpp. \`ollama run llama3\` and you're running.
- **LM Studio**: GUI application for downloading and chatting with local models.
- **vLLM**: Production-grade but works on consumer GPUs too.

GPU recommendations for local inference:
- **RTX 3060 12GB**: Can run 7B models in 4-bit quantization
- **RTX 4090 24GB**: Runs 13B in FP16 or 70B in 4-bit
- **2× RTX 3090 48GB total**: A budget option for larger models

**Mobile Inference**
Running models on phones and edge devices:
- **Apple Neural Engine**: Powers on-device ML on iPhone/iPad
- **Qualcomm AI Engine**: NPU in Snapdragon chips
- **MediaTek APU**: AI accelerator in Dimensity chips
- Models must be heavily quantized (4-bit or lower) and typically ≤3B parameters
- Frameworks: Core ML (Apple), TensorFlow Lite, ONNX Runtime Mobile`,
        code: `# Running a model locally with Ollama
# Step 1: Install Ollama (https://ollama.ai)

# Step 2: Pull and run a model
# ollama pull llama3:8b
# ollama run llama3:8b

# Step 3: Use the API programmatically
import requests

response = requests.post("http://localhost:11434/api/generate", json={
    "model": "llama3:8b",
    "prompt": "Explain AI inference in one paragraph",
    "stream": False
})
print(response.json()["response"])`
      }
    ]
  },
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
  },
  {
    id: 'techniques',
    number: 5,
    title: 'Techniques',
    icon: '🔧',
    color: '#22c55e',
    description: 'Advanced optimization techniques — quantization, speculative decoding, caching, parallelism, and disaggregation.',
    sections: [
      {
        id: 'quantization',
        title: 'Quantization',
        content: `Quantization reduces model precision to use less memory and compute faster.

**Number Formats**
- **FP32 (32-bit float)**: Full precision. 4 bytes per parameter. Baseline accuracy.
- **FP16 (16-bit float)**: Half precision. 2 bytes. Minimal quality loss for most models.
- **BF16 (bfloat16)**: Same range as FP32 but less precision. Preferred for training and inference.
- **FP8 (E4M3/E5M2)**: 1 byte. Supported natively on H100+. ~2x faster than FP16.
- **INT8**: 1 byte integer. Good balance of compression and quality.
- **INT4**: 0.5 bytes. 8x compression vs FP32. Some quality impact.

**Quantization Approaches**
- **Post-Training Quantization (PTQ)**: Quantize a trained model without retraining. Fast but lower quality.
  - **GPTQ**: Weight-only quantization using calibration data. Popular for 4-bit models.
  - **AWQ**: Activation-aware weight quantization. Better quality than GPTQ.
  - **GGUF/llama.cpp quantization**: Various quant types (Q4_K_M, Q5_K_S, etc.)
- **Quantization-Aware Training (QAT)**: Train with simulated quantization. Better quality but expensive.

**Measuring Quality Impact**
Quantization always involves a quality trade-off:
- FP16 → INT8: Usually <1% quality loss
- FP16 → INT4: 1-5% quality loss depending on method and model
- Always evaluate on YOUR task — perplexity benchmarks don't tell the full story
- Larger models are more robust to quantization (70B INT4 ≈ 70B FP16 quality)`
      },
      {
        id: 'speculative-decoding',
        title: 'Speculative Decoding',
        content: `Speculative decoding accelerates LLM generation by predicting multiple tokens at once.

**Core Idea**: Use a small, fast "draft" model to generate K candidate tokens, then verify them all in parallel with the large target model. If the predictions match (which they often do for common patterns), you get K tokens for the cost of one large-model forward pass.

**Draft-Target Speculative Decoding**
1. Draft model generates K tokens (e.g., K=5)
2. Target model verifies all K tokens in a single forward pass
3. Accept all tokens up to the first mismatch
4. Typical acceptance rate: 70-85% — meaning 3-4 tokens accepted per iteration

**Medusa**
Adds multiple "prediction heads" to the model itself:
- Each head predicts a future token (head 1 = next token, head 2 = token after, etc.)
- No separate draft model needed
- Can be fine-tuned quickly on top of existing models

**EAGLE**
Uses the target model's own hidden states to predict future tokens:
- Higher acceptance rate than Medusa (~85-90%)
- Lightweight autoregressive head trained on feature-level predictions

**N-gram Speculation and Lookahead Decoding**
Simplest forms of speculation:
- Match n-gram patterns from the prompt to predict future tokens
- Zero additional model parameters needed
- Works surprisingly well for repetitive or structured text`
      },
      {
        id: 'caching',
        title: 'Caching',
        content: `Caching is critical for reducing redundant computation in LLM inference.

**Prefix Caching and KV Cache Re-Use**
Many requests share common prefixes (system prompts, few-shot examples):
- Cache the KV states for shared prefixes
- New requests starting with the same prefix skip prefill entirely
- Example: If 1000 requests share a 2000-token system prompt, compute it once instead of 1000 times
- vLLM's automatic prefix caching and SGLang's RadixAttention implement this

**Where to Store the KV Cache**
- **GPU HBM**: Fastest but most expensive. Limited capacity.
- **CPU RAM**: 10-50x more capacity, 10-20x slower access
- **SSD/NVMe**: Even more capacity, even slower. Good for very long contexts.
- **Cascading**: Hot entries in GPU, warm in CPU, cold on SSD

**Cache-Aware Routing**
In multi-replica deployments, route requests to the replica most likely to have relevant cache:
- Hash the prefix to determine the target replica
- Improves cache hit rate from ~30% to 80%+
- Significant latency reduction for workloads with common prefixes

**Long Context Handling**
For very long contexts (100K+ tokens):
- KV cache can exceed model weight memory (128K context on Llama 3 ≈ 32GB KV cache)
- Techniques: KV cache quantization (FP8/INT8), sparse attention, sliding window attention`
      },
      {
        id: 'model-parallelism',
        title: 'Model Parallelism',
        content: `When a model doesn't fit on one GPU, you need parallelism strategies.

**Tensor Parallelism (TP) for Lower Latency**
Split individual operations across GPUs:
- Each GPU holds a slice of every weight matrix
- All GPUs compute simultaneously, then synchronize (AllReduce)
- Reduces latency proportionally (2 GPUs ≈ 2x faster decode)
- Requires high-bandwidth GPU interconnect (NVLink) — doesn't work well across nodes
- Best for: Latency-sensitive services with multi-GPU instances

**Expert Parallelism for Higher Throughput (MoE Models)**
For Mixture of Experts models:
- Distribute experts across GPUs
- Each GPU hosts a subset of experts
- Tokens are routed to the GPU hosting the relevant expert
- Scales throughput without increasing per-token latency

**Multi-Node Inference**
When even 8 GPUs aren't enough:
- **Pipeline Parallelism (PP)**: Split model layers across nodes. GPU 1 runs layers 0-15, GPU 2 runs layers 16-31.
- **TP + PP combination**: TP within a node (NVLink), PP across nodes (InfiniBand)
- Network bandwidth becomes critical — InfiniBand (400 Gb/s) vs Ethernet (100 Gb/s)
- Used for largest models: 405B Llama needs 8+ GPUs in FP16`
      },
      {
        id: 'disaggregation',
        title: 'Disaggregation',
        content: `Disaggregation separates prefill and decode into independent services.

**How Disaggregation Works**
Traditional serving runs prefill and decode on the same GPUs. Disaggregation splits them:
- **Prefill instances**: Optimized for compute-heavy prompt processing. Larger batch sizes, higher GPU utilization.
- **Decode instances**: Optimized for memory-bound token generation. Can use different GPU types or configurations.
- The KV cache is transferred from prefill to decode instances after prompt processing.

**When to Use Disaggregation**
Disaggregation makes sense when:
- Prefill and decode have very different hardware requirements
- You have mixed workloads (some requests with long prompts, some with short)
- You want to independently scale prefill and decode capacity
- Your prefill:decode ratio is skewed (many long prompts but short outputs, or vice versa)

**Dynamic Disaggregation with NVIDIA Dynamo**
NVIDIA Dynamo provides a production-ready disaggregation framework:
- Automatically routes prefill and decode to specialized pools
- Handles KV cache transfer between instances
- Dynamic load balancing based on current queue depth
- Integrates with TensorRT-LLM and vLLM backends`
      }
    ]
  },
  {
    id: 'modalities',
    number: 6,
    title: 'Modalities',
    icon: '🎨',
    color: '#06b6d4',
    description: 'Inference across modalities — vision-language models, embeddings, speech recognition, text-to-speech, and image/video generation.',
    sections: [
      {
        id: 'vision-language-models',
        title: 'Vision Language Models',
        content: `Vision Language Models (VLMs) process both images and text, enabling multimodal understanding.

**Architecture**
Most VLMs combine a vision encoder with an LLM:
1. **Vision encoder** (e.g., CLIP ViT) converts images to feature vectors
2. **Projection layer** maps vision features into the LLM's embedding space
3. **LLM decoder** generates text conditioned on both image and text tokens

Models: LLaVA, GPT-4V, Gemini, Qwen-VL, InternVL

**Video Processing for VLMs**
Processing video requires handling temporal information:
- **Frame sampling**: Extract N frames uniformly (e.g., 1 frame/second)
- **Video tokens**: Each frame generates ~256-576 tokens → a 1-minute 1fps video = 15K-35K tokens
- Memory and compute scale linearly with frame count
- Optimization: Use temporal pooling to reduce tokens per frame

**Omni-Modal Models**
Next-generation models that handle text, image, audio, and video natively:
- Single model architecture for all modalities
- Examples: Gemini, GPT-4o (with audio), AnyGPT
- Inference challenge: Must load all modality-specific components even for single-modality requests`
      },
      {
        id: 'embedding-models',
        title: 'Embedding Models',
        content: `Embedding models convert text into dense vector representations for search and retrieval.

**Embedding Model Architecture**
- Based on encoder-only transformers (BERT-style) or encoder-decoder models
- Output: A fixed-size vector (e.g., 384, 768, or 1024 dimensions) representing the semantic meaning
- Popular models: all-MiniLM-L6-v2 (fast), GTE-large (accurate), E5-mistral-7b (state-of-art)

**Embedding Model Inference**
Embedding inference is fundamentally different from LLM inference:
- **No autoregressive generation**: Single forward pass produces the embedding
- **Highly parallelizable**: Process thousands of documents simultaneously
- **Compute-bound**: Large batches fully saturate GPU compute
- **Throughput-focused**: Latency per-item matters less than total throughput

Optimization tips:
- Use large batch sizes (256-1024) for maximum GPU utilization
- FP16/INT8 quantization with minimal quality impact
- CPU inference is viable for smaller models (< 100M parameters)
- Batch processing overnight for large corpus embedding`,
        code: `# Efficient batch embedding with sentence-transformers
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2", device="cuda")

# Process in large batches for maximum throughput
documents = ["Document 1...", "Document 2...", ...]  # thousands of docs
embeddings = model.encode(
    documents,
    batch_size=256,        # Large batch for GPU utilization
    show_progress_bar=True,
    normalize_embeddings=True  # For cosine similarity
)
print(f"Shape: {embeddings.shape}")  # (N, 384)`
      },
      {
        id: 'asr-models',
        title: 'ASR (Automatic Speech Recognition)',
        content: `ASR models convert speech audio to text — powering transcription, subtitles, and voice interfaces.

**Key Model: Whisper**
OpenAI's Whisper is the most popular open ASR model:
- Available in multiple sizes: tiny (39M) to large-v3 (1.5B)
- Supports 100+ languages and translation
- Encoder-decoder architecture: Audio encoder + text decoder

**Single-Chunk Latency Optimization**
For real-time transcription (e.g., live meetings):
- Process audio in small chunks (5-10 seconds)
- Use Whisper large-v3 with CTranslate2 or whisper.cpp for optimized inference
- Faster Whisper (CTranslate2) is 4x faster than original PyTorch implementation
- Batch multiple audio streams on a single GPU

**Long File Latency Optimization**
For processing long recordings (podcasts, calls):
- Split audio into chunks with overlap (to avoid word boundary issues)
- Process chunks in parallel across GPUs
- Use VAD (Voice Activity Detection) to skip silence
- WhisperX adds word-level timestamps and speaker diarization

**Diarization**
Speaker diarization identifies WHO speaks WHEN:
- Models: pyannote.audio, NeMo MSDD
- Pipeline: VAD → Segmentation → Embedding → Clustering
- Can be combined with Whisper for speaker-attributed transcriptions`
      },
      {
        id: 'tts-models',
        title: 'TTS (Text-to-Speech) Models',
        content: `TTS models generate natural-sounding speech from text.

**Streaming Real-Time Text to Speech**
For conversational AI, TTS must be fast and streamable:
- **VITS/VITS2**: End-to-end TTS, fast inference. Single model from text → waveform.
- **XTTS**: Coqui's model with zero-shot voice cloning from 6-second reference
- **Bark**: Suno's model — generates speech with non-verbal sounds (laughter, sighs)
- Streaming: Generate audio chunks as text becomes available → reduces first-byte latency

**Speech-to-Speech Models**
New models that skip text entirely:
- **GPT-4o**: Native audio-to-audio with natural prosody
- **Moshi**: Real-time duplex speech model
- Architecture: Audio encoder → Language model → Audio decoder
- Advantage: Preserves intonation, emotion, and speaking style

**Latency targets:**
- Conversational AI: <500ms TTFB (time to first audio byte)
- Voice assistants: <300ms for responsive feel
- Batch TTS (audiobooks): Throughput matters more than latency`
      },
      {
        id: 'image-generation-models',
        title: 'Image Generation Optimization',
        content: `Optimizing image generation inference for speed and quality.

**Image Generation Kernel Optimization**
Key optimizations for diffusion models:
- **Attention optimization**: Use Flash Attention in the U-Net/DiT attention layers
- **Conv2d optimization**: cuDNN autotuning for convolution kernels
- **VAE optimization**: The VAE decoder can be tiled for high-res images to reduce memory
- **torch.compile**: Can provide 10-30% speedup on diffusion model forward passes

**One Weird Trick for Faster Image Generation**
Progressive resolution / cascade models:
- Generate at low resolution first (256×256)
- Upscale with a specialized super-resolution model
- Total time is less than generating at high resolution directly
- SDXL Refiner: Uses a two-stage approach for better quality

**Batch optimization:**
- Generate multiple images simultaneously for higher GPU utilization
- Use classifier-free guidance with batched positive/negative prompts
- SDXL on H100: ~1-2 seconds per image at 1024×1024 with 30 steps`
      },
      {
        id: 'video-generation-models',
        title: 'Video Generation Models',
        content: `Video generation is one of the most compute-intensive inference workloads.

**Architecture**
Modern video generation models extend image diffusion:
- **Temporal attention**: Cross-frame attention to ensure consistency
- **3D convolutions**: Process spatial and temporal dimensions together
- **DiT (Diffusion Transformers)**: Scaling better than U-Net for video (Sora, CogVideo)

**Attention Optimization and Quantization**
Video models have massive attention maps:
- A 16-frame video at 512×512 has ~65K spatial tokens per frame × 16 frames
- Flash Attention is essential — without it, memory would be prohibitive
- INT8/FP8 quantization for attention values with minimal quality impact
- Window attention: Only attend to nearby frames for efficiency

**Context Parallelism**
Distribute frames across GPUs:
- Each GPU processes a subset of frames
- Cross-GPU communication only during temporal attention layers
- Linear scaling: 4 GPUs ≈ 4x longer videos in constant time
- Used by Sora and similar large-scale video generation systems`
      }
    ]
  },
  {
    id: 'production',
    number: 7,
    title: 'Production',
    icon: '🚀',
    color: '#ef4444',
    description: 'Everything you need to deploy AI inference in production — containers, autoscaling, multi-cloud, security, and observability.',
    sections: [
      {
        id: 'containerization',
        title: 'Containerization',
        content: `Containers are the standard way to package and deploy inference services.

**Dependency Management**
AI models have complex dependency chains:
- CUDA toolkit version must match GPU driver
- PyTorch version must match CUDA version
- Model-specific dependencies (Flash Attention, custom kernels)
- Pin EVERY dependency version in requirements.txt

**NVIDIA Container Toolkit**
The nvidia-container-toolkit exposes GPUs inside containers:
- Install on the host machine
- Use \`--gpus all\` or \`--gpus '"device=0,1"'\` with docker run
- Base images: \`nvcr.io/nvidia/pytorch:24.01-py3\` includes CUDA, cuDNN, NCCL, PyTorch

**NIMs (NVIDIA Inference Microservices)**
Pre-built, optimized containers from NVIDIA:
- Fully packaged: model weights + inference engine + API server
- Deploy with a single \`docker run\` command
- Includes health checks, metrics endpoints, and load balancing
- Available for popular models: Llama, Mistral, Stable Diffusion`,
        code: `# Dockerfile for an inference service
FROM nvcr.io/nvidia/pytorch:24.01-py3

WORKDIR /app

# Install inference engine
RUN pip install vllm==0.4.0

# Download model at build time (optional — can also mount)
RUN huggingface-cli download meta-llama/Llama-3-8B \\
    --local-dir /models/llama3-8b

EXPOSE 8000

CMD ["python", "-m", "vllm.entrypoints.openai.api_server", \\
     "--model", "/models/llama3-8b", \\
     "--dtype", "bfloat16", \\
     "--max-model-len", "8192"]`
      },
      {
        id: 'autoscaling',
        title: 'Autoscaling',
        content: `Autoscaling AI inference is uniquely challenging due to GPU constraints and model loading time.

**Concurrency and Batch Sizing**
- **Static batching**: Process N requests at once. Simple but wastes GPU time on padding.
- **Continuous batching**: Add/remove requests from the batch dynamically. Used by vLLM/SGLang.
- Optimal concurrency depends on model size, GPU memory, and request pattern.

**Cold Starts**
The biggest autoscaling challenge — model loading takes time:
- Loading a 7B model: 10-30 seconds (from SSD/network)
- Loading a 70B model: 1-5 minutes
- Mitigation: Keep warm replicas, use model caching, pre-load on standby instances

**Routing, Load Balancing, and Queueing**
- **Least-connections routing**: Send to the replica with fewest active requests
- **Prefix-aware routing**: Route to replicas with matching KV cache (see Caching section)
- **Priority queues**: Different SLAs for different customers/endpoints
- **Request queuing**: Buffer spikes instead of dropping requests

**Scale to Zero**
For cost savings on low-traffic endpoints:
- Scale replicas to zero when no traffic
- Accept the cold start penalty (10s-5min) for first request
- Use serverless platforms (AWS Lambda, Modal, Baseten) for auto scale-to-zero

**Independent Component Scaling**
Scale different parts independently:
- API gateway: Scale with request volume
- Prefill instances: Scale with input token volume
- Decode instances: Scale with output token volume`
      },
      {
        id: 'multi-cloud-capacity',
        title: 'Multi-Cloud Capacity Management',
        content: `Managing GPU capacity across cloud providers for reliability and cost optimization.

**GPU Procurement**
GPUs are often scarce — strategies for securing capacity:
- **Reserved instances**: Guaranteed capacity at discounted rates (1-3 year terms)
- **On-demand**: Pay as you go, but availability isn't guaranteed during GPU shortages
- **Spot instances**: 60-90% cheaper, but instances can be reclaimed with 30s-2min notice
- **Multi-cloud**: Spread across AWS, GCP, Azure to reduce single-provider risk

**Geo-Aware Load Balancing**
Deploy models close to users:
- US, Europe, and Asia regions for global coverage
- Route requests to nearest healthy region
- Fallback to other regions if primary is down or overloaded

**Building for Reliability**
Production inference must handle failures gracefully:
- **Health checks**: GPU memory, model loaded, inference working
- **Graceful degradation**: Fall back to smaller models under load
- **Circuit breakers**: Stop sending traffic to unhealthy instances
- **Redundancy**: Never rely on a single GPU or single provider

**Security and Compliance**
- **Input/output filtering**: Block harmful prompts and outputs
- **Data residency**: Keep data in specific regions for GDPR/compliance
- **Token-level access control**: Rate limiting per API key
- **Audit logging**: Record all inference requests for compliance`
      },
      {
        id: 'testing-and-deployment',
        title: 'Testing and Deployment',
        content: `Safe deployment practices for AI inference services.

**Zero-Downtime Deployment**
Upgrade models and infrastructure without dropping requests:
- **Blue-green deployment**: Run old and new versions simultaneously, switch traffic
- **Canary deployment**: Route 5% of traffic to new version, monitor metrics, gradually increase
- **Rolling updates**: Replace instances one at a time in a fleet
- Always validate the new model's quality metrics before shifting traffic

**Cost Estimation**
Understanding and controlling inference costs:
- **Per-token cost**: Cost = (GPU cost/hour) / (tokens/hour throughput)
- **H100 costs**: ~$2-3/hr (spot) to ~$8-12/hr (on-demand) on major clouds
- **Llama 3 8B on H100**: ~$0.05-0.10 per million tokens
- **Llama 3 70B on 8×H100**: ~$0.50-1.00 per million tokens
- Quantization can reduce costs 2-4x with minimal quality impact

**Observability**
Monitor everything in production:
- **Latency metrics**: TTFT, ITL, E2E latency at P50/P95/P99
- **Throughput**: Tokens/second, requests/second
- **GPU metrics**: Utilization, temperature, memory usage, power draw
- **Queue depth**: How many requests are waiting
- **Error rates**: Timeout, OOM, model errors
- Tools: Prometheus + Grafana, Datadog, custom dashboards`
      },
      {
        id: 'client-code',
        title: 'Client Code Best Practices',
        content: `Building robust client applications that consume inference APIs.

**Client Latency Overhead**
Network and serialization overhead matters:
- HTTP/REST: ~1-5ms overhead per request (JSON serialization)
- gRPC: ~0.5-2ms overhead (binary serialization, persistent connections)
- WebSocket: Lowest overhead for streaming — single connection, minimal framing
- For latency-critical apps, co-locate clients near inference servers

**Asynchronous Inference**
Don't block on inference calls:
- Use async HTTP clients (aiohttp, httpx.AsyncClient in Python)
- Fire-and-forget for non-critical tasks
- Callback/webhook patterns for long-running generations
- Queue-based: Submit to a job queue, poll or receive results async

**Streaming and Protocol Support**
For LLM applications, streaming is essential:
- **Server-Sent Events (SSE)**: Simple, HTTP-based streaming. Widely supported.
- **WebSockets**: Bidirectional, lower overhead, good for conversational apps
- **gRPC streaming**: Efficient binary protocol, great for server-to-server
- Always implement client-side timeout and retry logic

**Best practices:**
- Set appropriate timeouts (TTFT timeout + max generation time)
- Implement exponential backoff for retries
- Use connection pooling for high-throughput clients
- Handle partial responses gracefully (connection drops mid-stream)`,
        code: `# Robust async client with streaming
import httpx
import asyncio

async def generate_with_streaming(prompt: str):
    async with httpx.AsyncClient(timeout=60.0) as client:
        async with client.stream(
            "POST",
            "http://inference-server:8000/v1/chat/completions",
            json={
                "model": "llama3-8b",
                "messages": [{"role": "user", "content": prompt}],
                "stream": True,
                "max_tokens": 500
            },
            headers={"Authorization": "Bearer YOUR_KEY"}
        ) as response:
            async for line in response.aiter_lines():
                if line.startswith("data: ") and line != "data: [DONE]":
                    chunk = json.loads(line[6:])
                    token = chunk["choices"][0]["delta"].get("content", "")
                    print(token, end="", flush=True)

asyncio.run(generate_with_streaming("Explain AI inference"))`
      }
    ]
  }
];
