"use client";

import { useFavorites as useFavoritesOriginal } from '../../hooks/useFavoritesBase';
import { useComparison as useComparisonOriginal } from '../../hooks/useComparisonBase';
import { useModelDatabase as useModelDatabaseOriginal } from '../../hooks/useModelDatabaseBase';
import { AppContext } from './AppContext';

export function AppProviders({ children }) {
  const favorites = useFavoritesOriginal();
  const comparison = useComparisonOriginal();
  const db = useModelDatabaseOriginal();

  return (
    <AppContext.Provider value={{ favorites, comparison, db }}>
      {children}
    </AppContext.Provider>
  );
}
