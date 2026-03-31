const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://otaku-fusion-fizq.vercel.app/api/:path*',
      },
    ];
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
    ],
    /* Дозволені рівні стиснення для <Image quality={…}> (Lighthouse: менший розмір прев’ю) */
    qualities: [60, 62, 65, 70, 75, 80],
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === 'true',
  },
};

module.exports = nextConfig;
