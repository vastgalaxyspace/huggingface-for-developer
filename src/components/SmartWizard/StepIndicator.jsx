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
              aria-label={step.label}
              aria-current={active ? "step" : undefined}
              className="wizard-step"
            >
              <span className={active ? "active" : completed ? "complete" : ""}>
                {completed ? <Check size={18}/> : <Icon size={18}/>}
              </span>
              {step.label}
            </button>

            {index < STEPS.length - 1 ? (
              <div className="relative mx-2 flex-1 h-[3px] overflow-hidden rounded-full bg-slate-200">
                <div
                  className="absolute inset-0 rounded-full bg-[var(--accent)] transition-all duration-500 ease-in-out"
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
