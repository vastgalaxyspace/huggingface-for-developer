import { getTrendingModels } from '../src/services/huggingface';
import { enrichModelData } from '../src/utils/modelUtils';
import HomePageClient from "../src/components/routes/HomePageClient";

export default async function Home() {
  const trending = await getTrendingModels(150);
  const popularModels = trending.map(enrichModelData);
  
  return <HomePageClient initialModels={popularModels} />;
}
