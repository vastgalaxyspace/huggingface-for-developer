"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import HomePage from '../src/views/HomePage';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSearch = (modelId) => {
    if (!modelId.includes('/')) {
      // It's a keyword search
      const searchEl = document.getElementById('search');
      if (searchEl) searchEl.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setLoading(true);
    router.push(`/model/${modelId}`);
  };

  const handleViewRecommender = () => {
    router.push('/recommender');
  };

  const handleApplyTemplate = (template) => {
    console.log('Applied template:', template.name);
  };

  return (
    <HomePage 
      onSearch={handleSearch} 
      loading={loading}
      onViewRecommender={handleViewRecommender}
      onApplyTemplate={handleApplyTemplate}
    />
  );
}
