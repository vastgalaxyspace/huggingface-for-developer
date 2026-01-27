import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ModelDetailPage from './pages/ModelDetailPage';
import ComparisonPage from './pages/ComparisonPage';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorDisplay from './components/common/ErrorDisplay';
import ComparisonBar from './components/comparison/ComparisonBar';
import SEO from './components/common/SEO';
import { useModelData } from './hooks/useModelData';
import { useFavorites } from './hooks/useFavorites';
import FavoritesPanel from './components/favorites/FavoritesPanel';
import { useComparison } from './hooks/useComparison';

function App() {
  const [searchQuery, setSearchQuery] = useState(null);
  const [viewMode, setViewMode] = useState('home'); // 'home' | 'detail' | 'compare' | 'favorites'
  
  const { data: modelData, loading, error } = useModelData(searchQuery);
  const {
    comparisonList,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    canAddMore,
    count
  } = useComparison();

  const {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    exportFavorites,
    importFavorites,
    count: favoritesCount
  } = useFavorites();

  const handleSearch = (modelId) => {
    setSearchQuery(modelId);
    setViewMode('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSearchQuery(null);
    setViewMode('home');
  };

  const handleRetry = () => {
    if (searchQuery) {
      setSearchQuery(null);
      setTimeout(() => {
        setSearchQuery(searchQuery);
        setViewMode('detail');
      }, 100);
    }
  };

  const handleCompare = () => {
    if (comparisonList.length >= 2) {
      setViewMode('compare');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackFromComparison = () => {
    setViewMode('home');
    setSearchQuery(null);
  };

  const handleViewFavorites = () => {
    setViewMode('favorites');
    setSearchQuery(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Dynamic SEO */}
      {viewMode === 'home' && <SEO />}
      {viewMode === 'detail' && modelData && <SEO modelData={modelData} />}
      {viewMode === 'compare' && (
        <SEO 
          title={`Compare ${comparisonList.length} Models | HF Model Explorer`}
          description={`Side-by-side comparison of ${comparisonList.join(', ')} - VRAM, licenses, parameters, and more.`}
        />
      )}

      <Header 
        onViewFavorites={handleViewFavorites}
        favoritesCount={favoritesCount}
      />
      
      <main className="min-h-screen pb-24">
        {/* HOME PAGE */}
        {viewMode === 'home' && (
          <HomePage onSearch={handleSearch} loading={loading} />
        )}

        {/* MODEL DETAIL PAGE */}
        {viewMode === 'detail' && (
          <>
            {loading && <LoadingSpinner />}
            {!loading && error && <ErrorDisplay error={error} onRetry={handleRetry} />}
            {!loading && !error && modelData && (
              <ModelDetailPage 
                modelData={modelData} 
                onBack={handleBack}
                onAddToComparison={addToComparison}
                onRemoveFromComparison={removeFromComparison}
                isInComparison={isInComparison(searchQuery)}
                canAddMore={canAddMore}
                onToggleFavorite={toggleFavorite}
                isFavorite={isFavorite(searchQuery)}
              />
            )}
          </>
        )}

        {/* COMPARISON PAGE */}
        {viewMode === 'compare' && (
          <ComparisonPage 
            modelIds={comparisonList} 
            onBack={handleBackFromComparison}
          />
        )}

        {/* FAVORITES PAGE */}
        {viewMode === 'favorites' && (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <button
              onClick={() => setViewMode('home')}
              className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Search</span>
            </button>

            <FavoritesPanel
              favorites={favorites}
              onSelectModel={handleSearch}
              onRemove={(modelId) => toggleFavorite({ modelId })}
              onClear={clearFavorites}
              onExport={exportFavorites}
              onImport={importFavorites}
            />
          </div>
        )}
      </main>

      {/* Comparison Bar (Sticky Bottom) */}
      {viewMode !== 'compare' && (
        <ComparisonBar
          comparisonList={comparisonList}
          onRemove={removeFromComparison}
          onCompare={handleCompare}
          onClear={clearComparison}
        />
      )}

      <Footer />
    </div>
  );
}

export default App;