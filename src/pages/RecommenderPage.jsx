import { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useRecommender } from '../hooks/useRecommender';
import WizardStepUseCase from '../components/recommender/WizardStepUseCase';
import WizardStepConstraints from '../components/recommender/WizardStepConstraints';
import WizardStepPreferences from '../components/recommender/WizardStepPreferences';
import WizardStepResults from '../components/recommender/WizardStepResults';

const RecommenderPage = ({ onBack, onSelectModel, allModels, loading, progress = 0 }) => {
  const {
    step,
    requirements,
    recommendations,
    updateRequirement,
    nextStep,
    prevStep,
    generateRecommendations,
    reset
  } = useRecommender();

  const [isGenerating, setIsGenerating] = useState(false);

  const canProceed = () => {
    if (step === 1) return requirements.useCase !== null;
    if (step === 2) return requirements.maxVRAM > 0;
    if (step === 3) return requirements.priority !== null;
    return true;
  };

  const handleNext = () => {
    if (step === 3) {
      setIsGenerating(true);
      // Simulate analysis delay
      setTimeout(() => {
        generateRecommendations(allModels);
        setIsGenerating(false);
      }, 1000);
    } else {
      nextStep();
    }
  };

  const handleStartOver = () => {
    reset();
  };

  const steps = [
    { number: 1, title: 'Use Case', icon: '🎯' },
    { number: 2, title: 'Constraints', icon: '⚙️' },
    { number: 3, title: 'Preferences', icon: '⭐' },
    { number: 4, title: 'Results', icon: '🎉' }
  ];

  // Detailed Loading State with Progress Bar
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto mt-12">
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-12">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 rounded-full"></div>
                </div>
              </div>

              <p className="text-center text-xl text-gray-300 mb-4">
                Loading model database...
              </p>
              
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden mb-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <p className="text-center text-sm text-gray-400">
                {progress}% complete - Analyzing {Math.ceil((progress / 100) * allModels?.length || 0)} models
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">
              Smart Model Recommender
            </h1>
          </div>

          <div className="w-20" /> {/* Spacer */}
        </div>

        {/* Wizard Progress Stepper */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.slice(0, 3).map((s, idx) => (
                <div key={s.number} className="flex items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                      step >= s.number
                        ? 'bg-purple-500 border-purple-500 text-white'
                        : 'bg-white/5 border-white/20 text-gray-400'
                    }`}
                  >
                    <span className="text-xl">{s.icon}</span>
                  </div>
                  
                  {idx < 2 && (
                    <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                      step > s.number ? 'bg-purple-500' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between text-sm">
              {steps.slice(0, 3).map((s) => (
                <div
                  key={s.number}
                  className={`font-semibold transition-colors ${
                    step >= s.number ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {s.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
          {isGenerating ? (
            <div className="text-center py-12">
              <div className="inline-block w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-xl text-white">Analyzing models...</p>
              <p className="text-gray-400 mt-2">Finding your perfect matches based on requirements</p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <WizardStepUseCase
                  selected={requirements.useCase}
                  onSelect={(useCase) => updateRequirement('useCase', useCase)}
                />
              )}

              {step === 2 && (
                <WizardStepConstraints
                  requirements={requirements}
                  onUpdate={updateRequirement}
                />
              )}

              {step === 3 && (
                <WizardStepPreferences
                  requirements={requirements}
                  onUpdate={updateRequirement}
                />
              )}

              {step === 4 && (
                <WizardStepResults
                  recommendations={recommendations}
                  onSelectModel={onSelectModel}
                  onStartOver={handleStartOver}
                />
              )}
            </>
          )}
        </div>

        {/* Bottom Navigation */}
        {step < 4 && !isGenerating && (
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
            >
              {step === 3 ? (
                <>
                  <Sparkles className="w-5 h-5" />
                  Get Recommendations
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommenderPage;