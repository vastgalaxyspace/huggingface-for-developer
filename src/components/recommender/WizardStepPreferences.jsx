import { getPriorities } from '../../utils/recommenderEngine';

const WizardStepPreferences = ({ requirements, onUpdate }) => {
  const priorities = getPriorities();

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">
          What's most important to you?
        </h2>
        <p className="text-gray-400">
          This helps us balance trade-offs and prioritize recommendations
        </p>
      </div>

      {/* Priority Selection */}
      <div className="bg-white/5 rounded-xl p-6">
        <label className="block text-lg font-semibold text-white mb-4">
          ⚡ Your Priority
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(priorities).map(([key, priority]) => (
            <button
              key={key}
              onClick={() => onUpdate('priority', key)}
              className={`text-left p-5 rounded-xl border-2 transition-all ${
                requirements.priority === key
                  ? 'bg-purple-500/30 border-purple-500'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/50'
              }`}
            >
              <h3 className="text-xl font-bold text-white mb-2">
                {priority.name}
              </h3>
              <p className="text-sm text-gray-400">
                {priority.description}
              </p>
              
              {/* Weight Indicators */}
              <div className="mt-4 space-y-2">
                {Object.entries(priority.weights).map(([metric, weight]) => (
                  <div key={metric} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 capitalize w-16">
                      {metric}:
                    </span>
                    <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all"
                        style={{ width: `${weight * 10}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-6">
                      {weight}
                    </span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Framework Preference (Optional) */}
      <div className="bg-white/5 rounded-xl p-6">
        <label className="block text-lg font-semibold text-white mb-4">
          🔧 Frameworks You Use (Optional)
        </label>
        <p className="text-sm text-gray-400 mb-4">
          We'll boost models with better support for your stack
        </p>
        <div className="flex flex-wrap gap-3">
          {['transformers', 'vllm', 'ollama', 'llamacpp', 'tensorrt'].map((framework) => (
            <button
              key={framework}
              onClick={() => {
                const current = requirements.frameworks || [];
                const updated = current.includes(framework)
                  ? current.filter(f => f !== framework)
                  : [...current, framework];
                onUpdate('frameworks', updated);
              }}
              className={`px-4 py-2 rounded-lg border transition-all ${
                (requirements.frameworks || []).includes(framework)
                  ? 'bg-purple-500/30 border-purple-500 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              {framework}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WizardStepPreferences;