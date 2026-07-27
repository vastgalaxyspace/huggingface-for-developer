"use client";

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { shouldServeAds } from '../../lib/adPolicy';

/**
 * Mounts the AdSense loader only on routes cleared by the ad policy.
 *
 * Client component because the decision is per-route and the root layout is shared;
 * usePathname is the only way to branch on the current route from inside it. The
 * google-adsense-account meta tag and /ads.txt stay sitewide in app/layout.jsx, so
 * gating this script does not affect site ownership verification.
 */
export default function AdSenseLoader({ client }) {
  const pathname = usePathname();

  if (!client || !shouldServeAds(pathname)) return null;

  return (
    <Script
      id="google-adsense"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
