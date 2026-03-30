"use client";

import { useMemo } from "react";
import WizardHeader from "./WizardHeader";
import Step1Task from "./steps/Step1Task";
import Step2Compute from "./steps/Step2Compute";
import Step3Metrics from "./steps/Step3Metrics";
import Step4Results from "./steps/Step4Results";
import WizardNavButtons from "./shared/WizardNavButtons";
import { useSmartWizard } from "./useSmartWizard";

export default function SmartWizard() {
  const wizard = useSmartWizard();

  const stepContent = useMemo(() => {
    switch (wizard.state.current_step) {
      case 1:
        return <Step1Task state={wizard.state} updateTask={wizard.updateTask} />;
      case 2:
        return (
          <Step2Compute
            state={wizard.state}
            updateCompute={wizard.updateCompute}
            updateMetrics={wizard.updateMetrics}
          />
        );
      case 3:
        return (
          <Step3Metrics
            state={wizard.state}
            updateMetrics={wizard.updateMetrics}
          />
        );
      case 4:
        return (
          <Step4Results
            state={wizard.state}
            sortKey={wizard.sortKey}
            setSortKey={wizard.setSortKey}
            sortedModels={wizard.sortedModels}
            topPriorityLabel={wizard.topPriorityLabel}
            onEditStep={wizard.goToStep}
            onRetry={wizard.fetchModels}
          />
        );
      default:
        return null;
    }
  }, [wizard]);

  const transitionClass =
    wizard.direction === "forward" ? "wizard-enter-forward" : "wizard-enter-backward";

  return (
    <div className="min-h-[calc(100vh-78px)] bg-gradient-to-b from-slate-100 to-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <WizardHeader
          currentStep={wizard.state.current_step}
          completedSteps={wizard.state.completed_steps}
          goToStep={wizard.goToStep}
        />

        <div className="mx-auto mt-10 max-w-3xl">
          <div
            key={wizard.state.current_step}
            className={`min-h-[400px] rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8 ${transitionClass}`}
          >
            {stepContent}
          </div>

          <WizardNavButtons
            currentStep={wizard.state.current_step}
            canProceed={wizard.canProceed()}
            validationMessage={wizard.getValidationMessage()}
            onBack={wizard.prevStep}
            onNext={wizard.handleAdvance}
            onStartOver={wizard.startOver}
            onExport={wizard.exportResults}
            loading={wizard.state.results.loading}
          />
        </div>
      </div>
    </div>
  );
}
