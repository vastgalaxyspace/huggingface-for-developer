import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const CollapsibleSection = ({ 
  id, 
  title, 
  icon: Icon, 
  iconColor = 'text-purple-400', 
  defaultOpen = true, 
  children,
  badge = null
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div id={id} className="mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-4 group"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-6 h-6 ${iconColor}`} />}
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {badge && (
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-lg border border-purple-500/30">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
            {isOpen ? 'Collapse' : 'Expand'}
          </span>
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
