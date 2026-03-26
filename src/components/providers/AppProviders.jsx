"use client";

import { usePathname } from 'next/navigation';
import { useFavorites as useFavoritesOriginal } from '../../hooks/useFavoritesBase';
import { useComparison as useComparisonOriginal } from '../../hooks/useComparisonBase';
import { useModelDatabase as useModelDatabaseOriginal } from '../../hooks/useModelDatabaseBase';
import { AppContext } from './AppContext';

export function AppProviders({ children }) {
  const pathname = usePathname();
  const shouldLoadDatabase =
    pathname?.startsWith('/recommender') || pathname?.startsWith('/model');

  const favorites = useFavoritesOriginal();
  const comparison = useComparisonOriginal();
  const db = useModelDatabaseOriginal(shouldLoadDatabase);

  return (
    <AppContext.Provider value={{ favorites, comparison, db }}>
      {children}
    </AppContext.Provider>
  );
}
