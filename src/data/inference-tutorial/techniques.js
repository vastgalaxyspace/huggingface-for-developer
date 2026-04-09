export const TECHNIQUES_CHAPTER = 
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
  }
;

