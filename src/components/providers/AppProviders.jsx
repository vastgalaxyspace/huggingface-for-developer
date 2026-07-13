"use client";

import { usePathname } from 'next/navigation';
import { useFavorites as useFavoritesOriginal } from '../../hooks/useFavoritesBase';
import { useComparison as useComparisonOriginal } from '../../hooks/useComparisonBase';
import { useModelDatabase as useModelDatabaseOriginal } from '../../hooks/useModelDatabaseBase';
import { useAuth } from '../../hooks/useAuth';
import { AppContext } from './AppContext';
import ToastHost from '../common/ToastHost';
import AuthRequiredModal from '../auth/AuthRequiredModal';

export function AppProviders({ children }) {
  const pathname = usePathname();
  const shouldLoadDatabase =
    pathname?.startsWith('/recommender') || pathname?.startsWith('/model');

  const favorites = useFavoritesOriginal();
  const comparison = useComparisonOriginal();
  const db = useModelDatabaseOriginal(shouldLoadDatabase);
  const auth = useAuth();

  return (
    <AppContext.Provider value={{ favorites, comparison, db, auth }}>
      {children}
      <AuthRequiredModal auth={auth} disabled={pathname?.startsWith('/login')} />
      <ToastHost />
    </AppContext.Provider>
  );
}
