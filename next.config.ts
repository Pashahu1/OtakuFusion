const nextConfig = {
  experimental: {
    inlineCss: true,
  },
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
    qualities: [52, 55, 58, 60, 62, 65, 68, 70, 75, 80],
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === 'true',
  },
};

module.exports = nextConfig;
