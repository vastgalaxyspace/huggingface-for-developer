import { Cpu, Info, AlertTriangle } from 'lucide-react';

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
  // Handle null or zero VRAM gracefully
  const hasData = vramEstimates && vramEstimates.fp16 > 0;

  return (
    <section id="section-vram" className="mb-10 fade-in-section scroll-mt-28">
      <div className="flex items-center gap-2 mb-1">
        <Cpu className="h-5 w-5 text-[var(--accent)]" />
        <h2 className="text-[1.5rem] font-black tracking-tight text-[var(--text-strong)]">VRAM and Memory Requirements</h2>
      </div>
      <p className="mb-2 text-[13px] text-[var(--text-faint)]">
        Estimated GPU memory needed at different precision levels for inference.
      </p>
      {hasData && (
        <p className="mb-5 text-[11px] font-medium text-[var(--text-muted)] flex items-center gap-1.5">
          <Info className="h-3 w-3" />
          Source: {vramEstimates.paramSource === 'safetensors' ? 'HuggingFace safetensors metadata (accurate)' : 'Estimated from model config (approximate)'}
        </p>
      )}

      {hasData ? (
        <div className="rounded-[22px] border border-[var(--border-soft)] bg-white p-6 shadow-[0_4px_20px_rgba(59,83,114,0.04)]">
          <VRAMBar label="FP32 (Full Precision)" value={vramEstimates.fp32} maxValue={Math.max(vramEstimates.fp32 || 0, 80)} color="bg-red-400" subtext="Training only -- not recommended for inference" />
          <VRAMBar label="FP16 / BF16 (Half Precision)" value={vramEstimates.fp16} maxValue={Math.max(vramEstimates.fp32 || 0, 80)} color="bg-blue-500" subtext="Standard inference precision -- best quality" />
          <VRAMBar label="INT8 (8-bit Quantized)" value={vramEstimates.int8} maxValue={Math.max(vramEstimates.fp32 || 0, 80)} color="bg-emerald-500" subtext="95-98% quality -- production recommended" />
          <VRAMBar label="INT4 (4-bit Quantized)" value={vramEstimates.int4} maxValue={Math.max(vramEstimates.fp32 || 0, 80)} color="bg-amber-500" subtext="85-92% quality -- edge/local deployment" />

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

          {/* Educational note */}
          <div className="mt-4 rounded-xl border border-[var(--border-soft)] bg-[rgba(245,248,252,0.6)] p-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-faint)] mb-2">What does this mean?</h4>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              VRAM (Video RAM) is the memory on your GPU. Your GPU must have enough VRAM to load
              the entire model in memory. Lower precision (INT8, INT4) reduces memory requirements
              with a small quality trade-off. For most production use cases, <strong>INT8 quantization</strong> offers
              the best balance of quality and efficiency.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-[22px] border border-dashed border-[var(--border-soft)] bg-[rgba(249,251,254,0.5)] p-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-[14px] font-bold text-[var(--text-strong)] mb-1">VRAM Data Unavailable</h4>
              <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
                Unable to estimate VRAM requirements for this model. This can happen when the model's
                configuration file is not publicly accessible, or when the model uses a non-standard architecture.
                Visit the model's HuggingFace page for more details.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VRAMSection;
