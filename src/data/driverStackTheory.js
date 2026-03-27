export const DRIVER_STACK_THEORY = [
  {
    id: "01",
    title: "NVIDIA Driver Module Responsibilities",
    toneClass: "h-sm",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "The NVIDIA driver is the control bridge between the operating system and GPU hardware.",
              "It is responsible for isolation, scheduling, command submission, and fault handling so multiple applications can safely share the GPU."
            ]
          }
        ]
      },
      {
        title: "Core responsibilities",
        sections: [
          {
            type: "list",
            items: [
              "Resource management: allocate VRAM and protect process memory boundaries.",
              "Instruction submission: translate software requests into GPU command streams and queues.",
              "Context switching: multiplex GPU access across processes over time slices.",
              "Error handling: surface XID-class failures, watchdog events, and thermal throttling conditions."
            ]
          }
        ]
      }
    ]
  },
  {
    id: "02",
    title: "Driver API vs Runtime API",
    toneClass: "h-cuda",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "CUDA exposes two programming layers: a high-level Runtime API and a low-level Driver API.",
              "The Runtime API simplifies usage, while the Driver API offers explicit control over contexts and module loading."
            ]
          }
        ]
      },
      {
        title: "Comparison table",
        sections: [
          {
            type: "table",
            headers: ["Aspect", "Runtime API (cuda*)", "Driver API (cu*)"],
            rows: [
              ["Abstraction level", "High-level convenience", "Low-level explicit control"],
              ["Context handling", "Automatic", "Manual"],
              ["Ease of use", "Easier", "More verbose"],
              ["Typical users", "Most CUDA app developers", "Framework/runtime/library developers"],
              ["Relationship", "Built on Driver API", "Foundation layer"]
            ]
          }
        ]
      }
    ]
  },
  {
    id: "03",
    title: "NVML and nvidia-smi Metric Semantics",
    toneClass: "h-vram",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "nvidia-smi is powered by NVML (NVIDIA Management Library), a system management interface for telemetry and controls.",
              "Interpreting metrics correctly is essential because many counters represent activity windows, not absolute saturation."
            ]
          }
        ]
      },
      {
        title: "Metric semantics",
        sections: [
          {
            type: "table",
            headers: ["Metric", "What it means"],
            rows: [
              ["GPU Utilization", "At least one kernel was active during the sampling interval"],
              ["Memory Utilization", "Memory controller activity time, not just memory capacity usage"],
              ["Power Draw", "Instantaneous board power, critical for datacenter power envelopes"],
              ["Memory Used", "Allocated VRAM footprint, not bandwidth pressure"]
            ]
          }
        ]
      }
    ]
  },
  {
    id: "04",
    title: "CUPTI Role for Profiling",
    toneClass: "h-warp",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "CUPTI (CUDA Profiling Tools Interface) provides profiling hooks and hardware counter access for performance analysis.",
              "Tools such as Nsight Systems and Nsight Compute rely on CUPTI to expose timing, activity traces, and stall/counter data."
            ]
          }
        ]
      },
      {
        title: "What CUPTI provides",
        sections: [
          {
            type: "list",
            items: [
              "Tracing: kernel launch/complete timelines and runtime API activity.",
              "Hardware counters: cache misses, instruction throughput, memory transactions, and more.",
              "Root-cause signals for bottlenecks such as low bandwidth utilization or high stall percentages."
            ]
          }
        ]
      }
    ]
  },
  {
    id: "05",
    title: "Full App-to-Hardware Software Stack",
    toneClass: "h-tma",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "End-to-end GPU execution spans multiple software layers, from application code down to kernel drivers and silicon.",
              "Understanding this stack helps isolate where latency, overhead, or incompatibility is introduced."
            ]
          }
        ]
      },
      {
        title: "Stack view",
        sections: [
          {
            type: "table",
            headers: ["Layer", "Role"],
            rows: [
              ["Application layer", "User code (for example Python + PyTorch)"],
              ["Framework/library layer", "cuBLAS, cuDNN, Triton, custom kernels"],
              ["CUDA Runtime", "High-level kernel launch and memory orchestration"],
              ["CUDA Driver", "System-facing device control and command submission"],
              ["NVIDIA kernel module", "OS kernel integration and low-level management"],
              ["GPU hardware", "Physical SMs, memory hierarchy, and execution pipelines"]
            ]
          }
        ]
      }
    ]
  }
];
