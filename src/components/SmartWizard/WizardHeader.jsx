"use client";

import { BrainCircuit } from "lucide-react";
import StepIndicator from "./StepIndicator";

export default function WizardHeader({ currentStep, completedSteps, goToStep }) {
  return (
    <div className="relative overflow-hidden rounded-b-[32px] bg-slate-900 px-4 pb-12 pt-10 sm:px-6 lg:px-8">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#1e3a5f_0%,#0f172a_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(37,99,235,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_30%,rgba(124,58,237,0.1)_0%,transparent_40%),radial-gradient(circle_at_60%_80%,rgba(5,150,105,0.08)_0%,transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* AI badge */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md">
          <BrainCircuit className="h-4 w-4 text-blue-300" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
            AI Decision Assistant
          </span>
        </div>

        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
          Smart Recommender{" "}
          <span 
            className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 text-transparent"
            style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            Wizard
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Find the optimal model for your exact architectural constraints, hardware budget, and deployment scenario.
        </p>

        <div className="mt-10">
          <StepIndicator
            currentStep={currentStep}
            completedSteps={completedSteps}
            goToStep={goToStep}
          />
        </div>
      </div>
    </div>
  );
}
