import StepIndicator from "./StepIndicator";

export default function WizardHeader({ currentStep, completedSteps, goToStep }) {
  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        Decision Assistant
      </p>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
        Smart Recommender Wizard
      </h1>
      <p className="mx-auto mt-4 max-w-3xl text-base text-gray-500 sm:text-lg">
        Find the optimal model for your specific architectural constraints.
      </p>
      <div className="mt-10">
        <StepIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
          goToStep={goToStep}
        />
      </div>
    </div>
  );
}
