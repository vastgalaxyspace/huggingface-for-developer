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
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
        <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          No Favorites Yet
        </h3>
        <p className="text-gray-400 mb-6">
          Start adding models to your favorites for quick access
        </p>
        <p className="text-sm text-gray-500">
          Click the <Heart className="w-4 h-4 inline" /> icon on any model page to add it here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-red-400 fill-current" />
            <h2 className="text-2xl font-bold text-white">
              Favorite Models
            </h2>
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold">
              {favorites.length}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm"
              title="Export favorites"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-sm"
              title="Import favorites"
            >
              <Upload className="w-4 h-4" />
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
              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm"
              title="Clear all favorites"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Favorites List */}
      <div className="divide-y divide-white/10">
        {favorites.map((favorite) => (
          <div
            key={favorite.modelId}
            className="p-6 hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-start justify-between">
              {/* Model Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => onSelectModel(favorite.modelId)}
                    className="text-lg font-semibold text-white hover:text-purple-400 transition-colors text-left"
                  >
                    {favorite.modelId}
                  </button>
                  
                  <a
                    href={`https://huggingface.co/${favorite.modelId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {favorite.vram && (
                    <div className="text-gray-400">
                      <span className="text-blue-400 font-semibold">
                        {favorite.vram}GB
                      </span>{' '}
                      VRAM
                    </div>
                  )}
                  {favorite.params && (
                    <div className="text-gray-400">
                      <span className="text-purple-400 font-semibold">
                        {favorite.params}B
                      </span>{' '}
                      params
                    </div>
                  )}
                  {favorite.license && (
                    <div className="px-2 py-1 bg-white/10 rounded text-gray-300 text-xs">
                      {favorite.license}
                    </div>
                  )}
                  {favorite.downloads && (
                    <div className="text-gray-400 text-xs">
                      {formatNumber(favorite.downloads)} downloads
                    </div>
                  )}
                </div>

                {/* Added Date */}
                <div className="text-xs text-gray-500 mt-2">
                  Added {new Date(favorite.addedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => onRemove(favorite.modelId)}
                className="ml-4 w-8 h-8 rounded-full flex items-center justify-center bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all opacity-0 group-hover:opacity-100"
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