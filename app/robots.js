import { SITE_URL } from '../src/lib/seo';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // JSON API routes are not content and should not spend crawl budget or
      // surface in results. Everything user-facing lives outside /api.
      disallow: '/api/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
