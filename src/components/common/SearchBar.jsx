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
            className="w-full rounded-2xl border border-[var(--border-soft)] bg-white px-6 py-4 pl-14 pr-32 text-lg text-[var(--text-main)] placeholder-[var(--text-faint)] transition-all focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[rgba(53,87,132,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
          />
          
          {/* Search Icon */}
          <div className="absolute left-5 top-1/2 -translate-y-1/2">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
            ) : (
              <Search className="w-6 h-6 text-[var(--text-faint)]" />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-[var(--accent)] px-6 py-2 font-semibold text-white transition-all hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Analyze'}
          </button>
        </div>
      </form>

      {/* Example Models */}
      <div className="flex flex-wrap gap-2 mt-4 items-center">
        <span className="text-sm text-[var(--text-faint)]">Quick start:</span>
        {examples.map((example) => (
          <button
            key={example}
            onClick={() => {
              setQuery(example);
              onSearch(example);
            }}
            disabled={loading}
            className="rounded-lg border border-[var(--border-soft)] bg-white px-3 py-1.5 text-sm text-[var(--text-muted)] transition-all hover:border-[var(--border-strong)] hover:text-[var(--text-main)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {example.split('/')[1]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
