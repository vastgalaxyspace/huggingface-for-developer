import { CheckCircle, XCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

const ComparisonTable = ({ models }) => {
  // Key parameters to compare
  const comparisonFields = [
    { 
      key: 'license', 
      label: 'License',
      getValue: (model) => model.licenseInfo?.name || 'Unknown',
      getColor: (model) => model.licenseInfo?.color || 'gray'
    },
    { 
      key: 'vram_fp16', 
      label: 'VRAM (FP16)',
      getValue: (model) => `${model.vramEstimates?.fp16 || 'N/A'} GB`,
      compare: 'lower_better'
    },
    { 
      key: 'vram_int8', 
      label: 'VRAM (INT8)',
      getValue: (model) => `${model.vramEstimates?.int8 || 'N/A'} GB`,
      compare: 'lower_better'
    },
    { 
      key: 'parameters', 
      label: 'Parameters',
      getValue: (model) => `${model.vramEstimates?.totalParams || 'N/A'}B`,
      compare: 'higher_better'
    },
    { 
      key: 'context_length', 
      label: 'Context Length',
      getValue: (model) => model.config?.max_position_embeddings?.toLocaleString() || 'N/A',
      compare: 'higher_better'
    },
    { 
      key: 'hidden_size', 
      label: 'Hidden Size',
      getValue: (model) => model.config?.hidden_size?.toLocaleString() || 'N/A'
    },
    { 
      key: 'num_layers', 
      label: 'Layers',
      getValue: (model) => model.config?.num_hidden_layers || 'N/A'
    },
    { 
      key: 'attention_heads', 
      label: 'Attention Heads',
      getValue: (model) => model.config?.num_attention_heads || 'N/A'
    },
    { 
      key: 'kv_heads', 
      label: 'KV Heads (GQA)',
      getValue: (model) => {
        const kvHeads = model.config?.num_key_value_heads;
        const attHeads = model.config?.num_attention_heads;
        if (!kvHeads) return 'N/A';
        if (kvHeads === attHeads) return `${kvHeads} (MHA)`;
        return `${kvHeads} (GQA)`;
      }
    },
    { 
      key: 'downloads', 
      label: 'Downloads',
      getValue: (model) => formatNumber(model.downloads || 0),
      compare: 'higher_better'
    },
    { 
      key: 'likes', 
      label: 'Likes',
      getValue: (model) => formatNumber(model.likes || 0),
      compare: 'higher_better'
    }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Find best value for comparison
  const getBestValue = (field, models) => {
    if (!field.compare) return null;
    
    const values = models.map(model => {
      const value = field.getValue(model);
      // Extract numeric value
      const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
      return { model, numeric };
    }).filter(v => !isNaN(v.numeric));

    if (values.length === 0) return null;

    if (field.compare === 'lower_better') {
      return Math.min(...values.map(v => v.numeric));
    } else {
      return Math.max(...values.map(v => v.numeric));
    }
  };

  const isBestValue = (field, model, models) => {
    if (!field.compare) return false;
    const bestValue = getBestValue(field, models);
    if (bestValue === null) return false;
    
    const value = field.getValue(model);
    const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
    return numeric === bestValue;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left p-4 font-semibold text-gray-400 sticky left-0 bg-slate-900/95 backdrop-blur-sm z-10">
              Parameter
            </th>
            {models.map((model) => (
              <th key={model.modelId} className="p-4 min-w-[250px]">
                <div className="text-left">
                  <div className="font-bold text-white mb-1 text-lg">
                    {model.modelId.split('/')[1] || model.modelId}
                  </div>
                  <div className="text-xs text-gray-400 font-normal">
                    by {model.author}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonFields.map((field) => (
            <tr key={field.key} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="p-4 font-medium text-gray-300 sticky left-0 bg-slate-900/95 backdrop-blur-sm">
                {field.label}
              </td>
              {models.map((model) => {
                const value = field.getValue(model);
                const isBest = isBestValue(field, model, models);
                const color = field.getColor ? field.getColor(model) : null;
                
                return (
                  <td key={model.modelId} className="p-4">
                    <div className={`flex items-center gap-2 ${isBest ? 'text-green-400 font-semibold' : 'text-white'}`}>
                      {isBest && field.compare && (
                        <div className="flex items-center gap-1 text-green-400">
                          {field.compare === 'lower_better' ? (
                            <TrendingDown className="w-4 h-4" />
                          ) : (
                            <TrendingUp className="w-4 h-4" />
                          )}
                        </div>
                      )}
                      
                      {field.key === 'license' && color && (
                        <div>
                          {color === 'green' && <CheckCircle className="w-4 h-4 text-green-400" />}
                          {color === 'yellow' && <AlertCircle className="w-4 h-4 text-yellow-400" />}
                          {color === 'red' && <XCircle className="w-4 h-4 text-red-400" />}
                        </div>
                      )}
                      
                      <span>{value}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;