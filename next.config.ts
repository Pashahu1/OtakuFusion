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
    ],
    qualities: [75, 80],
    unoptimized: true,
  },
};

module.exports = nextConfig;
