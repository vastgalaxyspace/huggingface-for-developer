import { useState, useCallback } from 'react';
import { getRecommendations, validateRequirements } from '../utils/recommenderEngine';

/**
 * Custom hook for managing recommender state
 */
export const useRecommender = () => {
  const [step, setStep] = useState(1);
  const [requirements, setRequirements] = useState({
    useCase: null,
    maxVRAM: 24,
    minContext: null,
    license: 'any',
    priority: 'balanced',
    frameworks: []
  });
  const [recommendations, setRecommendations] = useState(null);

  const updateRequirement = useCallback((key, value) => {
    setRequirements(prev => ({ ...prev, [key]: value }));
  }, []);

  const nextStep = useCallback(() => {
    setStep(prev => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((stepNumber) => {
    setStep(stepNumber);
  }, []);

  const generateRecommendations = useCallback((allModels) => {
    const validation = validateRequirements(requirements);
    
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const results = getRecommendations(allModels, requirements, 3);
    setRecommendations(results);
    setStep(4);
    
    return { success: true, results };
  }, [requirements]);

  const reset = useCallback(() => {
    setStep(1);
    setRequirements({
      useCase: null,
      maxVRAM: 24,
      minContext: null,
      license: 'any',
      priority: 'balanced',
      frameworks: []
    });
    setRecommendations(null);
  }, []);

  return {
    step,
    requirements,
    recommendations,
    updateRequirement,
    nextStep,
    prevStep,
    goToStep,
    generateRecommendations,
    reset
  };
};