import { Database, Heart } from 'lucide-react';

const Header = ({ onViewFavorites, favoritesCount = 0 }) => {
  return (
    <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Database className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                HuggingFace Model Explorer
              </h1>
              <p className="text-sm text-gray-400">
                Decode any LLM in seconds
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-6 text-sm">
            <button
              onClick={onViewFavorites}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors relative"
            >
              <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'fill-current text-red-400' : ''}`} />
              <span>Favorites</span>
              {favoritesCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {favoritesCount}
                </span>
              )}
            </button>
            
            <a 
              href="https://huggingface.co/models" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              HuggingFace →
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;