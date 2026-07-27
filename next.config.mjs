/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.1.175'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async redirects() {
    return [
      // Retired: /can-i-run/{gpu}/{model}. 38 GPUs x 38 models generated 1,444
      // near-identical pages whose only difference was a computed number — the
      // "scaled content abuse" pattern in Google's spam policies, and the cited
      // cause of an AdSense "low value content" rejection. Every one of those
      // answers now lives as a row on the GPU hub page, so these 308 to the hub
      // and keep whatever link equity they had. Model IDs contain a slash, so this
      // needs a catch-all — but :model+ (one or more), NOT :model* (zero or more),
      // which also matches the bare /can-i-run/{gpu} hub and redirects it to itself.
      {
        source: '/can-i-run/:gpu/:model+',
        destination: '/can-i-run/:gpu',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
