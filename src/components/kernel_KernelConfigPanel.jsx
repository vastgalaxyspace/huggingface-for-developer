"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { KERNEL_PRESETS, clamp, formatBytes, formatKbFromBytes, inputClassName, isPowerOfTwo, mutedCardClassName, safeNumber, sectionLabelClassName } from "./kernel_utils";

function Field({ label, hint, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-gray-500">{hint}</span> : null}
    </label>
  );
}

export default function KernelConfigPanel({ arch, kernelMode, config, onConfigChange, onPresetLoad }) {
  if (!arch) return null;

  const totalThreads = kernelMode === "triton" ? safeNumber(config.numWarps) * arch.warp_size : safeNumber(config.blockDimX, 1) * safeNumber(config.blockDimY, 1) * safeNumber(config.blockDimZ, 1);
  const totalSmem = kernelMode === "triton" ? safeNumber(config.numStages) * safeNumber(config.blockSize) * safeNumber(config.elementSizeBytes) : safeNumber(config.staticSmemBytes) + safeNumber(config.dynamicSmemBytes);
  const wastedThreads = totalThreads > 0 && totalThreads % arch.warp_size !== 0 ? arch.warp_size - (totalThreads % arch.warp_size) : 0;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-8">
        <div>
          <p className={sectionLabelClassName}>Preset</p>
          <div className="mt-4">
            <Field label="Load Preset">
              <select
                defaultValue=""
                onChange={(event) => {
                  const preset = KERNEL_PRESETS.find((item) => item.id === event.target.value);
                  if (preset) onPresetLoad(preset);
                }}
                className={inputClassName}
              >
                <option value="">Choose a saved kernel profile</option>
                {KERNEL_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {kernelMode === "cuda" ? (
          <>
            <div>
              <p className={sectionLabelClassName}>Thread Block Configuration</p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {[
                  ["blockDimX", "blockDim.x", 1024],
                  ["blockDimY", "blockDim.y", 1024],
                  ["blockDimZ", "blockDim.z", 64]
                ].map(([field, label, max]) => (
                  <Field key={field} label={label}>
                    <input
                      type="number"
                      min={1}
                      max={max}
                      value={config[field]}
                      onChange={(event) => onConfigChange(field, clamp(Number(event.target.value) || 1, 1, max))}
                      className={inputClassName}
                    />
                  </Field>
                ))}
              </div>

              <div className={`mt-4 ${mutedCardClassName}`}>
                <p className="text-sm font-medium text-gray-900">Total Threads per Block = {config.blockDimX} × {config.blockDimY} × {config.blockDimZ} = {totalThreads}</p>
                {totalThreads > arch.max_threads_per_sm ? <p className="mt-2 text-sm text-red-700">Thread block exceeds SM thread capacity for this architecture.</p> : null}
                {wastedThreads > 0 ? <p className="mt-2 text-sm text-yellow-700">Not a multiple of {arch.warp_size} — {wastedThreads} threads wasted per warp.</p> : null}
              </div>
            </div>

            <div>
              <p className={sectionLabelClassName}>Register Usage</p>
              <div className="mt-4">
                <Field label="Registers per Thread" hint="Find this with: nvcc --ptxas-options=-v or nsight">
                  <input
                    type="number"
                    min={0}
                    max={arch.max_registers_per_thread}
                    value={config.registersPerThread}
                    onChange={(event) => onConfigChange("registersPerThread", clamp(Number(event.target.value) || 0, 0, arch.max_registers_per_thread))}
                    className={inputClassName}
                  />
                </Field>
                {Number(config.registersPerThread) === 0 ? <div className="mt-3 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">Registers not limiting occupancy</div> : null}
              </div>
            </div>

            <div>
              <p className={sectionLabelClassName}>Shared Memory</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Static Shared Memory (bytes)">
                  <input type="number" min={0} value={config.staticSmemBytes} onChange={(event) => onConfigChange("staticSmemBytes", Math.max(0, Number(event.target.value) || 0))} className={inputClassName} />
                </Field>
                <Field label="Dynamic Shared Memory (bytes)">
                  <input type="number" min={0} value={config.dynamicSmemBytes} onChange={(event) => onConfigChange("dynamicSmemBytes", Math.max(0, Number(event.target.value) || 0))} className={inputClassName} />
                </Field>
              </div>

              <div className={`mt-4 ${mutedCardClassName}`}>
                <p className="text-sm font-medium text-gray-900">Total Shared Memory per Block = {formatBytes(totalSmem)} = {formatKbFromBytes(totalSmem)}</p>
                {totalSmem > arch.max_smem_per_block_kb * 1024 ? <p className="mt-2 text-sm text-red-700">Shared memory exceeds the per-block limit.</p> : null}
              </div>
            </div>
          </>
        ) : (
          <div>
            <p className={sectionLabelClassName}>Triton Kernel Parameters</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="BLOCK_SIZE">
                <input type="number" min={64} max={1024} step={64} value={config.blockSize} onChange={(event) => onConfigChange("blockSize", clamp(Number(event.target.value) || 64, 64, 1024))} className={inputClassName} />
              </Field>
              <Field label="num_warps">
                <input type="number" min={1} max={32} value={config.numWarps} onChange={(event) => onConfigChange("numWarps", clamp(Number(event.target.value) || 1, 1, 32))} className={inputClassName} />
              </Field>
              <Field label="num_stages">
                <input type="number" min={1} max={5} value={config.numStages} onChange={(event) => onConfigChange("numStages", clamp(Number(event.target.value) || 1, 1, 5))} className={inputClassName} />
              </Field>
              <Field label="element_size_bytes">
                <select value={config.elementSizeBytes} onChange={(event) => onConfigChange("elementSizeBytes", Number(event.target.value))} className={inputClassName}>
                  <option value={1}>1 = int8</option>
                  <option value={2}>2 = fp16 / bf16</option>
                  <option value={4}>4 = fp32</option>
                </select>
              </Field>
              <Field label="Registers per Thread Override" hint="Triton defaults to an estimated ~32 registers per thread unless overridden.">
                <input type="number" min={0} max={arch.max_registers_per_thread} value={config.tritonRegistersPerThread} onChange={(event) => onConfigChange("tritonRegistersPerThread", clamp(Number(event.target.value) || 0, 0, arch.max_registers_per_thread))} className={inputClassName} />
              </Field>
            </div>

            <div className={`mt-4 space-y-2 ${mutedCardClassName}`}>
              <p className="text-sm font-medium text-gray-900">Threads per Block = num_warps × warp_size = {config.numWarps} × {arch.warp_size} = {totalThreads}</p>
              <p className="text-sm text-gray-600">Estimated shared memory per block = num_stages × BLOCK_SIZE × element_size = {formatBytes(totalSmem)}</p>
              {!isPowerOfTwo(Number(config.numWarps) || 0) ? <p className="text-sm text-yellow-700">num_warps should be a power of 2 for Triton kernels.</p> : null}
            </div>
          </div>
        )}

        <div>
          <button type="button" onClick={() => onConfigChange("showLaunchConfig", !config.showLaunchConfig)} className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left">
            <div>
              <p className={sectionLabelClassName}>Launch Configuration (Optional)</p>
              <p className="mt-1 text-sm text-gray-500">Add grid size and total SM count for whole-GPU utilization estimates.</p>
            </div>
            {config.showLaunchConfig ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
          </button>

          {config.showLaunchConfig ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Total Blocks in Grid">
                <input type="number" min={0} value={config.totalBlocks} onChange={(event) => onConfigChange("totalBlocks", Math.max(0, Number(event.target.value) || 0))} className={inputClassName} />
              </Field>
              <Field label="Total SMs on GPU" hint="H100 = 132 SMs | A100 = 108 SMs | RTX 4090 = 128 SMs">
                <input type="number" min={0} value={config.totalSms} onChange={(event) => onConfigChange("totalSms", Math.max(0, Number(event.target.value) || 0))} className={inputClassName} />
              </Field>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
