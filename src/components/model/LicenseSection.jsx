import { Shield, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const stripEmoji = (str) => {
  if (!str) return '';
  return str.replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FEFF}]|[\u{1F900}-\u{1F9FF}]|[✅⚠️❌✓✗☑☒⚡🔴🟢🟡🟠💡🤗🦙💻🚀🎮💼☁️🖥️🎯📦💾🌐🏷️]/gu, '').trim();
};

const LicenseSection = ({ licenseInfo, licenseDisplay, deploymentRec }) => {
  if (!licenseInfo) return null;

  const iconMap = {
    green: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    yellow: <AlertCircle className="h-5 w-5 text-amber-500" />,
    red: <XCircle className="h-5 w-5 text-red-500" />,
    blue: <Shield className="h-5 w-5 text-blue-500" />,
    gray: <AlertCircle className="h-5 w-5 text-gray-400" />,
  };

  const colorMap = {
    green: 'border-emerald-200 bg-emerald-50',
    yellow: 'border-amber-200 bg-amber-50',
    red: 'border-red-200 bg-red-50',
    blue: 'border-blue-200 bg-blue-50',
    gray: 'border-gray-200 bg-gray-50',
  };

  const permissions = [
    { label: 'Commercial Use', value: licenseInfo.commercial, key: 'commercial' },
    { label: 'Modification and Fine-tuning', value: licenseInfo.modification, key: 'modification' },
    { label: 'Distribution', value: licenseInfo.distribution, key: 'distribution' },
    { label: 'Patent Grant', value: licenseInfo.patent, key: 'patent' },
  ];

  const getPermIcon = (val) => {
    if (val === true) return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    if (val === false) return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertCircle className="h-4 w-4 text-amber-500" />;
  };

  const getPermText = (val) => {
    if (val === true) return 'Allowed';
    if (val === false) return 'Not Allowed';
    return 'Conditional / Unknown';
  };

  return (
    <section id="section-license" className="mb-14">
      <div className="flex items-center gap-2 mb-1">
        <Shield className="h-5 w-5 text-[var(--accent)]" />
        <h2 className="text-[1.6rem] font-black tracking-tight text-[var(--text-strong)]">License Analysis</h2>
      </div>
      <p className="mb-5 text-[13px] text-[var(--text-faint)]">Commercial usability and deployment restrictions</p>

      <div className={`mb-5 flex items-start gap-3 rounded-2xl border p-5 ${colorMap[licenseInfo.color] || colorMap.gray}`}>
        {iconMap[licenseInfo.color] || iconMap.gray}
        <div>
          <h3 className="text-[15px] font-bold text-[var(--text-strong)]">{licenseInfo.name}</h3>
          <p className="mt-1 text-[13px] text-[var(--text-main)]">{stripEmoji(licenseInfo.details)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-[22px] border border-[var(--border-soft)] bg-white p-5">
          <h4 className="mb-4 text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">Permissions</h4>
          <div className="space-y-3">
            {permissions.map(p => (
              <div key={p.key} className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[var(--text-main)]">{p.label}</span>
                <div className="flex items-center gap-1.5">
                  {getPermIcon(p.value)}
                  <span className="text-[12px] font-semibold text-[var(--text-muted)]">{getPermText(p.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[22px] border border-[var(--border-soft)] bg-white p-5">
          <h4 className="mb-4 text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]">Deployment Recommendation</h4>
          {deploymentRec && (
            <>
              <p className="mb-3 text-[14px] font-bold text-[var(--text-strong)]">{stripEmoji(deploymentRec.message)}</p>
              {deploymentRec.actions && (
                <ul className="space-y-1.5">
                  {deploymentRec.actions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--text-muted)]">
                      <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                      {a}
                    </li>
                  ))}
                </ul>
              )}
              {deploymentRec.risks && (
                <p className="mt-3 text-[12px] text-[var(--text-faint)]">Risk Level: {deploymentRec.risks}</p>
              )}
            </>
          )}
          {licenseInfo.warnings && licenseInfo.warnings.length > 0 && (
            <div className="mt-4 border-t border-[var(--border-soft)] pt-4">
              <h5 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600">Warnings</h5>
              {licenseInfo.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[12px] text-amber-700 mb-1">
                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LicenseSection;
