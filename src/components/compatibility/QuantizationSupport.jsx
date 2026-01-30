import { CheckCircle, XCircle, ArrowDown } from 'lucide-react';

const QuantizationSupport = ({ quantization }) => {
  const formats = [
    { key: 'fp16', color: 'blue', priority: 1 },
    { key: 'int8', color: 'green', priority: 2 },
    { key: 'int4', color: 'yellow', priority: 3 },
    { key: 'gptq', color: 'purple', priority: 4 },
    { key: 'awq', color: 'pink', priority: 5 },
    { key: 'gguf', color: 'cyan', priority: 6 }
  ];

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {Object.values(quantization).filter(q => q.supported).length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Supported Formats</div>
        </div>
        
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">
            {quantization.fp16?.vram}
          </div>
          <div className="text-xs text-gray-400 mt-1">FP16 VRAM</div>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {quantization.int8?.vram}
          </div>
          <div className="text-xs text-gray-400 mt-1">INT8 VRAM</div>
        </div>
        
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {quantization.int4?.vram}
          </div>
          <div className="text-xs text-gray-400 mt-1">INT4 VRAM</div>
        </div>
      </div>

      {/* Format Details */}
      <div className="space-y-3">
        {formats.map((format) => {
          const data = quantization[format.key];
          if (!data) return null;

          return (
            <div
              key={format.key}
              className={`bg-white/5 border rounded-xl p-4 ${
                data.supported
                  ? 'border-white/10 hover:bg-white/10'
                  : 'border-red-500/30 opacity-60'
              } transition-all`}
            >
              <div className="flex items-start justify-between">
                {/* Format Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {data.supported ? (
                      <CheckCircle className={`w-5 h-5 text-${format.color}-400`} />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <h4 className="text-lg font-bold text-white">
                      {data.name}
                    </h4>
                  </div>

                  {/* Stats Grid */}
                  {data.supported && (
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-xs text-gray-400">VRAM</div>
                        <div className={`text-sm font-bold text-${format.color}-400`}>
                          {data.vram}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Quality</div>
                        <div className={`text-sm font-bold text-${format.color}-400`}>
                          {data.quality}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Status</div>
                        <div className={`text-sm font-bold text-green-400`}>
                          {data.supported ? 'Available' : 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="flex flex-wrap gap-2">
                    {data.notes.map((note, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded text-xs ${
                          data.supported
                            ? `bg-${format.color}-500/20 text-${format.color}-400 border border-${format.color}-500/30`
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Memory Savings Visualization */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-xl p-5">
        <h4 className="text-lg font-bold text-white mb-4">
          💾 Memory Savings Comparison
        </h4>
        
        <div className="space-y-3">
          {/* FP16 Baseline */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-300">FP16 (Baseline)</span>
              <span className="text-sm font-bold text-blue-400">
                {quantization.fp16?.vram} (100%)
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* INT8 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-300">INT8 (2x smaller)</span>
              <span className="text-sm font-bold text-green-400">
                {quantization.int8?.vram} (~50%)
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
              <div className="bg-green-500 h-full" style={{ width: '50%' }}></div>
            </div>
          </div>

          {/* INT4 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-300">INT4 (4x smaller)</span>
              <span className="text-sm font-bold text-yellow-400">
                {quantization.int4?.vram} (~25%)
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
              <div className="bg-yellow-500 h-full" style={{ width: '25%' }}></div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
          <ArrowDown className="w-4 h-4 text-green-400" />
          <span>Lower VRAM = Cheaper hardware, faster loading, more headroom for batch processing</span>
        </div>
      </div>
    </div>
  );
};

export default QuantizationSupport;