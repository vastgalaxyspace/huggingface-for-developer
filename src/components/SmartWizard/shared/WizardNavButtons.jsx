import { ArrowLeft, ArrowRight, Download } from "lucide-react";

export default function WizardNavButtons({
  currentStep,
  canProceed,
  validationMessage,
  onBack,
  onNext,
  onStartOver,
  onExport,
  loading,
}) {
  const isResults = currentStep === 4;
  const isFinalAction = currentStep === 3;

  return (
    <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {isResults ? (
          <button
            type="button"
            onClick={onStartOver}
            className="inline-flex items-center rounded-xl border border-gray-300 px-6 py-3 text-gray-600 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Start Over
          </button>
        ) : currentStep > 1 ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center rounded-xl border border-gray-300 px-6 py-3 text-gray-600 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
        ) : (
          <div />
        )}
      </div>

      <div className="text-center text-sm font-medium text-gray-500">
        Step {currentStep} of 4
      </div>

      <div className="flex items-center justify-end gap-3">
        {isResults ? (
          <button
            type="button"
            onClick={onExport}
            disabled={loading}
            className="inline-flex items-center rounded-xl border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed || loading}
            title={!canProceed ? validationMessage : ""}
            className={`rounded-xl px-6 py-3 font-semibold text-white transition-colors ${
              isFinalAction
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-gray-900 hover:bg-gray-800"
            } inline-flex items-center disabled:cursor-not-allowed disabled:bg-gray-300`}
          >
            {isFinalAction ? "Find Models" : "Continue"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
