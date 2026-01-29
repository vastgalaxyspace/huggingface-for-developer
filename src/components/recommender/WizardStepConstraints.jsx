const WizardStepConstraints = ({ requirements, onUpdate }) => {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">
          What are your constraints?
        </h2>
        <p className="text-gray-400">
          Help us filter models that fit your budget and requirements
        </p>
      </div>

      {/* VRAM Budget */}
      <div className="bg-white/5 rounded-xl p-6">
        <label className="block text-lg font-semibold text-white mb-4">
          💾 Maximum VRAM Available
        </label>
        <input
          type="range"
          min="4"
          max="80"
          step="4"
          value={requirements.maxVRAM}
          onChange={(e) => onUpdate('maxVRAM', parseInt(e.target.value))}
          className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-between mt-4">
          <span className="text-gray-400 text-sm">4GB</span>
          <span className="text-2xl font-bold text-purple-400">
            {requirements.maxVRAM}GB
          </span>
          <span className="text-gray-400 text-sm">80GB</span>
        </div>
        <p className="text-sm text-gray-400 mt-3">
          Models requiring more than {requirements.maxVRAM}GB will be filtered out
        </p>
      </div>

      {/* Context Length */}
      <div className="bg-white/5 rounded-xl p-6">
        <label className="block text-lg font-semibold text-white mb-4">
          📄 Minimum Context Length Needed
        </label>
        <select
          value={requirements.minContext || ''}
          onChange={(e) => onUpdate('minContext', parseInt(e.target.value) || null)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Any (no minimum)</option>
          <option value="4096">4k tokens (short conversations)</option>
          <option value="8192">8k tokens (standard)</option>
          <option value="16384">16k tokens (long documents)</option>
          <option value="32768">32k tokens (very long context)</option>
          <option value="65536">64k+ tokens (massive context)</option>
        </select>
      </div>

      {/* License Requirement */}
      <div className="bg-white/5 rounded-xl p-6">
        <label className="block text-lg font-semibold text-white mb-4">
          🛡️ License Requirements
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onUpdate('license', 'any')}
            className={`px-6 py-4 rounded-lg border-2 transition-all ${
              requirements.license === 'any'
                ? 'bg-purple-500/30 border-purple-500 text-white'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <div className="font-semibold mb-1">Any License</div>
            <div className="text-xs">Research or commercial</div>
          </button>
          
          <button
            onClick={() => onUpdate('license', 'commercial')}
            className={`px-6 py-4 rounded-lg border-2 transition-all ${
              requirements.license === 'commercial'
                ? 'bg-green-500/30 border-green-500 text-white'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <div className="font-semibold mb-1">Commercial</div>
            <div className="text-xs">Production use</div>
          </button>
          
          <button
            onClick={() => onUpdate('license', 'research')}
            className={`px-6 py-4 rounded-lg border-2 transition-all ${
              requirements.license === 'research'
                ? 'bg-blue-500/30 border-blue-500 text-white'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <div className="font-semibold mb-1">Research Only</div>
            <div className="text-xs">Non-commercial</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WizardStepConstraints;