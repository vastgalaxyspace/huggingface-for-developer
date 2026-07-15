import { pageMetadata } from '../../src/lib/seo';

export const metadata = {
  ...pageMetadata({
    title: 'Favorite Models',
    description:
      'Save, organize, and revisit your bookmarked Hugging Face models for faster evaluation and sharing.',
    path: '/favorites',
    keywords: ['favorite AI models', 'bookmark Hugging Face models'],
  }),
  // Per-user utility page with no shared content — keep it out of the index.
  robots: { index: false, follow: true },
};

export default function FavoritesLayout({ children }) {
  return <>{children}</>;
}
