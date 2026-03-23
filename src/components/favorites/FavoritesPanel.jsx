import { Heart, X, Download, Upload, Trash2, ExternalLink } from 'lucide-react';
import { useRef } from 'react';

const FavoritesPanel = ({ 
  favorites, 
  onSelectModel, 
  onRemove, 
  onClear,
  onExport,
  onImport 
}) => {
  const fileInputRef = useRef(null);

  const formatNumber = (num) => {
    if (!num) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = ''; // Reset input
    }
  };

  if (favorites.length === 0) {
    return (
      <div className="bg-[#fafbfc] border-2 border-dashed border-gray-200 rounded-lg p-16 text-center max-w-2xl mx-auto mt-10">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <Heart className="w-8 h-8 text-blue-300" />
        </div>
        <h3 className="text-xl font-extrabold text-[#232f3e] mb-2 tracking-tight">
          No Favorites Yet
        </h3>
        <p className="text-slate-500 font-medium mb-6 text-[14px]">
          Start adding models to your favorites for quick access and comparison.
        </p>
        <p className="text-[12px] text-slate-400 font-medium">
          Click the <Heart className="w-3.5 h-3.5 inline text-slate-400 mx-1" /> icon on any model page to add it here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-100 p-6 bg-[#FAFBFC]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
              <Heart className="w-4 h-4 text-blue-500 fill-current" />
            </div>
            <h2 className="text-xl font-extrabold text-[#232f3e] tracking-tight">
              Favorite Models
            </h2>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[11px] font-bold">
              {favorites.length}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-slate-600 rounded hover:bg-gray-50 transition-all text-xs font-bold uppercase tracking-wider shadow-sm"
              title="Export favorites"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-slate-600 rounded hover:bg-gray-50 transition-all text-xs font-bold uppercase tracking-wider shadow-sm"
              title="Import favorites"
            >
              <Upload className="w-3.5 h-3.5" />
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            
            <button
              onClick={onClear}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 text-red-600 rounded hover:bg-red-100 transition-all text-xs font-bold uppercase tracking-wider ml-2"
              title="Clear all favorites"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Favorites List */}
      <div className="divide-y divide-gray-50">
        {favorites.map((favorite) => (
          <div
            key={favorite.modelId}
            className="p-6 hover:bg-slate-50 transition-colors group relative"
          >
            <div className="flex items-start justify-between">
              {/* Model Info */}
              <div className="flex-1 pr-12">
                <div className="flex items-center gap-3 mb-2.5">
                  <button
                    onClick={() => onSelectModel(favorite.modelId)}
                    className="text-[16px] font-extrabold text-[#31578F] hover:text-[#1a3b6e] transition-colors text-left tracking-tight"
                  >
                    {favorite.modelId}
                  </button>
                  
                  <a
                    href={`https://huggingface.co/${favorite.modelId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-[#31578F] transition-colors md:opacity-0 group-hover:opacity-100"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px]">
                  {favorite.vram && (
                    <div className="text-slate-500 font-medium">
                      VRAM: <span className="text-slate-800 font-bold">{favorite.vram} GB</span>
                    </div>
                  )}
                  {favorite.params && (
                    <div className="text-slate-500 font-medium">
                      Params: <span className="text-slate-800 font-bold">{favorite.params} B</span>
                    </div>
                  )}
                  {favorite.license && (
                    <div className="px-2 py-0.5 bg-[#f1f4f8] text-[#46668B] rounded text-[10px] font-bold uppercase tracking-widest border border-gray-100">
                      {favorite.license}
                    </div>
                  )}
                  {favorite.downloads && (
                    <div className="text-slate-500 font-medium text-[11px]">
                      {formatNumber(favorite.downloads)} DLs
                    </div>
                  )}
                </div>

                {/* Added Date */}
                <div className="text-[10px] uppercase tracking-widest text-[#9DB0C6] mt-4 font-bold">
                  Added {new Date(favorite.addedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => onRemove(favorite.modelId)}
                className="absolute right-6 top-6 w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all md:opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-100"
                title="Remove from favorites"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPanel;