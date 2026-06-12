import ProfilePageClient from '../../src/components/routes/ProfilePageClient';
import { pageMetadata } from '../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'Profile',
  description: 'View your InnoAI account profile.',
  path: '/profile',
});

export default function ProfilePage() {
  return <ProfilePageClient />;
}
