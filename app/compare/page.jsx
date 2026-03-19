"use client";
import { useRouter } from 'next/navigation';
import { useComparison } from '../../src/hooks/useComparison';
import ComparisonPageOriginal from '../../src/views/ComparisonPage';

export default function ComparePage() {
  const router = useRouter();
  const { comparisonList } = useComparison();

  return (
    <ComparisonPageOriginal 
      modelIds={comparisonList} 
      onBack={() => router.push('/')}
    />
  );
}
