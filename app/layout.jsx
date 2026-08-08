import Script from 'next/script';
import { AppProviders } from '../src/components/providers/AppProviders';
import AdSenseLoader from '../src/components/ads/AdSenseLoader';
import Header from '../src/components/layout/Header';
import Footer from '../src/components/layout/Footer';
import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  PRODUCT_NAME,
  SITE_NAME,
  SITE_URL,
} from '../src/lib/seo';
import './globals.css';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-KV1HD9TCT7';
// AdSense publisher ID (ca-pub-...). Drives both the loader script and the
// google-adsense-account meta tag Google uses to verify site ownership.
// Keep this in sync with public/ads.txt (which uses the pub-... form).
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-9740252976972845';
// Google Search Console "HTML tag" verification token. Optional: set it in the
// hosting env to emit <meta name="google-site-verification">. This is a fallback
// for the Google Analytics verification method, which requires the gtag snippet
// to be server-rendered inside <head> (see the <head> block below).
const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '';

const siteKeywords = [
  'hugging face model explorer',
  'llm comparison',
  'vram calculator',
  'ai model comparison',
  'gpu model sizing',
  'hugging face analysis',
  'llm deployment tools',
  'model recommender',
  'roofline model analyzer',
  'kernel occupancy estimator',
];

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'InnoAI AI Explorer: Analyze Hugging Face Models Fast',
    template: '%s | InnoAI',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: siteKeywords,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: PRODUCT_NAME,
  category: 'technology',
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  other: {
    // Static, server-rendered <meta name="google-adsense-account">. This is the
    // "Meta tag" verification method and does not depend on JS execution, so it is
    // the most reliable ownership signal for the AdSense crawler.
    'google-adsense-account': ADSENSE_CLIENT,
  },
  ...(GOOGLE_SITE_VERIFICATION
    ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
    : {}),
  // Sized icon files, not the 1445x1344 / 601 KiB master. Browsers fetch the
  // favicon on first paint, so pointing these at the full-resolution logo made
  // every mobile visitor download 601 KiB to render a 32px tab icon — the whole
  // of Lighthouse's "Improve image delivery: 600 KiB" finding.
  icons: {
    icon: '/images/innoai-logo-96.png',
    shortcut: '/images/innoai-logo-96.png',
    apple: '/images/innoai-logo-256.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: 'InnoAI AI Explorer: Analyze Hugging Face Models Fast',
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE),
        width: 1200,
        height: 630,
        alt: PRODUCT_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InnoAI AI Explorer',
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: PRODUCT_NAME,
  alternateName: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  inLanguage: 'en-US',
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl('/images/innoai-logo-512.png'),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      {/* Plain <script> tags, not next/script: Search Console's Google Analytics
          verification reads the raw server HTML and requires the gtag snippet in
          <head>. next/script with strategy="afterInteractive" injects into <body>
          after hydration, which the verifier never sees. */}
      <head>
        {GA_MEASUREMENT_ID ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        ) : null}
      </head>
      <body>
        {/* Route-gated: the loader mounts only where src/lib/adPolicy.js allows it.
            Google's Inventory value policy bars ads on low-value screens and on
            navigation/behavioural screens, so account, quiz, and client-rendered
            shell routes are excluded. Verification is unaffected — the
            google-adsense-account meta tag above and /ads.txt are both sitewide. */}
        <AdSenseLoader client={ADSENSE_CLIENT} />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <AppProviders>
          <div className="flex min-h-screen flex-col text-slate-800">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}

