import { Cpu, Cloud, Server, Monitor } from 'lucide-react';

const GPUCompatibility = ({ hardware }) => {
  const categories = [
    { key: 'consumer', icon: Cpu, color: 'blue' },
    { key: 'professional', icon: Server, color: 'purple' },
    { key: 'cloud', icon: Cloud, color: 'cyan' },
    { key: 'cpu', icon: Monitor, color: 'gray' }
  ];

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const data = hardware[category.key];
        if (!data) return null;

        const Icon = category.icon;
        const isCompatible = data.compatible !== false;

        return (
          <div
            key={category.key}
            className={`bg-white/5 border rounded-xl p-5 ${
              isCompatible
                ? 'border-white/10 hover:bg-white/10'
                : 'border-red-500/30 opacity-75'
            } transition-all`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg bg-${category.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 text-${category.color}-400`} />
              </div>

              <div className="flex-1">
                {/* Header */}
                <div className="mb-3">
                  <h4 className="text-lg font-bold text-white mb-1">
                    {data.name}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {data.recommendation}
                  </p>
                  {data.performance && (
                    <p className="text-sm text-yellow-400 mt-1">
                      Performance: {data.performance}
                    </p>
                  )}
                </div>

                {/* Options/Details */}
                {data.options && data.options.length > 0 && (
                  <div className="space-y-2">
                    {category.key === 'consumer' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {data.options.map((option, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg ${
                              option.feasible
                                ? 'bg-green-500/10 border border-green-500/30'
                                : 'bg-red-500/10 border border-red-500/30'
                            }`}
                          >
                            <div className="font-semibold text-white text-sm">
                              {option.name}
                            </div>
                            {option.format && (
                              <div className="text-xs text-gray-400 mt-1">
                                Format: {option.format}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {category.key === 'professional' && (
                      <div className="flex flex-wrap gap-2">
                        {data.options.map((option, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm"
                          >
                            {option.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {category.key === 'cloud' && (
                      <div className="space-y-2">
                        {data.options.map((option, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg"
                          >
                            <div>
                              <div className="font-semibold text-white text-sm">
                                {option.provider}: {option.instance}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {option.price}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GPUCompatibility;