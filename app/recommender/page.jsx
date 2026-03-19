"use client";
import { useRouter } from 'next/navigation';
import RecommenderPageOriginal from '../../src/views/RecommenderPage';
import { useModelDatabase } from '../../src/hooks/useModelDatabase';

export default function RecommenderPage() {
  const router = useRouter();
  const db = useModelDatabase();

  return (
    <RecommenderPageOriginal
      onBack={() => router.push('/')}
      onSelectModel={(id) => router.push(`/model/${id}`)}
      allModels={db?.models || []}
      loading={db?.loading || false}
      progress={db?.progress || 0}
    />
  );
}
