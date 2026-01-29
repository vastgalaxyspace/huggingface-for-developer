import { getUseCases } from '../../utils/recommenderEngine';

const WizardStepUseCase = ({ selected, onSelect }) => {
  const useCases = getUseCases();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">
          What will you use this model for?
        </h2>
        <p className="text-gray-400">
          This helps us recommend models optimized for your specific needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(useCases).map(([key, useCase]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`text-left p-6 rounded-xl border-2 transition-all hover:scale-105 ${
              selected === key
                ? 'bg-purple-500/30 border-purple-500'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/50'
            }`}
          >
            <div className="text-5xl mb-3">{useCase.icon}</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {useCase.name}
            </h3>
            <p className="text-sm text-gray-400">
              {useCase.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WizardStepUseCase;