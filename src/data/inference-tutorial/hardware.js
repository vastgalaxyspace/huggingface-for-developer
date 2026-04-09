export const HARDWARE_CHAPTER = 
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
  }
;

