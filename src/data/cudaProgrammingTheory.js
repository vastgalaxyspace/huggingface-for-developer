export const CUDA_PROGRAMMING_THEORY = [
  {
    id: "01",
    title: "CUDA Keywords and Memory Qualifiers",
    toneClass: "h-cuda",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "CUDA extends C++ with qualifiers that define execution location and memory placement.",
              "These qualifiers tell the compiler whether code runs on CPU or GPU, and where variables are stored."
            ]
          }
        ]
      },
      {
        title: "Execution space qualifiers",
        sections: [
          {
            type: "table",
            headers: ["Qualifier", "Meaning"],
            rows: [
              ["__global__", "Kernel function called on CPU and executed on GPU"],
              ["__device__", "Function called and executed on GPU"],
              ["__host__", "Standard CPU-only C++ function"]
            ]
          }
        ]
      },
      {
        title: "Memory qualifiers",
        sections: [
          {
            type: "table",
            headers: ["Qualifier", "Memory behavior"],
            rows: [
              ["__shared__", "Places variables in per-block shared memory on SM"],
              ["__constant__", "Places read-only values in constant memory cache"]
            ]
          }
        ]
      }
    ]
  },
  {
    id: "02",
    title: "Kernel Launch Dimensions and Mapping",
    toneClass: "h-sm",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "Kernels use execution configuration syntax: kernel<<<blocks, threads>>>(...).",
              "Grid and block shapes can be 1D, 2D, or 3D via dim3, enabling natural mapping to tensors and images."
            ]
          }
        ]
      },
      {
        title: "Built-in indexing variables",
        sections: [
          {
            type: "table",
            headers: ["Variable", "Role"],
            rows: [
              ["threadIdx", "Thread index inside current block"],
              ["blockIdx", "Block index inside grid"],
              ["blockDim", "Block dimensions (threads per block)"]
            ]
          }
        ]
      },
      {
        title: "Global index formula (1D)",
        sections: [
          {
            type: "formula",
            main: "id = blockIdx.x * blockDim.x + threadIdx.x"
          }
        ]
      }
    ]
  },
  {
    id: "03",
    title: "cudaMalloc / cudaMemcpy / cudaFree Fundamentals",
    toneClass: "h-vram",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "Host RAM and device VRAM are separate memory spaces, so allocation and transfer are explicit in CUDA runtime code.",
              "Data movement over PCIe/NVLink is often a bottleneck, so transfers should be minimized and overlapped where possible."
            ]
          }
        ]
      },
      {
        title: "Core APIs",
        sections: [
          {
            type: "table",
            headers: ["API", "Purpose"],
            rows: [
              ["cudaMalloc", "Allocate bytes in GPU memory"],
              ["cudaMemcpy", "Copy data between host and device memory spaces"],
              ["cudaFree", "Release previously allocated GPU memory"]
            ]
          }
        ]
      },
      {
        title: "Copy directions",
        sections: [
          {
            type: "list",
            items: [
              "HostToDevice: push input data from CPU to GPU.",
              "DeviceToHost: pull output data back from GPU to CPU."
            ]
          }
        ]
      }
    ]
  },
  {
    id: "04",
    title: "Shared Memory Tiling and Synchronization",
    toneClass: "h-shmem",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "Tiling stages reusable chunks of global memory into shared memory so threads can reuse fast on-chip data.",
              "This is foundational for high-performance kernels such as matrix multiplication and convolution."
            ]
          }
        ]
      },
      {
        title: "Synchronization barrier",
        sections: [
          {
            type: "content",
            paragraphs: [
              "__syncthreads() is a block-wide barrier. It ensures all threads finish cooperative loads before any thread consumes the tile."
            ]
          },
          {
            type: "list",
            items: [
              "Without synchronization, threads may read incomplete data (race condition).",
              "Correct placement of barriers is required for both correctness and performance."
            ]
          }
        ]
      }
    ]
  },
  {
    id: "05",
    title: "Streams and CUDA Graphs",
    toneClass: "h-tma",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "Default stream execution is ordered; streams enable concurrent kernels and copies when dependencies allow.",
              "CUDA Graphs reduce CPU launch overhead by capturing repeated operation DAGs and replaying them efficiently."
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
              "Use multiple streams to overlap transfer for task B while task A computes.",
              "Use CUDA Graphs for repetitive multi-kernel workloads to lower launch overhead and jitter."
            ]
          }
        ]
      }
    ]
  }
];
