"use client";

import { ArrowLeft, ArrowRight, Download, RotateCcw, Sparkles } from "lucide-react";

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
    <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {isResults ? (
          <button
            type="button"
            onClick={onStartOver}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Start Over
          </button>
        ) : currentStep > 1 ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Step counter */}
      <div className="flex items-center gap-2 text-center">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 w-6 rounded-full transition-all ${
                s <= currentStep ? "bg-blue-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-slate-400">
          Step {currentStep}/4
        </span>
      </div>

      <div className="flex items-center justify-end gap-3">
        {isResults ? (
          <button
            type="button"
            onClick={onExport}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed || loading}
            title={!canProceed ? validationMessage : ""}
            className={`inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,99,235,0.25),0_0_0_4px_rgba(37,99,235,0.15)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none ${
              isFinalAction 
                ? "bg-gradient-to-br from-emerald-600 to-emerald-700 hover:shadow-[0_8px_24px_rgba(5,150,105,0.25),0_0_0_4px_rgba(5,150,105,0.15)]" 
                : "bg-gradient-to-br from-blue-600 to-blue-700"
            }`}
          >
            {isFinalAction ? (
              <>
                <Sparkles className="h-4 w-4" />
                Find Models
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
