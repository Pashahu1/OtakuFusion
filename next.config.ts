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
    domains: ['cdn.noitatnemucod.net'],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
