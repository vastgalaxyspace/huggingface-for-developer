"use client";

import { Check } from "lucide-react";

export default function SelectionGrid({
  options,
  selected,
  onSelect,
  multiSelect = false,
  columns = "sm:grid-cols-2 lg:grid-cols-3",
}) {
  const selectedValues = Array.isArray(selected) ? selected : [selected];

  return (
    <div className={`grid grid-cols-1 gap-3 ${columns}`}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.id);

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id, multiSelect)}
            className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
              isSelected
                ? "border-blue-600 bg-blue-50/50 shadow-[0_0_0_3px_rgba(37,99,235,0.15)] shadow-blue-500/10 -translate-y-0.5"
                : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
            }`}
>
            {/* Checkmark badge */}
            <span 
              className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 ${
                isSelected ? "scale-100 bg-blue-600 opacity-100" : "scale-50 bg-transparent opacity-0"
              }`}
            >
              <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
            </span>

            <div className="relative z-10 flex items-start gap-3">
              {option.icon ? (
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base transition-colors ${
                    isSelected
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {option.icon}
                </span>
              ) : null}
              <div className="min-w-0">
                <div
                  className={`text-sm font-bold sm:text-[15px] ${
                    isSelected ? "text-blue-900" : "text-slate-800"
                  }`}
                >
                  {option.label}
                </div>
                {option.description ? (
                  <p
                    className={`mt-1 text-[13px] leading-snug ${
                      isSelected ? "text-blue-600/70" : "text-slate-500"
                    }`}
                  >
                    {option.description}
                  </p>
                ) : null}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
