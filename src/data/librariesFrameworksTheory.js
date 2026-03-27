export const LIBRARIES_FRAMEWORKS_THEORY = [
  {
    id: "01",
    title: "cuBLAS GEMM and Tensor Core Usage",
    toneClass: "h-tens",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "cuBLAS is NVIDIA's high-performance BLAS library, and GEMM is the core operation behind many deep learning workloads.",
              "For GEMM shapes and datatypes that meet hardware paths, cuBLAS can route work to Tensor Cores for major throughput gains."
            ]
          }
        ]
      },
      {
        title: "Key points",
        sections: [
          {
            type: "formula",
            main: "C = alpha * A * B + beta * C"
          },
          {
            type: "list",
            items: [
              "GEMM is the backbone of linear layers and attention projections.",
              "Tensor Cores execute matrix-tile math more efficiently than standard scalar FP32 pipelines.",
              "cuBLAS selects optimized kernels based on shape, datatype, and architecture."
            ]
          }
        ]
      }
    ]
  },
  {
    id: "02",
    title: "cuDNN Operator Acceleration",
    toneClass: "h-cuda",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "cuDNN provides optimized implementations for deep learning operators such as convolution, pooling, normalization, and activations.",
              "Its algorithm selection and heuristics help map each operator configuration to efficient kernels on a given GPU."
            ]
          }
        ]
      },
      {
        title: "Practical behavior",
        sections: [
          {
            type: "list",
            items: [
              "Autotuning can evaluate multiple candidate algorithms for a specific shape.",
              "Different algorithms can trade memory footprint for speed.",
              "Operator-level acceleration in cuDNN underpins many framework-level speedups."
            ]
          }
        ]
      }
    ]
  },
  {
    id: "03",
    title: "Triton Custom Kernel Workflow",
    toneClass: "h-sm",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "Triton is a Python-based language/compiler for writing custom GPU kernels with a blocked programming model.",
              "It targets high performance while reducing low-level CUDA indexing and scheduling complexity."
            ]
          }
        ]
      },
      {
        title: "Workflow",
        sections: [
          {
            type: "list",
            items: [
              "Write kernel logic in Python using Triton primitives.",
              "Express tile/block behavior and memory access patterns.",
              "Compile through Triton toolchain to PTX and execute via runtime integration.",
              "Iterate with profiling to approach hand-tuned CUDA performance for targeted kernels."
            ]
          }
        ]
      }
    ]
  },
  {
    id: "04",
    title: "PyTorch Runtime Integration",
    toneClass: "h-vram",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "PyTorch dispatches operations to backend libraries based on tensor device, dtype, and operation type.",
              "On CUDA tensors, core ops frequently route to cuBLAS/cuDNN/Triton-generated kernels."
            ]
          }
        ]
      },
      {
        title: "Runtime mechanisms",
        sections: [
          {
            type: "list",
            items: [
              "Dispatcher: maps high-level ops (for example matmul) to backend implementations.",
              "Caching allocator: reuses VRAM blocks to reduce allocation overhead.",
              "Operator fusion (TorchInductor): combines ops to reduce kernel launches and memory traffic."
            ]
          }
        ]
      }
    ]
  },
  {
    id: "05",
    title: "Nsight and Binary Inspection Tooling",
    toneClass: "h-warp",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "Profiling and binary inspection tools turn GPU execution from a black box into measurable timelines, counters, and instruction-level evidence.",
              "Use system-level and kernel-level tools together to identify bottlenecks and validate optimization intent."
            ]
          }
        ]
      },
      {
        title: "Tool roles",
        sections: [
          {
            type: "table",
            headers: ["Tool", "Primary use"],
            rows: [
              ["Nsight Systems", "Timeline profiling across CPU, GPU, and transfers"],
              ["Nsight Compute", "Kernel-level metrics: occupancy, stalls, memory behavior"],
              ["cuobjdump / nvdisasm", "Inspect generated SASS and verify instruction paths"]
            ]
          }
        ]
      }
    ]
  }
];
