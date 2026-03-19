import { useContext } from 'react';
import { AppContext } from '../components/providers/AppProviders';

export const useComparison = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useComparison must be used within AppProviders');
  }
  return context.comparison;
};
