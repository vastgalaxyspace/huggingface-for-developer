import Script from 'next/script';
import { AppProviders } from '../src/components/providers/AppProviders';
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
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
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
  logo: absoluteUrl('/favicon.svg'),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
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
          <div className="min-h-screen text-slate-800">
            <Header />
            <main className="min-h-screen pb-24">{children}</main>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}

