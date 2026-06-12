import { Suspense } from 'react';
import LoginPageClient from '../../src/components/routes/LoginPageClient';
import { pageMetadata } from '../../src/lib/seo';

export const metadata = pageMetadata({
  title: 'Sign In',
  description: 'Sign in to InnoAI with Google or email and password.',
  path: '/login',
});

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageClient />
    </Suspense>
  );
}
