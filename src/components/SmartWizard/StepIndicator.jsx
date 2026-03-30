const STEPS = [
  { id: 1, label: "Task" },
  { id: 2, label: "Compute" },
  { id: 3, label: "Metrics" },
  { id: 4, label: "Results" },
];

export default function StepIndicator({ currentStep, completedSteps, goToStep }) {
  return (
    <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
      {STEPS.map((step, index) => {
        const completed = completedSteps.includes(step.id);
        const active = step.id === currentStep;
        const clickable = completed && !active;

        return (
          <div key={step.id} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => clickable && goToStep(step.id)}
              disabled={!clickable}
              className="group flex shrink-0 flex-col items-center disabled:cursor-not-allowed"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold transition-all duration-200 ${
                  completed || active
                    ? "bg-gray-900 text-white"
                    : "border-2 border-gray-300 bg-white text-gray-400"
                }`}
              >
                {step.id}
              </span>
              <span
                className={`mt-2 hidden text-xs font-bold uppercase tracking-widest md:block ${
                  active || completed ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </button>

            {index < STEPS.length - 1 ? (
              <div className="mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full transition-all duration-200 ${
                    completedSteps.includes(step.id) ? "w-full bg-gray-900" : "w-0 bg-gray-900"
                  }`}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
