import { Plus, Check, X } from 'lucide-react';

const CompareButton = ({ modelId, isInComparison, onAdd, onRemove, disabled }) => {
  if (isInComparison) {
    return (
      <button
        onClick={() => onRemove(modelId)}
        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-all"
      >
        <Check className="w-4 h-4" />
        <span className="font-semibold">Added to Compare</span>
        <X className="w-4 h-4 ml-2" />
      </button>
    );
  }

  return (
    <button
      onClick={() => onAdd(modelId)}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Plus className="w-4 h-4" />
      <span className="font-semibold">Add to Compare</span>
    </button>
  );
};

export default CompareButton;