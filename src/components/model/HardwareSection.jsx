import { Server, Monitor, Cloud, AlertTriangle } from 'lucide-react';

const tierColors = {
  consumer: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  prosumer: 'bg-blue-50 border-blue-200 text-blue-700',
  professional: 'bg-purple-50 border-purple-200 text-purple-700',
  enterprise: 'bg-amber-50 border-amber-200 text-amber-700',
};

const HardwareSection = ({ gpuRecommendations, cloudCosts, multiGPU, vramEstimates }) => {
  if (!gpuRecommendations && !cloudCosts) return null;

  return (
    <section id="section-hardware" className="mb-14">
      <div className="flex items-center gap-2 mb-1">
        <Server className="h-5 w-5 text-[var(--accent)]" />
        <h2 className="text-[1.6rem] font-black tracking-tight text-[var(--text-strong)]">Hardware and GPU Recommendations</h2>
      </div>
      <p className="mb-5 text-[13px] text-[var(--text-faint)]">
        Based on ~{vramEstimates?.fp16 || '?'}GB VRAM requirement (FP16)
      </p>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {gpuRecommendations?.recommended?.length > 0 && (
          <div className="rounded-[22px] border border-[var(--border-soft)] bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="h-4 w-4 text-[var(--accent)]" />
              <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">Recommended GPUs</h4>
            </div>
            <div className="space-y-3">
              {gpuRecommendations.recommended.map((gpu, i) => (
                <div key={i} className={`flex items-center justify-between rounded-xl border p-3.5 ${tierColors[gpu.tier] || tierColors.consumer}`}>
                  <div>
                    <p className="text-[14px] font-bold">{gpu.name}</p>
                    <p className="text-[11px] opacity-80">{gpu.use_case}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-bold">${gpu.price?.toLocaleString()}</p>
                    <p className="text-[10px] opacity-70">{gpu.utilization}% VRAM used</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {gpuRecommendations.budget && (
                <div className="rounded-lg bg-[rgba(16,185,129,0.06)] p-2.5 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Budget</p>
                  <p className="mt-1 text-[11px] font-bold text-[var(--text-strong)]">{gpuRecommendations.budget.name}</p>
                </div>
              )}
              {gpuRecommendations.professional && (
                <div className="rounded-lg bg-[rgba(139,92,246,0.06)] p-2.5 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-purple-600">Professional</p>
                  <p className="mt-1 text-[11px] font-bold text-[var(--text-strong)]">{gpuRecommendations.professional.name}</p>
                </div>
              )}
              {gpuRecommendations.enterprise && (
                <div className="rounded-lg bg-[rgba(245,158,11,0.06)] p-2.5 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600">Enterprise</p>
                  <p className="mt-1 text-[11px] font-bold text-[var(--text-strong)]">{gpuRecommendations.enterprise.name}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {cloudCosts && Object.keys(cloudCosts).length > 0 && (
          <div className="rounded-[22px] border border-[var(--border-soft)] bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="h-4 w-4 text-[var(--accent)]" />
              <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">Cloud GPU Pricing</h4>
            </div>
            <div className="space-y-3">
              {Object.entries(cloudCosts).map(([provider, info]) => (
                <div key={provider} className="flex items-center justify-between rounded-xl border border-[var(--border-soft)] bg-[rgba(245,248,252,0.5)] p-3.5">
                  <div>
                    <p className="text-[13px] font-bold text-[var(--text-strong)] capitalize">{provider}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">{info.name} ({info.gpu})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-bold text-[var(--text-strong)]">${info.price?.toFixed(2)}/hr</p>
                    <p className="text-[10px] text-[var(--text-faint)]">~${Math.round(info.monthlyCost)}/mo</p>
                  </div>
                </div>
              ))}
            </div>
            {multiGPU?.needed && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
                <div>
                  <p className="text-[12px] font-bold text-amber-700">Multi-GPU Required</p>
                  <p className="text-[11px] text-amber-600 mt-0.5">{multiGPU.message}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default HardwareSection;
