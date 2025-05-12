/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://otaku-fusion-fizq.vercel.app/api/:path*",
      },
    ];
  },
  images: {
    domains: ["cdn.noitatnemucod.net"],
  },
};

module.exports = nextConfig;
