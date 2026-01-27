import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

const SearchBar = ({ onSearch, loading = false }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onSearch(query.trim());
    }
  };

  const examples = [
    'meta-llama/Llama-2-7b-chat-hf',
    'mistralai/Mistral-7B-v0.1',
    'microsoft/phi-2',
    'google/gemma-7b'
  ];

  return (
    <div className="w-full">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter model ID (e.g., meta-llama/Llama-2-7b-chat-hf)"
            disabled={loading}
            className="w-full px-6 py-4 pl-14 pr-32 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          
          {/* Search Icon */}
          <div className="absolute left-5 top-1/2 -translate-y-1/2">
            {loading ? (
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            ) : (
              <Search className="w-6 h-6 text-gray-400" />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Analyze'}
          </button>
        </div>
      </form>

      {/* Example Models */}
      <div className="flex flex-wrap gap-2 mt-4 items-center">
        <span className="text-sm text-gray-400">Quick start:</span>
        {examples.map((example) => (
          <button
            key={example}
            onClick={() => {
              setQuery(example);
              onSearch(example);
            }}
            disabled={loading}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {example.split('/')[1]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;