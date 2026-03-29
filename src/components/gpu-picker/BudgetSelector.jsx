"use client";

const BUDGETS = [
  ["consumer", "Consumer <$2K"],
  ["workstation", "Workstation $2K-$15K"],
  ["enterprise", "Enterprise $15K+"],
  ["any", "Any Budget"],
];

const VENDORS = [
  ["all", "All"],
  ["nvidia", "NVIDIA"],
  ["amd", "AMD"],
  ["apple", "Apple"],
  ["intel", "Intel"],
];

function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
        active ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-gray-200 text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}

export default function BudgetSelector({ budgetTier, vendorPreference, onBudgetChange, onVendorChange }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 ease-in-out">
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">BUDGET TIER</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {BUDGETS.map(([value, label]) => (
          <Pill key={value} active={budgetTier === value} onClick={() => onBudgetChange(value)}>
            {label}
          </Pill>
        ))}
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-widest text-emerald-800">Vendor Preference</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {VENDORS.map(([value, label]) => (
          <Pill key={value} active={vendorPreference === value} onClick={() => onVendorChange(value)}>
            {label}
          </Pill>
        ))}
      </div>
    </div>
  );
}
