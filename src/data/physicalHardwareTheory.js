export const PHYSICAL_HARDWARE_THEORY = [
  {
    "id": "01",
    "title": "Streaming Multiprocessor (SM)",
    "toneClass": "h-sm",
    "blocks": [
      {
        "title": "What it is",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "A Streaming Multiprocessor (SM) is the main execution unit inside an NVIDIA GPU. It is the hardware component that actually runs your CUDA programs and executes instructions. If a GPU is a factory, the SM is one complete department — with its own workers, tools, storage, and manager.",
              "The analogy: CPU is to Core as GPU is to Streaming Multiprocessor. Each SM executes thousands of GPU threads in parallel."
            ]
          }
        ]
      },
      {
        "title": "What an SM is responsible for",
        "sections": [
          {
            "type": "list",
            "items": [
              "Executing instructions (SASS machine code)",
              "Managing threads — assigning them to execution units",
              "Scheduling work — picking which warp runs each cycle",
              "Storing thread state in the register file",
              "Coordinating memory access — shared memory, L1 cache"
            ]
          }
        ]
      },
      {
        "title": "Internal components of one SM",
        "sections": [
          {
            "type": "compare",
            "columns": [
              {
                "label": "Compute units",
                "items": [
                  "CUDA cores → execute scalar arithmetic (add, multiply)",
                  "Tensor cores → execute matrix multiply-accumulate (MMA)",
                  "Special Function Units (SFU) → sin, cos, sqrt, exp"
                ]
              },
              {
                "label": "Memory units",
                "items": [
                  "Register file → fastest storage, private per thread",
                  "Shared memory / L1 cache → fast, shared by block",
                  "Load/Store Units (LSU) → move data to/from memory"
                ]
              },
              {
                "label": "Scheduling units",
                "items": [
                  "Warp schedulers → decide which warp executes each clock cycle"
                ]
              }
            ]
          }
        ]
      },
      {
        "title": "SM specs across GPU generations",
        "sections": [
          {
            "type": "table",
            "headers": [
              "GPU",
              "Architecture",
              "SMs",
              "CUDA cores/SM",
              "Tensor cores/SM",
              "Warps/SM",
              "Shared mem/SM"
            ],
            "rows": [
              [
                "H100 SXM",
                "Hopper",
                "132",
                "128",
                "4",
                "64",
                "256 KB"
              ],
              [
                "A100",
                "Ampere",
                "108",
                "128",
                "4",
                "64",
                "192 KB"
              ],
              [
                "RTX 4090",
                "Ada",
                "128",
                "128",
                "4",
                "48",
                "128 KB"
              ],
              [
                "RTX 3090",
                "Ampere",
                "82",
                "128",
                "4",
                "48",
                "128 KB"
              ]
            ]
          }
        ]
      },
      {
        "title": "SM vs CPU core — key differences",
        "sections": [
          {
            "type": "table",
            "headers": [
              "Feature",
              "CPU Core",
              "GPU SM"
            ],
            "rows": [
              [
                "Main purpose",
                "Fast sequential execution",
                "Massive parallel execution"
              ],
              [
                "Threads per unit",
                "1–2",
                "2048 concurrent threads"
              ],
              [
                "Context switch",
                "~1000 cycles (slow)",
                "1 clock cycle"
              ],
              [
                "Cache size",
                "Very large (MB)",
                "Smaller (256 KB)"
              ],
              [
                "Control logic",
                "Complex (branch predict)",
                "Simpler (no speculation)"
              ]
            ]
          }
        ]
      },
      {
        "title": "Parallel execution numbers (H100)",
        "sections": [
          {
            "type": "kv",
            "items": [
              {
                "key": "SMs in H100",
                "value": "132"
              },
              {
                "key": "Warp schedulers per SM",
                "value": "4"
              },
              {
                "key": "Threads per warp",
                "value": "32"
              },
              {
                "key": "Parallel threads per SM per cycle",
                "value": "128 (4×32)"
              },
              {
                "key": "Total parallel threads (H100)",
                "value": "16,896"
              },
              {
                "key": "Total concurrent threads (H100)",
                "value": "270,336"
              }
            ]
          }
        ]
      },
      {
        "title": "Factory analogy",
        "sections": [
          {
            "type": "list",
            "items": [
              "GPU = factory",
              "SM = department inside the factory",
              "GPU cores = workers who do actual work",
              "Warp scheduler = manager who assigns tasks"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "02",
    "title": "CUDA Cores",
    "toneClass": "h-cuda",
    "blocks": [
      {
        "title": "What it is",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "A CUDA core is the basic arithmetic execution unit inside a Streaming Multiprocessor. It performs the actual mathematical computations — addition, multiplication, fused multiply-add (FMA). If the SM is the processor, CUDA cores are the execution engines inside it.",
              "CUDA cores execute scalar instructions — one operation on one piece of data per cycle. They are general-purpose compute units, different from Tensor cores which handle entire matrices."
            ]
          }
        ]
      },
      {
        "title": "Types of CUDA cores",
        "sections": [
          {
            "type": "list",
            "items": [
              "FP32 cores — 32-bit floating point. The most common. Used for most AI inference and general GPU compute",
              "INT32 cores — 32-bit integer. Used for address calculations, index arithmetic",
              "FP64 cores — 64-bit double precision. Used in scientific computing. Fewer of these per SM"
            ]
          }
        ]
      },
      {
        "title": "How CUDA cores execute instructions",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "CUDA cores do not execute instructions independently. The warp scheduler issues the same instruction to a group of 32 threads (a warp), and each CUDA core applies that instruction to different data in different registers. This is SIMT — Single Instruction, Multiple Threads."
            ]
          },
          {
            "type": "formula",
            "main": "CUDA program → GPU → Streaming Multiprocessors → CUDA cores → execute instructions",
            "sub": "One CUDA core executes one thread's instruction at a time"
          }
        ]
      },
      {
        "title": "Ampere dual-pipeline design (RTX 3090 / A100)",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "In Ampere architecture, CUDA cores are split into two groups per SM:"
            ]
          },
          {
            "type": "list",
            "items": [
              "64 dedicated FP32 cores — always do FP32",
              "64 dual-purpose FP32/INT32 cores — can do either FP32 or INT32 depending on the instruction"
            ]
          },
          {
            "type": "content",
            "paragraphs": [
              "This means the GPU can execute 128 FP32 operations per clock per SM, or mix FP32 and INT32 simultaneously — a significant improvement over Pascal."
            ]
          }
        ]
      },
      {
        "title": "What CUDA cores actually do in AI workloads",
        "sections": [
          {
            "type": "list",
            "items": [
              "Floating point arithmetic in linear layers (before Tensor cores take over)",
              "Activation functions (ReLU, GELU) — elementwise operations",
              "Normalization math (LayerNorm, RMSNorm)",
              "Memory index calculations",
              "Softmax (exp, sum, divide)"
            ]
          }
        ]
      },
      {
        "title": "CUDA core counts by GPU",
        "sections": [
          {
            "type": "table",
            "headers": [
              "GPU",
              "Architecture",
              "SMs",
              "CUDA cores/SM",
              "Total CUDA cores"
            ],
            "rows": [
              [
                "H100 SXM",
                "Hopper",
                "132",
                "128",
                "16,896"
              ],
              [
                "A100",
                "Ampere",
                "108",
                "128",
                "13,824"
              ],
              [
                "RTX 4090",
                "Ada",
                "128",
                "128",
                "16,384"
              ],
              [
                "RTX 3090",
                "Ampere",
                "82",
                "128",
                "10,496"
              ]
            ]
          }
        ]
      },
      {
        "title": "Peak TFLOP formula",
        "sections": [
          {
            "type": "formula",
            "main": "Peak TFLOP = (Total CUDA cores) × (Clock MHz) × (Ops per cycle) ÷ 10¹²",
            "sub": "Example H100: 16,896 × 1,980 MHz × 2 (FMA) = 66.9 TFLOP/s FP32"
          }
        ]
      }
    ]
  },
  {
    "id": "03",
    "title": "Tensor Cores",
    "toneClass": "h-tens",
    "blocks": [
      {
        "title": "What it is",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "Tensor cores are specialized hardware units inside Streaming Multiprocessors designed specifically to perform matrix multiply and accumulate (MMA) operations extremely fast. While a CUDA core operates on one number at a time, a Tensor core operates on entire matrices in a single instruction.",
              "They are the reason modern GPUs can train and run large neural networks. Without Tensor cores, deep learning at scale would be impractical."
            ]
          }
        ]
      },
      {
        "title": "The core operation Tensor cores perform",
        "sections": [
          {
            "type": "formula",
            "main": "D = A × B + C",
            "sub": "Called Matrix Multiply and Accumulate (MMA). A and B are input matrices, C is the accumulator, D is the result. This is the foundation of every linear layer, attention mechanism, convolution, and transformer block."
          }
        ]
      },
      {
        "title": "Why Tensor cores exist — the problem they solve",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "Neural networks are almost entirely matrix multiplications. A linear layer with M×K weight matrix applied to a K×N input batch is one GEMM operation. Transformers run hundreds of these per forward pass. CUDA cores doing this scalar multiplication would take thousands of cycles. Tensor cores do the same operation in one instruction — thousands of times faster."
            ]
          }
        ]
      },
      {
        "title": "CUDA core vs Tensor core comparison",
        "sections": [
          {
            "type": "table",
            "headers": [
              "Feature",
              "CUDA Core",
              "Tensor Core"
            ],
            "rows": [
              [
                "Operation",
                "Scalar arithmetic",
                "Matrix multiply-accumulate"
              ],
              [
                "Ops per instruction",
                "1–2",
                "Thousands"
              ],
              [
                "Speed (relative)",
                "Slower",
                "Much faster (15×+)"
              ],
              [
                "Used for",
                "General compute, activations",
                "AI, deep learning, GEMM"
              ],
              [
                "Count per SM (H100)",
                "128",
                "4"
              ]
            ]
          }
        ]
      },
      {
        "title": "Tensor core generations and precisions",
        "sections": [
          {
            "type": "table",
            "headers": [
              "Generation",
              "GPU",
              "Precisions supported",
              "Peak (per SM)"
            ],
            "rows": [
              [
                "1st gen",
                "V100 (Volta)",
                "FP16",
                "125 TFLOP"
              ],
              [
                "2nd gen",
                "A100 (Ampere)",
                "FP16, BF16, INT8, TF32",
                "312 TFLOP"
              ],
              [
                "3rd gen",
                "H100 (Hopper)",
                "FP16, BF16, INT8, FP8, TF32",
                "989 TFLOP"
              ],
              [
                "4th gen",
                "B200 (Blackwell)",
                "All above + FP4",
                "4.5 PFLOP"
              ]
            ]
          }
        ]
      },
      {
        "title": "What Tensor cores are used for in AI workloads",
        "sections": [
          {
            "type": "list",
            "items": [
              "Every linear / fully connected layer (GEMM)",
              "Attention QK^T and AV computations in transformers",
              "CNN convolutions (via im2col → GEMM)",
              "Embedding table lookups (in some implementations)",
              "Flash Attention uses Tensor cores via warpgroup MMA (Hopper)"
            ]
          }
        ]
      },
      {
        "title": "Key insight — fewer but far more powerful",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "H100 has 128 CUDA cores per SM but only 4 Tensor cores per SM. Yet Tensor cores produce the majority of the useful AI compute. The 989 TFLOP FP16 headline number comes almost entirely from Tensor cores, not CUDA cores."
            ]
          },
          {
            "type": "kv",
            "items": [
              {
                "key": "H100 FP32 (CUDA cores only)",
                "value": "66.9 TFLOP"
              },
              {
                "key": "H100 FP16 (Tensor cores)",
                "value": ""
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "04",
    "title": "Warp Scheduler",
    "toneClass": "h-warp",
    "blocks": [
      {
        "title": "What a warp is first",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "A warp is a group of 32 CUDA threads that execute the same instruction simultaneously on different data. The SM does not schedule individual threads — it schedules warps. A warp is the smallest schedulable unit on a GPU."
            ]
          },
          {
            "type": "kv",
            "items": [
              {
                "key": "Threads per warp",
                "value": "32 (always)"
              },
              {
                "key": "Max warps per SM (H100)",
                "value": "64"
              },
              {
                "key": "Warp schedulers per SM (H100)",
                "value": "4"
              },
              {
                "key": "Warps issued per cycle",
                "value": "4 (one per scheduler)"
              }
            ]
          }
        ]
      },
      {
        "title": "What the warp scheduler does",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "The warp scheduler decides which warp executes next on each clock cycle. Every cycle, it looks at all active warps and picks the ones that are eligible to run — those that have their next instruction ready and all their input data available. It issues an instruction from an eligible warp to the CUDA cores."
            ]
          }
        ]
      },
      {
        "title": "Four warp states",
        "sections": [
          {
            "type": "list",
            "items": [
              "Active — warp exists and has not finished. Loaded in the SM. Has registers allocated",
              "Eligible — warp is active and its next instruction is ready to execute right now",
              "Selected — warp was chosen by the scheduler this cycle and is executing",
              "Stalled — warp is active but waiting for something (memory load, previous instruction to finish). Cannot run yet"
            ]
          }
        ]
      },
      {
        "title": "Why fast switching is the key to GPU efficiency",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "When one warp stalls waiting for a memory read from VRAM (which takes 400–800 cycles), the warp scheduler instantly switches to another eligible warp in 1 clock cycle. No state needs to be saved because every warp's registers are permanently stored in the register file. This is how the GPU hides memory latency — by always having another warp ready to go."
            ]
          },
          {
            "type": "compare",
            "columns": [
              {
                "label": "CPU context switch",
                "items": [
                  "Save registers to memory",
                  "Load next thread's state",
                  "~1,000–10,000 clock cycles"
                ]
              },
              {
                "label": "GPU warp switch",
                "items": [
                  "Registers already in register file",
                  "Nothing to save or load",
                  "1 clock cycle"
                ]
              }
            ]
          }
        ]
      },
      {
        "title": "Warp divergence — the scheduler's biggest enemy",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "All 32 threads in a warp must execute the same instruction. When an if/else condition causes threads to take different branches, the warp scheduler must run the if-path first (with else-path threads masked) and then the else-path (with if-path threads masked). This is called predication and cuts effective throughput in proportion to the number of distinct paths."
            ]
          },
          {
            "type": "formula",
            "main": "if (threadIdx.x % 2 == 0) → 2 passes needed → 50% wasted thread-cycles",
            "sub": "Even split = 2 passes. Best case = no divergence = 1 pass = 100% efficiency"
          }
        ]
      }
    ]
  },
  {
    "id": "05",
    "title": "Special Function Units (SFU) and Load/Store Units (LSU)",
    "toneClass": "h-sfu",
    "blocks": [
      {
        "title": "Special Function Unit (SFU) — what it is",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "An SFU is a hardware unit inside a Streaming Multiprocessor that executes complex mathematical functions faster than normal CUDA cores could. These are called transcendental functions — operations that cannot be done with simple multiply-add chains."
            ]
          },
          {
            "type": "list",
            "items": [
              "sin(x), cos(x), tan(x) — trigonometric functions",
              "sqrt(x) — square root",
              "exp(x) — natural exponential (used in softmax, sigmoid, GELU)",
              "log(x) — natural logarithm",
              "rcp(x) — reciprocal (1/x)",
              "rsqrt(x) — reciprocal square root (very common in normalization)"
            ]
          }
        ]
      },
      {
        "title": "SFU count and throughput",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "Each SM has 4 SFUs (on modern NVIDIA architectures). Each SFU can process one thread's transcendental function per clock. Since a warp has 32 threads, processing one warp takes 32/4 = 8 cycles. For comparison, a CUDA core can process one FP32 multiply per clock per core — so CUDA cores handle SFU-type work much slower when SFU is the bottleneck."
            ]
          },
          {
            "type": "kv",
            "items": [
              {
                "key": "SFUs per SM",
                "value": "4"
              },
              {
                "key": "Cycles for one warp",
                "value": "8 cycles (32 ÷ 4)"
              },
              {
                "key": "Functions executed",
                "value": "sin, cos, exp, sqrt, log"
              },
              {
                "key": "Used heavily in",
                "value": "Softmax, GELU, normalization"
              }
            ]
          }
        ]
      },
      {
        "title": "Load/Store Unit (LSU) — what it is",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "An LSU is a hardware unit inside the SM that moves data between memory and CUDA cores. CUDA cores cannot directly access memory — they can only operate on values already in registers. The LSU is the interface between the compute units and all memory levels."
            ]
          },
          {
            "type": "list",
            "items": [
              "Load — reads data from shared memory, L1, L2, or global memory (VRAM) into registers",
              "Store — writes results from registers back to shared memory or global memory"
            ]
          }
        ]
      },
      {
        "title": "Why LSU is critical — the bottleneck you don't see",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "Without the LSU, CUDA cores have nothing to compute. In memory-bound kernels, CUDA cores are actually idle most of the time — they are waiting for the LSU to bring data from VRAM. The LSU is what makes memory bandwidth the limiting factor in memory-bound workloads. When developers talk about LLM inference being \"memory-bound,\" they mean the LSU is constantly moving model weights from VRAM and is always the bottleneck, not the CUDA cores."
            ]
          },
          {
            "type": "kv",
            "items": [
              {
                "key": "LSUs per SM",
                "value": "16"
              },
              {
                "key": "Without LSU",
                "value": "GPU cores cannot load or store data"
              }
            ]
          }
        ]
      },
      {
        "title": "SFU vs LSU — side by side",
        "sections": [
          {
            "type": "table",
            "headers": [
              "Feature",
              "SFU",
              "LSU"
            ],
            "rows": [
              [
                "Purpose",
                "Execute complex math",
                "Move data between memory and cores"
              ],
              [
                "Function type",
                "Computation",
                "Memory access"
              ],
              [
                "Example operations",
                "exp(), sqrt(), sin()",
                "load(), store()"
              ],
              [
                "Role",
                "Math acceleration",
                "Memory communication"
              ]
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "06",
    "title": "Tensor Memory Accelerator — TMA (Hopper+)",
    "toneClass": "h-tma",
    "blocks": [
      {
        "title": "What it is",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "The Tensor Memory Accelerator (TMA) is a specialized hardware unit introduced in NVIDIA Hopper (H100) to efficiently move large blocks of multi-dimensional data from global memory (GPU RAM) to shared memory (the SM's fast local memory). It is designed specifically to optimize memory movement for AI matrix operations.",
              "TMA was introduced because as Tensor cores got faster, feeding them data from VRAM became the new bottleneck. TMA solves this by making memory transfer asynchronous and bypassing the register file entirely."
            ]
          }
        ]
      },
      {
        "title": "What TMA does differently from normal memory loads",
        "sections": [
          {
            "type": "compare",
            "columns": [
              {
                "label": "Normal LSU load (pre-Hopper)",
                "items": [
                  "CUDA core issues load instruction",
                  "Data goes through registers",
                  "Wastes register file capacity",
                  "Threads stall waiting for data",
                  "Increases register pressure"
                ]
              },
              {
                "label": "TMA load (Hopper+)",
                "items": [
                  "Hardware unit issues bulk transfer",
                  "Data goes directly to shared memory",
                  "Bypasses registers completely",
                  "Transfer is asynchronous",
                  "Threads continue computing"
                ]
              }
            ]
          }
        ]
      },
      {
        "title": "The path TMA takes",
        "sections": [
          {
            "type": "formula",
            "main": "Global Memory (VRAM) → Shared Memory (SM)",
            "sub": "Completely bypasses: Registers · CUDA cores · Tensor cores. This frees those units to keep computing while data arrives."
          }
        ]
      },
      {
        "title": "Why TMA matters for LLM inference",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "Flash Attention v3 and other Hopper-optimized kernels use TMA to overlap computation and memory movement. While one warpgroup is computing attention on one tile, TMA is already loading the next tile into shared memory. This is called software pipelining and gets close to 100% Tensor core utilization on H100 — something impossible with normal loads."
            ]
          }
        ]
      },
      {
        "title": "GPU support",
        "sections": [
          {
            "type": "list",
            "items": [
              "Hopper (H100) — introduced TMA",
              "Blackwell (B200) — extended TMA capabilities",
              "Ampere (A100, RTX 3090) — not available",
              "Ada (RTX 4090) — not available"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "07",
    "title": "Register File",
    "toneClass": "h-reg",
    "blocks": [
      {
        "title": "What it is",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "The register file is the fastest memory inside a Streaming Multiprocessor. It stores data that CUDA cores and Tensor cores are currently using for computation. Every active thread has its own private slice of the register file — this is how the warp scheduler can switch between warps in 1 cycle without saving any state."
            ]
          }
        ]
      },
      {
        "title": "What registers store",
        "sections": [
          {
            "type": "list",
            "items": [
              "Local variables in your CUDA kernel",
              "Intermediate computation results (between instructions)",
              "Memory addresses used in load/store operations",
              "Loop counters and control flow variables",
              "Thread's program counter (instruction pointer)"
            ]
          }
        ]
      },
      {
        "title": "Register file specs",
        "sections": [
          {
            "type": "kv",
            "items": [
              {
                "key": "Registers per SM (all modern GPUs)",
                "value": "65,536 × 32-bit"
              },
              {
                "key": "Max registers per thread",
                "value": "255"
              },
              {
                "key": "Latency",
                "value": "~1 cycle (fastest)"
              },
              {
                "key": "Total registers in RTX 3090 (82 SMs)",
                "value": "5,373,952"
              }
            ]
          }
        ]
      },
      {
        "title": "Register pressure — the critical concept",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "Register pressure is how many registers your kernel uses per thread. The register file is shared among all threads in the SM — if each thread uses more registers, fewer threads can run simultaneously, which reduces occupancy and limits latency hiding."
            ]
          },
          {
            "type": "formula",
            "main": "Max concurrent threads = 65,536 registers ÷ (registers per thread)",
            "sub": "32 registers/thread → 2048 threads (full occupancy). 64 registers/thread → 1024 threads (50% occupancy)."
          }
        ]
      },
      {
        "title": "Register spilling",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "When a kernel uses more than 255 registers per thread, the compiler spills excess data to local memory — which is actually stored in global memory (VRAM). This is catastrophic for performance because a register access takes 1 cycle but a VRAM access takes 400–800 cycles. Profilers show register spilling as long scoreboard stalls."
            ]
          }
        ]
      },
      {
        "title": "Memory hierarchy position",
        "sections": [
          {
            "type": "formula",
            "main": "Registers (~1 cycle) → Shared/L1 (~30 cycles) → L2 (~200 cycles) → VRAM (~600 cycles) → CPU RAM (~10,000 cycles)",
            "sub": "Registers are 600× faster than VRAM. Always keep working data in registers and shared memory."
          }
        ]
      }
    ]
  },
  {
    "id": "08",
    "title": "Shared Memory",
    "toneClass": "h-shmem",
    "blocks": [
      {
        "title": "What it is",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "Shared memory is a fast, programmer-controlled memory inside each SM that is shared by all threads in the same thread block. It is physically the same chip as the L1 data cache — the split between shared memory and L1 is configurable in modern GPUs. Unlike registers (private per thread), shared memory is visible to all threads in a block, which allows them to cooperate and share data without going to slow global memory."
            ]
          }
        ]
      },
      {
        "title": "Key properties",
        "sections": [
          {
            "type": "list",
            "items": [
              "~30 cycle latency — much faster than VRAM (600 cycles) but slower than registers (1 cycle)",
              "Programmer-controlled — you explicitly load data into it using __shared__",
              "Shared within a block — all threads in one block can read and write it",
              "Block-lifetime — allocated when the block starts, freed when it ends",
              "256 KB per SM on H100, 128 KB on RTX 3090/4090"
            ]
          }
        ]
      },
      {
        "title": "The tiling strategy — why shared memory matters",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "The main use of shared memory is tiling: loading a chunk of data from VRAM once, using it many times from shared memory, then loading the next chunk. This dramatically reduces global memory traffic because you pay the 600-cycle VRAM cost once but do dozens of operations from the 30-cycle shared memory."
            ]
          },
          {
            "type": "formula",
            "main": "Without tiling: N operations × 1 VRAM load each = N × 600 cycles\nWith tiling: 1 VRAM load + N operations from shared = 600 + N × 30 cycles",
            "sub": "For matrix multiply with reuse factor K: ~K× speedup. This is why cuBLAS is fast."
          }
        ]
      },
      {
        "title": "Bank conflicts — the main pitfall",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "Shared memory is divided into 32 banks, each 4 bytes wide. Multiple threads can access different banks simultaneously — perfectly parallel. But if multiple threads access different addresses in the same bank, those accesses are serialized — they become sequential instead of parallel. This is a bank conflict."
            ]
          },
          {
            "type": "list",
            "items": [
              "Access stride = 1 (consecutive) → no conflicts, 1 transaction",
              "Access stride = 32 → all 32 threads hit bank 0 → 32-way conflict → 32 serial transactions",
              "Fix: pad shared memory array by 1 element to shift stride and avoid conflicts"
            ]
          }
        ]
      },
      {
        "title": "Shared memory specs by GPU",
        "sections": [
          {
            "type": "table",
            "headers": [
              "GPU",
              "Shared mem per SM",
              "Max shared per block",
              "Banks"
            ],
            "rows": [
              [
                "H100 SXM",
                "256 KB",
                "228 KB",
                "32"
              ],
              [
                "A100",
                "192 KB",
                "164 KB",
                "32"
              ],
              [
                "RTX 4090",
                "128 KB",
                "100 KB",
                "32"
              ],
              [
                "RTX 3090",
                "128 KB",
                "100 KB",
                "32"
              ]
            ]
          }
        ]
      },
      {
        "title": "How shared memory limits occupancy",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "Like registers, shared memory is shared among all blocks on an SM. If one block uses 64 KB of shared memory and the SM has 128 KB total, only 2 blocks can run simultaneously — reducing occupancy. This is the second most common occupancy limiter after register pressure."
            ]
          },
          {
            "type": "formula",
            "main": "Max blocks per SM = Total shared memory ÷ Shared memory per block",
            "sub": "128 KB SM, 32 KB per block → max 4 blocks per SM"
          }
        ]
      }
    ]
  },
  {
    "id": "09",
    "title": "GPU RAM (VRAM / Global Memory)",
    "toneClass": "h-vram",
    "blocks": [
      {
        "title": "What it is",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "GPU RAM — also called VRAM, Video RAM, or Global Memory — is the main large memory of the GPU. It is accessible by all Streaming Multiprocessors across the entire chip. This is where model weights, KV cache, activations, gradients, and all large tensors live. It is the slowest memory level on the GPU but by far the largest."
            ]
          }
        ]
      },
      {
        "title": "Three names for the same thing",
        "sections": [
          {
            "type": "list",
            "items": [
              "Global Memory — the CUDA programming term. What you access with cudaMalloc",
              "VRAM — Video RAM. The marketing term. What nvidia-smi reports",
              "GPU RAM — general term. What people mean when they say \"my GPU has 24 GB\""
            ]
          }
        ]
      },
      {
        "title": "What is stored in VRAM",
        "sections": [
          {
            "type": "list",
            "items": [
              "Model weights — the largest consumer. 7B FP16 model = 14 GB",
              "KV cache — grows with sequence length and batch size",
              "Activations — intermediate tensors during forward pass",
              "Gradients — during training, same size as weights",
              "Optimizer state — Adam stores 2 momentum buffers × weights size",
              "Textures (for graphics workloads)"
            ]
          }
        ]
      },
      {
        "title": "HBM vs GDDR — the two VRAM types",
        "sections": [
          {
            "type": "compare",
            "columns": [
              {
                "label": "HBM (H100, A100, V100)",
                "items": [
                  "High Bandwidth Memory — stacked 3D DRAM",
                  "Very wide memory bus (5120-bit on H100)",
                  "Extremely high bandwidth (3.35 TB/s H100)",
                  "More expensive, used in data center GPUs",
                  "Lower capacity ceiling"
                ]
              },
              {
                "label": "GDDR6X (RTX 3090, RTX 4090)",
                "items": [
                  "Graphics DDR — standard planar DRAM",
                  "Narrower bus (384-bit on RTX 3090)",
                  "Lower bandwidth (~900 GB/s RTX 3090)",
                  "Cheaper, used in consumer GPUs",
                  "Can achieve higher capacities"
                ]
              }
            ]
          }
        ]
      },
      {
        "title": "VRAM specs across major GPUs",
        "sections": [
          {
            "type": "table",
            "headers": [
              "GPU",
              "VRAM",
              "Type",
              "Bandwidth",
              "Bus width"
            ],
            "rows": [
              [
                "H100 SXM",
                "80 GB",
                "HBM3",
                "3.35 TB/s",
                "5120-bit"
              ],
              [
                "A100 80G",
                "80 GB",
                "HBM2e",
                "2.0 TB/s",
                "5120-bit"
              ],
              [
                "RTX 4090",
                "24 GB",
                "GDDR6X",
                "1.0 TB/s",
                "384-bit"
              ],
              [
                "RTX 3090",
                "24 GB",
                "GDDR6X",
                "936 GB/s",
                "384-bit"
              ],
              [
                "B200",
                "192 GB",
                "HBM3e",
                "8.0 TB/s",
                "8192-bit"
              ]
            ]
          }
        ]
      },
      {
        "title": "VRAM requirements for AI workloads",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "Understanding VRAM usage is one of the most practical GPU skills. Here is how to estimate what you need:"
            ]
          },
          {
            "type": "formula",
            "main": "Inference VRAM = weights + KV cache + activations + overhead (~10%)\nTraining VRAM = weights + gradients + optimizer state + activations + overhead",
            "sub": "Weights: params × bytes_per_param (FP32=4, BF16=2, INT8=1, INT4=0.5)\n7B BF16 = 7×10⁹ × 2 = 14 GB just for weights\nAdam optimizer adds 2× weights = 28 GB more for training"
          }
        ]
      },
      {
        "title": "Why VRAM bandwidth matters more than VRAM size for inference",
        "sections": [
          {
            "type": "content",
            "paragraphs": [
              "During LLM inference decode (generating tokens one by one), the model reads all weights from VRAM for every single token. With a batch size of 1, there is very little computation reuse — so the bottleneck is how fast you can stream weights from VRAM. This is why the H100 at 3.35 TB/s memory bandwidth generates tokens much faster than an RTX 3090 at 936 GB/s, even if both have the same VRAM capacity."
            ]
          },
          {
            "type": "formula",
            "main": "Minimum token latency = model size ÷ memory bandwidth",
            "sub": "7B BF16 (14 GB) on H100 (3.35 TB/s) = 14 GB ÷ 3350 GB/s ≈ 4.2 ms per token minimum"
          }
        ]
      },
      {
        "title": "Why DRAM instead of SRAM for GPU RAM",
        "sections": [
          {
            "type": "compare",
            "columns": [
              {
                "label": "SRAM (used in registers, L1, L2)",
                "items": [
                  "Very fast (~1–200 cycles)",
                  "Large transistor count per bit",
                  "Very expensive per GB",
                  "Not feasible at 24–80 GB scale"
                ]
              },
              {
                "label": "DRAM (used in VRAM)",
                "items": [
                  "Slower (~600 cycles)",
                  "1 transistor + 1 capacitor per bit",
                  "Much cheaper per GB",
                  "Feasible at 80–192 GB scale"
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];
