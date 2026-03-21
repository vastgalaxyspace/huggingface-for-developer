import { useContext } from 'react';
import { AppContext } from '../components/providers/AppContext';

export const useModelDatabase = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useModelDatabase must be used within AppProviders');
  }
  return context.db;
};
