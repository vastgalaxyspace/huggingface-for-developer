import { useContext } from 'react';
import { AppContext } from '../components/providers/AppProviders';

export const useFavorites = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useFavorites must be used within AppProviders');
  }
  return context.favorites;
};
