const nextConfig = {
  experimental: {
    inlineCss: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.noitatnemucod.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'myanimelist.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'anilist.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'artworks.thetvdb.com',
        pathname: '/**',
      },
    ],
    imageSizes: [
      16,
      32,
      48,
      64,
      96,
      128,
      160,
      192,
      224,
      232,
      240,
      256,
      288,
      320,
      384,
    ],
    qualities: [52, 55, 58, 60, 62, 65, 68, 70, 72, 75, 80, 82, 85, 90, 95],
    formats: ['image/avif', 'image/webp'],
    unoptimized:
      process.env.NEXT_IMAGE_UNOPTIMIZED === 'true' ||
      (process.env.NODE_ENV === 'development' &&
        process.env.NEXT_IMAGE_OPTIMIZE_IN_DEV !== 'true'),
  },
};

module.exports = nextConfig;
