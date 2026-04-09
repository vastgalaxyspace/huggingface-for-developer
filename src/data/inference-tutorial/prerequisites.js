export const PREREQUISITES_CHAPTER = 
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

Generative AI models have unlocked a new class of applications across industries and domains. Each category of application relies on different models and modalities and requires tailored inference.

| Category | Example | Considerations |
| --- | --- | --- |
| Agents | Prospecting agent for sales teams | One user action triggers many inference calls |
| Chat | Front-line customer support chat with RAG | Time to first token makes chat feel fast |
| Voice | Real-time translation between languages | End-to-end latency for natural conversation |
| Media | Virtual try-on for clothes, shoes, and jewelry | Balance output quality vs. speed |
| Search | Legal document discovery | Offline corpus filling vs. online user requests |
| RecSys | E-commerce product recommendations | Consistent latency with high request volume |
| Completion | Tab completion for coding in an IDE | Full completion chunk at user's typing speed |
| Moderation | Scan user-generated content for safety | High throughput for cost-effective checks |

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
  }
;

