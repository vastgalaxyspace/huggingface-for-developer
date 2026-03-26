import { Cpu, Info } from 'lucide-react';

const VRAMBar = ({ label, value, maxValue, color, subtext }) => {
  const pct = Math.min((value / maxValue) * 100, 100);
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-semibold text-[var(--text-main)]">{label}</span>
        <span className="text-[13px] font-bold text-[var(--text-strong)]">~{value} GB</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[rgba(0,0,0,0.06)]">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {subtext && <p className="mt-1 text-[11px] text-[var(--text-faint)]">{subtext}</p>}
    </div>
  );
};

const VRAMSection = ({ vramEstimates }) => {
  if (!vramEstimates) return null;
  const maxVal = Math.max(vramEstimates.fp32 || 0, 80);

  return (
    <section id="section-vram" className="mb-14">
      <div className="flex items-center gap-2 mb-1">
        <Cpu className="h-5 w-5 text-[var(--accent)]" />
        <h2 className="text-[1.6rem] font-black tracking-tight text-[var(--text-strong)]">VRAM and Memory Requirements</h2>
      </div>
      <p className="mb-5 text-[13px] text-[var(--text-faint)]">
        Estimated GPU memory needed at different precision levels. Source: {vramEstimates.paramSource === 'safetensors' ? 'HuggingFace safetensors metadata (accurate)' : 'Estimated from config (approximate)'}
      </p>
      <div className="rounded-[22px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_4px_20px_rgba(59,83,114,0.04)]">
        <VRAMBar label="FP32 (Full Precision)" value={vramEstimates.fp32} maxValue={maxVal} color="bg-red-400" subtext="Training only - not recommended for inference" />
        <VRAMBar label="FP16 / BF16 (Half Precision)" value={vramEstimates.fp16} maxValue={maxVal} color="bg-blue-500" subtext="Standard inference precision - best quality" />
        <VRAMBar label="INT8 (8-bit Quantized)" value={vramEstimates.int8} maxValue={maxVal} color="bg-emerald-500" subtext="95-98% quality - production recommended" />
        <VRAMBar label="INT4 (4-bit Quantized)" value={vramEstimates.int4} maxValue={maxVal} color="bg-amber-500" subtext="85-92% quality - edge/local deployment" />
        <div className="mt-5 flex items-start gap-2 rounded-xl bg-[rgba(59,130,246,0.06)] px-4 py-3">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
          <div className="text-[12px] text-[var(--text-muted)]">
            <strong>Total Parameters:</strong> {vramEstimates.totalParams >= 1000 ? `${(vramEstimates.totalParams / 1000).toFixed(1)} Trillion` : `${vramEstimates.totalParams} Billion`}
            <span className="mx-2">|</span>
            <strong>Model Size on Disk:</strong> ~{vramEstimates.fp16} GB (safetensors)
            <span className="mx-2">|</span>
            Includes 20% overhead for activations and KV cache
          </div>
        </div>
      </div>
    </section>
  );
};

export default VRAMSection;
