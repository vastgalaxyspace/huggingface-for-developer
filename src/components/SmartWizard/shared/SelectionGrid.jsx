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
            className={`rounded-xl border-2 p-4 text-left transition-all ${
              isSelected
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
            }`}
          >
            <div className="flex items-start gap-3">
              {option.icon ? (
                <span className="mt-0.5 text-lg leading-none">{option.icon}</span>
              ) : null}
              <div>
                <div className="text-sm font-bold sm:text-base">{option.label}</div>
                {option.description ? (
                  <p className={`mt-1 text-sm ${isSelected ? "text-gray-200" : "text-gray-500"}`}>
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
