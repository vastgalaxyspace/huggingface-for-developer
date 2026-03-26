import { DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/tcoCalculator';

const recColor = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
};

const TCOSection = ({ tco }) => {
  if (!tco) return null;
  const { comparison, breakEven, recommendations } = tco;

  return (
    <section id="section-tco" className="mb-14">
      <div className="flex items-center gap-2 mb-1">
        <DollarSign className="h-5 w-5 text-[var(--accent)]" />
        <h2 className="text-[1.6rem] font-black tracking-tight text-[var(--text-strong)]">Total Cost of Ownership</h2>
      </div>
      <p className="mb-5 text-[13px] text-[var(--text-faint)]">API vs Cloud GPU vs Self-Hosted cost comparison</p>

      {comparison && (
        <div className="mb-6 overflow-hidden rounded-[22px] border border-[var(--border-soft)] bg-white">
          <table className="w-full text-[13px]">
            <thead className="border-b border-[var(--border-soft)] bg-[rgba(245,248,252,0.92)]">
              <tr>
                <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-faint)]">Period</th>
                <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-faint)]">API</th>
                <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-faint)]">Cloud GPU</th>
                <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-faint)]">Self-Hosted</th>
              </tr>
            </thead>
            <tbody className="font-semibold text-[var(--text-main)]">
              <tr className="transition-colors hover:bg-[rgba(243,247,252,0.8)]">
                <td className="px-5 py-3.5">Year 1</td>
                <td className="px-5 py-3.5 text-right">{formatCurrency(comparison.yearOne?.api || 0)}</td>
                <td className="px-5 py-3.5 text-right">{formatCurrency(comparison.yearOne?.cloudGPU || 0)}</td>
                <td className="px-5 py-3.5 text-right">{formatCurrency(comparison.yearOne?.selfHosted || 0)}</td>
              </tr>
              <tr className="border-t border-[var(--border-soft)] transition-colors hover:bg-[rgba(243,247,252,0.8)]">
                <td className="px-5 py-3.5">Year 2</td>
                <td className="px-5 py-3.5 text-right">{formatCurrency(comparison.yearTwo?.api || 0)}</td>
                <td className="px-5 py-3.5 text-right">{formatCurrency(comparison.yearTwo?.cloudGPU || 0)}</td>
                <td className="px-5 py-3.5 text-right">{formatCurrency(comparison.yearTwo?.selfHosted || 0)}</td>
              </tr>
              <tr className="border-t border-[var(--border-soft)] transition-colors hover:bg-[rgba(243,247,252,0.8)] font-bold text-[var(--text-strong)]">
                <td className="px-5 py-3.5">3-Year Total</td>
                <td className="px-5 py-3.5 text-right">{formatCurrency(comparison.threeYearTotal?.api || 0)}</td>
                <td className="px-5 py-3.5 text-right">{formatCurrency(comparison.threeYearTotal?.cloudGPU || 0)}</td>
                <td className="px-5 py-3.5 text-right">{formatCurrency(comparison.threeYearTotal?.selfHosted || 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {breakEven && (
          <div className="rounded-[22px] border border-[var(--border-soft)] bg-white p-5">
            <h4 className="mb-3 text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">Break-Even Analysis</h4>
            <div className="space-y-3">
              {breakEven.cloudVsAPI && (
                <div>
                  <p className="text-[13px] font-bold text-[var(--text-strong)]">Cloud vs API</p>
                  <p className="text-[12px] text-[var(--text-muted)]">{breakEven.cloudVsAPI.note}</p>
                </div>
              )}
              {breakEven.selfHostedVsCloud && (
                <div>
                  <p className="text-[13px] font-bold text-[var(--text-strong)]">Self-Hosted vs Cloud</p>
                  <p className="text-[12px] text-[var(--text-muted)]">
                    {breakEven.selfHostedVsCloud.months ? `Breaks even in ~${breakEven.selfHostedVsCloud.months} months` : breakEven.selfHostedVsCloud.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {recommendations && recommendations.length > 0 && (
          <div className="rounded-[22px] border border-[var(--border-soft)] bg-white p-5">
            <h4 className="mb-3 text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">Recommendations</h4>
            <div className="space-y-2">
              {recommendations.map((rec, i) => (
                <div key={i} className={`rounded-xl border p-3 ${recColor[rec.type] || recColor.info}`}>
                  <p className="text-[12px] font-bold">{rec.message}</p>
                  {rec.reason && <p className="text-[11px] mt-0.5 opacity-80">{rec.reason}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TCOSection;
