export const PRODUCTION_CHAPTER = 
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
;

