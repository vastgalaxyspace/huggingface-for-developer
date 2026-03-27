export const EXECUTION_MODEL_THEORY = [
  {
    id: "01",
    title: "Thread - Smallest Unit with PC and Registers",
    toneClass: "h-sm",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "A thread is the smallest unit of execution on the GPU. Each thread has its own program counter and private register state.",
              "Threads are lightweight and execute the same kernel code on different data values."
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
              ["Private memory", "Registers only"],
              ["Max registers per thread", "255"],
              ["Has own program counter", "Yes"],
              ["Lives inside", "A warp (group of 32)"],
              ["Execution model", "SIMT"]
            ]
          }
        ]
      },
      {
        title: "Practical visual",
        sections: [
          {
            type: "list",
            items: [
              "Show 32 boxes labeled Thread 0 to Thread 31.",
              "Inside each box show PC and Registers.",
              "Label the full row as one warp."
            ]
          }
        ]
      }
    ]
  },
  {
    id: "02",
    title: "Warp - 32 Threads and Real Scheduling Unit",
    toneClass: "h-warp",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "GPU schedulers do not schedule individual threads; they schedule warps of 32 threads.",
              "All active lanes in a warp execute the same instruction in lockstep under SIMT."
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
              ["Threads per warp", "32"],
              ["Execution model", "SIMT"],
              ["Scheduled by", "Warp scheduler in SM"],
              ["Instruction issue", "Same instruction across lanes"],
              ["Warps per SM (Hopper class)", "Up to 64"]
            ]
          }
        ]
      },
      {
        title: "Practical calculator",
        sections: [
          {
            type: "content",
            paragraphs: ["Warp occupancy calculator input: threads per block. Output: full warps plus wasted slots."]
          },
          {
            type: "table",
            headers: ["Threads per block", "Full warps", "Wasted threads"],
            rows: [
              ["32", "1", "0"],
              ["48", "1", "16"],
              ["128", "4", "0"],
              ["100", "3", "28"]
            ]
          }
        ]
      }
    ]
  },
  {
    id: "03",
    title: "Thread Block (CTA) - Shared Memory and Sync Domain",
    toneClass: "h-shmem",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "A thread block (CTA) is a cooperative group scheduled on one SM for its lifetime.",
              "Threads in the same block share shared memory and can synchronize with __syncthreads()."
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
              ["Max threads per block", "1024"],
              ["Max warps per block", "32"],
              ["Shared memory", "Shared across block"],
              ["Can synchronize", "Yes, within block"],
              ["Placement", "One SM, does not migrate"]
            ]
          }
        ]
      },
      {
        title: "Practical table",
        sections: [
          {
            type: "table",
            headers: ["Block size", "Warps", "Occupancy impact"],
            rows: [
              ["32", "1", "Very low"],
              ["128", "4", "Moderate"],
              ["256", "8", "Good"],
              ["512", "16", "High"],
              ["1024", "32", "Max but less flexible"]
            ]
          }
        ]
      }
    ]
  },
  {
    id: "04",
    title: "Grid - All Blocks in One Kernel Launch",
    toneClass: "h-sm",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "A grid is the full set of blocks launched by one kernel call.",
              "Blocks in a grid are independent and can be scheduled in any order across available SMs."
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
              ["Contains", "All blocks for one kernel"],
              ["Dimensions", "1D, 2D, or 3D"],
              ["Max blocks per dimension", "65,535"],
              ["Block communication", "Not possible"],
              ["Scheduled across", "All available SMs"]
            ]
          }
        ]
      },
      {
        title: "Practical visual",
        sections: [
          {
            type: "formula",
            main:
              "Grid\n|- Block(0,0) -> SM0\n|- Block(0,1) -> SM1\n|- Block(1,0) -> SM0 (after reuse)\n|- Block(1,1) -> SM2\n`- Block(2,0) -> SM3",
            sub: "Order is not guaranteed; correctness must not depend on block execution order."
          }
        ]
      }
    ]
  },
  {
    id: "05",
    title: "SIMT - One Instruction Across 32 Threads",
    toneClass: "h-cuda",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "SIMT issues one instruction to a warp and executes it across multiple threads with different data.",
              "Compared with classic SIMD, GPU threads keep separate logical thread state and expose a scalar programming model."
            ]
          }
        ]
      },
      {
        title: "SIMT vs SIMD",
        sections: [
          {
            type: "table",
            headers: ["Property", "SIMD (CPU)", "SIMT (GPU)"],
            rows: [
              ["Threads/lane count", "4-16 lanes", "32 threads"],
              ["Own registers per lane/thread", "No", "Yes"],
              ["Own program counter", "No", "Yes (logical)"],
              ["Divergence handling", "Limited", "Supported with cost"],
              ["Programming model", "Explicit vectors", "Scalar-like threads"]
            ]
          }
        ]
      }
    ]
  },
  {
    id: "06",
    title: "Warp Divergence - Branch Cost and Predication",
    toneClass: "h-warp",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "Divergence occurs when threads in one warp take different control-flow paths.",
              "The warp executes each path with masking, which serializes branch paths and lowers efficiency."
            ]
          }
        ]
      },
      {
        title: "Cost table",
        sections: [
          {
            type: "table",
            headers: ["Scenario", "Active threads", "Efficiency"],
            rows: [
              ["No divergence", "32/32", "100%"],
              ["50/50 split", "16 then 16", "50%"],
              ["1 thread on alternate path", "31 then 1", "~50%"],
              ["All threads same branch", "32/32", "100%"]
            ]
          }
        ]
      },
      {
        title: "Practical rule",
        sections: [
          {
            type: "formula",
            main:
              "BAD:\nif (threadIdx.x % 2 == 0) { doA(); } else { doB(); }\n\nBETTER:\nresult = condition ? A : B;  // predication-friendly form",
            sub: "Reduce branch entropy within each warp whenever possible."
          }
        ]
      }
    ]
  },
  {
    id: "07",
    title: "Latency Hiding - Why Many Warps Matter",
    toneClass: "h-vram",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "When one warp waits on memory, the scheduler switches to another eligible warp.",
              "Latency hiding is achieved by maintaining enough ready warps to cover long memory delays."
            ]
          }
        ]
      },
      {
        title: "Latency table",
        sections: [
          {
            type: "table",
            headers: ["Memory type", "Latency (cycles)", "Warps needed to hide it"],
            rows: [
              ["Register", "1", "0"],
              ["Shared memory", "30", "1-2"],
              ["L1 cache", "30", "1-2"],
              ["L2 cache", "200", "6-8"],
              ["VRAM (HBM)", "600", "18-20"]
            ]
          }
        ]
      },
      {
        title: "Timeline visual",
        sections: [
          {
            type: "formula",
            main:
              "Cycle 1: Warp A requests VRAM (wait)\nCycle 2: Warp B executes\nCycle 3: Warp C executes\n...\nCycle N: Warp A data returns and resumes",
            sub: "Throughput depends on scheduler having enough eligible work."
          }
        ]
      }
    ]
  },
  {
    id: "08",
    title: "Occupancy - Active Warps vs Max Warps",
    toneClass: "h-sm",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "Occupancy is active warps per SM divided by hardware maximum warps.",
              "Higher occupancy often improves latency hiding, but peak occupancy is not always peak performance."
            ]
          }
        ]
      },
      {
        title: "Limiting factors",
        sections: [
          {
            type: "table",
            headers: ["Limiting factor", "If too high", "Effect"],
            rows: [
              ["Registers per thread", "Consumes register file", "Fewer warps fit"],
              ["Shared memory per block", "Consumes shared memory", "Fewer blocks fit"],
              ["Threads per block", "Poor packing", "Lower active warp count"],
              ["Balanced usage", "Resource fit", "Higher useful occupancy"]
            ]
          }
        ]
      },
      {
        title: "Practical calculator",
        sections: [
          {
            type: "list",
            items: [
              "Inputs: threads per block, registers per thread, shared memory per block.",
              "Output: occupancy percent and primary bottleneck resource."
            ]
          }
        ]
      }
    ]
  },
  {
    id: "09",
    title: "Warpgroup (Hopper+) - 4 Warps for WGMMA",
    toneClass: "h-tens",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "Hopper introduces warpgroup execution for wgmma instructions, combining 4 warps (128 threads).",
              "This enables larger matrix operations and improved Tensor Core feeding compared with warp-only MMA patterns."
            ]
          }
        ]
      },
      {
        title: "Comparison table",
        sections: [
          {
            type: "table",
            headers: ["Unit", "Threads", "Instruction", "Generation"],
            rows: [
              ["Warp", "32", "mma", "Ampere+"],
              ["Warpgroup", "128 (4 warps)", "wgmma", "Hopper+"],
              ["Warpgroup benefit", "Larger tile op", "Higher Tensor Core feed", "Hopper+"]
            ]
          }
        ]
      }
    ]
  },
  {
    id: "10",
    title: "Thread Block Cluster (Hopper+) - Inter-Block Cooperation",
    toneClass: "h-sm",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "Thread Block Clusters allow groups of blocks to cooperate within a GPC on Hopper-class GPUs.",
              "Clustered blocks can use distributed shared memory and cluster-level synchronization primitives."
            ]
          }
        ]
      },
      {
        title: "Updated hierarchy table",
        sections: [
          {
            type: "table",
            headers: ["Level", "Contains", "Can sync?", "Memory"],
            rows: [
              ["Thread", "Itself", "-", "Registers"],
              ["Warp", "32 threads", "-", "-"],
              ["Block", "Up to 1024 threads", "Yes (__syncthreads)", "Shared memory"],
              ["Cluster", "Up to 8 blocks", "Yes", "Distributed shared memory"],
              ["Grid", "All blocks", "No", "VRAM"]
            ]
          }
        ]
      }
    ]
  },
  {
    id: "11",
    title: "Warp Execution States - Active, Eligible, Selected, Stalled",
    toneClass: "h-warp",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "Warp schedulers evaluate warp readiness each cycle. State transitions determine which warps can issue instructions.",
              "Understanding state distribution helps explain utilization and stall behavior in profilers."
            ]
          }
        ]
      },
      {
        title: "States table",
        sections: [
          {
            type: "table",
            headers: ["State", "Meaning", "Scheduler action"],
            rows: [
              ["Active", "Assigned resources on SM", "Considered"],
              ["Eligible", "Operands and dependencies ready", "Can be selected"],
              ["Selected", "Chosen this cycle", "Issues instruction"],
              ["Stalled", "Waiting on dependency/data", "Skipped for now"]
            ]
          }
        ]
      },
      {
        title: "Practical flow",
        sections: [
          {
            type: "formula",
            main:
              "Memory request -> Stalled\nOther eligible warps -> Selected\nData returns -> Eligible\nScheduler picks -> Selected",
            sub: "The scheduler continuously rotates through ready warps."
          }
        ]
      }
    ]
  },
  {
    id: "12",
    title: "Scoreboard Stalls - Short vs Long",
    toneClass: "h-vram",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "The scoreboard tracks register readiness after issued instructions, especially memory operations.",
              "Long scoreboard stalls are often memory-bound symptoms tied to high-latency accesses."
            ]
          }
        ]
      },
      {
        title: "Stall types table",
        sections: [
          {
            type: "table",
            headers: ["Stall type", "Source", "Cycles", "Mitigation"],
            rows: [
              ["Short stall", "Shared memory / L1", "20-40", "Increase locality and ready warps"],
              ["Long stall", "VRAM / HBM", "400-700", "Coalescing, prefetch, more warps"],
              ["Execution dependency", "Prior instruction result", "4-8", "Instruction scheduling/reordering"],
              ["Sync stall", "__syncthreads()", "Varies", "Reduce sync frequency"]
            ]
          }
        ]
      },
      {
        title: "Practical profiling tip",
        sections: [
          {
            type: "list",
            items: [
              "Track Stall Long Scoreboard percent in Nsight Compute.",
              "If high, prioritize access coalescing and occupancy-aware tuning."
            ]
          }
        ]
      }
    ]
  }
];
