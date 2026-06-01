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
    /** Має містити всі значення `quality` з `<Image />` (див. PreviewHero 90/95 тощо). */
    qualities: [52, 55, 58, 60, 62, 65, 68, 70, 72, 75, 80, 82, 85, 90, 95],
    formats: ['image/avif', 'image/webp'],
    /**
     * У dev Next 16 інколи сипле LRU при записі дискового кешу оптимізатора (`calculateSize === 0`).
     * Без серверної оптимізації в розробці помилки зникають; у production залишається оптимізація.
     * Примусово увімкнути оптимізацію в dev: NEXT_IMAGE_OPTIMIZE_IN_DEV=true
     */
    unoptimized:
      process.env.NEXT_IMAGE_UNOPTIMIZED === 'true' ||
      (process.env.NODE_ENV === 'development' &&
        process.env.NEXT_IMAGE_OPTIMIZE_IN_DEV !== 'true'),
  },
};

module.exports = nextConfig;
