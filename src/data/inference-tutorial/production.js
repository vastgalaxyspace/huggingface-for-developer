export const PRODUCTION_CHAPTER =
  {
    id: 'production',
    number: 7,
    title: 'Production',
    icon: '🚀',
    color: '#ef4444',
    description: 'Everything you need to deploy AI inference in production — containers, autoscaling, multi-cloud, security, and observability. Production is where inference engineering proves itself: latency comes from server, network, and client, not just prefill/decode. With enough traffic, any single instance will be overwhelmed — this is an infrastructure problem, not a CUDA problem',
    sections: [
      {
        id: 'containerization',
        title: 'Containerization',
        content: `Containers standardize deployment by packaging an application with all dependencies so it runs anywhere — no more "it works on my machine"

**What Goes in an Image**
- **Model weights**: Hugging Face repo, S3 bucket, or baked into image
- **Inference engine**: vLLM, SGLang, TensorRT-LLM version
- **System packages**: ffmpeg for audio/image/video models, CUDA toolkit
- **CUDA dependencies**: Toolkit version must match GPU driver; PyTorch must match CUDA

**Pack Light + Pin Versions**
Inference images are often many gigabytes. Only include strictly necessary dependencies for fast deployment. Pin every version in requirements.txt — this keeps runtime behavior consistent and prevents breaking changes. Tools like uv, poetry, or pip will flag incompatibilities at build time. Breaking changes are common with newly released models like DeepSeek where you may use nightly builds initially

**Container Layers**
Docker images are composed of layers:
1. **Base image**: Ubuntu or complex image from registry like \`nvcr.io/nvidia/pytorch:24.01-py3\`
2. **Additional layers**: Dependencies, app code, configs from Dockerfile
3. **Container layer**: Ephemeral runtime layer — changes lost when container terminates

**NVIDIA Ecosystem**
The nvidia-container-toolkit exposes GPUs inside containers. Use \`--gpus all\` or \`--gpus '"device=0,1"'\` with docker run. NVIDIA Inference Microservices (NIMs) are pre-built optimized containers: model weights + engine + API server in one \`docker run\`, with health checks, metrics, and load balancing built in`,
        code: `# Dockerfile for an inference service - pinned + minimal
FROM nvcr.io/nvidia/pytorch:24.01-py3

WORKDIR /app

# Pin inference engine version for reproducible builds
RUN pip install --no-cache-dir vllm==0.4.0

# Optional: bake model at build time vs. mounting at runtime
# Trade-off: faster cold starts vs. larger images + slower deploys
RUN huggingface-cli download meta-llama/Llama-3-8B \\
    --local-dir /models/llama3-8b

# Only expose what you need
EXPOSE 8000

# Health check for orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \\
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["python", "-m", "vllm.entrypoints.openai.api_server", \\
     "--model", "/models/llama3-8b", \\
     "--dtype", "bfloat16", \\
     "--max-model-len", "8192", \\
     "--gpu-memory-utilization", "0.95"]`
      },
      {
        id: 'autoscaling',
        title: 'Autoscaling',
        content: `Autoscaling AI inference is uniquely hard due to GPU constraints and model loading time. Scale decisions must consider concurrency, cold starts, routing, and component-level scaling.

**Concurrency and Batch Sizing**
- **Static batching**: Process N requests at once. Simple but wastes GPU time on padding
- **Continuous batching**: Add/remove requests from batch dynamically at token level. Used by vLLM/SGLang
- Batch sizing trades latency for throughput. Larger batches = more throughput but worse per-user latency
- Set autoscaling concurrency target to match replica batch size. Once all replicas hit max concurrency, spin up more

**Cold Starts — The Core Challenge**
Cold start = time to spin up a new replica. Overall autoscaler performance depends on cold start speed — if you can't spin up fast, you over-provision

Cold start has 4 factors:
1. **GPU procurement**: How fast can you add GPUs to cluster and allocate to model?
2. **Image loading**: How fast can you pull the container onto the instance?
3. **Model loading**: How fast can you load weights into container? 7B model: 10-30s, 70B model: 1-5min
4. **Engine startup**: How fast can you start vLLM/SGLang, including compilation?

Mitigation: Make images/weights smaller or get more bandwidth. Quantization helps with model loading speed. Keep warm replicas and use model caching.

**Routing, Load Balancing, and Queueing**
- **Least-connections**: Send to replica with fewest active requests
- **Prefix-aware routing**: Route to replicas with matching KV cache for cache hits
- **Priority queues**: Different SLAs per customer/endpoint
- **Request queueing**: Buffer spikes instead of dropping. Robust queueing is required for scale-to-zero

**Scale to Zero**
Scale down to zero active replicas with no traffic, then scale up on request. Prerequisites: fast cold starts and robust queueing

Good for: dev/test with bursty traffic, periodic workloads like business-hours agents or daily batch jobs. Bad for: latency-sensitive apps with light unscheduled traffic — use pay-per-token APIs until you have more scale

**Independent Component Scaling**
Compound AI workloads have multiple steps with different hardware needs. Voice activity detector needs small GPU; transcription model needs bigger; LLM needs multi-GPU node. Scale API gateway, prefill instances, and decode instances independently`
      },
      {
        id: 'multi-cloud-capacity',
        title: 'Multi-Cloud Capacity Management',
        content: `Managing GPU capacity across cloud providers for reliability, cost, and latency optimization. Multi-cloud capacity management takes a global view for self-healing and global scheduling

**GPU Procurement Strategies**
Large-scale inference blends GPU sources:
- **Reserved instances**: Baseline of low-cost guaranteed capacity, 1-3 year terms
- **On-demand**: Pay-as-you-go, but availability isn't guaranteed during shortages
- **Spot instances**: 60-90% cheaper, but can be reclaimed with 30s-2min notice
- **Multi-cloud**: Pool capacity from AWS, GCP, Azure for flexibility and redundancy

**Geo-Aware Load Balancing**
Users are worldwide. Just like a cluster needs a load balancer, multi-cluster systems need global load balancing. Don't let requests queue when there's spare capacity elsewhere, but don't habitually send Singapore → San Francisco

Rule of thumb: 5ms per time zone. NY → SF = 15ms one way. With 300ms P95 latency budgets, run workloads as close to end users as possible

**Building for Reliability**
GPUs have high failure rates in production. Llama 3 training: 16,000 GPUs for 54 days saw 419 unexpected interruptions, mostly hardware failure. That's ~1 failure per 50,000 GPU-hours. Running one 8-GPU node for a year = 70,000 GPU-hours. Expect hardware failure

Mitigations:
- **Health checks**: GPU memory, model loaded, inference working
- **Graceful degradation**: Fall back to smaller models under load
- **Circuit breakers**: Stop sending traffic to unhealthy instances
- **Redundancy**: Multi-cloud splits inference across providers for resiliency
- **Compliance**: Run inference where data sovereignty requires

**Security and Compliance**
- **Input/output filtering**: Block harmful prompts and outputs
- **Data residency**: Keep data in specific regions for GDPR/compliance
- **Token-level access control**: Rate limiting per API key
- **Audit logging**: Record all inference requests for compliance`,
        code: `# Multi-region deployment config example
regions:
    - name: us-west-2
    gpu_type: h100
    min_replicas: 2 # Never scale to zero in primary region
    reserved: 80% # Baseline capacity
    on_demand: 20% # Burst capacity
    - name: eu-central-1
    gpu_type: h100
    min_replicas: 1
    spot: 50% # Cost optimization for EU traffic
    - name: ap-southeast-1
    gpu_type: h100
    min_replicas: 0 # Scale-to-zero OK for low traffic region

routing:
  strategy: geo_aware_least_latency
  fallback_timeout_ms: 5000 # If primary region slow, try next closest`
      },
      {
        id: 'testing-and-deployment',
        title: 'Testing and Deployment',
        content: `Safe deployment practices and cost modeling for AI inference services.

**Zero-Downtime Deployment**
Upgrade models/infra without dropping requests:
- **Blue-green**: Run old + new versions simultaneously, switch traffic atomically
- **Canary deployment**: Route small % of live traffic to new service, monitor, gradually increase to 100%. Can be fast (minutes) or slow ramp
- **Rolling updates**: Replace instances one at a time
- With autoscaling, canaries don't increase cost much — reducing traffic to prod causes it to scale down
- **Critical**: Ensure new deployment has enough active replicas before shifting traffic, or users see latency spike as requests queue for autoscaling

**Cost Estimation**
Switching from per-token APIs to dedicated GPUs changes how you think about cost. Public APIs: simple price × tokens. Dedicated: cost is function of many variables

Cost factors:
- **Batch sizing**: Latency-optimized low batches vs throughput-optimized high batches
- **Traffic patterns**: Is capacity saturating or going spare?
- **Sequence lengths**: Input/output tokens on average and outliers
- **Input vs output tokens**: Different costs — don't reverse-engineer per-token from GPU cost

Use long time horizons (≥1 week) to smooth usage variations. Total Cost of Ownership includes engineering time to build/maintain systems

**Observability**
Inference is mission-critical — monitor with alerting, logs, observability. Integrate with existing tools: Grafana, Datadog, PagerDuty, Sentry

Key metrics:
- **Total volume**: Requests to model deployment
- **Request/response sizes**: Input/output sequence lengths
- **Response codes**: 2XX, 4XX, 5XX counts
- **Latency**: TTFT, tokens/sec, E2E latency at P50/P90/P99
- **Replica count**: Active + starting up instances
- **Utilization**: CPU, host memory, GPU, GPU memory
- **Queue depth**: Requests enqueued waiting to process

Metrics are interdependent — latency spike could be volume or long sequences. Logs (server + audit) provide real-time info when things go wrong`
      },
      {
        id: 'client-code',
        title: 'Client Code Best Practices',
        content: `Client code is often overlooked but critical — there are two sides to every inference call: client and server. On-server inference time is just a fraction of end-to-end latency

**Client Latency Overhead**
Establishing client-server session takes dozens of milliseconds depending on connection and protocol. In a 300ms P95 SLA system, TLS handshake costs ≥10% of budget before inference starts. Re-use existing sessions for future requests. OpenAI SDK does this silently; when building custom clients for non-standard modalities, follow best practices like session re-use

Co-locate clients near inference servers for latency-critical apps.

**Asynchronous Inference**
For throughput not latency: bulk document processing, corpus embedding. Async = "fire and forget"

Sync requests timeout after minutes. Async jobs immediately acknowledge and later return result to webhook. Async time limits measured in hours not minutes. With strong server-side queuing, async makes high-throughput latency-insensitive systems more robust

**Streaming and Protocol Support**
Streaming makes apps feel instant. For LLMs, streaming text over HTTP is sufficient. For other modalities, especially real-time, you may need protocols beyond HTTP like WebSockets for continuous connection

Protocols:
- **HTTP/REST + SSE**: Simple, widely supported. Server-Sent Events for streaming
- **WebSockets**: Bidirectional, lowest overhead, good for conversational apps
- **gRPC streaming**: Efficient binary, great server-to-server

**Best practices:**
- Set timeouts: TTFT timeout + max generation time
- Implement exponential backoff for retries
- Use connection pooling for high-throughput clients
- Handle partial responses gracefully (connection drops mid-stream)
- For non-standard modalities, validate session re-use is working`,
        code: `# Robust async client with streaming + session re-use
import httpx
import asyncio
import json
from typing import AsyncGenerator

class InferenceClient:
    def __init__(self, base_url: str, api_key: str):
        # Re-use session across requests to avoid TLS handshake overhead
        self.client = httpx.AsyncClient(
            base_url=base_url,
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=httpx.Timeout(60.0, connect=5.0), # TTFT + generation timeout
            limits=httpx.Limits(max_connections=100, max_keepalive_connections=20)
        )

    async def stream_generate(self, prompt: str) -> AsyncGenerator[str, None]:
        """Stream tokens with automatic retry + backoff"""
        for attempt in range(3):
            try:
                async with self.client.stream(
                    "POST",
                    "/v1/chat/completions",
                    json={
                        "model": "llama3-8b",
                        "messages": [{"role": "user", "content": prompt}],
                        "stream": True,
                        "max_tokens": 500
                    }
                ) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if line.startswith("data: ") and line != "data: [DONE]":
                            chunk = json.loads(line[6:])
                            if content := chunk["choices"][0]["delta"].get("content"):
                                yield content
                    return # Success
            except (httpx.TimeoutException, httpx.ConnectError) as e:
                if attempt == 2: raise
                await asyncio.sleep(2 ** attempt) # Exponential backoff

    async def close(self):
        await self.client.aclose()

# Usage
async def main():
    client = InferenceClient("http://inference-server:8000", "YOUR_KEY")
    try:
        async for token in client.stream_generate("Explain AI inference"):
            print(token, end="", flush=True)
    finally:
        await client.close()

asyncio.run(main())`
      }
    ]
  }
;