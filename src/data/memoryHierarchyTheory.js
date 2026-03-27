export const MEMORY_HIERARCHY_THEORY = [
  {
    id: "01",
    title: "Register File - Fastest Storage and Spilling",
    toneClass: "h-reg",
    blocks: [
      {
        title: "Core concept",
        sections: [
          {
            type: "content",
            paragraphs: [
              "The register file is the fastest memory on the GPU. On modern NVIDIA data center parts, each SM exposes 65,536 32-bit registers and each thread gets its own private register allocation.",
              "Registers are on-chip SRAM, so read/write latency is near one cycle. This is why keeping hot values in registers is critical for throughput."
            ]
          },
          {
            type: "list",
            items: [
              "Maximum architectural register index per thread is 255.",
              "Compiler register allocation is automatic and depends on your kernel code.",
              "If register demand exceeds what can be allocated efficiently, extra values spill to local memory (backed by VRAM).",
              "Spills preserve correctness but can cause large performance drops due to high latency memory traffic."
            ]
          }
        ]
      },
      {
        title: "Spec table",
        sections: [
          {
            type: "table",
            headers: ["Property", "Value"],
            rows: [
              ["Registers per SM", "65,536"],
              ["Max registers per thread", "255"],
              ["Access latency", "~1 cycle"],
              ["Memory type", "On-chip SRAM"]
            ]
          }
        ]
      },
      {
        title: "Practical content",
        sections: [
          {
            type: "kv",
            items: [
              { key: "Live calculator", value: "Will my kernel spill?" },
              { key: "Inputs", value: "Threads per block, registers per thread" },
              { key: "Output", value: "Total register use vs 65,536 and spill risk state" },
              { key: "Visual", value: "Fill bar for register usage; overflow arrow to VRAM with SPILL warning" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "02",
    title: "Shared Memory / L1 Cache - Scratchpad and Tiling",
    toneClass: "h-shmem",
    blocks: [
      {
        title: "Core concept",
        sections: [
          {
            type: "content",
            paragraphs: [
              "Shared memory is on-chip memory visible to all threads in a block. It shares hardware resources with L1 cache, but shared memory is explicitly controlled by your kernel.",
              "This scratchpad model lets you stage reusable tiles of data and avoid repeated VRAM reads."
            ]
          },
          {
            type: "list",
            items: [
              "Programmer managed: load, synchronize, reuse, and discard at block end.",
              "Tiling pattern: many threads reuse one loaded tile, reducing global memory traffic.",
              "Bank conflicts can serialize accesses if threads hit the same bank."
            ]
          }
        ]
      },
      {
        title: "Split config table",
        sections: [
          {
            type: "table",
            headers: ["Config", "Shared Memory", "L1 Cache"],
            rows: [
              ["Default", "100 KB", "156 KB"],
              ["Prefer Shared", "164 KB", "92 KB"],
              ["Max Shared", "228 KB", "28 KB"]
            ]
          }
        ]
      },
      {
        title: "Practical content",
        sections: [
          {
            type: "list",
            items: [
              "Tiling visual: without tiling, many arrows to VRAM; with tiling, one staged load and reuse.",
              "Bank conflict simulator: 32-bank grid with stride input and conflict result (no conflict, 2-way, 8-way, etc)."
            ]
          }
        ]
      }
    ]
  },
  {
    id: "03",
    title: "L2 Cache - Shared Across All SMs",
    toneClass: "h-vram",
    blocks: [
      {
        title: "Core concept",
        sections: [
          {
            type: "content",
            paragraphs: [
              "L2 cache sits between per-SM L1/shared and off-chip VRAM. Unlike L1/shared, L2 is a single shared resource across all SMs.",
              "When data is reused by multiple SMs, L2 hits can avoid repeated VRAM trips and significantly improve effective bandwidth."
            ]
          },
          {
            type: "list",
            items: [
              "Typical hierarchy rule: closer memory is faster and smaller.",
              "L2 is slower than register/L1 but much faster than VRAM.",
              "Cross-SM reuse and spatial locality make L2 hit rate a major performance factor."
            ]
          }
        ]
      },
      {
        title: "Memory hierarchy table",
        sections: [
          {
            type: "table",
            headers: ["Level", "Size", "Latency", "Shared?"],
            rows: [
              ["Register", "256 KB per SM", "~1 cycle", "No - per thread"],
              ["L1/Shared", "256 KB per SM", "~30 cycles", "Yes - per block"],
              ["L2", "50 MB", "~200 cycles", "Yes - all SMs"],
              ["VRAM/HBM", "80 GB", "~600 cycles", "Yes - entire GPU"]
            ]
          }
        ]
      },
      {
        title: "Practical content",
        sections: [
          {
            type: "list",
            items: [
              "Hit-rate visual flow: L1 check -> L2 check -> VRAM fallback.",
              "Show stage hit percentages and cumulative latency impact."
            ]
          }
        ]
      }
    ]
  },
  {
    id: "04",
    title: "GPU RAM (VRAM / Global Memory) - Model State Home",
    toneClass: "h-vram",
    blocks: [
      {
        title: "Core concept",
        sections: [
          {
            type: "content",
            paragraphs: [
              "VRAM (global memory) stores model weights, activations, optimizer state, and KV cache. For large LLM inference, memory capacity and bandwidth directly gate throughput.",
              "HBM uses stacked memory dies with very wide interfaces to deliver high bandwidth relative to traditional graphics memory."
            ]
          },
          {
            type: "kv",
            items: [
              { key: "H100 SXM memory", value: "80 GB HBM3" },
              { key: "Bandwidth (class reference)", value: "Up to ~3.35 TB/s" },
              { key: "Why multi-GPU", value: "Large models and KV cache can exceed single-GPU VRAM" }
            ]
          }
        ]
      },
      {
        title: "Practical content",
        sections: [
          {
            type: "list",
            items: [
              "Model fit calculator: model size (7B/13B/70B/180B) + precision (FP32/FP16/INT8/INT4).",
              "Output should show VRAM needed vs 80 GB and required GPU count."
            ]
          },
          {
            type: "table",
            headers: ["Context Length", "Batch Size", "KV Cache Size"],
            rows: [
              ["4K", "1", "~0.5 GB"],
              ["32K", "1", "~4 GB"],
              ["128K", "1", "~16 GB"],
              ["128K", "8", "~128 GB"]
            ]
          }
        ]
      }
    ]
  },
  {
    id: "05",
    title: "HBM vs GDDR - Bandwidth and Deployment Trade-offs",
    toneClass: "h-vram",
    blocks: [
      {
        title: "Core concept",
        sections: [
          {
            type: "content",
            paragraphs: [
              "GDDR memory is common on consumer GPUs and is cost effective for graphics. HBM is co-packaged and optimized for extreme memory bandwidth and energy efficiency per transferred bit.",
              "For memory-bandwidth-bound AI workloads, HBM-class bandwidth can produce major token throughput gains."
            ]
          }
        ]
      },
      {
        title: "Direct comparison table",
        sections: [
          {
            type: "table",
            headers: ["Property", "GDDR6X (RTX 4090)", "HBM3 (H100)"],
            rows: [
              ["Bandwidth", "1 TB/s", "3.35 TB/s"],
              ["Capacity", "24 GB", "80 GB"],
              ["Power per GB/s", "Higher", "Lower"],
              ["Cost", "Low", "Very high"],
              ["Use case", "Gaming", "AI / HPC"]
            ]
          }
        ]
      },
      {
        title: "Practical content",
        sections: [
          {
            type: "list",
            items: [
              "Bandwidth impact visual: token/sec bar chart for equivalent model on GDDR vs HBM systems.",
              "Explain that throughput scaling is workload dependent, not always linear."
            ]
          }
        ]
      }
    ]
  },
  {
    id: "06",
    title: "Memory Banks and Bank Conflicts - 32-Bank Behavior",
    toneClass: "h-shmem",
    blocks: [
      {
        title: "Core concept",
        sections: [
          {
            type: "content",
            paragraphs: [
              "Shared memory is split into 32 banks. If threads in a warp target different banks, requests can be served in parallel.",
              "If multiple threads map to the same bank in the same cycle, accesses serialize and effective bandwidth drops."
            ]
          },
          {
            type: "formula",
            main: "bank_index = address modulo 32",
            sub: "Stride and alignment determine conflict degree."
          }
        ]
      },
      {
        title: "Access pattern table",
        sections: [
          {
            type: "table",
            headers: ["Pattern", "Stride", "Result"],
            rows: [
              ["Thread0->addr0, Thread1->addr4", "1", "No conflict"],
              ["Thread0->addr0, Thread1->addr128", "32", "32-way conflict"],
              ["Thread0->addr0, Thread1->addr8", "2", "2-way conflict"]
            ]
          }
        ]
      },
      {
        title: "Practical content",
        sections: [
          {
            type: "list",
            items: [
              "Interactive 32-bank grid: highlight bank hits per warp for a user-selected stride.",
              "Display conflict degree and estimated wasted cycles.",
              "Mitigation prompts: padding and layout changes to spread accesses."
            ]
          }
        ]
      }
    ]
  },
  {
    id: "07",
    title: "Memory Coalescing - Consecutive vs Strided Access",
    toneClass: "h-vram",
    blocks: [
      {
        title: "Core concept",
        sections: [
          {
            type: "content",
            paragraphs: [
              "Global memory accesses are most efficient when a warp touches contiguous addresses. Hardware can merge these into fewer memory transactions.",
              "Strided or random access breaks coalescing and increases transaction count, reducing effective bandwidth."
            ]
          },
          {
            type: "list",
            items: [
              "Consecutive warp addresses can approach one transaction window.",
              "Large stride patterns can degrade toward one transaction per thread.",
              "Structure-of-arrays layouts are often more coalescing friendly than array-of-structures."
            ]
          }
        ]
      },
      {
        title: "Transaction count table",
        sections: [
          {
            type: "table",
            headers: ["Access Pattern", "Transactions", "Efficiency"],
            rows: [
              ["Consecutive (stride 1)", "1", "100%"],
              ["Stride 2", "2", "50%"],
              ["Stride 4", "4", "25%"],
              ["Stride 32", "32", "3%"],
              ["Random", "32", "3%"]
            ]
          }
        ]
      },
      {
        title: "Practical content",
        sections: [
          {
            type: "compare",
            columns: [
              {
                label: "AoS layout",
                items: [
                  "Pattern: x,y,z,x,y,z...",
                  "Threads jump across fields",
                  "Poor coalescing in many kernels"
                ]
              },
              {
                label: "SoA layout",
                items: [
                  "Pattern: x,x,x..., y,y,y..., z,z,z...",
                  "Threads read adjacent data",
                  "Better coalescing and bandwidth use"
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "08",
    title: "Tensor Memory (Blackwell) - Feeding Tensor Cores",
    toneClass: "h-vram",
    blocks: [
      {
        title: "Core concept",
        sections: [
          {
            type: "content",
            paragraphs: [
              "Blackwell introduces new memory-path capabilities focused on keeping Tensor Cores fed with matrix tiles. The goal is to reduce data-movement stalls and increase sustained tensor throughput.",
              "Compared with fully manual movement strategies, newer hardware paths improve overlap between compute and data staging."
            ]
          }
        ]
      },
      {
        title: "Generation comparison table",
        sections: [
          {
            type: "table",
            headers: ["Feature", "Ampere", "Hopper", "Blackwell"],
            rows: [
              ["Tensor Core gen", "3rd", "4th", "5th"],
              ["Data movement model", "Manual", "Semi-auto (TMA)", "Tensor-memory optimized path"],
              ["FP8 support", "No", "Yes", "Yes + enhanced"],
              ["Peak TFLOPS (FP16 class)", "312", "989", "1800+"]
            ]
          }
        ]
      },
      {
        title: "Practical content",
        sections: [
          {
            type: "list",
            items: [
              "Pipeline visual: old loop (compute -> wait -> compute) vs overlapped pipeline (compute + prefetch).",
              "Focus metric: reduced Tensor Core idle time and better sustained throughput."
            ]
          }
        ]
      }
    ]
  }
];
