import { Shield, Cpu, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const QuickDecisionPanel = ({ licenseInfo, vramEstimates }) => {
  const getLicenseIcon = (color) => {
    switch (color) {
      case 'green': return <CheckCircle className="w-5 h-5" />;
      case 'yellow': return <AlertCircle className="w-5 h-5" />;
      case 'red': return <XCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getColorClasses = (color) => {
    switch (color) {
      case 'green': return 'bg-green-500/20 border-green-500/30 text-green-400';
      case 'yellow': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'red': return 'bg-red-500/20 border-red-500/30 text-red-400';
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  // Handle missing data
  if (!licenseInfo || !vramEstimates) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 text-red-400 backdrop-blur-sm rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-semibold">Data Unavailable</h3>
        </div>
        <div className="text-sm opacity-90">
          Unable to load model configuration. This may be due to access restrictions or network issues.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* License Status */}
      <div className={`${getColorClasses(licenseInfo.color)} border backdrop-blur-sm rounded-xl p-4`}>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5" />
          <h3 className="font-semibold">License</h3>
        </div>
        <div className="text-2xl font-bold mb-1">
          {licenseInfo.name}
        </div>
        <div className="text-sm opacity-90">
          {licenseInfo.summary}
        </div>
        {licenseInfo.warnings && licenseInfo.warnings.length > 0 && (
          <div className="mt-3 pt-3 border-t border-current/20">
            <div className="text-xs space-y-1">
              {licenseInfo.warnings.slice(0, 2).map((warning, idx) => (
                <div key={idx}>• {warning}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* VRAM Requirements */}
      <div className="bg-blue-500/20 border border-blue-500/30 text-blue-400 backdrop-blur-sm rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="w-5 h-5" />
          <h3 className="font-semibold">VRAM Required</h3>
        </div>
        <div className="text-2xl font-bold mb-1">
          ~{vramEstimates.fp16}GB
        </div>
        <div className="text-sm opacity-90 mb-3">
          Full precision (FP16)
        </div>
        <div className="text-xs space-y-1 pt-3 border-t border-blue-500/20">
          <div>INT8: ~{vramEstimates.int8}GB</div>
          <div>INT4: ~{vramEstimates.int4}GB</div>
        </div>
      </div>

      {/* Model Size */}
      <div className="bg-purple-500/20 border border-purple-500/30 text-purple-400 backdrop-blur-sm rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="w-5 h-5" />
          <h3 className="font-semibold">Model Size</h3>
        </div>
        <div className="text-2xl font-bold mb-1">
          {vramEstimates.totalParams}B
        </div>
        <div className="text-sm opacity-90 mb-3">
          Parameters
        </div>
        <div className="text-xs pt-3 border-t border-purple-500/20">
          Total trainable parameters
        </div>
      </div>
    </div>
  );
};

export default QuickDecisionPanel;