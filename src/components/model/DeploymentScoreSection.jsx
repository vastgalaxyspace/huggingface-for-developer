import { Shield, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const stripEmoji = (str) => {
  if (!str) return '';
  return str.replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FEFF}]|[\u{1F900}-\u{1F9FF}]|[✅⚠️❌✓✗☑☒⚡🔴🟢🟡🟠💡🤗🦙💻🚀🎮💼☁️🖥️🎯📦💾🌐🏷️\[\]]/gu, '').replace(/^(PASS|WARN|FAIL)\s*/i, '').trim();
};

const getStatusIcon = (text) => {
  if (!text) return null;
  if (text.includes('PASS') || text.includes('Commercial use') || text.startsWith('[PASS]')) return <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />;
  if (text.includes('FAIL') || text.includes('No ') || text.includes('Missing') || text.startsWith('[FAIL]')) return <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />;
  if (text.includes('WARN') || text.startsWith('[WARN]')) return <Info className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />;
  return <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />;
};

const ScoreBar = ({ label, score, maxScore, details, issues }) => {
  const pct = Math.round((score / maxScore) * 100);
  const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : pct >= 40 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className="rounded-xl border border-[var(--border-soft)] bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-bold text-[var(--text-strong)]">{label}</span>
        <span className="text-[13px] font-bold text-[var(--text-strong)]">{score}/{maxScore}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(0,0,0,0.06)] mb-3">
        <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      {details && details.length > 0 && (
        <div className="space-y-1">
          {details.slice(0, 3).map((d, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              {getStatusIcon(d)}
              <span>{stripEmoji(d)}</span>
            </div>
          ))}
        </div>
      )}
      {issues && issues.length > 0 && (
        <div className="mt-2 space-y-1">
          {issues.slice(0, 2).map((issue, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-amber-600">
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              <span>{issue}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DeploymentScoreSection = ({ deploymentScore }) => {
  if (!deploymentScore) return null;
  const { total, scores, rating, recommendations, readyForProduction } = deploymentScore;

  const ratingColors = {
    green: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    yellow: 'border-amber-300 bg-amber-50 text-amber-700',
    orange: 'border-orange-300 bg-orange-50 text-orange-700',
    red: 'border-red-300 bg-red-50 text-red-700',
  };

  const ratingIcons = {
    green: <CheckCircle className="h-6 w-6" />,
    yellow: <Info className="h-6 w-6" />,
    orange: <AlertTriangle className="h-6 w-6" />,
    red: <AlertTriangle className="h-6 w-6" />,
  };

  return (
    <section id="section-score" className="mb-14">
      <div className="flex items-center gap-2 mb-1">
        <Shield className="h-5 w-5 text-[var(--accent)]" />
        <h2 className="text-[1.6rem] font-black tracking-tight text-[var(--text-strong)]">Deployment Readiness</h2>
      </div>
      <p className="mb-5 text-[13px] text-[var(--text-faint)]">Multi-factor assessment for production deployment</p>

      <div className={`mb-6 flex items-center justify-between rounded-2xl border-2 p-5 ${ratingColors[rating.color] || ratingColors.yellow}`}>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-black">{total}</div>
          <div>
            <div className="flex items-center gap-2">
              {ratingIcons[rating.color]}
              <p className="text-[15px] font-bold">{rating.label}</p>
            </div>
            <p className="text-[12px] opacity-80">
              {readyForProduction ? 'Ready for production deployment' : 'Review issues before deploying'}
            </p>
          </div>
        </div>
        <div className="text-[11px] font-bold uppercase tracking-wider opacity-70">out of 100</div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {scores.license && <ScoreBar label="License" {...scores.license} />}
        {scores.community && <ScoreBar label="Community" {...scores.community} />}
        {scores.documentation && <ScoreBar label="Documentation" {...scores.documentation} />}
        {scores.compatibility && <ScoreBar label="Compatibility" {...scores.compatibility} />}
        {scores.efficiency && <ScoreBar label="Efficiency" {...scores.efficiency} />}
      </div>

      {recommendations && recommendations.length > 0 && (
        <div className="space-y-2">
          {recommendations.map((rec, i) => {
            const Icon = rec.type === 'success' ? CheckCircle : rec.type === 'warning' ? AlertTriangle : Info;
            const color = rec.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : rec.type === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-blue-200 bg-blue-50 text-blue-700';
            return (
              <div key={i} className={`flex items-start gap-2.5 rounded-xl border p-3.5 ${color}`}>
                <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-[12px] font-medium">{rec.message}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default DeploymentScoreSection;
