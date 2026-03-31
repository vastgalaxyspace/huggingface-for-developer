export const SITE_URL = 'https://innoai.space';
export const SITE_NAME = 'InnoAI';
export const PRODUCT_NAME = 'InnoAI AI Explorer';
export const DEFAULT_DESCRIPTION =
  'Analyze Hugging Face models, estimate VRAM, compare architectures, and choose the right AI stack with practical tools for developers and researchers.';
export const DEFAULT_OG_IMAGE = '/opengraph-image';

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString();
}

export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  keywords = [],
  type = 'website',
}) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const imageUrl = absoluteUrl(DEFAULT_OG_IMAGE);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: absoluteUrl(path),
    },
    openGraph: {
      type,
      url: absoluteUrl(path),
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${title} - ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}

