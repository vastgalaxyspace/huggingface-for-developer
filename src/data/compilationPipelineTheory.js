export const COMPILATION_PIPELINE_THEORY = [
  {
    id: "01",
    title: "CUDA C++ -> PTX -> SASS -> Binary Pipeline",
    toneClass: "h-cuda",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "This is the complete path from source code to GPU execution, with four major stages.",
              "You write CUDA C++ kernels in .cu files, nvcc emits PTX, ptxas produces architecture-specific SASS, and final binaries are packaged for runtime loading."
            ]
          }
        ]
      },
      {
        title: "Four stages",
        sections: [
          {
            type: "list",
            items: [
              "Stage 1 - CUDA C++: kernel code with CUDA keywords like __global__, __shared__, threadIdx, blockIdx.",
              "Stage 2 - PTX: virtual ISA (readable assembly-like intermediate representation).",
              "Stage 3 - SASS: real machine instructions for a specific SM target (for example sm_80 or sm_90).",
              "Stage 4 - cubin/fatbin: packaged binaries, with fatbin holding multiple targets."
            ]
          },
          {
            type: "formula",
            main: "your_code.cu -> nvcc -> PTX -> ptxas -> SASS -> cubin/fatbin -> GPU executes"
          }
        ]
      }
    ]
  },
  {
    id: "02",
    title: "PTX Portability and Virtual ISA",
    toneClass: "h-sm",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "PTX provides forward portability across GPU generations. It is a virtual ISA, not final hardware code.",
              "If no matching native cubin is available at runtime, the NVIDIA driver can JIT-compile PTX into SASS for the installed GPU."
            ]
          }
        ]
      },
      {
        title: "Why it matters",
        sections: [
          {
            type: "list",
            items: [
              "Old binaries can still run on newer GPUs via driver JIT from embedded PTX.",
              "Libraries commonly ship native SASS for known targets and PTX as fallback.",
              "PTX fallback is convenient but may be slower than fully offline target-specific builds."
            ]
          }
        ]
      },
      {
        title: "Trade-off summary",
        sections: [
          {
            type: "table",
            headers: ["Aspect", "PTX fallback", "Native SASS"],
            rows: [
              ["Portability", "High", "Limited to compiled targets"],
              ["Startup behavior", "May incur JIT cost", "No JIT for matching target"],
              ["Peak optimization", "Good, but not always maximal", "Best for specific architecture"]
            ]
          }
        ]
      }
    ]
  },
  {
    id: "03",
    title: "SASS - Architecture-Specific Instruction Layer",
    toneClass: "h-warp",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "SASS is the final instruction stream executed by the GPU scheduler and pipelines.",
              "It is architecture specific: different compute capabilities expose different instruction sets and capabilities."
            ]
          }
        ]
      },
      {
        title: "Key points",
        sections: [
          {
            type: "list",
            items: [
              "Newer architectures add opcodes and execution paths unavailable on older chips.",
              "SASS includes concrete register usage and memory instruction variants.",
              "Performance tuning often inspects SASS with tools such as nvdisasm and Nsight Compute.",
              "Compiling only one SASS target can force PTX fallback or limit feature usage on other GPUs."
            ]
          }
        ]
      }
    ]
  },
  {
    id: "04",
    title: "nvcc Flow and Compute Capability Mapping",
    toneClass: "h-tma",
    blocks: [
      {
        title: "Theory",
        sections: [
          {
            type: "content",
            paragraphs: [
              "nvcc is a compiler driver that coordinates host compilation, device compilation, PTX generation, ptxas assembly, and final linking.",
              "Compute capability (for example 8.0, 9.0) defines available hardware features and instruction support."
            ]
          }
        ]
      },
      {
        title: "nvcc internal flow",
        sections: [
          {
            type: "list",
            items: [
              "Split host and device code paths.",
              "Compile host code with system toolchain.",
              "Compile device code to PTX and/or SASS.",
              "Assemble with ptxas and link final executable or library."
            ]
          }
        ]
      },
      {
        title: "Capability mapping",
        sections: [
          {
            type: "table",
            headers: ["Concept", "Meaning"],
            rows: [
              ["-arch=sm_90", "Generate native code for Hopper-class target"],
              ["-arch=sm_80", "Generate native code for Ampere-class target"],
              ["Multiple -gencode", "Ship multiple cubins plus PTX fallback"],
              ["Wrong target only", "May miss newer instructions and performance opportunities"]
            ]
          }
        ]
      }
    ]
  }
];
