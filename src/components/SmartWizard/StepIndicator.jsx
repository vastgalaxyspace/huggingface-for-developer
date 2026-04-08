"use client";

import { Check, ClipboardList, Cpu, Settings2, Trophy } from "lucide-react";

const STEPS = [
  { id: 1, label: "Task", icon: ClipboardList },
  { id: 2, label: "Compute", icon: Cpu },
  { id: 3, label: "Metrics", icon: Settings2 },
  { id: 4, label: "Results", icon: Trophy },
];

export default function StepIndicator({ currentStep, completedSteps, goToStep }) {
  return (
    <div className="mx-auto flex max-w-2xl items-center justify-between gap-1">
      {STEPS.map((step, index) => {
        const completed = completedSteps.includes(step.id);
        const active = step.id === currentStep;
        const clickable = completed && !active;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => clickable && goToStep(step.id)}
              disabled={!clickable}
              className="group flex shrink-0 flex-col items-center disabled:cursor-not-allowed"
            >
              <span
                className={`relative flex h-[52px] w-[52px] items-center justify-center rounded-2xl border-2 text-[15px] font-bold transition-all duration-300 ${
                  active
                    ? "border-transparent bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_8px_24px_rgba(37,99,235,0.25),0_0_0_4px_rgba(37,99,235,0.15)]"
                    : completed
                      ? "border-transparent bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-[0_4px_12px_rgba(5,150,105,0.2)]"
                      : "border-slate-200 bg-white/70 text-slate-400"
                }`}
              >
                {completed && !active ? (
                  <Check className="h-5 w-5" strokeWidth={3} />
                ) : (
                  <Icon className="h-5 w-5" strokeWidth={2} />
                )}
              </span>
              <span
                className={`mt-2.5 hidden text-[11px] font-bold uppercase tracking-[0.16em] md:block ${
                  active
                    ? "text-blue-600"
                    : completed
                      ? "text-emerald-600"
                      : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </button>

            {index < STEPS.length - 1 ? (
              <div className="relative mx-2 flex-1 h-[3px] overflow-hidden rounded-full bg-slate-200">
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600 transition-all duration-500 ease-in-out"
                  style={{
                    width: completedSteps.includes(step.id) ? "100%" : "0%",
                  }}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
